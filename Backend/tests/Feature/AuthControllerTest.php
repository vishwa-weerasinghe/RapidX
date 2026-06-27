<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_returns_validation_errors_for_invalid_data(): void
    {
        $response = $this->postJson('/api/register', [
            'Email' => 'not-an-email',
            'Password' => 'short',
            'Password_confirmation' => 'different',
            'First_Name' => '',
            'Last_Name' => '',
            'Phone_No' => '',
            'NIC' => '',
            'Country' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Email', 'Password', 'First_Name', 'Last_Name', 'Phone_No', 'NIC', 'Country']);

        $this->assertDatabaseCount('customers', 0)
            ->assertDatabaseCount('users', 0);
    }

    public function test_registration_rejects_duplicate_email_without_creating_new_records(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Jane',
            'Last_Name' => 'Doe',
            'Email' => 'jane@example.com',
            'Phone_No' => '0771234567',
            'NIC' => '200012345678',
            'Country' => 'Sri Lanka',
        ]);

        User::create([
            'Email' => 'jane@example.com',
            'User_Name' => 'Jane Doe',
            'Password' => Hash::make('Password123'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->postJson('/api/register', [
            'Email' => 'jane@example.com',
            'Password' => 'Password123',
            'Password_confirmation' => 'Password123',
            'First_Name' => 'John',
            'Last_Name' => 'Smith',
            'Phone_No' => '0712345678',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Email']);

        $this->assertDatabaseHas('customers', ['Email' => 'jane@example.com'])
            ->assertDatabaseHas('users', ['Email' => 'jane@example.com']);
        $this->assertEquals(1, Customer::where('Email', 'jane@example.com')->count());
        $this->assertEquals(1, User::where('Email', 'jane@example.com')->count());
    }

    public function test_login_returns_unauthorized_for_invalid_credentials(): void
    {
        User::create([
            'Email' => 'sam@example.com',
            'User_Name' => 'Sam',
            'Password' => Hash::make('CorrectPassword123'),
            'Customer_ID' => Customer::create([
                'First_Name' => 'Sam',
                'Last_Name' => 'Perera',
                'Email' => 'sam@example.com',
                'Phone_No' => '0712345678',
                'NIC' => '199912345678',
                'Country' => 'Sri Lanka',
            ])->Customer_ID,
        ]);

        $response = $this->postJson('/api/login', [
            'Email' => 'sam@example.com',
            'Password' => 'WrongPassword123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    public function test_dashboard_requires_authentication(): void
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }

    public function test_successful_registration_persists_user_and_customer_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'Email' => 'newuser@example.com',
            'Password' => 'Password123',
            'Password_confirmation' => 'Password123',
            'First_Name' => 'New',
            'Last_Name' => 'User',
            'Phone_No' => '0771234567',
            'NIC' => '200012345678',
            'Country' => 'Sri Lanka',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Registration successful')
            ->assertJsonStructure(['message', 'user' => ['Member_ID', 'Email'], 'token']);

        $this->assertDatabaseHas('customers', ['Email' => 'newuser@example.com']);
        $this->assertDatabaseHas('users', ['Email' => 'newuser@example.com']);
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $user = User::where('Email', 'newuser@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('Password123', $user->Password));
    }
}
