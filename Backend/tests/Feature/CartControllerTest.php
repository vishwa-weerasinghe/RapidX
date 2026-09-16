<?php

namespace Tests\Feature;

use App\Http\Controllers\CartController;
use App\Models\Booking;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function createPackage(array $overrides = []): Package
    {
        return Package::create(array_merge([
            'Package_Name'    => 'Morning Safari',
            'Description'     => 'A guided safari.',
            'price_one_adult' => 100.00,
            'price_more_adult' => 100.00,
            'price_child' => 50.00,
        ], $overrides));
    }

    protected function createGuestCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name'     => 'Guest',
            'Last_Name'      => 'Customer',
            'Email'          => fake()->unique()->safeEmail(),
            'Phone_No'       => '0771234567',
            'NIC'            => '123456789V',
            'Country'        => 'Sri Lanka',
            'Customer_Type'  => 'Guest',
        ], $overrides));
    }

    protected function createBookingInCart(int $customerId, int $packageId, array $overrides = []): Booking
    {
        $booking = Booking::create(array_merge([
            'Booking_Date'    => '2026-08-01',
            'Pickup_Time'     => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults'    => 2,
            'No_of_child'     => 1,
            'Payment'         => 100.00,
            'Status'          => 'In Cart',
            'Customer_ID'     => $customerId,
            'Package_ID'      => $packageId,
            'Vehicle_ID'      => null,
        ], $overrides));

        Cart::create([
            'Customer_ID' => $customerId,
            'Booking_ID'  => $booking->Booking_ID,
        ]);

        return $booking;
    }

    // -------------------------------------------------------------------------
    // Store (add to cart)
    // -------------------------------------------------------------------------

    public function test_guest_can_add_a_package_to_cart_without_registering(): void
    {
        $package = $this->createPackage(['Package_Name' => 'Evening Safari']);

        $response = $this->postJson('/api/cart', [
            'Booking_Date'    => '2026-08-10',
            'Pickup_Time'     => '06:00',
            'Pickup_Location' => 'Dambulla',
            'No_of_adults'    => 2,
            'No_of_child'     => 1,
            'Package_ID'      => $package->id,
            'Payment'         => 300.00,
            'First_Name'      => 'Guest',
            'Last_Name'       => 'Customer',
            'Email'           => 'guest@example.com',
            'Phone_No'        => '0771234567',
            'NIC'             => '123456789V',
            'Country'         => 'Sri Lanka',
        ]);

        $response->assertCreated()
            ->assertJsonPath('customer.Customer_Type', 'Guest');

        $customerId = $response->json('customer.Customer_ID');

        $this->assertDatabaseHas('customers', [
            'Customer_ID'    => $customerId,
            'Email'          => 'guest@example.com',
            'Customer_Type'  => 'Guest',
        ]);
        $this->assertDatabaseHas('bookings', [
            'Customer_ID' => $customerId,
            'Package_ID'  => $package->id,
            'Status'      => 'In Cart',
        ]);
        $this->assertDatabaseHas('carts', [
            'Customer_ID' => $customerId,
        ]);
    }

    public function test_existing_customer_can_add_to_cart_using_customer_id(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer(['Email' => 'existing@example.com']);

        $response = $this->postJson('/api/cart', [
            'Customer_ID'     => $customer->Customer_ID,
            'Booking_Date'    => '2026-09-01',
            'Pickup_Time'     => '08:00',
            'Pickup_Location' => 'Sigiriya',
            'No_of_adults'    => 3,
            'No_of_child'     => 0,
            'Package_ID'      => $package->id,
            'Payment'         => 300.00,
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'Customer_ID' => $customer->Customer_ID,
            'Status'      => 'In Cart',
        ]);
        $this->assertDatabaseHas('carts', [
            'Customer_ID' => $customer->Customer_ID,
        ]);
    }

    public function test_store_returns_validation_errors_for_missing_guest_fields(): void
    {
        $response = $this->postJson('/api/cart', [
            'Booking_Date'    => '2026-08-10',
            'Pickup_Time'     => '06:00',
            'Pickup_Location' => 'Dambulla',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            // Package_ID and guest identity fields are missing
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Package_ID', 'Payment', 'First_Name', 'Last_Name', 'Email', 'Phone_No', 'NIC', 'Country']);

        $this->assertDatabaseCount('bookings', 0);
        $this->assertDatabaseCount('carts', 0);
    }

    public function test_store_returns_validation_error_for_invalid_booking_date(): void
    {
        $package = $this->createPackage();

        $response = $this->postJson('/api/cart', [
            'Booking_Date'    => 'not-a-date',
            'Pickup_Time'     => '06:00',
            'Pickup_Location' => 'Dambulla',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            'Package_ID'      => $package->id,
            'Payment'         => 300.00,
            'First_Name'      => 'Guest',
            'Last_Name'       => 'User',
            'Email'           => 'guest@example.com',
            'Phone_No'        => '0771234567',
            'NIC'             => '123456789V',
            'Country'         => 'Sri Lanka',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Booking_Date']);

        $this->assertDatabaseCount('bookings', 0);
    }

    // -------------------------------------------------------------------------
    // Index (view cart)
    // -------------------------------------------------------------------------

    public function test_customer_can_view_their_cart_items(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer();

        $this->createBookingInCart($customer->Customer_ID, $package->id);

        $response = $this->getJson('/api/cart/' . $customer->Customer_ID);

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertNotEmpty($data);
        $this->assertEquals($customer->Customer_ID, $data[0]['Customer_ID']);
    }

    public function test_cart_is_empty_for_customer_with_no_items(): void
    {
        $customer = $this->createGuestCustomer();

        $response = $this->getJson('/api/cart/' . $customer->Customer_ID);

        $response->assertStatus(200);
        $this->assertEmpty($response->json());
    }

    // -------------------------------------------------------------------------
    // Checkout
    // -------------------------------------------------------------------------

    public function test_checkout_updates_all_cart_bookings_to_confirmed_and_clears_cart(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer(['Email' => 'test@example.com']);

        $booking = $this->createBookingInCart($customer->Customer_ID, $package->id);

        $response = $this->postJson('/api/cart/checkout', [
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'All bookings in cart checked out successfully!']);

        $booking->refresh();
        $this->assertEquals('Confirmed', $booking->Status);

        $this->assertDatabaseMissing('carts', [
            'Customer_ID' => $customer->Customer_ID,
        ]);
    }

    public function test_checkout_with_empty_cart_returns_bad_request(): void
    {
        $customer = $this->createGuestCustomer();

        $response = $this->postJson('/api/cart/checkout', [
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Your cart is empty']);
    }

    public function test_checkout_returns_validation_error_when_customer_id_missing(): void
    {
        $response = $this->postJson('/api/cart/checkout', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Customer_ID']);
    }

    public function test_checkout_confirms_multiple_bookings_in_one_go(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer();

        $booking1 = $this->createBookingInCart($customer->Customer_ID, $package->id);
        $booking2 = $this->createBookingInCart($customer->Customer_ID, $package->id);

        $this->postJson('/api/cart/checkout', [
            'Customer_ID' => $customer->Customer_ID,
        ])->assertStatus(200);

        $this->assertEquals('Confirmed', $booking1->fresh()->Status);
        $this->assertEquals('Confirmed', $booking2->fresh()->Status);
        $this->assertDatabaseCount('carts', 0);
    }

    // -------------------------------------------------------------------------
    // Destroy (remove from cart)
    // -------------------------------------------------------------------------

    public function test_customer_can_remove_an_item_from_the_cart(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer();

        $booking = $this->createBookingInCart($customer->Customer_ID, $package->id);

        $response = $this->deleteJson('/api/cart/' . $booking->Booking_ID);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Item removed from cart successfully']);

        $this->assertDatabaseMissing('bookings', ['Booking_ID' => $booking->Booking_ID]);
        $this->assertDatabaseMissing('carts', ['Booking_ID' => $booking->Booking_ID]);
    }

    public function test_cannot_delete_non_cart_booking_via_cart_endpoint(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer();

        // Create standard confirmed booking (not in cart)
        $booking = Booking::create([
            'Booking_Date'    => '2026-08-01',
            'Pickup_Time'     => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults'    => 2,
            'No_of_child'     => 1,
            'Payment'         => 100.00,
            'Status'          => 'Confirmed',
            'Customer_ID'     => $customer->Customer_ID,
            'Package_ID'      => $package->id,
            'Vehicle_ID'      => null,
        ]);

        $response = $this->deleteJson('/api/cart/' . $booking->Booking_ID);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Cart item not found']);

        // Assert booking was not deleted
        $this->assertDatabaseHas('bookings', ['Booking_ID' => $booking->Booking_ID]);
    }

    public function test_cannot_delete_booking_whose_status_is_not_in_cart(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer();

        $booking = $this->createBookingInCart($customer->Customer_ID, $package->id, [
            'Status' => 'Confirmed',
        ]);

        $response = $this->deleteJson('/api/cart/' . $booking->Booking_ID);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Only pending cart bookings can be removed from cart']);

        $this->assertDatabaseHas('bookings', ['Booking_ID' => $booking->Booking_ID]);
    }

    public function test_authenticated_user_cannot_delete_another_customers_cart_item(): void
    {
        $package   = $this->createPackage();
        $customer1 = $this->createGuestCustomer(['Email' => 'owner@example.com']);
        $customer2 = $this->createGuestCustomer(['Email' => 'attacker@example.com']);

        $user2 = \App\Models\User::create([
            'User_Name'   => 'Attacker User',
            'Email'       => 'attacker@example.com',
            'Password'    => bcrypt('Password123'),
            'role'        => 'user',
            'Customer_ID' => $customer2->Customer_ID,
        ]);

        $booking1 = $this->createBookingInCart($customer1->Customer_ID, $package->id);

        $response = $this->actingAs($user2, 'sanctum')
            ->deleteJson('/api/cart/' . $booking1->Booking_ID);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized: You do not own this cart item']);

        $this->assertDatabaseHas('bookings', ['Booking_ID' => $booking1->Booking_ID]);
        $this->assertDatabaseHas('carts', ['Booking_ID' => $booking1->Booking_ID]);
    }

    public function test_guest_request_with_mismatched_customer_id_cannot_delete_cart_item(): void
    {
        $package   = $this->createPackage();
        $customer1 = $this->createGuestCustomer(['Email' => 'owner@example.com']);
        $customer2 = $this->createGuestCustomer(['Email' => 'attacker@example.com']);

        $booking1 = $this->createBookingInCart($customer1->Customer_ID, $package->id);

        $response = $this->deleteJson('/api/cart/' . $booking1->Booking_ID . '?Customer_ID=' . $customer2->Customer_ID);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized: You do not own this cart item']);

        $this->assertDatabaseHas('bookings', ['Booking_ID' => $booking1->Booking_ID]);
        $this->assertDatabaseHas('carts', ['Booking_ID' => $booking1->Booking_ID]);
    }

    public function test_authenticated_user_can_delete_their_own_cart_item(): void
    {
        $package  = $this->createPackage();
        $customer = $this->createGuestCustomer(['Email' => 'owner@example.com']);

        $user = \App\Models\User::create([
            'User_Name'   => 'Owner User',
            'Email'       => 'owner@example.com',
            'Password'    => bcrypt('Password123'),
            'role'        => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $booking = $this->createBookingInCart($customer->Customer_ID, $package->id);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/cart/' . $booking->Booking_ID);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Item removed from cart successfully']);

        $this->assertDatabaseMissing('bookings', ['Booking_ID' => $booking->Booking_ID]);
        $this->assertDatabaseMissing('carts', ['Booking_ID' => $booking->Booking_ID]);
    }
}
