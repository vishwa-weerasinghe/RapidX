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

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name' => 'John',
            'Last_Name'  => 'Doe',
            'Email'      => fake()->unique()->safeEmail(),
            'Phone_No'   => '123456789',
            'NIC'        => '123456789V',
            'Country'    => 'Sri Lanka',
        ], $overrides));
    }

    protected function createPackage(array $overrides = []): Package
    {
        return Package::create(array_merge([
            'Package_Name'    => 'Safari Explorer',
            'Description'     => 'Explore the wild.',
            'Price_for_adult' => 150.00,
            'Price_for_child' => 75.00,
        ], $overrides));
    }

    protected function createBooking(int $customerId, int $packageId, array $overrides = []): Booking
    {
        return Booking::create(array_merge([
            'Customer_ID'     => $customerId,
            'Package_ID'      => $packageId,
            'Booking_Date'    => now()->toDateString(),
            'Pickup_Time'     => '10:00:00',
            'Pickup_Location' => 'Hotel Alpha',
            'Status'          => 'Pending',
            'Payment'         => 150.00,
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
        ], $overrides));
    }

    protected function createReview(int $customerId, int $rate = 4, string $description = 'Great experience!'): Review
    {
        return Review::create([
            'Customer_ID' => $customerId,
            'Rate'        => $rate,
            'Description' => $description,
        ]);
    }

    protected function loginAndGetToken(string $email, string $password = 'Password@123'): string
    {
        return $this->postJson('/api/login', [
            'Email'    => $email,
            'Password' => $password,
        ])->json('token');
    }

    // -------------------------------------------------------------------------
    // Admin stats
    // -------------------------------------------------------------------------

    public function test_admin_stats_returns_correct_structure_and_data(): void
    {
        $customer = $this->createCustomer(['Email' => 'john@example.com']);
        $package  = $this->createPackage();

        $this->createBooking($customer->Customer_ID, $package->id, [
            'Status'  => 'Pending',
            'Payment' => 150.00,
        ]);

        $this->createBooking($customer->Customer_ID, $package->id, [
            'Booking_Date' => now()->subDay()->toDateString(),
            'Pickup_Time'  => '11:00:00',
            'Status'       => 'Confirmed',
            'Payment'      => 150.00,
            'No_of_child'  => 1,
        ]);

        $this->createReview($customer->Customer_ID, 4, 'Great experience!');

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

        $this->assertEquals(2, $response->json('total_bookings'));
        $this->assertEquals(1, $response->json('total_reviews'));
        $this->assertEquals(300.00, $response->json('total_revenue'));
        $this->assertEquals(4.0, $response->json('avg_rating'));
        $this->assertArrayHasKey('Pending', $response->json('bookings_by_status'));
        $this->assertArrayHasKey('Confirmed', $response->json('bookings_by_status'));
        $this->assertCount(2, $response->json('recent_bookings'));
        $this->assertCount(1, $response->json('recent_reviews'));
    }

    public function test_admin_stats_returns_zero_counts_when_no_data_exists(): void
    {
        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200);

        $this->assertEquals(0, $response->json('total_bookings'));
        $this->assertEquals(0, $response->json('total_reviews'));
        $this->assertEquals(0, $response->json('total_revenue'));
        $this->assertEquals(0, $response->json('avg_rating'));
        $this->assertEmpty($response->json('bookings_by_status'));
        $this->assertEmpty($response->json('recent_bookings'));
        $this->assertEmpty($response->json('recent_reviews'));
    }

    public function test_admin_stats_revenue_sums_all_booking_payments(): void
    {
        $customer = $this->createCustomer();
        $package  = $this->createPackage();

        $this->createBooking($customer->Customer_ID, $package->id, ['Payment' => 200.00]);
        $this->createBooking($customer->Customer_ID, $package->id, ['Payment' => 350.00]);
        $this->createBooking($customer->Customer_ID, $package->id, ['Payment' => 100.00]);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200);
        $this->assertEquals(650.00, $response->json('total_revenue'));
        $this->assertEquals(3, $response->json('total_bookings'));
    }

    public function test_admin_stats_avg_rating_is_rounded_to_one_decimal(): void
    {
        $customer = $this->createCustomer();

        $this->createReview($customer->Customer_ID, 3);
        $this->createReview($customer->Customer_ID, 4);
        $this->createReview($customer->Customer_ID, 5);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200);
        // (3 + 4 + 5) / 3 = 4.0
        $this->assertEquals(4.0, $response->json('avg_rating'));
    }

    public function test_admin_stats_recent_bookings_contains_correct_fields(): void
    {
        $customer = $this->createCustomer(['Email' => 'recent@example.com']);
        $package  = $this->createPackage(['Package_Name' => 'Sunset Safari']);

        $this->createBooking($customer->Customer_ID, $package->id);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200);

        $recentBooking = $response->json('recent_bookings.0');
        $this->assertArrayHasKey('id', $recentBooking);
        $this->assertArrayHasKey('customer', $recentBooking);
        $this->assertArrayHasKey('package', $recentBooking);
        $this->assertArrayHasKey('date', $recentBooking);
        $this->assertArrayHasKey('status', $recentBooking);
        $this->assertArrayHasKey('payment', $recentBooking);

        $this->assertEquals('Sunset Safari', $recentBooking['package']);
        $this->assertEquals('John Doe', $recentBooking['customer']);
    }

    public function test_admin_stats_recent_reviews_capped_at_four(): void
    {
        $customer = $this->createCustomer();

        for ($i = 1; $i <= 6; $i++) {
            $this->createReview($customer->Customer_ID, $i <= 5 ? $i : 5, "Review number {$i}");
        }

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200);
        $this->assertCount(4, $response->json('recent_reviews'));
    }

    // -------------------------------------------------------------------------
    // User dashboard
    // -------------------------------------------------------------------------

    public function test_user_dashboard_returns_authenticated_user_data(): void
    {
        $customer = $this->createCustomer(['Email' => 'dash@example.com']);

        $user = User::create([
            'Email'       => 'dash@example.com',
            'User_Name'   => 'Dash User',
            'Password'    => Hash::make('Password@123'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $token = $this->loginAndGetToken('dash@example.com');

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['Email', 'User_Name'],
            ]);

        $this->assertEquals('dash@example.com', $response->json('user.Email'));
        $this->assertEquals('Dash User', $response->json('user.User_Name'));
    }

    public function test_user_dashboard_fails_without_authentication(): void
    {
        $this->getJson('/api/dashboard')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }
}

