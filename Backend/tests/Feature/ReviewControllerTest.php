<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Review;
use App\Models\Package;
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

    protected function createPackage(): Package
    {
        return Package::create([
            'Package_Name' => 'Safari Package',
            'Description' => 'Test package',
            'price_one_adult' => 1000,
            'price_more_adult' => 1000,
            'price_child' => 500,
        ]);
    }

    protected function createBookingForEmail(string $email): Booking
    {
        $customer = $this->createCustomer(['Email' => $email]);
        $package = $this->createPackage();

        return Booking::create([
            'Booking_Date' => '2026-08-01',
            'Pickup_Time' => '09:00:00',
            'Pickup_Location' => 'Dambulla',
            'No_of_adults' => 2,
            'No_of_child' => 0,
            'Payment' => 2000,
            'Status' => 'Confirmed',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Vehicle_ID' => null,
        ]);
    }

    protected function createBookingForCustomer(int $customerId): Booking
    {
        $package = $this->createPackage();

        return Booking::create([
            'Booking_Date' => '2026-08-01',
            'Pickup_Time' => '09:00:00',
            'Pickup_Location' => 'Dambulla',
            'No_of_adults' => 2,
            'No_of_child' => 0,
            'Payment' => 2000,
            'Status' => 'Confirmed',
            'Customer_ID' => $customerId,
            'Package_ID' => $package->id,
            'Vehicle_ID' => null,
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
        $this->createBookingForCustomer($customer->getKey());

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

    public function test_authenticated_user_without_booking_cannot_create_review(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->getKey());

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reviews', [
                'Rate' => 5,
                'Description' => 'Should not save',
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Sorry you have not booked a safari. you are failed to upload a review']);

        $this->assertDatabaseCount('reviews', 0);
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

    public function test_public_review_requires_a_booked_email(): void
    {
        $response = $this->postJson('/api/reviews', [
            'Rate' => 4,
            'Description' => 'Should fail',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Email is required to submit a public review.']);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_public_user_can_create_review_when_the_email_matches_a_booking(): void
    {
        $email = 'guest-reviewer@example.com';
        $booking = $this->createBookingForEmail($email);

        $response = $this->postJson('/api/reviews', [
            'Rate' => 4,
            'Description' => 'Amazing safari experience',
            'Email' => $email,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('Rate', 4)
            ->assertJsonPath('Description', 'Amazing safari experience')
            ->assertJsonPath('Customer_ID', $booking->Customer_ID);

        $this->assertDatabaseHas('reviews', [
            'Rate' => 4,
            'Description' => 'Amazing safari experience',
            'Customer_ID' => $booking->Customer_ID,
        ]);
    }

    public function test_public_review_rejects_an_email_without_a_booking(): void
    {
        $response = $this->postJson('/api/reviews', [
            'Rate' => 5,
            'Description' => 'Should not save',
            'Email' => 'missing-booking@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Please use the email from a booked safari to submit a review.']);

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
        $this->createBookingForCustomer($customer->getKey());

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

    public function test_unauthenticated_user_cannot_delete_a_review(): void
    {
        $customer = $this->createCustomer();
        $review = Review::create([
            'Rate' => 4,
            'Description' => 'Sample review',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->deleteJson('/api/reviews/' . $review->getKey());

        $response->assertStatus(401);
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_unauthenticated_user_cannot_edit_a_review(): void
    {
        $customer = $this->createCustomer();
        $review = Review::create([
            'Rate' => 4,
            'Description' => 'Original review',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->putJson('/api/reviews/' . $review->getKey(), [
            'Description' => 'Edited review',
        ]);

        $response->assertStatus(401);
        $this->assertDatabaseHas('reviews', [
            'Review_ID' => $review->getKey(),
            'Description' => 'Original review',
        ]);
    }

    public function test_non_admin_user_cannot_delete_a_review(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->getKey());
        $review = Review::create([
            'Rate' => 4,
            'Description' => 'Sample review',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/reviews/' . $review->getKey());

        $response->assertStatus(403)
            ->assertJson(['message' => 'Only administrators can delete reviews.']);
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_only_admin_can_delete_a_review(): void
    {
        $admin = $this->createAdmin();
        $customer = $this->createCustomer();
        $review = Review::create([
            'Rate' => 5,
            'Description' => 'To be deleted',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/reviews/' . $review->getKey());

        $response->assertStatus(200)
            ->assertJson(['message' => 'Review deleted successfully']);
        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_admin_cannot_write_reviews(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/reviews', [
                'Rate' => 5,
                'Description' => 'Admin attempt',
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Customer profile not found.']);
        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_admin_cannot_edit_reviews(): void
    {
        $admin = $this->createAdmin();
        $customer = $this->createCustomer();
        $review = Review::create([
            'Rate' => 4,
            'Description' => 'Original review',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/reviews/' . $review->getKey(), [
                'Description' => 'Admin edited',
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('reviews', [
            'Review_ID' => $review->getKey(),
            'Description' => 'Original review',
        ]);
    }

    public function test_no_one_can_edit_written_review_after_submission(): void
    {
        $customer = $this->createCustomer();
        $user = $this->createUser($customer->getKey());
        $review = Review::create([
            'Rate' => 5,
            'Description' => 'Original review',
            'Customer_ID' => $customer->getKey(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/reviews/' . $review->getKey(), [
                'Rate' => 1,
                'Description' => 'Edited after submission',
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('reviews', [
            'Review_ID' => $review->getKey(),
            'Rate' => 5,
            'Description' => 'Original review',
        ]);
    }
}