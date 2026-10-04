<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (!Schema::hasColumn('packages', 'Package_ID')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->unsignedBigInteger('Package_ID')->nullable()->after('id');
            });
        }

        DB::table('packages')->update(['Package_ID' => DB::raw('id')]);
    }

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
        $package = Package::create([
            'Package_Name' => 'City Tour',
            'Description' => 'A sample package',
            'price_one_adult' => 1000,
            'price_more_adult' => 1000,
            'price_child' => 500,
        ]);

        DB::table('packages')->where('id', $package->id)->update(['Package_ID' => $package->id]);

        return $package;
    }

    protected function createBooking(?int $customerId = null, ?int $packageId = null): Booking
    {
        return Booking::create([
            'Booking_Date' => '2026-07-10',
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Payment' => 1500,
            'Status' => 'Pending',
            'Customer_ID' => $customerId ?? $this->createCustomer()->Customer_ID,
            'Package_ID' => $packageId ?? $this->createPackage()->id,
            'Vehicle_ID' => null,
        ]);
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

    protected function createNamedPackage(string $name): Package
    {
        $package = Package::create([
            'Package_Name' => $name,
            'Description' => 'A sample package',
            'price_one_adult' => 1000,
            'price_more_adult' => 1000,
            'price_child' => 500,
        ]);

        DB::table('packages')->where('id', $package->id)->update(['Package_ID' => $package->id]);

        return $package;
    }

    protected function createBookingOnDate(string $date, array $overrides = []): Booking
    {
        return Booking::create(array_merge([
            'Booking_Date' => $date,
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

    public function test_index_returns_bookings_successfully(): void
    {
        $customer = $this->createCustomer();
        $package = $this->createPackage();

        Booking::create([
            'Booking_Date' => '2026-07-11',
            'Pickup_Time' => '09:30:00',
            'Pickup_Location' => 'Kandy',
            'No_of_adults' => 1,
            'No_of_child' => 0,
            'Payment' => 1000,
            'Status' => 'Pending',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
        ]);
        $admin = User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/bookings');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Pickup_Location' => 'Kandy']);

        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_user_bookings_returns_only_the_requested_customers_bookings(): void
    {
        $firstCustomer = $this->createCustomer(['Email' => 'first@example.com']);
        $secondCustomer = $this->createCustomer(['Email' => 'second@example.com']);
        $package = $this->createPackage();

        Booking::create([
            'Booking_Date' => '2026-07-12',
            'Pickup_Time' => '11:00:00',
            'Pickup_Location' => 'Galle',
            'No_of_adults' => 2,
            'No_of_child' => 0,
            'Payment' => 2000,
            'Status' => 'Pending',
            'Customer_ID' => $firstCustomer->Customer_ID,
            'Package_ID' => $package->id,
        ]);

        Booking::create([
            'Booking_Date' => '2026-07-13',
            'Pickup_Time' => '12:00:00',
            'Pickup_Location' => 'Jaffna',
            'No_of_adults' => 1,
            'No_of_child' => 1,
            'Payment' => 1500,
            'Status' => 'Confirmed',
            'Customer_ID' => $secondCustomer->Customer_ID,
            'Package_ID' => $package->id,
        ]);

        $response = $this->getJson('/api/user-bookings/' . $firstCustomer->Customer_ID);

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Pickup_Location' => 'Galle']);
    }

    public function test_booking_can_be_created_and_persisted_in_database(): void
    {
        $customer = $this->createCustomer();
        $user = User::create([
            'User_Name' => 'Test User',
            'Email' => $customer->Email,
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);
        $package = $this->createPackage();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/bookings', [
            'Booking_Date' => '2026-07-14',
            'Pickup_Time' => '13:00:00',
            'Area' => 'Habarana',
            'Pickup_Location' => 'Negombo',
            'No_of_adults' => 3,
            'No_of_child' => 2,
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Booking created successfully')
            ->assertJsonPath('booking.Pickup_Location', 'Negombo');

        $this->assertDatabaseHas('bookings', [
            'Pickup_Location' => 'Negombo',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Status' => 'Pending',
            'Vehicle_ID' => null,
        ]);
    }

    public function test_guest_booking_can_be_created_without_existing_customer_id(): void
    {
        $package = $this->createPackage();

        $response = $this->postJson('/api/bookings', [
            'Booking_Date' => '2026-07-15',
            'Pickup_Time' => '14:00:00',
            'Area' => 'Sigiriya',
            'Pickup_Location' => 'Ella',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Package_ID' => $package->id,
            'First_Name' => 'Guest',
            'Last_Name' => 'User',
            'Email' => 'guest@example.com',
            'Phone_No' => '0712345678',
            'NIC' => '987654321V',
            'Country' => 'Sri Lanka',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Booking created successfully');

        $this->assertDatabaseHas('customers', [
            'Email' => 'guest@example.com',
            'Phone_No' => '0712345678',
        ]);

        $this->assertDatabaseHas('bookings', [
            'Pickup_Location' => 'Ella',
            'Package_ID' => $package->id,
            'Status' => 'Confirmed',
        ]);
    }

    public function test_admin_created_booking_has_an_admin_placement_notification(): void
    {
        $admin = User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
        $customer = $this->createCustomer();
        $package = $this->createPackage();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/bookings', [
                'Booking_Date' => '2026-07-16',
                'Pickup_Time' => '13:00:00',
                'Area' => 'Habarana',
                'Pickup_Location' => 'Negombo',
                'No_of_adults' => 2,
                'No_of_child' => 0,
                'Customer_ID' => $customer->Customer_ID,
                'Package_ID' => $package->id,
                'Created_By_Admin' => true,
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('bookings', [
            'Customer_ID' => $customer->Customer_ID,
            'Admin_Message' => 'New booking successfully placed by you.',
        ]);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $response = $this->postJson('/api/bookings', [
            'Booking_Date' => '',
            'Pickup_Time' => '',
            'Area' => '',
            'Pickup_Location' => '',
            'No_of_adults' => '',
            'No_of_child' => '',
            'Customer_ID' => '',
            'Package_ID' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Booking_Date', 'Pickup_Time', 'Area', 'Pickup_Location', 'No_of_adults', 'No_of_child', 'Package_ID']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_store_returns_validation_errors_for_invalid_input(): void
    {
        $response = $this->postJson('/api/bookings', [
            'Booking_Date' => 'not-a-date',
            'Pickup_Time' => '10:00:00',
            'Area' => 'Dambulla',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 'three',
            'No_of_child' => 1,
            'Customer_ID' => 1,
            'Package_ID' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Booking_Date', 'No_of_adults']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_show_returns_a_single_booking(): void
    {
        $booking = $this->createBooking();
        $admin = User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/bookings/' . $booking->Booking_ID);

        $response->assertStatus(200)
            ->assertJsonPath('Booking_ID', $booking->Booking_ID)
            ->assertJsonPath('Pickup_Location', 'Colombo');
    }

    public function test_update_booking_changes_existing_values_and_persists_them(): void
    {
        $booking = $this->createBooking();
        $admin = User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson('/api/bookings/' . $booking->Booking_ID, [
            'Pickup_Location' => 'Matara',
            'Payment' => 2500,
            'Status' => 'Confirmed',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Booking updated successfully')
            ->assertJsonPath('booking.Pickup_Location', 'Matara');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Pickup_Location' => 'Matara',
            'Payment' => '2500.00',
            'Status' => 'Confirmed',
        ]);
    }

    public function test_customer_can_update_pending_booking(): void
    {
        $customer = $this->createCustomer();
        $booking = $this->createBooking($customer->Customer_ID);
        $user = User::create([
            'User_Name' => 'Test Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/user/bookings/' . $booking->Booking_ID, [
            'Pickup_Location' => 'Matara',
            'No_of_adults' => 3,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Booking updated successfully')
            ->assertJsonPath('booking.Pickup_Location', 'Matara');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Pickup_Location' => 'Matara',
            'No_of_adults' => 3,
        ]);
    }

    public function test_customer_cannot_change_booking_status(): void
    {
        $customer = $this->createCustomer();
        $booking = $this->createBooking($customer->Customer_ID);
        $user = User::create([
            'User_Name' => 'Test Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/user/bookings/' . $booking->Booking_ID, [
            'Pickup_Location' => 'Matara',
            'Status' => 'Confirmed',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('booking.Pickup_Location', 'Matara');

        // The customer's Status value must be ignored – status stays Pending.
        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Pickup_Location' => 'Matara',
            'Status' => 'Pending',
        ]);
    }

    public function test_customer_cannot_update_confirmed_booking(): void
    {
        $customer = $this->createCustomer();
        $booking = $this->createBooking($customer->Customer_ID);
        $booking->update(['Status' => 'Confirmed']);
        $user = User::create([
            'User_Name' => 'Test Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/user/bookings/' . $booking->Booking_ID, [
            'Pickup_Location' => 'Matara',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'This booking cannot be modified.']);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Pickup_Location' => 'Colombo',
        ]);
    }

    public function test_customer_cannot_update_another_customers_booking(): void
    {
        $owner = $this->createCustomer();
        $intruder = $this->createCustomer();
        $booking = $this->createBooking($owner->Customer_ID);
        $intruderUser = User::create([
            'User_Name' => 'Intruder Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $intruder->Customer_ID,
        ]);

        $response = $this->actingAs($intruderUser, 'sanctum')->putJson('/api/user/bookings/' . $booking->Booking_ID, [
            'Pickup_Location' => 'Matara',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized: You can only edit your own bookings.']);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Pickup_Location' => 'Colombo',
        ]);
    }

    public function test_destroy_deletes_the_booking_from_the_database(): void
    {
        $admin = User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
        $booking = $this->createBooking();

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/bookings/' . $booking->Booking_ID);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Booking cancelled successfully']);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Customer_Seen' => false,
            'Customer_Message' => 'Your booking was cancelled by an administrator.',
        ]);
    }

    public function test_customer_can_view_and_clear_booking_notifications(): void
    {
        $customer = $this->createCustomer();
        $booking = $this->createBooking($customer->Customer_ID);
        $booking->update([
            'Status' => 'Cancelled',
            'Customer_Seen' => false,
            'Customer_Message' => 'Your booking was cancelled by an administrator.',
        ]);
        $user = User::create([
            'User_Name' => 'Customer User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer/' . $customer->Customer_ID . '/booking-notifications')
            ->assertStatus(200)
            ->assertJsonPath('0.Booking_ID', $booking->Booking_ID)
            ->assertJsonPath('0.Status', 'Cancelled');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/customer/' . $customer->Customer_ID . '/booking-notifications/mark-seen')
            ->assertStatus(200);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Customer_Seen' => true,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer/' . $customer->Customer_ID . '/booking-notifications')
            ->assertStatus(200)
            ->assertExactJson([]);
    }

    public function test_customer_cancellation_notifies_admin(): void
    {
        $booking = $this->createBooking();
        $customerUser = User::create([
            'User_Name' => 'Test Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => $booking->Customer_ID,
        ]);

        $this->actingAs($customerUser, 'sanctum')
            ->patchJson('/api/user/bookings/' . $booking->Booking_ID . '/cancel')
            ->assertStatus(200)
            ->assertJsonPath('booking.Status', 'Cancelled');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Admin_Seen' => false,
            'Admin_Message' => 'Customer cancelled this booking.',
        ]);
    }

    public function test_admin_notifications_include_new_and_customer_cancelled_bookings(): void
    {
        $admin = User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
        $newBooking = $this->createBooking();
        $newBooking->update([
            'Admin_Seen' => false,
            'Admin_Message' => 'A new booking has been placed by a customer.',
        ]);
        $cancelledBooking = $this->createBooking();
        $cancelledBooking->update([
            'Status' => 'Cancelled',
            'Admin_Seen' => false,
            'Admin_Message' => 'Customer cancelled this booking.',
        ]);
        $seenBooking = $this->createBooking();
        $seenBooking->update([
            'Admin_Seen' => true,
            'Admin_Message' => 'An older booking notification.',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/bookings/notifications')
            ->assertStatus(200)
            ->assertJsonFragment([
                'Booking_ID' => $newBooking->Booking_ID,
                'Admin_Message' => 'A new booking has been placed by a customer.',
            ])
            ->assertJsonFragment([
                'Booking_ID' => $cancelledBooking->Booking_ID,
                'Status' => 'Cancelled',
                'Admin_Message' => 'Customer cancelled this booking.',
            ]);

        $response->assertJsonMissing([
            'Booking_ID' => $seenBooking->Booking_ID,
        ]);
    }

    // ── Booking period + search filtering ───────────────────────────────

    public function test_index_filters_bookings_by_custom_date_range(): void
    {
        $inRange = $this->createBookingOnDate('2026-07-15');
        $beforeRange = $this->createBookingOnDate('2026-07-01');
        $afterRange = $this->createBookingOnDate('2026-07-31');

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/bookings?period=custom&from_date=2026-07-10&to_date=2026-07-20');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_ID' => $inRange->Booking_ID])
            ->assertJsonMissing(['Booking_ID' => $beforeRange->Booking_ID])
            ->assertJsonMissing(['Booking_ID' => $afterRange->Booking_ID]);
    }

    public function test_index_filter_by_search_matches_customer_name(): void
    {
        $matchingCustomer = Customer::create([
            'First_Name' => 'Nimal',
            'Last_Name' => 'Perera',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ]);
        $matching = $this->createBookingOnDate('2026-07-15', ['Customer_ID' => $matchingCustomer->Customer_ID]);
        $other = $this->createBookingOnDate('2026-07-16');

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/bookings?search=Nimal');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_ID' => $matching->Booking_ID])
            ->assertJsonMissing(['Booking_ID' => $other->Booking_ID]);
    }

    public function test_index_filter_by_search_matches_package_name(): void
    {
        $package = $this->createNamedPackage('Elephant Safari Deluxe');
        $matching = $this->createBookingOnDate('2026-07-15', ['Package_ID' => $package->id]);
        $other = $this->createBookingOnDate('2026-07-16');

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/bookings?search=Safari%20Deluxe');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_ID' => $matching->Booking_ID])
            ->assertJsonMissing(['Booking_ID' => $other->Booking_ID]);
    }

    public function test_index_search_is_scoped_to_the_selected_period(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Kasun',
            'Last_Name' => 'Silva',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ]);
        $inPeriod = $this->createBookingOnDate('2026-07-15', ['Customer_ID' => $customer->Customer_ID]);
        $outsidePeriod = $this->createBookingOnDate('2026-06-15', [
            'Customer_ID' => $customer->Customer_ID,
            'Pickup_Location' => 'Jaffna',
        ]);

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/bookings?period=custom&from_date=2026-07-01&to_date=2026-07-31&search=Kasun');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_ID' => $inPeriod->Booking_ID])
            ->assertJsonMissing(['Booking_ID' => $outsidePeriod->Booking_ID]);
    }

    public function test_index_filters_bookings_for_this_week(): void
    {
        try {
            // 2026-08-15 is a Saturday, so the Monday->Sunday week is
            // 2026-08-10 .. 2026-08-16.
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $weekStart = $this->createBookingOnDate('2026-08-10');
            $weekEnd = $this->createBookingOnDate('2026-08-16');
            $beforeWeek = $this->createBookingOnDate('2026-08-09');
            $afterWeek = $this->createBookingOnDate('2026-08-17');

            $response = $this->actingAs($this->createAdmin(), 'sanctum')
                ->getJson('/api/bookings?period=this_week');

            $response->assertStatus(200)
                ->assertJsonCount(2)
                ->assertJsonFragment(['Booking_ID' => $weekStart->Booking_ID])
                ->assertJsonFragment(['Booking_ID' => $weekEnd->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $beforeWeek->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $afterWeek->Booking_ID]);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_index_filters_bookings_for_last_month(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $lastMonth = $this->createBookingOnDate('2026-07-15');
            $monthStart = $this->createBookingOnDate('2026-07-01');
            $monthEnd = $this->createBookingOnDate('2026-07-31');
            $beforeMonth = $this->createBookingOnDate('2026-06-30');
            $currentMonth = $this->createBookingOnDate('2026-08-01');

            $response = $this->actingAs($this->createAdmin(), 'sanctum')
                ->getJson('/api/bookings?period=last_month');

            $response->assertStatus(200)
                ->assertJsonCount(3)
                ->assertJsonFragment(['Booking_ID' => $lastMonth->Booking_ID])
                ->assertJsonFragment(['Booking_ID' => $monthStart->Booking_ID])
                ->assertJsonFragment(['Booking_ID' => $monthEnd->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $beforeMonth->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $currentMonth->Booking_ID]);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_index_filters_bookings_for_this_year(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $yearStart = $this->createBookingOnDate('2026-01-01');
            $yearEnd = $this->createBookingOnDate('2026-12-31');
            $previousYear = $this->createBookingOnDate('2025-12-31');
            $nextYear = $this->createBookingOnDate('2027-01-01');

            $response = $this->actingAs($this->createAdmin(), 'sanctum')
                ->getJson('/api/bookings?period=this_year');

            $response->assertStatus(200)
                ->assertJsonCount(2)
                ->assertJsonFragment(['Booking_ID' => $yearStart->Booking_ID])
                ->assertJsonFragment(['Booking_ID' => $yearEnd->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $previousYear->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $nextYear->Booking_ID]);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_index_filters_bookings_for_last_year(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $lastYear = $this->createBookingOnDate('2025-06-15');
            $lastYearStart = $this->createBookingOnDate('2025-01-01');
            $lastYearEnd = $this->createBookingOnDate('2025-12-31');
            $previousYear = $this->createBookingOnDate('2024-12-31');
            $currentYear = $this->createBookingOnDate('2026-01-01');

            $response = $this->actingAs($this->createAdmin(), 'sanctum')
                ->getJson('/api/bookings?period=last_year');

            $response->assertStatus(200)
                ->assertJsonCount(3)
                ->assertJsonFragment(['Booking_ID' => $lastYear->Booking_ID])
                ->assertJsonFragment(['Booking_ID' => $lastYearStart->Booking_ID])
                ->assertJsonFragment(['Booking_ID' => $lastYearEnd->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $previousYear->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $currentYear->Booking_ID]);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_index_filters_bookings_for_this_month(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $thisMonth = $this->createBookingOnDate('2026-08-10');
            $otherMonth = $this->createBookingOnDate('2026-07-10');

            $response = $this->actingAs($this->createAdmin(), 'sanctum')
                ->getJson('/api/bookings?period=this_month');

            $response->assertStatus(200)
                ->assertJsonCount(1)
                ->assertJsonFragment(['Booking_ID' => $thisMonth->Booking_ID])
                ->assertJsonMissing(['Booking_ID' => $otherMonth->Booking_ID]);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_index_returns_all_bookings_for_all_time_period(): void
    {
        $first = $this->createBookingOnDate('2026-07-10');
        $second = $this->createBookingOnDate('2026-08-20');

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/bookings?period=all_time');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['Booking_ID' => $first->Booking_ID])
            ->assertJsonFragment(['Booking_ID' => $second->Booking_ID]);
    }
}
