<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful login
     */
    public function test_user_can_login_with_correct_credentials(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Secure',
            'Last_Name' => 'User',
            'Email' => 'secureuser@example.com',
            'Phone_No' => '0712345678',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ]);

        User::create([
            'Email' => 'secureuser@example.com',
            'User_Name' => 'Secure User',
            'Password' => Hash::make('StrongPass@123'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->postJson('/api/login', [
            'Email' => 'secureuser@example.com',
            'Password' => 'StrongPass@123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'user', 'token']);
    }

    /**
     * Test invalid login prevents access
     */
    public function test_login_returns_unauthorized_for_invalid_credentials(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Sam',
            'Last_Name' => 'Perera',
            'Email' => 'sam@example.com',
            'Phone_No' => '0712345678',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ]);

        User::create([
            'Email' => 'sam@example.com',
            'User_Name' => 'Sam',
            'Password' => Hash::make('CorrectPassword@123'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->postJson('/api/login', [
            'Email' => 'sam@example.com',
            'Password' => 'WrongPassword@123',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid credentials']);
    }

    /**
     * Test successful registration
     */
    public function test_successful_registration_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'Email' => 'newuser@example.com',
            'Password' => 'StrongPass@123',
            'Password_confirmation' => 'StrongPass@123',
            'First_Name' => 'New',
            'Last_Name' => 'User',
            'Phone_No' => '0771234567',
            'NIC' => '200012345678',
            'Country' => 'Sri Lanka',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Registration successful')
                 ->assertJsonStructure(['message', 'user', 'token']);
                 
        $this->assertDatabaseHas('users', ['Email' => 'newuser@example.com']);
    }

    /**
     * Test successful logout
     */
    public function test_user_can_logout_successfully(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Logout',
            'Last_Name' => 'User',
            'Email' => 'logoutuser@example.com',
            'Phone_No' => '0712345678',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ]);

        $user = User::create([
            'Email' => 'logoutuser@example.com',
            'User_Name' => 'Logout User',
            'Password' => \Illuminate\Support\Facades\Hash::make('Password@123'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        // Login to get a real token
        $loginResponse = $this->postJson('/api/login', [
            'Email' => 'logoutuser@example.com',
            'Password' => 'Password@123',
        ]);
        
        $token = $loginResponse->json('token');

        // Pass the token as a Bearer token to test actual logout
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Logged out successfully']);
                 
        // Verify token is deleted
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
