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

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name' => 'Test',
            'Last_Name'  => 'User',
            'Email'      => fake()->unique()->safeEmail(),
            'Phone_No'   => '0712345678',
            'NIC'        => '199912345678',
            'Country'    => 'Sri Lanka',
        ], $overrides));
    }

    protected function createUser(int $customerId, string $email, string $password = 'StrongPass@123'): User
    {
        return User::create([
            'Email'       => $email,
            'User_Name'   => 'Test User',
            'Password'    => Hash::make($password),
            'Customer_ID' => $customerId,
        ]);
    }

    protected function loginAndGetToken(string $email, string $password = 'StrongPass@123'): string
    {
        return $this->postJson('/api/login', [
            'Email'    => $email,
            'Password' => $password,
        ])->json('token');
    }

    // -------------------------------------------------------------------------
    // Login security
    // -------------------------------------------------------------------------

    public function test_user_can_login_with_correct_credentials(): void
    {
        $customer = $this->createCustomer(['Email' => 'secureuser@example.com']);
        $this->createUser($customer->Customer_ID, 'secureuser@example.com');

        $response = $this->postJson('/api/login', [
            'Email'    => 'secureuser@example.com',
            'Password' => 'StrongPass@123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertNotNull($response->json('token'));
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_login_returns_unauthorized_for_wrong_password(): void
    {
        $customer = $this->createCustomer(['Email' => 'sam@example.com']);
        $this->createUser($customer->Customer_ID, 'sam@example.com', 'CorrectPassword@123');

        $response = $this->postJson('/api/login', [
            'Email'    => 'sam@example.com',
            'Password' => 'WrongPassword@123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_does_not_reveal_whether_email_exists(): void
    {
        // Both a non-existent account and a wrong-password attempt return the same 401
        $response = $this->postJson('/api/login', [
            'Email'    => 'ghost@example.com',
            'Password' => 'SomePassword@123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    // -------------------------------------------------------------------------
    // Registration security
    // -------------------------------------------------------------------------

    public function test_successful_registration_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'Email'                 => 'newuser@example.com',
            'Password'              => 'StrongPass@123',
            'Password_confirmation' => 'StrongPass@123',
            'First_Name'            => 'New',
            'Last_Name'             => 'User',
            'Phone_No'              => '0771234567',
            'NIC'                   => '200012345678',
            'Country'               => 'Sri Lanka',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Registration successful')
            ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('users', ['Email' => 'newuser@example.com']);
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_registration_password_is_stored_hashed_not_in_plain_text(): void
    {
        $this->postJson('/api/register', [
            'Email'                 => 'hashcheck@example.com',
            'Password'              => 'StrongPass@123',
            'Password_confirmation' => 'StrongPass@123',
            'First_Name'            => 'Hash',
            'Last_Name'             => 'Check',
            'Phone_No'              => '0771234567',
            'NIC'                   => '200012345678',
            'Country'               => 'Sri Lanka',
        ])->assertStatus(201);

        $user = User::where('Email', 'hashcheck@example.com')->first();
        $this->assertNotEquals('StrongPass@123', $user->Password);
        $this->assertTrue(Hash::check('StrongPass@123', $user->Password));
    }

    // -------------------------------------------------------------------------
    // Logout security
    // -------------------------------------------------------------------------

    public function test_user_can_logout_successfully(): void
    {
        $customer = $this->createCustomer(['Email' => 'logoutuser@example.com']);
        $this->createUser($customer->Customer_ID, 'logoutuser@example.com', 'Password@123');

        $token = $this->loginAndGetToken('logoutuser@example.com', 'Password@123');

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out successfully']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_logout_without_token_returns_unauthorized(): void
    {
        $this->postJson('/api/logout')->assertStatus(401);
    }

    public function test_token_is_deleted_from_database_after_logout(): void
    {
        $customer = $this->createCustomer(['Email' => 'revoketest@example.com']);
        $this->createUser($customer->Customer_ID, 'revoketest@example.com');

        $token = $this->loginAndGetToken('revoketest@example.com');

        // Confirm token exists in the database before logout
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/logout')
            ->assertStatus(200);

        // Token must be permanently removed from the database
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_expired_token_is_rejected_with_unauthorized(): void
    {
        // AUTH-13: Tokens older than sanctum.expiration are rejected with 401
        $customer = $this->createCustomer(['Email' => 'expireduser@example.com']);
        $this->createUser($customer->Customer_ID, 'expireduser@example.com');

        $token = $this->loginAndGetToken('expireduser@example.com');

        // Backdate token to 30 days ago
        \Illuminate\Support\Facades\DB::table('personal_access_tokens')
            ->update(['created_at' => now()->subDays(30)]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/dashboard');

        $response->assertStatus(401);
    }
}
