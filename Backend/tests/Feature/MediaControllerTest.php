<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class MediaControllerTest extends TestCase
{
    use RefreshDatabase;

    protected array $preExistingMediaFiles = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->preExistingMediaFiles = glob(public_path('uploads/*.*')) ?: [];
    }

    protected function tearDown(): void
    {
        foreach (glob(public_path('uploads/*.*')) ?: [] as $file) {
            if (!in_array($file, $this->preExistingMediaFiles, true)) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    protected function createUser(): User
    {
        return User::create([
            'User_Name' => 'Test User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
        ]);
    }

    protected function createAdmin(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    public function test_public_user_can_list_media(): void
    {
        Media::create([
            'title' => 'First media',
            'description' => 'Example description',
            'file_path' => '/uploads/test1.jpg',
        ]);

        $response = $this->getJson('/api/media');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['title' => 'First media']);

        $this->assertDatabaseCount('media', 1);
    }

    public function test_public_user_can_view_media(): void
    {
        $media = Media::create([
            'title' => 'First media',
            'description' => 'Example description',
            'file_path' => '/uploads/test1.jpg',
        ]);

        $response = $this->getJson('/api/media/' . $media->id);

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'First media']);
    }

    public function test_admin_can_create_media_with_image_and_persist_it(): void
    {
        $admin = $this->createAdmin();
        $image = UploadedFile::fake()->create('cover.jpg', 1024, 'image/jpeg');

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/media', [
                'title' => 'Holiday photo',
                'description' => 'Summer trip',
                'image' => $image,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('title', 'Holiday photo');

        $this->assertDatabaseHas('media', [
            'title' => 'Holiday photo',
            'description' => 'Summer trip',
        ]);

        $media = Media::where('title', 'Holiday photo')->first();
        $this->assertStringStartsWith('/uploads/', $media->file_path);
    }

    public function test_non_admin_cannot_create_media(): void
    {
        $user = $this->createUser();
        $image = UploadedFile::fake()->create('cover.jpg', 1024, 'image/jpeg');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/media', [
                'title' => 'Holiday photo',
                'description' => 'Summer trip',
                'image' => $image,
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseCount('media', 0);
    }

    public function test_unauthenticated_user_cannot_create_media(): void
    {
        $image = UploadedFile::fake()->create('cover.jpg', 1024, 'image/jpeg');

        $response = $this->postJson('/api/media', [
            'title' => 'Holiday photo',
            'description' => 'Summer trip',
            'image' => $image,
        ]);

        $response->assertStatus(401);
        $this->assertDatabaseCount('media', 0);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/media', [
                'title' => '',
                'description' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'image']);
    }

    public function test_admin_can_update_media_and_persist_changes(): void
    {
        $admin = $this->createAdmin();
        $media = Media::create([
            'title' => 'Original title',
            'description' => 'Original description',
            'file_path' => '/uploads/original.jpg',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/media/' . $media->id, [
                'title' => 'Updated title',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('title', 'Updated title');

        $this->assertDatabaseHas('media', [
            'id' => $media->id,
            'title' => 'Updated title',
        ]);
    }

    public function test_non_admin_cannot_update_media(): void
    {
        $user = $this->createUser();
        $media = Media::create([
            'title' => 'Original title',
            'description' => 'Original description',
            'file_path' => '/uploads/original.jpg',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/media/' . $media->id, [
                'title' => 'Updated title',
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('media', ['title' => 'Original title']);
    }

    public function test_admin_can_delete_media_and_remove_the_record(): void
    {
        $admin = $this->createAdmin();
        $media = Media::create([
            'title' => 'Delete me',
            'description' => 'To be removed',
            'file_path' => '/uploads/delete-me.jpg',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/media/' . $media->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }

    public function test_non_admin_cannot_delete_media(): void
    {
        $user = $this->createUser();
        $media = Media::create([
            'title' => 'Keep me',
            'description' => 'To be removed',
            'file_path' => '/uploads/delete-me.jpg',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/media/' . $media->id);

        $response->assertStatus(403);
        $this->assertDatabaseHas('media', ['id' => $media->id]);
    }
}
