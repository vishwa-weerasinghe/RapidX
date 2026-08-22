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

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name' => 'Test',
            'Last_Name'  => 'Customer',
            'Email'      => fake()->unique()->safeEmail(),
            'Phone_No'   => '0771234567',
            'NIC'        => '199912345678',
            'Country'    => 'Sri Lanka',
        ], $overrides));
    }

    protected function createUser(int $customerId, string $email, string $password = 'Password@123'): User
    {
        return User::create([
            'User_Name'   => 'Test User',
            'Email'       => $email,
            'Password'    => Hash::make($password),
            'Customer_ID' => $customerId,
        ]);
    }

    protected function loginAndGetToken(string $email, string $password = 'Password@123'): string
    {
        return $this->postJson('/api/login', [
            'Email'    => $email,
            'Password' => $password,
        ])->json('token');
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    public function test_successful_registration_persists_customer_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'Email'                 => 'newuser@example.com',
            'Password'              => 'Password@123',
            'Password_confirmation' => 'Password@123',
            'First_Name'            => 'New',
            'Last_Name'             => 'User',
            'Phone_No'              => '0771234567',
            'NIC'                   => '200012345678',
            'Country'               => 'Sri Lanka',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Registration successful')
            ->assertJsonStructure(['message', 'user' => ['Member_ID', 'Email'], 'token']);

        $this->assertDatabaseHas('customers', ['Email' => 'newuser@example.com']);
        $this->assertDatabaseHas('users', ['Email' => 'newuser@example.com']);
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $user = User::where('Email', 'newuser@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('Password@123', $user->Password));
    }

    public function test_registration_user_name_is_concatenation_of_first_and_last_name(): void
    {
        $this->postJson('/api/register', [
            'Email'                 => 'name@example.com',
            'Password'              => 'Password@123',
            'Password_confirmation' => 'Password@123',
            'First_Name'            => 'John',
            'Last_Name'             => 'Doe',
            'Phone_No'              => '0771234567',
            'NIC'                   => '200012345678',
            'Country'               => 'Sri Lanka',
        ])->assertStatus(201);

        $this->assertDatabaseHas('users', ['User_Name' => 'John Doe']);
    }

    public function test_registration_returns_validation_errors_for_missing_fields(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'Email', 'Password', 'First_Name', 'Last_Name', 'Phone_No', 'NIC', 'Country',
            ]);

        $this->assertDatabaseCount('customers', 0);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_returns_validation_error_for_invalid_email(): void
    {
        $response = $this->postJson('/api/register', [
            'Email'                 => 'not-an-email',
            'Password'              => 'Password@123',
            'Password_confirmation' => 'Password@123',
            'First_Name'            => 'Test',
            'Last_Name'             => 'User',
            'Phone_No'              => '0771234567',
            'NIC'                   => '200012345678',
            'Country'               => 'Sri Lanka',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Email']);
    }

    public function test_registration_returns_validation_error_when_password_too_short(): void
    {
        $response = $this->postJson('/api/register', [
            'Email'                 => 'test@example.com',
            'Password'              => 'short',
            'Password_confirmation' => 'short',
            'First_Name'            => 'Test',
            'Last_Name'             => 'User',
            'Phone_No'              => '0771234567',
            'NIC'                   => '200012345678',
            'Country'               => 'Sri Lanka',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Password']);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_returns_validation_error_when_passwords_do_not_match(): void
    {
        $response = $this->postJson('/api/register', [
            'Email'                 => 'test@example.com',
            'Password'              => 'Password@123',
            'Password_confirmation' => 'DifferentPassword@123',
            'First_Name'            => 'Test',
            'Last_Name'             => 'User',
            'Phone_No'              => '0771234567',
            'NIC'                   => '200012345678',
            'Country'               => 'Sri Lanka',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Password']);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_rejects_duplicate_email_without_creating_new_records(): void
    {
        $customer = $this->createCustomer(['Email' => 'jane@example.com']);
        $this->createUser($customer->Customer_ID, 'jane@example.com');

        $response = $this->postJson('/api/register', [
            'Email'                 => 'jane@example.com',
            'Password'              => 'Password@123',
            'Password_confirmation' => 'Password@123',
            'First_Name'            => 'Another',
            'Last_Name'             => 'Person',
            'Phone_No'              => '0712345678',
            'NIC'                   => '199912345678',
            'Country'               => 'Sri Lanka',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Email']);

        $this->assertEquals(1, Customer::where('Email', 'jane@example.com')->count());
        $this->assertEquals(1, User::where('Email', 'jane@example.com')->count());
    }

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    public function test_user_can_login_with_correct_credentials_and_receives_token(): void
    {
        $customer = $this->createCustomer(['Email' => 'login@example.com']);
        $this->createUser($customer->Customer_ID, 'login@example.com');

        $response = $this->postJson('/api/login', [
            'Email'    => 'login@example.com',
            'Password' => 'Password@123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Login successful')
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

    public function test_login_returns_unauthorized_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'Email'    => 'nobody@example.com',
            'Password' => 'Password@123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    public function test_login_returns_validation_error_for_missing_fields(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Email', 'Password']);
    }

    public function test_login_returns_validation_error_for_invalid_email_format(): void
    {
        $response = $this->postJson('/api/login', [
            'Email'    => 'not-an-email',
            'Password' => 'Password@123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Email']);
    }

    // -------------------------------------------------------------------------
    // Logout
    // -------------------------------------------------------------------------

    public function test_authenticated_user_can_logout_and_token_is_revoked(): void
    {
        $customer = $this->createCustomer(['Email' => 'logout@example.com']);
        $this->createUser($customer->Customer_ID, 'logout@example.com');

        $token = $this->loginAndGetToken('logout@example.com');

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out successfully']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unauthenticated_user_cannot_logout(): void
    {
        $this->postJson('/api/logout')->assertStatus(401);
    }

    public function test_token_is_deleted_from_database_after_logout(): void
    {
        $customer = $this->createCustomer(['Email' => 'reuse@example.com']);
        $this->createUser($customer->Customer_ID, 'reuse@example.com');

        $token = $this->loginAndGetToken('reuse@example.com');

        // Confirm token was created
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/logout')
            ->assertStatus(200);

        // Token must be removed from the database after logout
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    // -------------------------------------------------------------------------
    // Dashboard (auth guard)
    // -------------------------------------------------------------------------

    public function test_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/dashboard')->assertStatus(401);
    }

    public function test_authenticated_user_can_access_dashboard_and_sees_own_data(): void
    {
        $customer = $this->createCustomer(['Email' => 'dash@example.com']);
        $this->createUser($customer->Customer_ID, 'dash@example.com');

        $token = $this->loginAndGetToken('dash@example.com');

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user' => ['Email', 'User_Name']]);

        $this->assertEquals('dash@example.com', $response->json('user.Email'));
    }
}
