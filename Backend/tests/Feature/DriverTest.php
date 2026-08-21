<?php

namespace Tests\Feature;

use App\Models\Driver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DriverTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_can_list_all_drivers()
    {
        Driver::create([
            'Driver_Name' => 'John Doe',
            'Phone_Number' => '1234567890',
            'Email' => 'john@example.com',
        ]);
        Driver::create([
            'Driver_Name' => 'Jane Smith',
            'Phone_Number' => '0987654321',
            'Email' => 'jane@example.com',
        ]);

        $response = $this->getJson('/api/drivers');

        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    public function test_can_create_a_driver()
    {
        $payload = [
            'Driver_Name' => 'Alice Johnson',
            'Phone_Number' => '5551234567',
            'Email' => 'alice@example.com',
        ];

        $response = $this->postJson('/api/drivers', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'Driver_Name' => 'Alice Johnson',
                     'Email' => 'alice@example.com',
                 ]);

        $this->assertDatabaseHas('drivers', [
            'Email' => 'alice@example.com',
        ]);
    }

    public function test_requires_fields_to_create_a_driver()
    {
        $response = $this->postJson('/api/drivers', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['Driver_Name', 'Phone_Number', 'Email']);
    }

    public function test_can_show_a_driver()
    {
        $driver = Driver::create([
            'Driver_Name' => 'Bob Williams',
            'Phone_Number' => '4445556666',
            'Email' => 'bob@example.com',
        ]);

        $response = $this->getJson("/api/drivers/{$driver->Driver_ID}");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'Driver_Name' => 'Bob Williams',
                 ]);
    }

    public function test_can_update_a_driver()
    {
        $driver = Driver::create([
            'Driver_Name' => 'Old Name',
            'Phone_Number' => '1112223333',
            'Email' => 'old@example.com',
        ]);

        $payload = [
            'Driver_Name' => 'New Name',
        ];

        $response = $this->putJson("/api/drivers/{$driver->Driver_ID}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'Driver_Name' => 'New Name',
                 ]);

        $this->assertDatabaseHas('drivers', [
            'Driver_ID' => $driver->Driver_ID,
            'Driver_Name' => 'New Name',
            'Email' => 'old@example.com', // remains unchanged
        ]);
    }

    public function test_can_delete_a_driver()
    {
        $driver = Driver::create([
            'Driver_Name' => 'To Be Deleted',
            'Phone_Number' => '9998887777',
            'Email' => 'delete@example.com',
        ]);

        $response = $this->deleteJson("/api/drivers/{$driver->Driver_ID}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('drivers', [
            'Driver_ID' => $driver->Driver_ID,
        ]);
    }
}
