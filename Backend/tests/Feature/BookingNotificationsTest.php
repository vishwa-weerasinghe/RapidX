<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\Package;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Gaps found in the booking audit that BookingControllerTest /
 * BookingRefundTest / VehicleControllerTest do not cover:
 *
 *  - GET    /api/admin/bookings/unread-count      (admin, untested)
 *  - POST   /api/admin/bookings/mark-seen         (admin, untested)
 *  - GET    /api/admin/bookings/notifications     (authz + null-message filter untested)
 *  - GET    /api/customer/{id}/booking-notifications/unread-count (untested)
 *  - ownership 403s for customer notification endpoints (untested)
 *  - GET    /api/bookings/{id} ownership 403 + missing 404 (untested)
 *  - GET    /api/user-bookings/{id} non-owner 403 (untested)
 *  - GET    /api/user-upcoming-booking/{id}       (whole endpoint untested)
 *  - PUT    /api/bookings/{id}/vehicles           (multi-vehicle, whole endpoint untested)
 */
class BookingNotificationsTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name' => 'Test',
            'Last_Name' => 'Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ], $overrides));
    }

    protected function createPackage(): Package
    {
        return Package::create([
            'Package_Name' => 'City Tour',
            'Description' => 'A sample package',
            'price_one_adult' => 1000,
            'price_more_adult' => 1000,
            'price_child' => 500,
        ]);
    }

    protected function createBooking(array $overrides = []): Booking
    {
        return Booking::create(array_merge([
            'Booking_Date' => now()->addDays(14)->toDateString(),
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 2,
            'No_of_child' => 0,
            'Payment' => 1000,
            'Status' => 'Pending',
            'Customer_ID' => $this->createCustomer()->Customer_ID,
            'Package_ID' => $this->createPackage()->id,
            'Vehicle_ID' => null,
        ], $overrides));
    }

    protected function createAdmin(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    protected function createUserFor(Customer $customer): User
    {
        return User::create([
            'User_Name' => 'Customer User',
            'Email' => $customer->Email,
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);
    }

    protected function createVehicle(): Vehicle
    {
        $driver = Driver::create([
            'Driver_Name' => 'Test Driver',
            'Phone_Number' => '0712345678',
            'Email' => fake()->unique()->safeEmail(),
        ]);

        return Vehicle::create([
            'Vehicle_No' => 'WP-CAB-' . fake()->unique()->numberBetween(1000, 9999),
            'Vehicle_Type' => 'Jeep',
            'No_of_Seats' => 6,
            'Driver_ID' => $driver->Driver_ID,
        ]);
    }

    // ---------------------------------------------------------------------
    // GET /api/admin/bookings/unread-count
    // ---------------------------------------------------------------------

    public function test_admin_unread_count_requires_authentication(): void
    {
        $this->getJson('/api/admin/bookings/unread-count')->assertStatus(401);
    }

    public function test_non_admin_cannot_view_admin_unread_count(): void
    {
        // SEC-04: Non-admin customer calling GET /admin/bookings/unread-count returns 403 Forbidden
        $user = $this->createUserFor($this->createCustomer());
        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/bookings/unread-count')
            ->assertStatus(403);
    }

    public function test_admin_unread_count_counts_every_unseen_booking(): void
    {
        $this->createBooking(['Admin_Message' => 'A new booking has been placed by a customer.']);
        // The count endpoint does not filter on Admin_Message, so an unseen
        // booking without a message is counted too (documents actual behaviour).
        $this->createBooking();
        $this->createBooking(['Admin_Seen' => true]);

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/admin/bookings/unread-count')
            ->assertStatus(200)
            ->assertJson(['count' => 2]);
    }

    public function test_admin_unread_count_is_zero_when_no_bookings_exist(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/admin/bookings/unread-count')
            ->assertStatus(200)
            ->assertJson(['count' => 0]);
    }

    // ---------------------------------------------------------------------
    // POST /api/admin/bookings/mark-seen
    // ---------------------------------------------------------------------

    public function test_mark_all_as_seen_requires_authentication(): void
    {
        $this->postJson('/api/admin/bookings/mark-seen')->assertStatus(401);
    }

    public function test_non_admin_cannot_mark_all_as_seen(): void
    {
        // SEC-03: Non-admin customer calling POST /admin/bookings/mark-seen returns 403 Forbidden
        $user = $this->createUserFor($this->createCustomer());
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/bookings/mark-seen')
            ->assertStatus(403);
    }

    public function test_admin_can_clear_all_unseen_notifications(): void
    {
        $first = $this->createBooking(['Admin_Message' => 'New booking']);
        $second = $this->createBooking(['Admin_Message' => 'Customer cancelled this booking.']);
        $alreadySeen = $this->createBooking(['Admin_Seen' => true, 'Admin_Message' => 'Old news']);

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->postJson('/api/admin/bookings/mark-seen')
            ->assertStatus(200)
            ->assertJson(['message' => 'Booking notifications cleared']);

        $this->assertSame(0, DB::table('bookings')->where('Admin_Seen', false)->count());

        $this->assertDatabaseHas('bookings', ['Booking_ID' => $first->Booking_ID, 'Admin_Seen' => true]);
        $this->assertDatabaseHas('bookings', ['Booking_ID' => $second->Booking_ID, 'Admin_Seen' => true]);
        $this->assertDatabaseHas('bookings', ['Booking_ID' => $alreadySeen->Booking_ID, 'Admin_Seen' => true]);
    }

    // ---------------------------------------------------------------------
    // GET /api/admin/bookings/notifications
    // ---------------------------------------------------------------------

    public function test_admin_notifications_require_authentication(): void
    {
        $this->getJson('/api/admin/bookings/notifications')->assertStatus(401);
    }

    public function test_non_admin_cannot_view_admin_notifications(): void
    {
        $user = $this->createUserFor($this->createCustomer());

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/bookings/notifications')
            ->assertStatus(403);
    }

    public function test_admin_notifications_exclude_unseen_bookings_without_a_message(): void
    {
        $withMessage = $this->createBooking(['Admin_Message' => 'A new booking has been placed by a customer.']);
        $this->createBooking(['Admin_Message' => null]);

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/admin/bookings/notifications')
            ->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_ID' => $withMessage->Booking_ID]);
    }

    // ---------------------------------------------------------------------
    // GET /api/customer/{id}/booking-notifications/unread-count
    // ---------------------------------------------------------------------

    public function test_customer_unread_count_requires_authentication(): void
    {
        $customer = $this->createCustomer();

        $this->getJson('/api/customer/' . $customer->Customer_ID . '/booking-notifications/unread-count')
            ->assertStatus(401);
    }

    public function test_customer_unread_count_counts_only_unseen_bookings_with_a_message(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUserFor($customer);

        // Counted: unseen with a message.
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => 'Your booking was cancelled by an administrator.',
            'Customer_Seen' => false,
        ]);
        // Not counted: seen with a message.
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => 'An older notification.',
            'Customer_Seen' => true,
        ]);
        // Not counted: unseen but without a message.
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => null,
            'Customer_Seen' => false,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer/' . $customer->Customer_ID . '/booking-notifications/unread-count')
            ->assertStatus(200)
            ->assertJson(['count' => 1]);
    }

    public function test_customer_unread_count_is_forbidden_for_another_customers_id(): void
    {
        $customer = $this->createCustomer();
        $otherCustomer = $this->createCustomer();
        $user = $this->createUserFor($customer);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer/' . $otherCustomer->Customer_ID . '/booking-notifications/unread-count')
            ->assertStatus(403)
            ->assertJson(['message' => 'Forbidden.']);
    }

    // ---------------------------------------------------------------------
    // GET /api/customer/{id}/booking-notifications
    // ---------------------------------------------------------------------

    public function test_customer_notification_list_excludes_seen_and_message_less_bookings(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUserFor($customer);

        $visible = $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => 'Your booking was cancelled by an administrator.',
            'Customer_Seen' => false,
        ]);
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => 'Already read.',
            'Customer_Seen' => true,
        ]);
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => null,
            'Customer_Seen' => false,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer/' . $customer->Customer_ID . '/booking-notifications')
            ->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_ID' => $visible->Booking_ID]);
    }

    public function test_customer_notification_list_is_forbidden_for_another_customers_id(): void
    {
        $customer = $this->createCustomer();
        $otherCustomer = $this->createCustomer();
        $user = $this->createUserFor($customer);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer/' . $otherCustomer->Customer_ID . '/booking-notifications')
            ->assertStatus(403)
            ->assertJson(['message' => 'Forbidden.']);
    }

    // ---------------------------------------------------------------------
    // POST /api/customer/{id}/booking-notifications/mark-seen
    // ---------------------------------------------------------------------

    public function test_marking_notifications_seen_leaves_bookings_without_a_message_untouched(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUserFor($customer);

        $withMessage = $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => 'Your booking was cancelled by an administrator.',
            'Customer_Seen' => false,
        ]);
        $withoutMessage = $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Customer_Message' => null,
            'Customer_Seen' => false,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/customer/' . $customer->Customer_ID . '/booking-notifications/mark-seen')
            ->assertStatus(200)
            ->assertJson(['message' => 'Booking notifications cleared']);

        $this->assertDatabaseHas('bookings', ['Booking_ID' => $withMessage->Booking_ID, 'Customer_Seen' => true]);
        $this->assertDatabaseHas('bookings', ['Booking_ID' => $withoutMessage->Booking_ID, 'Customer_Seen' => false]);
    }

    public function test_marking_notifications_seen_is_forbidden_for_another_customers_id(): void
    {
        $customer = $this->createCustomer();
        $otherCustomer = $this->createCustomer();
        $user = $this->createUserFor($customer);

        $foreign = $this->createBooking([
            'Customer_ID' => $otherCustomer->Customer_ID,
            'Customer_Message' => 'Not yours to clear.',
            'Customer_Seen' => false,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/customer/' . $otherCustomer->Customer_ID . '/booking-notifications/mark-seen')
            ->assertStatus(403)
            ->assertJson(['message' => 'Forbidden.']);

        $this->assertDatabaseHas('bookings', ['Booking_ID' => $foreign->Booking_ID, 'Customer_Seen' => false]);
    }

    // ---------------------------------------------------------------------
    // Booking ownership: show / user-bookings
    // ---------------------------------------------------------------------

    public function test_a_customer_cannot_view_another_customers_booking(): void
    {
        $owner = $this->createCustomer();
        $intruder = $this->createCustomer();
        $booking = $this->createBooking(['Customer_ID' => $owner->Customer_ID]);

        $this->actingAs($this->createUserFor($intruder), 'sanctum')
            ->getJson('/api/bookings/' . $booking->Booking_ID)
            ->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized: Access to this booking is restricted.']);
    }

    public function test_viewing_a_missing_booking_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/bookings/999999')
            ->assertNotFound();
    }

    public function test_user_bookings_requires_authentication(): void
    {
        // SEC-06: Call GET /user-bookings/{customerId} with no token returns 401
        $customer = $this->createCustomer();
        $this->getJson('/api/user-bookings/' . $customer->Customer_ID)->assertStatus(401);
    }

    public function test_a_customer_cannot_list_another_customers_bookings(): void
    {
        $owner = $this->createCustomer();
        $intruder = $this->createCustomer();
        $this->createBooking(['Customer_ID' => $owner->Customer_ID]);

        $this->actingAs($this->createUserFor($intruder), 'sanctum')
            ->getJson('/api/user-bookings/' . $owner->Customer_ID)
            ->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized: You can only view your own bookings.']);
    }

    // ---------------------------------------------------------------------
    // GET /api/user-upcoming-booking/{customerId}
    // ---------------------------------------------------------------------

    public function test_upcoming_booking_returns_the_nearest_future_confirmed_or_pending_booking(): void
    {
        $customer = $this->createCustomer();
        $otherCustomer = $this->createCustomer();

        // Must be skipped: in the past.
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_Date' => now()->subDay()->toDateString(),
            'Status' => 'Confirmed',
        ]);
        // Must be skipped: cancelled.
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_Date' => now()->addDays(10)->toDateString(),
            'Status' => 'Cancelled',
        ]);
        // Must be skipped: belongs to somebody else.
        $this->createBooking([
            'Customer_ID' => $otherCustomer->Customer_ID,
            'Booking_Date' => now()->addDays(2)->toDateString(),
            'Status' => 'Confirmed',
        ]);
        // Must win: nearest future Pending/Confirmed booking.
        $nearest = $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_Date' => now()->addDay()->toDateString(),
            'Status' => 'Confirmed',
        ]);
        // Must be skipped: further in the future.
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_Date' => now()->addDays(30)->toDateString(),
            'Status' => 'Pending',
        ]);

        $this->actingAs($this->createUserFor($customer), 'sanctum')
            ->getJson('/api/user-upcoming-booking/' . $customer->Customer_ID)
            ->assertStatus(200)
            ->assertJsonPath('Booking_ID', $nearest->Booking_ID);
    }

    public function test_upcoming_booking_ignores_past_and_cancelled_bookings(): void
    {
        $customer = $this->createCustomer();

        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_Date' => now()->subDays(3)->toDateString(),
            'Status' => 'Confirmed',
        ]);
        $this->createBooking([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_Date' => now()->addDays(5)->toDateString(),
            'Status' => 'Cancelled',
        ]);

        $response = $this->actingAs($this->createUserFor($customer), 'sanctum')
            ->getJson('/api/user-upcoming-booking/' . $customer->Customer_ID);

        $response->assertStatus(200);

        // The controller's "no upcoming booking" branch returns
        // response()->json(null), which serialises on the wire as {} —
        // i.e. no booking data for the frontend to render.
        $response->assertExactJson([]);
    }

    public function test_upcoming_booking_returns_null_when_the_customer_has_no_bookings(): void
    {
        $customer = $this->createCustomer();

        $response = $this->actingAs($this->createUserFor($customer), 'sanctum')
            ->getJson('/api/user-upcoming-booking/' . $customer->Customer_ID);

        $response->assertStatus(200);
        $response->assertExactJson([]);
    }

    public function test_upcoming_booking_does_not_leak_another_customers_booking(): void
    {
        $customer = $this->createCustomer();
        $otherCustomer = $this->createCustomer();

        $this->createBooking([
            'Customer_ID' => $otherCustomer->Customer_ID,
            'Booking_Date' => now()->addDays(3)->toDateString(),
            'Status' => 'Confirmed',
        ]);

        $response = $this->actingAs($this->createUserFor($customer), 'sanctum')
            ->getJson('/api/user-upcoming-booking/' . $customer->Customer_ID);

        $response->assertStatus(200);
        $response->assertExactJson([]);
    }

    public function test_upcoming_booking_requires_authentication(): void
    {
        // SEC-08: Call GET /user-upcoming-booking/{customerId} with no token returns 401
        $customer = $this->createCustomer();

        $this->getJson('/api/user-upcoming-booking/' . $customer->Customer_ID)
            ->assertStatus(401);
    }

    public function test_upcoming_booking_is_forbidden_for_another_customer(): void
    {
        // SEC-08: Ownership check
        $customerA = $this->createCustomer();
        $customerB = $this->createCustomer();

        $this->actingAs($this->createUserFor($customerB), 'sanctum')
            ->getJson('/api/user-upcoming-booking/' . $customerA->Customer_ID)
            ->assertStatus(403);
    }

    // ---------------------------------------------------------------------
    // PUT /api/bookings/{id}/vehicles (admin multi-vehicle assignment)
    // ---------------------------------------------------------------------

    public function test_admin_can_assign_multiple_vehicles_and_pivot_rows_are_persisted(): void
    {
        // 7 passengers => the controller derives ceil(7 / 6) = 2 vehicles.
        $booking = $this->createBooking(['No_of_adults' => 7]);
        $first = $this->createVehicle();
        $second = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [$first->Vehicle_ID, $second->Vehicle_ID],
            ])
            ->assertStatus(200)
            ->assertJson(['message' => '2 vehicle(s) assigned successfully']);

        $this->assertDatabaseHas('booking_vehicles', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => $first->Vehicle_ID,
        ]);
        $this->assertDatabaseHas('booking_vehicles', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => $second->Vehicle_ID,
        ]);
        // The legacy single-vehicle column points at the first assigned vehicle.
        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => $first->Vehicle_ID,
        ]);
    }

    public function test_one_vehicle_suffices_for_six_or_fewer_passengers(): void
    {
        $booking = $this->createBooking(['No_of_adults' => 6, 'No_of_child' => 0]);
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [$vehicle->Vehicle_ID],
            ])
            ->assertStatus(200)
            ->assertJson(['message' => '1 vehicle(s) assigned successfully']);
    }

    public function test_assignment_fails_when_there_are_not_enough_vehicles_for_the_passengers(): void
    {
        $booking = $this->createBooking(['No_of_adults' => 7]);
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [$vehicle->Vehicle_ID],
            ])
            ->assertStatus(422)
            ->assertJson(['message' => 'This booking needs at least 2 vehicle(s) for its passengers.']);

        // Nothing must be written: no pivot rows, no legacy column change.
        $this->assertDatabaseMissing('booking_vehicles', ['Booking_ID' => $booking->Booking_ID]);
        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => null,
        ]);
    }

    public function test_required_count_parameter_can_raise_the_minimum(): void
    {
        $booking = $this->createBooking(['No_of_adults' => 2]);
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [$vehicle->Vehicle_ID],
                'Required_Count' => 2,
            ])
            ->assertStatus(422)
            ->assertJson(['message' => 'This booking needs at least 2 vehicle(s) for its passengers.']);
    }

    public function test_required_count_below_one_is_rejected_by_validation(): void
    {
        $booking = $this->createBooking();
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [$vehicle->Vehicle_ID],
                'Required_Count' => 0,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['Required_Count']);
    }

    public function test_non_existing_vehicle_ids_are_rejected_by_validation(): void
    {
        $booking = $this->createBooking(['No_of_adults' => 7]);

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [999999],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['Vehicle_IDs.0']);
    }

    public function test_duplicate_vehicle_ids_are_rejected_by_validation(): void
    {
        $booking = $this->createBooking(['No_of_adults' => 7]);
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [$vehicle->Vehicle_ID, $vehicle->Vehicle_ID],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['Vehicle_IDs.1']);
    }

    public function test_non_admin_cannot_assign_multiple_vehicles(): void
    {
        $booking = $this->createBooking(['No_of_adults' => 7]);
        $first = $this->createVehicle();
        $second = $this->createVehicle();

        $this->actingAs($this->createUserFor($this->createCustomer()), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
                'Vehicle_IDs' => [$first->Vehicle_ID, $second->Vehicle_ID],
            ])
            ->assertStatus(403)
            ->assertJson(['message' => 'Only administrators can assign vehicles.']);

        $this->assertDatabaseMissing('booking_vehicles', ['Booking_ID' => $booking->Booking_ID]);
    }

    public function test_guest_cannot_assign_multiple_vehicles(): void
    {
        $booking = $this->createBooking(['No_of_adults' => 7]);
        $first = $this->createVehicle();
        $second = $this->createVehicle();

        $this->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicles', [
            'Vehicle_IDs' => [$first->Vehicle_ID, $second->Vehicle_ID],
        ])->assertStatus(401);

        $this->assertDatabaseMissing('booking_vehicles', ['Booking_ID' => $booking->Booking_ID]);
    }

    public function test_assigning_vehicles_to_a_missing_booking_returns_404(): void
    {
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/999999/vehicles', [
                'Vehicle_IDs' => [$vehicle->Vehicle_ID],
            ])
            ->assertNotFound();
    }
}