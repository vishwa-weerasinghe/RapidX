<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
/**
 * GET /api/appointments/annual-report had no test coverage at all
 * (AppointmentControllerTest only covers index + summary).
 */
class AppointmentAnnualReportTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------------
    // Helpers (mirrors AppointmentControllerTest)
    // ---------------------------------------------------------------------

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
            'price_one_adult' => 1000,
            'price_more_adult' => 1000,
            'price_child' => 500,
        ]);
    }

    protected function createBookingForDate(string $date, string $status, float $payment): Booking
    {
        return Booking::create([
            'Booking_Date' => $date,
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Payment' => $payment,
            'Status' => $status,
            'Customer_ID' => $this->createCustomer()->Customer_ID,
            'Package_ID' => $this->createPackage()->id,
            'Vehicle_ID' => null,
        ]);
    }

    // ---------------------------------------------------------------------
    // Authorization
    // ---------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_the_annual_report(): void
    {
        $this->getJson('/api/appointments/annual-report')->assertStatus(401);
    }

    public function test_regular_user_cannot_access_the_annual_report(): void
    {
        $this->actingAs($this->regularUser(), 'sanctum')
            ->getJson('/api/appointments/annual-report')
            ->assertStatus(403)
            ->assertJson(['message' => 'Only administrators can view appointments.']);
    }

    // ---------------------------------------------------------------------
    // Report content
    // ---------------------------------------------------------------------

    public function test_admin_receives_twelve_monthly_rows_and_year_totals(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $this->createBookingForDate('2026-01-10', 'Confirmed', 1000);
            $this->createBookingForDate('2026-02-10', 'Pending', 500);
            // Previous-year booking must not leak into the 2026 report.
            $this->createBookingForDate('2025-01-10', 'Confirmed', 9999);

            $response = $this->actingAs($this->adminUser(), 'sanctum')
                ->getJson('/api/appointments/annual-report');

            $response->assertStatus(200)
                ->assertJsonPath('year', '2026')
                ->assertJsonCount(12, 'rows');

            $january = $response->json('rows.0');
            $this->assertSame('2026-01', $january['month']);
            $this->assertSame('January', $january['label']);
            $this->assertSame(1, $january['total_confirmed']);
            $this->assertEquals(1000.0, $january['earnings_confirmed']);
            $this->assertEquals(1000.0, $january['total']);

            $february = $response->json('rows.1');
            $this->assertSame('2026-02', $february['month']);
            $this->assertSame(1, $february['total_pending']);
            $this->assertEquals(500.0, $february['earnings_unconfirmed']);

            // December has no data.
            $december = $response->json('rows.11');
            $this->assertSame('2026-12', $december['month']);
            $this->assertSame(0, $december['total_confirmed']);
            $this->assertEquals(0.0, $december['total']);

            $totals = $response->json('totals');
            $this->assertSame(1, $totals['total_confirmed']);
            $this->assertSame(1, $totals['total_pending']);
            $this->assertEquals(1000.0, $totals['earnings_confirmed']);
            $this->assertEquals(500.0, $totals['earnings_unconfirmed']);
            $this->assertEquals(0.0, $totals['refunds']);
            $this->assertEquals(1500.0, $totals['total']);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_annual_report_honours_the_year_parameter(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $this->createBookingForDate('2025-03-10', 'Confirmed', 700);
            $this->createBookingForDate('2026-05-10', 'Confirmed', 900);

            $response = $this->actingAs($this->adminUser(), 'sanctum')
                ->getJson('/api/appointments/annual-report?year=2025');

            $response->assertStatus(200)
                ->assertJsonPath('year', '2025')
                ->assertJsonCount(12, 'rows');

            $march = $response->json('rows.2');
            $this->assertSame('2025-03', $march['month']);
            $this->assertSame(1, $march['total_confirmed']);

            $totals = $response->json('totals');
            $this->assertSame(1, $totals['total_confirmed']);
            $this->assertEquals(700.0, $totals['earnings_confirmed']);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_annual_report_ignores_an_invalid_year_parameter(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $this->actingAs($this->adminUser(), 'sanctum')
                ->getJson('/api/appointments/annual-report?year=not-a-year')
                ->assertStatus(200)
                ->assertJsonPath('year', '2026');
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }

    public function test_annual_report_returns_zero_filled_rows_when_no_bookings_exist(): void
    {
        try {
            \Illuminate\Support\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-15'));

            $response = $this->actingAs($this->adminUser(), 'sanctum')
                ->getJson('/api/appointments/annual-report');

            $response->assertStatus(200)->assertJsonCount(12, 'rows');

            foreach ($response->json('rows') as $row) {
                $this->assertSame(0, $row['total_confirmed']);
                $this->assertSame(0, $row['total_pending']);
                $this->assertEquals(0.0, $row['earnings_confirmed']);
                $this->assertEquals(0.0, $row['total']);
            }

            $totals = $response->json('totals');
            $this->assertSame(0, $totals['total_confirmed']);
            $this->assertEquals(0.0, $totals['total']);
        } finally {
            \Illuminate\Support\Carbon::setTestNow(null);
        }
    }
}