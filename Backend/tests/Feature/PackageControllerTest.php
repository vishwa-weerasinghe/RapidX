<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class PackageControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticatedUser(): User
    {
        return User::create([
            'User_Name' => 'Test User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
        ]);
    }

    protected function adminUser(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    public function test_authenticated_user_can_list_packages(): void
    {
        Package::create([
            'Package_Name' => 'Weekend Escape',
            'Description' => 'A short getaway package',
            'price_one_adult' => 150.00,
            'price_more_adult' => 150.00,
            'price_child' => 90.00,
        ]);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->getJson('/api/packages');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Package_Name' => 'Weekend Escape']);

        $this->assertDatabaseCount('packages', 1);
    }

    public function test_authenticated_user_can_create_a_package_and_persist_it(): void
    {
        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson('/api/packages', [
                'Package_Name' => 'Family Package',
                'Description' => 'Great for family trips',
                'price_one_adult' => 200.50,
                'price_more_adult' => 200.50,
                'price_child' => 120.25,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('Package_Name', 'Family Package')
            ->assertJsonPath('Description', 'Great for family trips');

        $this->assertDatabaseHas('packages', [
            'Package_Name' => 'Family Package',
            'Description' => 'Great for family trips',
            'price_one_adult' => 200.50,
            'price_more_adult' => 200.50,
            'price_child' => 120.25,
        ]);
    }

    public function test_admin_can_create_a_package_with_an_optional_related_package(): void
    {
        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson('/api/packages', [
                'Package_Name' => 'Minneriya Safari',
                'Description' => 'Safari package linked to the Minneriya guide',
                'price_one_adult' => 200.00,
                'price_more_adult' => 200.00,
                'price_child' => 120.00,
                'related_package' => 'Minneriya Morning Safari',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('related_package', 'Minneriya Morning Safari');

        $this->assertDatabaseHas('packages', [
            'Package_Name' => 'Minneriya Safari',
            'related_package' => 'Minneriya Morning Safari',
        ]);
    }

    public function test_admin_can_clear_a_package_related_package(): void
    {
        $package = Package::create([
            'Package_Name' => 'Special Safari Package',
            'Description' => 'Package without a related package',
            'price_one_adult' => 150.00,
            'price_more_adult' => 150.00,
            'price_child' => 90.00,
            'related_package' => 'Minneriya Evening Safari',
        ]);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->putJson('/api/packages/' . $package->id, [
                'related_package' => null,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('related_package', null);

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'related_package' => null,
        ]);
    }

    public function test_admin_can_create_a_package_with_an_image(): void
    {
        $secureUrl = 'https://res.cloudinary.com/demo/package-images/safari.jpg';
        $this->mockCloudinaryUpload($secureUrl);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->post('/api/packages', [
                'Package_Name' => 'Image Package',
                'Description' => 'Package with an uploaded image',
                'price_one_adult' => 175.00,
                'price_more_adult' => 175.00,
                'price_child' => 95.00,
                'Image' => UploadedFile::fake()->create('safari.jpg', 100, 'image/jpeg'),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('Package_Name', 'Image Package')
            ->assertJsonPath('Image', $secureUrl);

        $this->assertDatabaseHas('packages', [
            'Package_Name' => 'Image Package',
            'Image' => $secureUrl,
        ]);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson('/api/packages', [
                'Package_Name' => '',
                'Description' => '',
                'price_one_adult' => '',
                'price_more_adult' => '',
                'price_child' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Package_Name', 'Description', 'price_one_adult', 'price_more_adult', 'price_child']);

        $this->assertDatabaseCount('packages', 0);
    }

    public function test_store_returns_validation_errors_for_invalid_input(): void
    {
        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson('/api/packages', [
                'Package_Name' => str_repeat('A', 101),
                'Description' => 'Valid description',
                'price_one_adult' => -5,
                'price_more_adult' => -5,
                'price_child' => 'not-a-number',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Package_Name', 'price_one_adult', 'price_more_adult', 'price_child']);

        $this->assertDatabaseCount('packages', 0);
    }

    public function test_guest_cannot_write_packages_but_can_read_them(): void
    {
        $package = Package::create([
            'Package_Name' => 'Protected Package',
            'Description' => 'Should not be accessible',
            'price_one_adult' => 100.00,
            'price_more_adult' => 100.00,
            'price_child' => 60.00,
        ]);

        $this->getJson('/api/packages')->assertStatus(200);
        $this->postJson('/api/packages', [
            'Package_Name' => 'New Package',
            'Description' => 'Should fail',
            'price_one_adult' => 80.00,
            'price_more_adult' => 80.00,
            'price_child' => 40.00,
        ])->assertStatus(401);
        $this->getJson('/api/packages/' . $package->id)->assertStatus(200);
        $this->putJson('/api/packages/' . $package->id, [
            'Package_Name' => 'Updated Package',
        ])->assertStatus(401);
        $this->deleteJson('/api/packages/' . $package->id)->assertStatus(401);

        $this->assertDatabaseHas('packages', ['id' => $package->id]);
    }

    public function test_regular_user_cannot_create_update_or_delete_packages(): void
    {
        $package = Package::create([
            'Package_Name' => 'Protected Package',
            'Description' => 'Should remain unchanged',
            'price_one_adult' => 100.00,
            'price_more_adult' => 100.00,
            'price_child' => 60.00,
        ]);
        $user = $this->authenticatedUser();

        $this->actingAs($user, 'sanctum')->postJson('/api/packages', [
            'Package_Name' => 'New Package',
            'Description' => 'Should fail',
            'price_one_adult' => 80.00,
            'price_more_adult' => 80.00,
            'price_child' => 40.00,
        ])->assertStatus(403);

        $this->actingAs($user, 'sanctum')->putJson('/api/packages/' . $package->id, [
            'Package_Name' => 'Updated Package',
        ])->assertStatus(403);

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/packages/' . $package->id)
            ->assertStatus(403);

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'Package_Name' => 'Protected Package',
        ]);
    }

    public function test_authenticated_user_can_update_a_package_and_persist_changes(): void
    {
        $package = Package::create([
            'Package_Name' => 'Original Package',
            'Description' => 'Original description',
            'price_one_adult' => 120.00,
            'price_more_adult' => 120.00,
            'price_child' => 80.00,
        ]);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->putJson('/api/packages/' . $package->id, [
                'Package_Name' => 'Updated Package',
                'price_one_adult' => 140.00,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('Package_Name', 'Updated Package');

        $this->assertEquals(140.0, $response->json('price_one_adult'));

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'Package_Name' => 'Updated Package',
            'price_one_adult' => 140.00,
            'Description' => 'Original description',
        ]);
    }

    public function test_authenticated_user_can_delete_a_package(): void
    {
        $package = Package::create([
            'Package_Name' => 'Delete Me',
            'Description' => 'To be removed',
            'price_one_adult' => 90.00,
            'price_more_adult' => 90.00,
            'price_child' => 50.00,
        ]);

        $response = $this->actingAs($this->adminUser(), 'sanctum')
            ->deleteJson('/api/packages/' . $package->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Package deleted']);

        $this->assertDatabaseMissing('packages', ['id' => $package->id]);
    }

    public function test_deleting_a_package_removes_its_image(): void
    {
        Storage::fake('public');
        $imagePath = UploadedFile::fake()->create('safari.jpg', 100, 'image/jpeg')
            ->store('package-images', 'public');

        $package = Package::create([
            'Package_Name' => 'Package With Image',
            'Description' => 'Its image should be removed too.',
            'price_one_adult' => 90.00,
            'price_more_adult' => 90.00,
            'price_child' => 50.00,
            'Image' => $imagePath,
        ]);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->deleteJson('/api/packages/' . $package->id)
            ->assertStatus(200)
            ->assertJson(['message' => 'Package deleted']);

        Storage::disk('public')->assertMissing($imagePath);
        $this->assertDatabaseMissing('packages', ['id' => $package->id]);
    }

    /**
     * Swap the Cloudinary SDK singleton with a mock so tests never hit the
     * real (external) Cloudinary API or require a CLOUDINARY_URL credential.
     */
    private function mockCloudinaryUpload(string $secureUrl): void
    {
        $this->mock(
            \Cloudinary\Cloudinary::class,
            function ($mock) use ($secureUrl) {
                $uploadApi = Mockery::mock(\Cloudinary\Api\Upload\UploadApi::class);
                $uploadApi->shouldReceive('upload')->andReturn(new \Cloudinary\Api\ApiResponse([
                    'secure_url' => $secureUrl,
                    'public_id'  => 'package-images/safari',
                ], []));
                $uploadApi->shouldReceive('destroy')->andReturn(new \Cloudinary\Api\ApiResponse([
                    'result' => 'ok',
                ], []));

                $mock->shouldReceive('uploadApi')->andReturn($uploadApi);
            }
        );
    }
}
