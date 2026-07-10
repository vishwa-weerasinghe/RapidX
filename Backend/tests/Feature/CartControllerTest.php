<?php

namespace Tests\Feature;

use App\Http\Controllers\CartController;
use App\Models\Booking;
use App\Models\Cart;
use App\Models\Customer;
use Illuminate\Http\Request;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    public function test_checkout_updates_booking_status_to_confirmed(): void
    {
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
            'Package_ID' => 1,
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
}
