<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Gaps found in the review audit:
 *
 *  - GET /api/reviews/analytics      (ratingAnalytics, whole endpoint untested)
 *  - GET /api/tripadvisor-reviews    (external dependency; default-review
 *    fallback untested — all HTTP is faked so the suite never hits the network)
 *  - GET /api/locations/{id}/reviews (same fallback, second route)
 */
class ReviewAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    protected function createCustomer(): Customer
    {
        return Customer::create([
            'First_Name' => 'Test',
            'Last_Name' => 'Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ]);
    }

    protected function createReview(int $rate): Review
    {
        return Review::create([
            'Customer_ID' => $this->createCustomer()->Customer_ID,
            'Rate' => $rate,
            'Description' => "Review with rate {$rate}",
        ]);
    }

    // ---------------------------------------------------------------------
    // GET /api/reviews/analytics
    // ---------------------------------------------------------------------

    public function test_rating_analytics_returns_zero_state_when_no_reviews_exist(): void
    {
        $response = $this->getJson('/api/reviews/analytics');

        $response->assertStatus(200)
            ->assertJson([
                'total_reviews' => 0,
                'average_rating' => 0,
                'positive_reviews' => 0,
                'neutral_reviews' => 0,
                'negative_reviews' => 0,
                'positive_percentage' => 0,
                'highest_rating' => 0,
                'lowest_rating' => 0,
                'most_common_rating' => 0,
            ]);

        $distribution = $response->json('rating_distribution');
        $this->assertCount(5, $distribution);

        // Distribution is always ordered 5 stars down to 1 star.
        $this->assertSame([5, 4, 3, 2, 1], array_column($distribution, 'rating'));
        $this->assertSame([0, 0, 0, 0, 0], array_column($distribution, 'count'));
    }

    public function test_rating_analytics_aggregates_reviews_correctly(): void
    {
        $this->createReview(5);
        $this->createReview(5);
        $this->createReview(4);
        $this->createReview(3);
        $this->createReview(1);

        $response = $this->getJson('/api/reviews/analytics');

        $response->assertStatus(200)
            ->assertJson([
                'total_reviews' => 5,
                'average_rating' => 3.6,
                'positive_reviews' => 3,   // two 5s + one 4
                'neutral_reviews' => 1,    // one 3
                'negative_reviews' => 1,   // one 1
                'positive_percentage' => 60.0,
                'highest_rating' => 5,
                'lowest_rating' => 1,
                'most_common_rating' => 5,
            ]);

        $distribution = $response->json('rating_distribution');
        $this->assertSame(
            ['rating' => [5, 4, 3, 2, 1], 'count' => [2, 1, 1, 0, 1]],
            [
                'rating' => array_column($distribution, 'rating'),
                'count' => array_column($distribution, 'count'),
            ]
        );
        // JSON round-trips whole floats as ints (40.0 -> 40), so compare loosely.
        $this->assertEquals(40.0, $distribution[0]['percentage']);
        $this->assertEquals(0.0, $distribution[3]['percentage']);
    }

    public function test_rating_analytics_marks_a_single_positive_review_as_100_percent(): void
    {
        $this->createReview(4);

        $this->getJson('/api/reviews/analytics')
            ->assertStatus(200)
            ->assertJson([
                'total_reviews' => 1,
                'average_rating' => 4.0,
                'positive_reviews' => 1,
                'positive_percentage' => 100.0,
                'most_common_rating' => 4,
                'highest_rating' => 4,
                'lowest_rating' => 4,
            ]);
    }

    // ---------------------------------------------------------------------
    // Tripadvisor fallback (no real network: every request is faked)
    // ---------------------------------------------------------------------

    public function test_tripadvisor_endpoint_returns_default_reviews_when_external_sources_fail(): void
    {
        Http::fake();

        $response = $this->getJson('/api/tripadvisor-reviews');

        $response->assertStatus(200)->assertJsonCount(7);

        $this->assertSame(
            ['TripAdvisor Traveler'],
            array_values(array_unique(array_column($response->json(), 'name')))
        );
        $this->assertSame(
            ['TripAdvisor'],
            array_values(array_unique(array_column($response->json(), 'source')))
        );
    }

    public function test_location_reviews_endpoint_returns_default_reviews_when_external_sources_fail(): void
    {
        Http::fake();

        $this->getJson('/api/locations/99999999/reviews')
            ->assertStatus(200)
            ->assertJsonCount(7)
            ->assertJsonFragment(['rate' => 5]);
    }
}