<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Media;
use App\Models\Package;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Missing-record handling: the audit found that 404 behaviour is only covered
 * for vehicles (VehicleControllerTest), cart items (CartControllerTest) and
 * cancellations (BookingRefundTest). Every other resource silently lacks a
 * "record does not exist" test, so a broken route-model binding or a
 * findOrFail regression would go unnoticed.
 *
 * Promotion-code 404s live in PromotionCodeApiTest.
 */
class MissingRecordsTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        return User::create([
            'User_Name' => 'Admin User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    protected function createUser(): User
    {
        return User::create([
            'User_Name' => 'Regular User',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'user',
        ]);
    }

    // ---------------------------------------------------------------------
    // Packages
    // ---------------------------------------------------------------------

    public function test_showing_a_missing_package_returns_404(): void
    {
        $this->getJson('/api/packages/999999')->assertNotFound();
    }

    public function test_updating_a_missing_package_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/packages/999999', ['Package_Name' => 'Ghost'])
            ->assertNotFound();
    }

    public function test_deleting_a_missing_package_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/packages/999999')
            ->assertNotFound();
    }

    // ---------------------------------------------------------------------
    // Drivers
    // ---------------------------------------------------------------------

    public function test_showing_a_missing_driver_returns_404(): void
    {
        $this->getJson('/api/drivers/999999')->assertNotFound();
    }

    public function test_updating_a_missing_driver_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/drivers/999999', ['Driver_Name' => 'Ghost'])
            ->assertNotFound();
    }

    public function test_deleting_a_missing_driver_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/drivers/999999')
            ->assertNotFound();
    }

    // ---------------------------------------------------------------------
    // Media
    // ---------------------------------------------------------------------

    public function test_showing_missing_media_returns_404(): void
    {
        $this->getJson('/api/media/999999')->assertNotFound();
    }

    public function test_updating_missing_media_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/media/999999', ['title' => 'Ghost'])
            ->assertNotFound();
    }

    public function test_deleting_missing_media_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/media/999999')
            ->assertNotFound();
    }

    // ---------------------------------------------------------------------
    // Reviews
    // ---------------------------------------------------------------------

    public function test_showing_a_missing_review_returns_404(): void
    {
        $this->getJson('/api/reviews/999999')->assertNotFound();
    }

    public function test_updating_a_missing_review_returns_404(): void
    {
        $this->actingAs($this->createUser(), 'sanctum')
            ->putJson('/api/reviews/999999', ['Rate' => 5])
            ->assertNotFound();
    }

    public function test_deleting_a_missing_review_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/reviews/999999')
            ->assertNotFound();
    }

    // ---------------------------------------------------------------------
    // Bookings
    // ---------------------------------------------------------------------

    public function test_showing_a_missing_booking_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->getJson('/api/bookings/999999')
            ->assertNotFound();
    }

    public function test_updating_a_missing_booking_returns_404(): void
    {
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->putJson('/api/bookings/999999', ['Pickup_Location' => 'Kandy'])
            ->assertNotFound();
    }

    public function test_deleting_a_missing_booking_returns_404_even_without_the_agreement_flag(): void
    {
        // destroy() calls findOrFail() before validating `agreed`, so an
        // unknown booking must answer 404 instead of a 422 about the policy.
        $this->actingAs($this->createAdmin(), 'sanctum')
            ->deleteJson('/api/bookings/999999')
            ->assertNotFound();
    }

    // ---------------------------------------------------------------------
    // Sanity: the same routes must still resolve records that do exist.
    // ---------------------------------------------------------------------

    public function test_existing_records_still_resolve_through_the_same_routes(): void
    {
        $customer = Customer::create([
            'First_Name' => 'Real',
            'Last_Name' => 'Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ]);

        $package = Package::create([
            'Package_Name' => 'Real Package',
            'Description' => 'Exists',
            'price_one_adult' => 100,
            'price_more_adult' => 100,
            'price_child' => 50,
        ]);
        $media = Media::create([
            'title' => 'Real media',
            'description' => 'Exists',
            'file_path' => '/uploads/real.jpg',
        ]);
        $review = Review::create([
            'Customer_ID' => $customer->Customer_ID,
            'Rate' => 5,
            'Description' => 'Exists',
        ]);

        $this->getJson('/api/packages/' . $package->id)->assertOk();
        $this->getJson('/api/media/' . $media->id)->assertOk();
        $this->getJson('/api/reviews/' . $review->getKey())->assertOk();
    }
}