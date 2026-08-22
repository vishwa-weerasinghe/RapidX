<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverControllerTest extends TestCase
{
    use RefreshDatabase;

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

    public function test_public_user_can_list_drivers(): void
    {
        Driver::create([
            'Driver_Name' => 'Alice Fernando',
            'Phone_Number' => '0712345678',
            'Email' => 'alice@example.com',
        ]);

        $response = $this->getJson('/api/drivers');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Driver_Name' => 'Alice Fernando']);

        $this->assertDatabaseCount('drivers', 1);
    }

    public function test_public_user_can_view_a_driver(): void
    {
        $driver = Driver::create([
            'Driver_Name' => 'Bob Silva',
            'Phone_Number' => '0776543210',
            'Email' => 'bob@example.com',
        ]);

        $response = $this->getJson('/api/drivers/' . $driver->Driver_ID);

        $response->assertStatus(200)
            ->assertJsonPath('Driver_Name', 'Bob Silva');
    }

    public function test_admin_can_create_a_driver_and_persist_it(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/drivers', [
                'Driver_Name' => 'Nimal Perera',
                'Phone_Number' => '0761234567',
                'Email' => 'nimal@example.com',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('Driver_Name', 'Nimal Perera');

        $this->assertDatabaseHas('drivers', [
            'Driver_Name' => 'Nimal Perera',
            'Email' => 'nimal@example.com',
        ]);
    }

    public function test_non_admin_cannot_create_a_driver(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/drivers', [
                'Driver_Name' => 'Unauthorized Driver',
                'Phone_Number' => '0761111111',
                'Email' => 'unauth@example.com',
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseCount('drivers', 0);
    }

    public function test_unauthenticated_user_cannot_create_a_driver(): void
    {
        $response = $this->postJson('/api/drivers', [
            'Driver_Name' => 'Unauthorized Driver',
            'Phone_Number' => '0761111111',
            'Email' => 'unauth@example.com',
        ]);

        $response->assertStatus(401);
        $this->assertDatabaseCount('drivers', 0);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/drivers', [
                'Driver_Name' => '',
                'Phone_Number' => '',
                'Email' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Driver_Name', 'Phone_Number', 'Email']);
    }

    public function test_admin_can_update_a_driver_and_database_changes_are_persisted(): void
    {
        $admin = $this->createAdmin();
        $driver = Driver::create([
            'Driver_Name' => 'Original Name',
            'Phone_Number' => '0711111111',
            'Email' => 'original@example.com',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/drivers/' . $driver->Driver_ID, [
                'Driver_Name' => 'Updated Name',
                'Phone_Number' => '0762222222',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('Driver_Name', 'Updated Name');

        $this->assertDatabaseHas('drivers', [
            'Driver_ID' => $driver->Driver_ID,
            'Driver_Name' => 'Updated Name',
            'Phone_Number' => '0762222222',
        ]);
    }

    public function test_non_admin_cannot_update_a_driver(): void
    {
        $user = $this->createUser();
        $driver = Driver::create([
            'Driver_Name' => 'Original Name',
            'Phone_Number' => '0711111111',
            'Email' => 'original@example.com',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/drivers/' . $driver->Driver_ID, [
                'Driver_Name' => 'Updated Name',
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('drivers', ['Driver_Name' => 'Original Name']);
    }

    public function test_admin_can_delete_a_driver(): void
    {
        $admin = $this->createAdmin();
        $driver = Driver::create([
            'Driver_Name' => 'Delete Me',
            'Phone_Number' => '0713333333',
            'Email' => 'delete@example.com',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/drivers/' . $driver->Driver_ID);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('drivers', ['Driver_ID' => $driver->Driver_ID]);
    }

    public function test_non_admin_cannot_delete_a_driver(): void
    {
        $user = $this->createUser();
        $driver = Driver::create([
            'Driver_Name' => 'Keep Me',
            'Phone_Number' => '0713333333',
            'Email' => 'keep@example.com',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/drivers/' . $driver->Driver_ID);

        $response->assertStatus(403);
        $this->assertDatabaseHas('drivers', ['Driver_ID' => $driver->Driver_ID]);
    }
}
