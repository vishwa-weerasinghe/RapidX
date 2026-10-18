<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class VehicleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (!Schema::hasColumn('packages', 'Package_ID')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->unsignedBigInteger('Package_ID')->nullable()->after('id');
            });
        }

        DB::table('packages')->update(['Package_ID' => DB::raw('id')]);
    }

    protected function createUser(): User
    {
        return User::create([
            'User_Name' => 'Test User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
        ]);
    }

    protected function createAdmin(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    protected function createDriver(): Driver
    {
        return Driver::create([
            'Driver_Name' => 'Test Driver',
            'Phone_Number' => '0712345678',
            'Email' => fake()->unique()->safeEmail(),
        ]);
    }

    protected function createVehicle(array $attributes = []): Vehicle
    {
        return Vehicle::create(array_merge([
            'Vehicle_No' => 'WP-CAB-1234',
            'Vehicle_Type' => 'Bus',
            'No_of_Seats' => 30,
            'Driver_ID' => $this->createDriver()->Driver_ID,
        ], $attributes));
    }

    protected function createBooking(): Booking
    {
        $customer = Customer::create([
            'First_Name' => 'Test',
            'Last_Name' => 'Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ]);
        $package = Package::create([
            'Package_Name' => 'City Tour',
            'Description' => 'A sample package',
            'price_one_adult' => 1000,
            'price_more_adult' => 1000,
            'price_child' => 500,
        ]);
        DB::table('packages')->where('id', $package->id)->update(['Package_ID' => $package->id]);

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

    public function test_admin_can_list_vehicles(): void
    {
        $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/vehicles')
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_non_admin_cannot_list_vehicles(): void
    {
        $this->actingAs($this->createUser(), 'sanctum')
            ->getJson('/api/vehicles')
            ->assertForbidden();
    }

    public function test_guest_cannot_list_vehicles(): void
    {
        $this->getJson('/api/vehicles')->assertUnauthorized();
    }

    public function test_admin_can_view_a_vehicle(): void
    {
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/vehicles/' . $vehicle->Vehicle_ID)
            ->assertOk()
            ->assertJsonPath('Vehicle_No', 'WP-CAB-1234');
    }

    public function test_non_admin_cannot_view_vehicle(): void
    {
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createUser(), 'sanctum')
            ->getJson('/api/vehicles/' . $vehicle->Vehicle_ID)
            ->assertForbidden();
    }

    public function test_guest_cannot_view_vehicle(): void
    {
        $vehicle = $this->createVehicle();

        $this->getJson('/api/vehicles/' . $vehicle->Vehicle_ID)->assertUnauthorized();
    }

    public function test_viewing_a_non_existing_vehicle_returns_not_found(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/vehicles/999999')
            ->assertNotFound();
    }

    public function test_admin_can_create_vehicle_and_persist_it(): void
    {
        $driver = $this->createDriver();

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->postJson('/api/vehicles', [
                'Vehicle_No' => 'SP-ABC-2468',
                'Vehicle_Type' => 'Coach',
                'No_of_Seats' => 45,
                'Driver_ID' => $driver->Driver_ID,
            ]);

        $response->assertCreated()
            ->assertJsonPath('Vehicle_No', 'SP-ABC-2468')
            ->assertJsonPath('Vehicle_Type', 'Coach')
            ->assertJsonPath('No_of_Seats', 45)
            ->assertJsonPath('Driver_ID', $driver->Driver_ID);

        $this->assertDatabaseHas('vehicles', [
            'Vehicle_No' => 'SP-ABC-2468',
            'Vehicle_Type' => 'Coach',
            'No_of_Seats' => 45,
            'Driver_ID' => $driver->Driver_ID,
        ]);
    }

    public function test_admin_can_create_vehicle_without_assigning_a_driver(): void
    {
        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->postJson('/api/vehicles', [
                'Vehicle_No' => 'SP-NODRIVER-1',
                'Vehicle_Type' => 'Coach',
                'No_of_Seats' => 45,
            ]);

        $response->assertCreated()
            ->assertJsonPath('Vehicle_No', 'SP-NODRIVER-1')
            ->assertJsonPath('Driver_ID', null);

        $this->assertDatabaseHas('vehicles', [
            'Vehicle_No' => 'SP-NODRIVER-1',
            'Driver_ID' => null,
        ]);
    }

    public function test_admin_can_update_vehicle_and_persist_updated_values(): void
    {
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/vehicles/' . $vehicle->Vehicle_ID, [
                'Vehicle_No' => 'WP-NEW-4321',
                'Vehicle_Type' => 'Luxury Bus',
                'No_of_Seats' => 50,
            ])
            ->assertOk()
            ->assertJsonPath('Vehicle_No', 'WP-NEW-4321')
            ->assertJsonPath('Vehicle_Type', 'Luxury Bus')
            ->assertJsonPath('No_of_Seats', 50);

        $this->assertDatabaseHas('vehicles', [
            'Vehicle_ID' => $vehicle->Vehicle_ID,
            'Vehicle_No' => 'WP-NEW-4321',
            'Vehicle_Type' => 'Luxury Bus',
            'No_of_Seats' => 50,
        ]);
    }

    public function test_admin_can_clear_a_vehicles_driver_assignment(): void
    {
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/vehicles/' . $vehicle->Vehicle_ID, ['Driver_ID' => null])
            ->assertOk()
            ->assertJsonPath('Driver_ID', null);

        $this->assertDatabaseHas('vehicles', [
            'Vehicle_ID' => $vehicle->Vehicle_ID,
            'Driver_ID' => null,
        ]);
    }

    public function test_updating_a_non_existing_vehicle_returns_not_found(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/vehicles/999999', ['Vehicle_Type' => 'Van'])
            ->assertNotFound();
    }

    public function test_deleting_a_non_existing_vehicle_returns_not_found(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/vehicles/999999')
            ->assertNotFound();
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->postJson('/api/vehicles', [
                'Vehicle_No' => '',
                'Vehicle_Type' => '',
                'No_of_Seats' => '',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['Vehicle_No', 'Vehicle_Type', 'No_of_Seats']);
    }

    public function test_store_returns_validation_errors_for_invalid_values(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->postJson('/api/vehicles', [
                'Vehicle_No' => str_repeat('A', 21),
                'Vehicle_Type' => str_repeat('B', 51),
                'No_of_Seats' => 0,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['Vehicle_No', 'Vehicle_Type', 'No_of_Seats']);
    }

    public function test_update_accepts_boundary_values(): void
    {
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/vehicles/' . $vehicle->Vehicle_ID, [
                'Vehicle_No' => str_repeat('A', 20),
                'Vehicle_Type' => str_repeat('B', 50),
                'No_of_Seats' => 1,
            ])
            ->assertOk();
    }

    public function test_admin_can_delete_vehicle_and_remove_it_from_database(): void
    {
        $admin = $this->createAdmin();
        $vehicle = $this->createVehicle();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/vehicles/' . $vehicle->Vehicle_ID)
            ->assertOk()
            ->assertJson(['message' => 'Vehicle deleted']);

        $this->assertDatabaseMissing('vehicles', ['Vehicle_ID' => $vehicle->Vehicle_ID]);
    }

    public function test_non_admin_user_cannot_create_update_delete_vehicle(): void
    {
        $user = $this->createUser();
        $vehicle = $this->createVehicle();
        $this->actingAs($user, 'sanctum')->postJson('/api/vehicles', [])->assertForbidden();
        $this->actingAs($user, 'sanctum')->putJson('/api/vehicles/' . $vehicle->Vehicle_ID, [])->assertForbidden();
        $this->actingAs($user, 'sanctum')->deleteJson('/api/vehicles/' . $vehicle->Vehicle_ID)->assertForbidden();
    }

    public function test_guest_cannot_create_update_delete_vehicle(): void
    {
        $vehicle = $this->createVehicle();
        $this->postJson('/api/vehicles', [])->assertUnauthorized();
        $this->putJson('/api/vehicles/' . $vehicle->Vehicle_ID, [])->assertUnauthorized();
        $this->deleteJson('/api/vehicles/' . $vehicle->Vehicle_ID)->assertUnauthorized();
    }

    public function test_admin_can_assign_vehicle(): void
    {
        $booking = $this->createBooking();
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicle', [
                'Vehicle_ID' => $vehicle->Vehicle_ID,
            ])
            ->assertOk()
            ->assertJsonPath('booking.Vehicle_ID', $vehicle->Vehicle_ID);
    }

    public function test_non_admin_cannot_assign_vehicle(): void
    {
        $booking = $this->createBooking();
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createUser(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicle', [
                'Vehicle_ID' => $vehicle->Vehicle_ID,
            ])
            ->assertForbidden();
    }

    public function test_guest_cannot_assign_vehicle(): void
    {
        $booking = $this->createBooking();
        $vehicle = $this->createVehicle();

        $this->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicle', [
            'Vehicle_ID' => $vehicle->Vehicle_ID,
        ])->assertUnauthorized();
    }

    public function test_vehicle_assignment_persists(): void
    {
        $booking = $this->createBooking();
        $vehicle = $this->createVehicle();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicle', [
                'Vehicle_ID' => $vehicle->Vehicle_ID,
            ])
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Vehicle_ID' => $vehicle->Vehicle_ID,
        ]);
    }

    public function test_invalid_vehicle_is_rejected_when_assigning(): void
    {
        $booking = $this->createBooking();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/' . $booking->Booking_ID . '/vehicle', [
                'Vehicle_ID' => 999999,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['Vehicle_ID']);
    }

}
