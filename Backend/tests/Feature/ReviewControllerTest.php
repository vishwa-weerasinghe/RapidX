<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name' => 'Test',
            'Last_Name' => 'Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ], $overrides));
    }

    protected function createUser(?int $customerId = null): User
    {
        return User::create([
            'User_Name' => 'Test User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'Customer_ID' => $customerId,
        ]);
    }

    public function test_authenticated_user_can_list_reviews(): void
    {
        $customer = $this->createCustomer();
        Review::create([
            'Rate' => 4,
            'Description' => 'A sample review',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->getJson('/api/reviews');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Description' => 'A sample review']);

        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_authenticated_user_can_view_a_review(): void
    {
        $customer = $this->createCustomer();
        $review = Review::create([
            'Rate' => 5,
            'Description' => 'Great experience',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->getJson('/api/reviews/' . $review->getKey());

        $response->assertStatus(200)
            ->assertJsonPath('Description', 'Great experience')
            ->assertJsonPath('Rate', 5);
    }

    public function test_authenticated_user_can_create_review_and_persist_it(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->getKey());

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reviews', [
                'Rate' => 5,
                'Description' => 'Excellent service',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('Rate', 5)
            ->assertJsonPath('Description', 'Excellent service')
            ->assertJsonPath('Customer_ID', $customer->getKey());

        $this->assertDatabaseHas('reviews', [
            'Rate' => 5,
            'Description' => 'Excellent service',
            'Customer_ID' => $customer->getKey(),
        ]);
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->getKey());

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reviews', [
                'Rate' => '',
                'Description' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Rate', 'Description']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_store_returns_validation_errors_for_invalid_input(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->getKey());

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reviews', [
                'Rate' => 0,
                'Description' => str_repeat('A', 1001),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Rate', 'Description']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_unauthenticated_user_cannot_create_review(): void
    {
        $response = $this->postJson('/api/reviews', [
            'Rate' => 4,
            'Description' => 'Should fail',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_authenticated_user_without_customer_profile_cannot_create_review(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reviews', [
                'Rate' => 3,
                'Description' => 'No profile',
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Customer profile not found.']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_review_creation_accepts_boundary_values(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->getKey());

        $description = str_repeat('B', 1000);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reviews', [
                'Rate' => 5,
                'Description' => $description,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('Rate', 5)
            ->assertJsonPath('Description', $description);

        $this->assertDatabaseHas('reviews', [
            'Rate' => 5,
            'Description' => $description,
            'Customer_ID' => $customer->getKey(),
        ]);
    }
}
