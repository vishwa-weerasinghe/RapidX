<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function adminUser(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    protected function regularUser(): User
    {
        return User::create([
            'User_Name' => 'Regular User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
        ]);
    }

    protected function createCustomer(): Customer
    {
        return Customer::create([
            'First_Name' => 'Nimal',
            'Last_Name' => 'Perera',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0712345678',
            'NIC' => '200012345678',
            'Country' => 'Sri Lanka',
        ]);
    }

    protected function createPackage(): Package
    {
        return Package::create([
            'Package_Name' => 'City Tour',
            'Description' => 'A sample package',
            'Price_for_adult' => 1000,
            'Price_for_child' => 500,
        ]);
    }

    protected function createBookingForDate(
        string $date,
        string $status,
        float $payment
    ): Booking {
        $customer = $this->createCustomer();
        $package = $this->createPackage();

        return Booking::create([
            'Booking_Date' => $date,
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Payment' => $payment,
            'Status' => $status,
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Vehicle_ID' => null,
        ]);
    }

    // ---------------------------------------------------------------------
    // Admin-only access – only admins can view appointments
    // ---------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_appointments(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);

        $response = $this->getJson('/api/appointments');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_appointment_summary(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);

        $response = $this->getJson('/api/appointments/summary');

        $response->assertStatus(401);
    }

    public function test_regular_user_cannot_access_appointments(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);

        $response = $this->actingAs($this->regularUser(), 'sanctum')
            ->getJson('/api/appointments');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Only administrators can view appointments.']);
    }

    public function test_regular_user_cannot_access_appointment_summary(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);

        $response = $this->actingAs($this->regularUser(), 'sanctum')
            ->getJson('/api/appointments/summary');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Only administrators can view appointments.']);
    }

    public function test_admin_can_access_appointments_successfully(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_admin_can_access_appointment_summary_successfully(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments/summary');

        $response->assertStatus(200)
            ->assertJson([
                'total_confirmed' => 1,
                'total_unconfirmed' => 0,
            ]);
    }

    // ---------------------------------------------------------------------
    // Index – appointments are read directly from the bookings table
    // ---------------------------------------------------------------------

    public function test_index_returns_appointments_successfully(): void
    {
        $this->createBookingForDate('2026-07-11', 'Pending', 1000);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_Date' => '2026-07-11'])
            ->assertJsonFragment(['Status' => 'Pending']);
    }

    public function test_index_reads_only_from_bookings_table_and_never_stores_new_records(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);
        $this->createBookingForDate('2026-07-11', 'Pending', 2000);
        $this->createBookingForDate('2026-07-12', 'Confirmed', 3000);

        $bookingsBefore = Booking::count();

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments');

        $response->assertStatus(200)
            ->assertJsonCount(3);

        // The endpoint is read-only: it must return booking data without
        // inserting any additional records anywhere in the database.
        $this->assertSame($bookingsBefore, Booking::count(), 'The appointments endpoint must be read-only and read from the bookings table.');
        $this->assertDatabaseCount('bookings', 3);
        $this->assertDatabaseCount('customers', 3);
        $this->assertDatabaseCount('packages', 3);
    }

    public function test_index_includes_created_bookings_from_bookings_table(): void
    {
        // A newly created booking appears in the appointments list
        // because appointments read from the bookings table.
        $booking = $this->createBookingForDate('2026-07-15', 'Confirmed', 2500);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Booking_ID' => $booking->Booking_ID])
            ->assertJsonFragment(['Payment' => 2500])
            ->assertJsonFragment(['Status' => 'Confirmed']);
    }

    public function test_index_filters_appointments_by_month_parameter(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1500);
        $this->createBookingForDate('2026-07-25', 'Pending', 2500);
        $this->createBookingForDate('2026-08-15', 'Confirmed', 3500);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments?month=2026-07');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['Booking_Date' => '2026-07-10'])
            ->assertJsonFragment(['Booking_Date' => '2026-07-25']);
    }

    public function test_index_ignores_invalid_month_format_and_returns_all_bookings(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);
        $this->createBookingForDate('2026-08-15', 'Confirmed', 2000);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments?month=not-a-valid-month');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_index_ignores_missing_month_parameter_and_returns_all_bookings(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);
        $this->createBookingForDate('2026-08-15', 'Confirmed', 2000);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_index_returns_empty_array_when_there_are_no_bookings(): void
    {
        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments');

        $response->assertStatus(200)
            ->assertExactJson([]);
    }

    // ---------------------------------------------------------------------
    // Summary – monthly overview totals calculated from the bookings table
    // ---------------------------------------------------------------------

    public function test_summary_calculates_confirmed_and_unconfirmed_metrics_for_the_requested_month(): void
    {
        $month = now()->format('Y-m');

        // 3 confirmed bookings in the current month
        $this->createBookingForDate(now()->format('Y-m-03'), 'Confirmed', 1000);
        $this->createBookingForDate(now()->format('Y-m-12'), 'Confirmed', 2000);
        $this->createBookingForDate(now()->format('Y-m-21'), 'Confirmed', 500);

        // 2 in-cart / unconfirmed bookings in the current month
        $this->createBookingForDate(now()->format('Y-m-05'), 'Pending', 700);
        $this->createBookingForDate(now()->format('Y-m-28'), 'In cart', 800);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments/summary?month=' . $month);

        $response->assertStatus(200)
            ->assertJson([
                'total_confirmed' => 3,
                'total_unconfirmed' => 2,
                'total_earnings' => 3500,
                'total_earnings_confirmed' => 3500,
                'total_earnings_unconfirmed' => 1500,
            ]);
    }

    public function test_summary_counts_only_bookings_from_the_requested_month(): void
    {
        $now = now();
        $currentMonth = $now->format('Y-m');

        // Inside the requested month
        $this->createBookingForDate($now->format('Y-m-10'), 'Confirmed', 1000);
        $this->createBookingForDate($now->format('Y-m-20'), 'Pending', 600);

        // Outside the requested month
        $this->createBookingForDate(now()->subMonth(1)->format('Y-m-d'), 'Confirmed', 9000);
        $this->createBookingForDate(now()->subMonth(2)->format('Y-m-d'), 'Confirmed', 8000);
        $this->createBookingForDate(now()->subMonth(3)->format('Y-m-d'), 'Pending', 7000);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments/summary?month=' . $currentMonth);

        $response->assertStatus(200)
            ->assertJson([
                'total_confirmed' => 1,
                'total_unconfirmed' => 1,
                'total_earnings' => 1000,
                'total_earnings_confirmed' => 1000,
                'total_earnings_unconfirmed' => 600,
            ]);
    }

    public function test_summary_respects_the_custom_month_filter_parameter(): void
    {
        $this->createBookingForDate('2026-06-10', 'Confirmed', 2000);
        $this->createBookingForDate('2026-06-20', 'Pending', 500);
        $this->createBookingForDate('2026-07-15', 'Confirmed', 4000);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments/summary?month=2026-06');

        $response->assertStatus(200)
            ->assertJson([
                'total_confirmed' => 1,
                'total_unconfirmed' => 1,
                'total_earnings' => 2000,
                'total_earnings_confirmed' => 2000,
                'total_earnings_unconfirmed' => 500,
            ]);
    }

    public function test_summary_without_month_parameter_aggregates_all_bookings(): void
    {
        $this->createBookingForDate('2026-05-10', 'Confirmed', 1000);
        $this->createBookingForDate('2026-06-10', 'Confirmed', 2000);
        $this->createBookingForDate('2026-07-10', 'Pending', 500);
        $this->createBookingForDate('2026-08-10', 'Confirmed', 750);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments/summary');

        $response->assertStatus(200)
            ->assertJson([
                'total_confirmed' => 3,
                'total_unconfirmed' => 1,
                'total_earnings' => 3750,
                'total_earnings_confirmed' => 3750,
                'total_earnings_unconfirmed' => 500,
            ]);
    }

    public function test_summary_ignores_invalid_month_format(): void
    {
        $this->createBookingForDate('2026-07-10', 'Confirmed', 1000);
        $this->createBookingForDate('2026-08-15', 'Pending', 500);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments/summary?month=bad-format');

        $response->assertStatus(200)
            ->assertJson([
                'total_confirmed' => 1,
                'total_unconfirmed' => 1,
                'total_earnings' => 1000,
                'total_earnings_confirmed' => 1000,
                'total_earnings_unconfirmed' => 500,
            ]);
    }

    public function test_summary_returns_zero_values_when_no_bookings_exist(): void
    {
        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/appointments/summary');

        $response->assertStatus(200)
            ->assertJson([
                'total_confirmed' => 0,
                'total_unconfirmed' => 0,
                'total_earnings' => 0,
                'total_earnings_confirmed' => 0,
                'total_earnings_unconfirmed' => 0,
            ]);
    }
}