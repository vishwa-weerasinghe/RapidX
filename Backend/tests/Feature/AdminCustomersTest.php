<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /api/admin/customers (CustomerController::index) had no test coverage.
 *
 * NOTE (coordination): this endpoint belongs to the admin dashboard area.
 * These tests are deliberately minimal — if the admin/end-to-end test owner
 * already plans coverage for this route, merge rather than duplicate.
 */
class AdminCustomersTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    protected function createUser(): User
    {
        return User::create([
            'User_Name' => 'Regular User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
        ]);
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

    protected function createBooking(Customer $customer): Booking
    {
        $package = Package::create([
            'Package_Name' => 'City Tour',
            'Description' => 'A sample package',
            'price_one_adult' => 1000,
            'price_more_adult' => 1000,
            'price_child' => 500,
        ]);

        return Booking::create([
            'Booking_Date' => '2026-07-10',
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Payment' => 1500,
            'Status' => 'Pending',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Vehicle_ID' => null,
        ]);
    }

    public function test_guest_cannot_list_customers(): void
    {
        $this->getJson('/api/admin/customers')->assertStatus(401);
    }

    public function test_non_admin_cannot_list_customers(): void
    {
        $this->actingAs($this->createUser(), 'sanctum')
            ->getJson('/api/admin/customers')
            ->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized.']);
    }

    public function test_admin_can_list_customers_with_booking_counts_newest_first(): void
    {
        $withBookings = $this->createCustomer(['Email' => 'two-bookings@example.com']);
        $this->createBooking($withBookings);
        $this->createBooking($withBookings);

        $withoutBookings = $this->createCustomer(['Email' => 'no-bookings@example.com']);

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/admin/customers');

        $response->assertStatus(200)->assertJsonCount(2);

        // Ordered by Customer_ID descending: newest customer first.
        $this->assertSame(
            [$withoutBookings->Customer_ID, $withBookings->Customer_ID],
            array_column($response->json(), 'Customer_ID')
        );

        $counts = array_column($response->json(), 'bookings_count', 'Email');
        $this->assertSame(2, $counts['two-bookings@example.com']);
        $this->assertSame(0, $counts['no-bookings@example.com']);
    }
}