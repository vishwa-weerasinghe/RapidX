<?php

namespace Tests\Feature;

use App\Models\{Booking, Customer, Package, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingRefundTest extends TestCase
{
    use RefreshDatabase;

    private function makeBooking(string $date): array
    {
        $customer = Customer::create([
            'First_Name' => 'Test', 'Last_Name' => 'User',
            'Email' => 'a@test.com', 'Phone_No' => '077', 'NIC' => '1', 'Country' => 'LK',
        ]);
        $user = User::create([
            'User_Name' => 'T', 'Email' => 'a@test.com',
            'Password' => bcrypt('Password123'), 'role' => 'user',
            'Customer_ID' => $customer->Customer_ID,
        ]);
        $package = Package::create([
            'Package_Name' => 'P', 'Description' => 'D',
            'price_one_adult' => 100, 'price_more_adult' => 100, 'price_child' => 50,
        ]);
        $booking = Booking::create([
            'Booking_Date' => $date, 'Pickup_Time' => '07:00', 'Pickup_Location' => 'X',
            'No_of_adults' => 2, 'No_of_child' => 0, 'Payment' => 200, 'Status' => 'Pending',
            'Customer_ID' => $customer->Customer_ID, 'Package_ID' => $package->id,
        ]);
        return [$user, $booking];
    }

    public function test_cancel_more_than_7_days_gives_100_percent(): void
    {
        [$user, $booking] = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/user/bookings/{$booking->Booking_ID}/cancel")
            ->assertOk()->assertJsonPath('refund_percentage', 100);
    }

    public function test_cancel_5_days_before_gives_50_percent(): void
    {
        [$user, $booking] = $this->makeBooking(now()->addDays(5)->toDateString());

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/user/bookings/{$booking->Booking_ID}/cancel")
            ->assertOk()->assertJsonPath('refund_percentage', 50);
    }

    public function test_cancel_1_day_before_gives_0_percent(): void
    {
        [$user, $booking] = $this->makeBooking(now()->addDay()->toDateString());

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/user/bookings/{$booking->Booking_ID}/cancel")
            ->assertOk()->assertJsonPath('refund_percentage', 0);
    }
}