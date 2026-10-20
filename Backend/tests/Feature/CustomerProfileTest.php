<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * GET/PUT /api/customer-profile (AuthController::updateProfile) had no test
 * coverage at all in AuthControllerTest.
 */
class CustomerProfileTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name' => 'John',
            'Last_Name' => 'Doe',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ], $overrides));
    }

    protected function createUser(?int $customerId, array $overrides = []): User
    {
        return User::create(array_merge([
            'User_Name' => 'Profile User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => Hash::make('Password@123'),
            'Customer_ID' => $customerId,
        ], $overrides));
    }

    protected function validPayload(array $overrides = []): array
    {
        return array_merge([
            'First_Name' => 'Nimal',
            'Last_Name' => 'Siriwardena',
            'Email' => 'profile-update@example.com',
            'Phone_No' => '0779999999',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ], $overrides);
    }

    // ---------------------------------------------------------------------
    // GET /api/customer-profile
    // ---------------------------------------------------------------------

    public function test_guest_cannot_view_customer_profile(): void
    {
        $this->getJson('/api/customer-profile')->assertStatus(401);
    }

    public function test_authenticated_user_can_view_their_own_customer_profile(): void
    {
        $customer = $this->createCustomer(['Email' => 'owner@example.com']);
        $user = $this->createUser($customer->Customer_ID, ['Email' => 'owner@example.com']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer-profile')
            ->assertStatus(200)
            ->assertJsonPath('Customer_ID', $customer->Customer_ID)
            ->assertJsonPath('Email', 'owner@example.com')
            ->assertJsonPath('First_Name', 'John');
    }

    public function test_customer_profile_is_null_when_the_user_has_no_linked_customer(): void
    {
        $user = $this->createUser(null);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/customer-profile');

        // Customer::find(null) is null, and response()->json(null) serialises
        // on the wire as {} — the frontend receives no customer data.
        $response->assertStatus(200);
        $response->assertExactJson([]);
    }

    // ---------------------------------------------------------------------
    // PUT /api/customer-profile
    // ---------------------------------------------------------------------

    public function test_guest_cannot_update_customer_profile(): void
    {
        $this->putJson('/api/customer-profile', $this->validPayload())
            ->assertStatus(401);
    }

    public function test_authenticated_user_can_update_their_profile(): void
    {
        $customer = $this->createCustomer(['Email' => 'before@example.com']);
        $user = $this->createUser($customer->Customer_ID, [
            'Email' => 'before@example.com',
            'User_Name' => 'John Doe',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/customer-profile', $this->validPayload([
                'Email' => 'after@example.com',
            ]));

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Profile updated successfully.')
            ->assertJsonPath('customer.Email', 'after@example.com')
            ->assertJsonPath('user.User_Name', 'Nimal Siriwardena');

        // Customer record updated...
        $this->assertDatabaseHas('customers', [
            'Customer_ID' => $customer->Customer_ID,
            'First_Name' => 'Nimal',
            'Last_Name' => 'Siriwardena',
            'Email' => 'after@example.com',
            'Phone_No' => '0779999999',
            'NIC' => '199912345678',
            'Country' => 'Sri Lanka',
        ]);

        // ...and the user record keeps Email/User_Name in sync with it.
        $this->assertDatabaseHas('users', [
            'Member_ID' => $user->Member_ID,
            'Email' => 'after@example.com',
            'User_Name' => 'Nimal Siriwardena',
        ]);
    }

    public function test_profile_update_returns_validation_errors_for_missing_fields(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->Customer_ID);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/customer-profile', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'First_Name', 'Last_Name', 'Email', 'Phone_No', 'NIC', 'Country',
            ]);
    }

    public function test_profile_update_rejects_an_email_taken_by_another_user(): void
    {
        $customer = $this->createCustomer(['Email' => 'mine@example.com']);
        $user = $this->createUser($customer->Customer_ID, ['Email' => 'mine@example.com']);

        $otherCustomer = $this->createCustomer(['Email' => 'taken@example.com']);
        $this->createUser($otherCustomer->Customer_ID, ['Email' => 'taken@example.com']);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/customer-profile', $this->validPayload([
                'Email' => 'taken@example.com',
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['Email']);

        // The original e-mail must be untouched after the failed update.
        $this->assertDatabaseHas('users', ['Member_ID' => $user->Member_ID, 'Email' => 'mine@example.com']);
    }

    public function test_profile_update_accepts_keeping_the_current_email(): void
    {
        $customer = $this->createCustomer(['Email' => 'same@example.com']);
        $user = $this->createUser($customer->Customer_ID, ['Email' => 'same@example.com']);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/customer-profile', $this->validPayload([
                'Email' => 'same@example.com',
            ]))
            ->assertStatus(200)
            ->assertJsonPath('message', 'Profile updated successfully.');
    }

    public function test_profile_update_returns_404_when_user_has_no_customer_profile(): void
    {
        $user = $this->createUser(null);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/customer-profile', $this->validPayload())
            ->assertStatus(404)
            ->assertJson(['message' => 'Customer profile not found.']);
    }
}