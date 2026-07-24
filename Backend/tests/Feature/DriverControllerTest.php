<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticatedUser(): User
    {
        return User::create([
            'User_Name' => 'Test User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
        ]);
    }

    public function test_authenticated_user_can_list_drivers(): void
    {
        $this->authenticatedUser();

        Driver::create([
            'Driver_Name' => 'Alice Fernando',
            'Phone_Number' => '0712345678',
            'Email' => 'alice@example.com',
        ]);

        Driver::create([
            'Driver_Name' => 'Bob Silva',
            'Phone_Number' => '0776543210',
            'Email' => 'bob@example.com',
        ]);

        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->getJson('/api/drivers');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['Driver_Name' => 'Alice Fernando']);

        $this->assertDatabaseCount('drivers', 2);
    }

    public function test_authenticated_user_can_create_a_driver_and_persist_it(): void
    {
        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->postJson('/api/drivers', [
                'Driver_Name' => 'Nimal Perera',
                'Phone_Number' => '0761234567',
                'Email' => 'nimal@example.com',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('Driver_Name', 'Nimal Perera')
            ->assertJsonPath('Email', 'nimal@example.com');

        $this->assertDatabaseHas('drivers', [
            'Driver_Name' => 'Nimal Perera',
            'Phone_Number' => '0761234567',
            'Email' => 'nimal@example.com',
        ]);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->postJson('/api/drivers', [
                'Driver_Name' => '',
                'Phone_Number' => '',
                'Email' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Driver_Name', 'Phone_Number', 'Email']);

        $this->assertDatabaseCount('drivers', 0);
    }

    public function test_store_returns_validation_errors_for_invalid_input(): void
    {
        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->postJson('/api/drivers', [
                'Driver_Name' => str_repeat('A', 101),
                'Phone_Number' => '0712345678',
                'Email' => 'not-an-email',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Driver_Name', 'Email']);

        $this->assertDatabaseCount('drivers', 0);
    }

    public function test_unauthenticated_user_can_access_driver_endpoints(): void
    {
        $driver = Driver::create([
            'Driver_Name' => 'Kamal',
            'Phone_Number' => '0710000000',
            'Email' => 'kamal@example.com',
        ]);

        $this->getJson('/api/drivers')->assertStatus(200);
        $this->postJson('/api/drivers', [
            'Driver_Name' => 'New Driver',
            'Phone_Number' => '0720000000',
            'Email' => 'new@example.com',
        ])->assertStatus(201);
        $this->getJson('/api/drivers/' . $driver->Driver_ID)->assertStatus(200);
        $this->putJson('/api/drivers/' . $driver->Driver_ID, [
            'Driver_Name' => 'Updated',
        ])->assertStatus(200);
        $this->deleteJson('/api/drivers/' . $driver->Driver_ID)->assertStatus(200);
    }

    public function test_authenticated_user_can_update_a_driver_and_database_changes_are_persisted(): void
    {
        $driver = Driver::create([
            'Driver_Name' => 'Original Name',
            'Phone_Number' => '0711111111',
            'Email' => 'original@example.com',
        ]);

        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->putJson('/api/drivers/' . $driver->Driver_ID, [
                'Driver_Name' => 'Updated Name',
                'Phone_Number' => '0762222222',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('Driver_Name', 'Updated Name')
            ->assertJsonPath('Phone_Number', '0762222222');

        $this->assertDatabaseHas('drivers', [
            'Driver_ID' => $driver->Driver_ID,
            'Driver_Name' => 'Updated Name',
            'Phone_Number' => '0762222222',
            'Email' => 'original@example.com',
        ]);
    }

    public function test_authenticated_user_can_delete_a_driver(): void
    {
        $driver = Driver::create([
            'Driver_Name' => 'Delete Me',
            'Phone_Number' => '0713333333',
            'Email' => 'delete@example.com',
        ]);

        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->deleteJson('/api/drivers/' . $driver->Driver_ID);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Driver deleted']);

        $this->assertDatabaseMissing('drivers', ['Driver_ID' => $driver->Driver_ID]);
    }
}
