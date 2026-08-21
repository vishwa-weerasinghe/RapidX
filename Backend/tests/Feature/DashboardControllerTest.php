<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_stats_returns_correct_structure_and_data(): void
    {
        // Setup mock data
        $customer = Customer::create([
            'First_Name' => 'John',
            'Last_Name' => 'Doe',
            'Email' => 'john@example.com',
            'Phone_No' => '123456789',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ]);

        $package = Package::create([
            'Package_Name' => 'Safari Explorer',
            'Description' => 'Explore the wild.',
            'Price_for_adult' => 150.00,
            'Price_for_child' => 75.00,
        ]);

        // Create a couple of bookings
        Booking::create([
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Booking_Date' => now()->toDateString(),
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Hotel Alpha',
            'Status' => 'Pending',
            'Payment' => 150.00,
            'No_of_adults' => 2,
            'No_of_child' => 0,
        ]);

        Booking::create([
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Booking_Date' => now()->subDay()->toDateString(),
            'Pickup_Time' => '11:00:00',
            'Pickup_Location' => 'Hotel Beta',
            'Status' => 'Confirmed',
            'Payment' => 150.00,
            'No_of_adults' => 2,
            'No_of_child' => 1,
        ]);

        // Create a review
        Review::create([
            'Customer_ID' => $customer->Customer_ID,
            'Rate' => 4,
            'Description' => 'Great experience!',
        ]);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'total_bookings',
                     'total_reviews',
                     'total_revenue',
                     'avg_rating',
                     'bookings_by_status',
                     'recent_bookings',
                     'bookings_per_month',
                     'recent_reviews',
                 ]);

        // Verify some core counts
        $this->assertEquals(2, $response->json('total_bookings'));
        $this->assertEquals(1, $response->json('total_reviews'));
        $this->assertEquals(300.00, $response->json('total_revenue'));
        $this->assertEquals(4.0, $response->json('avg_rating'));
        $this->assertArrayHasKey('Pending', $response->json('bookings_by_status'));
        $this->assertArrayHasKey('Confirmed', $response->json('bookings_by_status'));
        $this->assertCount(2, $response->json('recent_bookings'));
        $this->assertCount(1, $response->json('recent_reviews'));
    }

    public function test_user_dashboard_returns_authenticated_user_data(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Dash',
            'Last_Name' => 'User',
            'Email' => 'dash@example.com',
            'Phone_No' => '0712345678',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ]);

        $user = User::create([
            'Email' => 'dash@example.com',
            'User_Name' => 'Dash User',
            'Password' => Hash::make('Password@123'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        // Perform actual login to get real token
        $loginResponse = $this->postJson('/api/login', [
            'Email' => 'dash@example.com',
            'Password' => 'Password@123',
        ]);
        $token = $loginResponse->json('token');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/dashboard');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user' => [
                         'Email',
                         'User_Name',
                     ]
                 ]);
                 
        $this->assertEquals('dash@example.com', $response->json('user.Email'));
    }

    public function test_user_dashboard_fails_without_authentication(): void
    {
        $response = $this->getJson('/api/dashboard');
        
        $response->assertStatus(401)
                 ->assertJson(['message' => 'Unauthenticated.']);
    }
}
