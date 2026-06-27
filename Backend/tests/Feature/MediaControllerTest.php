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

    protected function authenticatedUser(): User
    {
        return User::create([
            'User_Name' => 'Test User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
        ]);
    }

    public function test_authenticated_user_can_list_media(): void
    {
        Media::create([
            'title' => 'First media',
            'description' => 'Example description',
            'file_path' => '/uploads/test1.jpg',
        ]);

        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->getJson('/api/media');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['title' => 'First media']);

        $this->assertDatabaseCount('media', 1);
    }

    public function test_authenticated_user_can_create_media_with_image_and_persist_it(): void
    {
        $image = UploadedFile::fake()->create('cover.jpg', 1024, 'image/jpeg');

        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->postJson('/api/media', [
                'title' => 'Holiday photo',
                'description' => 'Summer trip',
                'image' => $image,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('title', 'Holiday photo')
            ->assertJsonPath('description', 'Summer trip');

        $this->assertDatabaseHas('media', [
            'title' => 'Holiday photo',
            'description' => 'Summer trip',
        ]);

        $media = Media::where('title', 'Holiday photo')->first();
        $this->assertNotNull($media);
        $this->assertStringStartsWith('/uploads/', $media->file_path);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->postJson('/api/media', [
                'title' => '',
                'description' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'image']);

        $this->assertDatabaseCount('media', 0);
    }

    public function test_store_returns_validation_errors_for_invalid_input(): void
    {
        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->postJson('/api/media', [
                'title' => str_repeat('A', 101),
                'description' => 'Valid description',
                'image' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'image']);

        $this->assertDatabaseCount('media', 0);
    }

    public function test_unauthenticated_user_can_access_media_endpoints(): void
    {
        $media = Media::create([
            'title' => 'Protected media',
            'description' => 'Hidden',
            'file_path' => '/uploads/protected.jpg',
        ]);

        $this->getJson('/api/media')->assertStatus(200);
        $this->postJson('/api/media', [
            'title' => 'New media',
            'description' => 'Should fail',
            'image' => UploadedFile::fake()->create('new.jpg', 1024, 'image/jpeg'),
        ])->assertStatus(201);
        $this->getJson('/api/media/' . $media->id)->assertStatus(200);
        $this->putJson('/api/media/' . $media->id, [
            'title' => 'Updated media',
        ])->assertStatus(200);
        $this->deleteJson('/api/media/' . $media->id)->assertStatus(200);
    }

    public function test_authenticated_user_can_update_media_and_persist_changes(): void
    {
        $media = Media::create([
            'title' => 'Original title',
            'description' => 'Original description',
            'file_path' => '/uploads/original.jpg',
        ]);

        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->putJson('/api/media/' . $media->id, [
                'title' => 'Updated title',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('title', 'Updated title')
            ->assertJsonPath('description', 'Updated description');

        $this->assertDatabaseHas('media', [
            'id' => $media->id,
            'title' => 'Updated title',
            'description' => 'Updated description',
        ]);
    }

    public function test_authenticated_user_can_delete_media_and_remove_the_record(): void
    {
        $media = Media::create([
            'title' => 'Delete me',
            'description' => 'To be removed',
            'file_path' => '/uploads/delete-me.jpg',
        ]);

        $response = $this->actingAs($this->authenticatedUser(), 'sanctum')
            ->deleteJson('/api/media/' . $media->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Media deleted successfully']);

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }
}
