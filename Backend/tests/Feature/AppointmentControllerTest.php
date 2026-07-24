<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\Package;
use App\Models\User;
use App\Models\Vehicle;
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

    protected function createBooking(?int $vehicleId = null): Booking
    {
        $customer = Customer::create([
            'First_Name' => 'Nimal',
            'Last_Name' => 'Perera',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0712345678',
            'NIC' => '200012345678',
            'Country' => 'Sri Lanka',
        ]);

        $package = Package::create([
            'Package_Name' => 'City Tour',
            'Description' => 'A sample package',
            'Price_for_adult' => 1000,
            'Price_for_child' => 500,
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
            'Vehicle_ID' => $vehicleId,
        ]);
    }

    public function test_index_returns_appointments_successfully(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Saman',
            'Last_Name' => 'Kumara',
            'Email' => 'saman@example.com',
            'Phone_No' => '0771234567',
            'NIC' => '200012345679',
            'Country' => 'Sri Lanka',
        ]);

        $package = Package::create([
            'Package_Name' => 'Airport Ride',
            'Description' => 'Airport transfer package',
            'Price_for_adult' => 2000,
            'Price_for_child' => 1000,
        ]);

        $driver = Driver::create([
            'Driver_Name' => 'Kasun Perera',
            'Phone_Number' => '0761111111',
            'Email' => 'kasun@example.com',
        ]);

        $vehicle = Vehicle::unguarded(function () use ($driver): Vehicle {
            return Vehicle::create([
                'Vehicle_No' => 'ABC-1234',
                'Vehicle_Type' => 'Car',
                'No_of_Seats' => 4,
                'Driver_ID' => $driver->Driver_ID,
            ]);
        });

        Booking::create([
            'Booking_Date' => '2026-07-11',
            'Pickup_Time' => '08:30:00',
            'Pickup_Location' => 'Kandy',
            'No_of_adults' => 1,
            'No_of_child' => 0,
            'Payment' => 1000,
            'Status' => 'Pending',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Vehicle_ID' => $vehicle->Vehicle_ID,
        ]);

        $response = $this->getJson('/api/appointments');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Email' => 'saman@example.com'])
            ->assertJsonFragment(['Driver_Name' => 'Kasun Perera']);
    }

    public function test_admin_can_successfully_assign_driver_and_persist_database_change(): void
    {
        $booking = $this->createBooking();
        $driver = Driver::create([
            'Driver_Name' => 'Amal Silva',
            'Phone_Number' => '0712222222',
            'Email' => 'amal@example.com',
        ]);
        $vehicle = Vehicle::unguarded(function () use ($driver): Vehicle {
            return Vehicle::create([
                'Vehicle_No' => 'XYZ-5678',
                'Vehicle_Type' => 'Van',
                'No_of_Seats' => 8,
                'Driver_ID' => $driver->Driver_ID,
            ]);
        });

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->putJson('/api/appointments/' . $booking->Booking_ID . '/driver', [
                'Driver_ID' => $driver->Driver_ID,
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Driver assignment updated successfully.']);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => $vehicle->Vehicle_ID,
        ]);
    }

    public function test_update_driver_requires_authentication_for_unauthorized_access(): void
    {
        $booking = $this->createBooking();

        $response = $this->putJson('/api/appointments/' . $booking->Booking_ID . '/driver', [
            'Driver_ID' => 1,
        ]);

        $response->assertStatus(401);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => null,
        ]);
    }

    public function test_update_driver_returns_validation_errors_for_missing_required_fields(): void
    {
        $booking = $this->createBooking();

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->putJson('/api/appointments/' . $booking->Booking_ID . '/driver', [
                'Driver_ID' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Driver_ID']);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => null,
        ]);
    }

    public function test_update_driver_returns_validation_errors_for_invalid_input(): void
    {
        $booking = $this->createBooking();

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->putJson('/api/appointments/' . $booking->Booking_ID . '/driver', [
                'Driver_ID' => 999,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Driver_ID']);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => null,
        ]);
    }

    public function test_update_driver_rejects_unauthorized_user(): void
    {
        $booking = $this->createBooking();
        $driver = Driver::create([
            'Driver_Name' => 'Sunil Fernando',
            'Phone_Number' => '0777777777',
            'Email' => 'sunil@example.com',
        ]);

        $response = $this->actingAs($this->regularUser(), 'sanctum')
            ->putJson('/api/appointments/' . $booking->Booking_ID . '/driver', [
                'Driver_ID' => $driver->Driver_ID,
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Only administrators can change the assigned driver.']);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => null,
        ]);
    }

    public function test_update_driver_handles_edge_case_when_driver_has_no_vehicle(): void
    {
        $booking = $this->createBooking();
        $driver = Driver::create([
            'Driver_Name' => 'Ruwan Jayasuriya',
            'Phone_Number' => '0755555555',
            'Email' => 'ruwan@example.com',
        ]);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->putJson('/api/appointments/' . $booking->Booking_ID . '/driver', [
                'Driver_ID' => $driver->Driver_ID,
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'No vehicle is assigned to this driver.']);

        $booking->refresh();
        $this->assertNull($booking->Vehicle_ID);
    }
}
