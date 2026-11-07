<?php

namespace Tests\Feature;

use App\Models\PromotionCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Gaps found in the promotion-code audit that PromotionCodeControllerTest
 * (index + store only) does not cover:
 *
 *  - POST   /api/promotion-codes/validate  (public validation endpoint)
 *  - PUT    /api/promotion-codes/{id}      (admin update)
 *  - DELETE /api/promotion-codes/{id}      (admin delete)
 */
class PromotionCodeApiTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------------
    // Helpers (mirrors PromotionCodeControllerTest)
    // ---------------------------------------------------------------------

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

    protected function createUser(): User
    {
        return User::create([
            'User_Name' => 'Registered User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
            'Customer_ID' => null,
        ]);
    }

    protected function makeCode(array $overrides = []): PromotionCode
    {
        return PromotionCode::create(array_merge([
            'code' => 'SAFARI10',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'valid_until' => now()->addMonth()->toDateString(),
            'usage_limit' => 20,
            'usage_count' => 0,
            'is_hidden' => false,
        ], $overrides));
    }

    // ---------------------------------------------------------------------
    // POST /api/promotion-codes/validate (public)
    // ---------------------------------------------------------------------

    public function test_validate_endpoint_accepts_a_code_below_its_usage_limit(): void
    {
        $this->makeCode(['usage_count' => 19, 'usage_limit' => 20]);

        $this->postJson('/api/promotion-codes/validate', ['code' => 'SAFARI10'])
            ->assertStatus(200)
            ->assertJsonPath('message', 'Valid promotion code')
            ->assertJsonPath('promotion.code', 'SAFARI10');
    }

    public function test_validate_endpoint_accepts_a_code_that_expires_today(): void
    {
        $this->makeCode(['valid_until' => now()->toDateString()]);

        $this->postJson('/api/promotion-codes/validate', ['code' => 'SAFARI10'])
            ->assertStatus(200)
            ->assertJsonPath('message', 'Valid promotion code');
    }

    public function test_validate_endpoint_accepts_a_code_without_a_usage_limit(): void
    {
        $this->makeCode(['usage_limit' => null, 'usage_count' => 999]);

        $this->postJson('/api/promotion-codes/validate', ['code' => 'SAFARI10'])
            ->assertStatus(200)
            ->assertJsonPath('message', 'Valid promotion code');
    }

    public function test_validate_endpoint_returns_404_for_an_unknown_code(): void
    {
        $this->postJson('/api/promotion-codes/validate', ['code' => 'DOESNOTEXIST'])
            ->assertStatus(404)
            ->assertJson(['message' => 'Invalid promotion code']);
    }

    public function test_validate_endpoint_returns_the_same_404_for_a_hidden_code(): void
    {
        $this->makeCode(['code' => 'SECRET25', 'is_hidden' => true]);

        // Hidden codes must be indistinguishable from unknown codes so the
        // endpoint never leaks the existence of admin-only codes.
        $this->postJson('/api/promotion-codes/validate', ['code' => 'SECRET25'])
            ->assertStatus(404)
            ->assertJson(['message' => 'Invalid promotion code']);
    }

    public function test_validate_endpoint_rejects_an_expired_code(): void
    {
        $this->makeCode(['valid_until' => now()->subDay()->toDateString()]);

        $this->postJson('/api/promotion-codes/validate', ['code' => 'SAFARI10'])
            ->assertStatus(400)
            ->assertJson(['message' => 'Promotion code has expired']);
    }

    public function test_validate_endpoint_rejects_a_code_that_hit_its_usage_limit(): void
    {
        $this->makeCode(['usage_count' => 20, 'usage_limit' => 20]);

        $this->postJson('/api/promotion-codes/validate', ['code' => 'SAFARI10'])
            ->assertStatus(400)
            ->assertJson(['message' => 'Promotion code usage limit reached']);
    }

    public function test_validate_endpoint_requires_the_code_field(): void
    {
        $this->postJson('/api/promotion-codes/validate', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    // ---------------------------------------------------------------------
    // PUT /api/promotion-codes/{id} (admin)
    // ---------------------------------------------------------------------

    public function test_admin_can_update_a_promotion_code_and_changes_persist(): void
    {
        $code = $this->makeCode();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/promotion-codes/' . $code->id, [
                'discount_value' => 30,
                'is_hidden' => true,
                'usage_limit' => 5,
            ])
            ->assertStatus(200)
            ->assertJsonPath('code', 'SAFARI10');

        $code->refresh();
        $this->assertEquals('30.00', $code->discount_value);
        $this->assertTrue($code->is_hidden);
        $this->assertSame(5, $code->usage_limit);
    }

    public function test_admin_update_keeps_the_unique_rule_away_from_the_codes_own_row(): void
    {
        $code = $this->makeCode(['code' => 'KEEPME']);

        // Re-sending the code's own value must not trip the unique rule.
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/promotion-codes/' . $code->id, ['code' => 'KEEPME'])
            ->assertStatus(200)
            ->assertJsonPath('code', 'KEEPME');
    }

    public function test_update_rejects_a_code_already_used_by_another_promotion_code(): void
    {
        $first = $this->makeCode(['code' => 'FIRST']);
        $this->makeCode(['code' => 'SECOND']);

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/promotion-codes/' . $first->id, ['code' => 'SECOND'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_update_rejects_invalid_discount_type_and_negative_discount_value(): void
    {
        $code = $this->makeCode();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/promotion-codes/' . $code->id, [
                'discount_type' => 'bogus',
                'discount_value' => -1,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['discount_type', 'discount_value']);
    }

    public function test_non_admin_cannot_update_a_promotion_code(): void
    {
        $code = $this->makeCode();

        $this->actingAs($this->createUser(), 'sanctum')
            ->putJson('/api/promotion-codes/' . $code->id, ['discount_value' => 99])
            ->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized']);

        $code->refresh();
        $this->assertEquals('10.00', $code->discount_value);
    }

    public function test_guest_cannot_update_a_promotion_code(): void
    {
        $code = $this->makeCode();

        $this->putJson('/api/promotion-codes/' . $code->id, ['discount_value' => 99])
            ->assertStatus(401);
    }

    public function test_updating_a_missing_promotion_code_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/promotion-codes/999999', ['discount_value' => 10])
            ->assertNotFound();
    }

    // ---------------------------------------------------------------------
    // DELETE /api/promotion-codes/{id} (admin)
    // ---------------------------------------------------------------------

    public function test_admin_can_delete_a_promotion_code(): void
    {
        $code = $this->makeCode();

        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/promotion-codes/' . $code->id)
            ->assertStatus(200)
            ->assertJson(['message' => 'Deleted successfully']);

        $this->assertDatabaseMissing('promotion_codes', ['id' => $code->id]);
    }

    public function test_non_admin_cannot_delete_a_promotion_code(): void
    {
        $code = $this->makeCode();

        $this->actingAs($this->createUser(), 'sanctum')
            ->deleteJson('/api/promotion-codes/' . $code->id)
            ->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized']);

        $this->assertDatabaseHas('promotion_codes', ['id' => $code->id]);
    }

    public function test_guest_cannot_delete_a_promotion_code(): void
    {
        $code = $this->makeCode();

        $this->deleteJson('/api/promotion-codes/' . $code->id)
            ->assertStatus(401);

        $this->assertDatabaseHas('promotion_codes', ['id' => $code->id]);
    }

    public function test_deleting_a_missing_promotion_code_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/promotion-codes/999999')
            ->assertNotFound();
    }
}