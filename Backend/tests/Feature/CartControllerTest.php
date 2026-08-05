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

    public function test_checkout_updates_booking_status_to_confirmed(): void
    {
        $package = Package::create([
            'Package_Name' => 'Morning Safari',
            'Description' => 'A guided safari.',
            'Price_for_adult' => 100.00,
            'Price_for_child' => 50.00,
        ]);

        $customer = Customer::create([
            'First_Name' => 'Test',
            'Last_Name' => 'Customer',
            'Email' => 'test@example.com',
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
            'Customer_Type' => 'Guest',
        ]);

        $booking = Booking::create([
            'Booking_Date' => '2026-08-01',
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Payment' => 100.00,
            'Status' => 'In Cart',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Vehicle_ID' => null,
        ]);

        Cart::create([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_ID' => $booking->Booking_ID,
        ]);

        $request = Request::create('/checkout', 'POST', [
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $controller = new CartController();
        $response = $controller->checkout($request);

        $this->assertEquals(200, $response->getStatusCode());
        $booking->refresh();
        $this->assertEquals('Confirmed', $booking->Status);
        $this->assertDatabaseMissing('carts', [
            'Customer_ID' => $customer->Customer_ID,
        ]);
    }

    public function test_guest_can_add_a_package_to_a_cart_without_registering(): void
    {
        $package = Package::create([
            'Package_Name' => 'Evening Safari',
            'Description' => 'A guided safari.',
            'Price_for_adult' => 120.00,
            'Price_for_child' => 60.00,
        ]);

        $response = $this->postJson('/api/cart', [
            'Booking_Date' => '2026-08-10',
            'Pickup_Time' => '06:00',
            'Pickup_Location' => 'Dambulla',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Package_ID' => $package->id,
            'Payment' => 300.00,
            'First_Name' => 'Guest',
            'Last_Name' => 'Customer',
            'Email' => 'guest@example.com',
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ]);

        $response->assertCreated()
            ->assertJsonPath('customer.Customer_Type', 'Guest');

        $customerId = $response->json('customer.Customer_ID');

        $this->assertDatabaseHas('bookings', [
            'Customer_ID' => $customerId,
            'Package_ID' => $package->id,
            'Status' => 'In Cart',
        ]);
        $this->assertDatabaseHas('carts', [
            'Customer_ID' => $customerId,
        ]);
    }
}
