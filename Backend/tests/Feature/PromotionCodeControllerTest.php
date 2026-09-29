<?php

namespace Tests\Feature;

use App\Models\PromotionCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionCodeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function createCustomerUser(): User
    {
        return User::create([
            'User_Name' => 'Registered User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => null,
        ]);
    }

    protected function createAdmin(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
            'Customer_ID' => null,
        ]);
    }

    protected function makeCode(array $overrides = []): PromotionCode
    {
        return PromotionCode::create(array_merge([
            'code' => 'SAFARI10',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'valid_until' => '2026-12-31',
            'usage_limit' => 20,
            'usage_count' => 0,
            'is_hidden' => false,
        ], $overrides));
    }

    public function test_guest_cannot_list_promotion_codes(): void
    {
        $this->getJson('/api/promotion-codes')->assertStatus(401);
    }

    public function test_registered_user_can_list_promotion_codes(): void
    {
        $this->makeCode(['code' => 'VISIBLE']);

        $this->actingAs($this->createCustomerUser(), 'sanctum')
            ->getJson('/api/promotion-codes')
            ->assertStatus(200)
            ->assertJsonFragment(['code' => 'VISIBLE']);
    }

    public function test_registered_user_does_not_see_hidden_codes(): void
    {
        $this->makeCode(['code' => 'VISIBLE']);
        $this->makeCode(['code' => 'HIDDEN', 'is_hidden' => true]);

        $response = $this->actingAs($this->createCustomerUser(), 'sanctum')
            ->getJson('/api/promotion-codes')
            ->assertStatus(200);

        $codes = array_column($response->json(), 'code');

        $this->assertContains('VISIBLE', $codes);
        $this->assertNotContains('HIDDEN', $codes);
    }

    public function test_admin_sees_both_hidden_and_visible_codes(): void
    {
        $this->makeCode(['code' => 'VISIBLE']);
        $this->makeCode(['code' => 'HIDDEN', 'is_hidden' => true]);

        $response = $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/promotion-codes')
            ->assertStatus(200);

        $codes = array_column($response->json(), 'code');

        $this->assertContains('VISIBLE', $codes);
        $this->assertContains('HIDDEN', $codes);
    }

    public function test_admin_can_create_a_promotion_code(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->postJson('/api/promotion-codes', [
                'code' => 'NEW10',
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'valid_until' => '2026-12-31',
                'usage_limit' => 5,
                'is_hidden' => false,
            ], ['Accept' => 'application/json'])
            ->assertStatus(201)
            ->assertJsonFragment(['code' => 'NEW10']);

        $this->assertDatabaseHas('promotion_codes', ['code' => 'NEW10']);
    }

    public function test_registered_user_cannot_create_a_promotion_code(): void
    {
        $this->actingAs($this->createCustomerUser(), 'sanctum')
            ->postJson('/api/promotion-codes', [
                'code' => 'HACKED',
                'discount_type' => 'percentage',
                'discount_value' => 100,
            ], ['Accept' => 'application/json'])
            ->assertStatus(403);

        $this->assertDatabaseCount('promotion_codes', 0);
    }

    public function test_listing_returns_the_fields_the_admin_entered(): void
    {
        $this->makeCode([
            'code' => 'SUMMER25',
            'discount_type' => 'percentage',
            'discount_value' => 25,
            'valid_until' => '2026-08-31',
            'usage_limit' => 50,
            'is_hidden' => false,
        ]);

        $this->actingAs($this->createCustomerUser(), 'sanctum')
            ->getJson('/api/promotion-codes')
            ->assertStatus(200)
            ->assertJsonFragment([
                'code' => 'SUMMER25',
                'discount_type' => 'percentage',
                'discount_value' => '25.00',
                'usage_limit' => 50,
                'is_hidden' => false,
            ]);
    }
}
