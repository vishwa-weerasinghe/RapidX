<?php

namespace Tests\Feature;

use App\Mail\ContactMessage;
use App\Models\Booking;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * HomePageTest
 *
 * Tests every backend API endpoint the home page depends on:
 *  - GET  /api/packages   → Safari packages section
 *  - GET  /api/media      → Photo gallery section
 *  - GET  /api/reviews    → Customer reviews section
 *  - POST /api/contact    → Contact form section
 *  - POST /api/cart       → "Book Now" / add-to-cart button
 */
class HomePageTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function createPackage(array $overrides = []): Package
    {
        return Package::create(array_merge([
            'Package_Name'    => 'Minneriya Safari',
            'Description'     => 'World-famous elephant gathering.',
            'price_one_adult' => 150.00,
            'price_more_adult' => 150.00,
            'price_child' => 75.00,
        ], $overrides));
    }

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name'    => 'Test',
            'Last_Name'     => 'Customer',
            'Email'         => fake()->unique()->safeEmail(),
            'Phone_No'      => '0771234567',
            'NIC'           => '123456789V',
            'Country'       => 'Sri Lanka',
            'Customer_Type' => 'Guest',
        ], $overrides));
    }

    protected function validContactPayload(array $overrides = []): array
    {
        return array_merge([
            'name'    => 'John Doe',
            'email'   => 'john@example.com',
            'phone'   => '0771234567',
            'subject' => 'Safari Inquiry',
            'message' => 'I would like to book a safari for next month.',
        ], $overrides);
    }

    // =========================================================================
    // SECTION 1 — Safari Packages (GET /api/packages)
    // =========================================================================

    public function test_home_page_can_load_all_packages(): void
    {
        $this->createPackage(['Package_Name' => 'Minneriya Safari']);
        $this->createPackage(['Package_Name' => 'Kaudulla Safari']);
        $this->createPackage(['Package_Name' => 'Wasgamuwa Safari']);

        $response = $this->getJson('/api/packages');

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonFragment(['Package_Name' => 'Minneriya Safari'])
            ->assertJsonFragment(['Package_Name' => 'Kaudulla Safari'])
            ->assertJsonFragment(['Package_Name' => 'Wasgamuwa Safari']);
    }

    public function test_packages_endpoint_returns_empty_array_when_no_packages_exist(): void
    {
        $response = $this->getJson('/api/packages');

        $response->assertStatus(200);
        $this->assertEmpty($response->json());
    }

    public function test_each_package_contains_required_fields_for_home_page(): void
    {
        $this->createPackage([
            'Package_Name'    => 'Full Day Safari',
            'Description'     => 'An amazing full day in the wild.',
            'price_one_adult' => 200.00,
            'price_more_adult' => 200.00,
            'price_child' => 100.00,
        ]);

        $response = $this->getJson('/api/packages');

        $response->assertStatus(200);

        $pkg = $response->json()[0];
        $this->assertArrayHasKey('id', $pkg);
        $this->assertArrayHasKey('Package_Name', $pkg);
        $this->assertArrayHasKey('Description', $pkg);
        $this->assertArrayHasKey('price_one_adult', $pkg);
        $this->assertArrayHasKey('price_more_adult', $pkg);
        $this->assertArrayHasKey('price_child', $pkg);

        $this->assertEquals('Full Day Safari', $pkg['Package_Name']);
        $this->assertEquals(200.00, $pkg['price_one_adult']);
        $this->assertEquals(100.00, $pkg['price_child']);
    }

    // =========================================================================
    // SECTION 2 — Photo Gallery (GET /api/media)
    // =========================================================================

    public function test_home_page_gallery_endpoint_is_accessible(): void
    {
        $response = $this->getJson('/api/media');

        $response->assertStatus(200);
    }

    public function test_home_page_gallery_returns_empty_array_when_no_media_exists(): void
    {
        $response = $this->getJson('/api/media');

        $response->assertStatus(200);
        $this->assertIsArray($response->json());
    }

    // =========================================================================
    // SECTION 3 — Customer Reviews (GET /api/reviews)
    // =========================================================================

    public function test_home_page_reviews_section_loads_all_reviews(): void
    {
        $customer = $this->createCustomer();

        Review::create(['Rate' => 5, 'Description' => 'Amazing experience!', 'Customer_ID' => $customer->Customer_ID]);
        Review::create(['Rate' => 4, 'Description' => 'Great safari!',       'Customer_ID' => $customer->Customer_ID]);
        Review::create(['Rate' => 5, 'Description' => 'Will come again!',    'Customer_ID' => $customer->Customer_ID]);

        $response = $this->getJson('/api/reviews');

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonFragment(['Description' => 'Amazing experience!'])
            ->assertJsonFragment(['Description' => 'Great safari!']);
    }

    public function test_reviews_endpoint_returns_empty_array_when_no_reviews_exist(): void
    {
        $response = $this->getJson('/api/reviews');

        $response->assertStatus(200);
        $this->assertEmpty($response->json());
    }

    public function test_each_review_contains_required_fields_for_home_page(): void
    {
        $customer = $this->createCustomer();
        Review::create([
            'Rate'        => 5,
            'Description' => 'Wonderful safari!',
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->getJson('/api/reviews');

        $response->assertStatus(200);

        $review = $response->json()[0];
        $this->assertArrayHasKey('Rate', $review);
        $this->assertArrayHasKey('Description', $review);
        $this->assertArrayHasKey('Customer_ID', $review);

        $this->assertEquals(5, $review['Rate']);
        $this->assertEquals('Wonderful safari!', $review['Description']);
    }

    // =========================================================================
    // SECTION 4 — Contact Form (POST /api/contact)
    // =========================================================================

    public function test_home_page_contact_form_submits_successfully(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validContactPayload());

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Your message has been sent successfully!',
            ]);

        Mail::assertQueued(ContactMessage::class);
    }

    public function test_contact_form_fails_without_required_fields(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);

        Mail::assertNothingQueued();
    }

    public function test_contact_form_fails_with_invalid_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validContactPayload([
            'email' => 'not-a-valid-email',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        Mail::assertNothingQueued();
    }

    public function test_contact_form_works_without_optional_phone_number(): void
    {
        Mail::fake();

        $payload = $this->validContactPayload();
        unset($payload['phone']);

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    // =========================================================================
    // SECTION 5 — Book Now / Add to Cart (POST /api/cart)
    // =========================================================================

    public function test_guest_visitor_can_add_a_package_to_cart_from_home_page(): void
    {
        $package = $this->createPackage(['Package_Name' => 'Minneriya Day Safari']);

        $response = $this->postJson('/api/cart', [
            'Booking_Date'    => '2026-09-15',
            'Pickup_Time'     => '07:00',
            'Pickup_Location' => 'Sigiriya Hotel',
            'No_of_adults'    => 2,
            'No_of_child'     => 1,
            'Package_ID'      => $package->getKey(),
            'Payment'         => 375.00,
            'First_Name'      => 'Jane',
            'Last_Name'       => 'Smith',
            'Email'           => 'jane@example.com',
            'Phone_No'        => '0771234567',
            'NIC'             => '123456789V',
            'Country'         => 'UK',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('customer.Customer_Type', 'Guest');

        $customerId = $response->json('customer.Customer_ID');

        $this->assertDatabaseHas('customers', [
            'Customer_ID' => $customerId,
            'Email'       => 'jane@example.com',
        ]);
        $this->assertDatabaseHas('bookings', [
            'Customer_ID' => $customerId,
            'Package_ID'  => $package->getKey(),
            'Status'      => 'In Cart',
        ]);
        $this->assertDatabaseHas('carts', [
            'Customer_ID' => $customerId,
        ]);
    }

    public function test_book_now_fails_if_package_id_is_missing(): void
    {
        $response = $this->postJson('/api/cart', [
            'Booking_Date'    => '2026-09-15',
            'Pickup_Time'     => '07:00',
            'Pickup_Location' => 'Hotel',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            // Package_ID missing
            'Payment'         => 300.00,
            'First_Name'      => 'Jane',
            'Last_Name'       => 'Smith',
            'Email'           => 'jane@example.com',
            'Phone_No'        => '0771234567',
            'NIC'             => '123456789V',
            'Country'         => 'UK',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Package_ID']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_book_now_fails_with_invalid_date_format(): void
    {
        $package = $this->createPackage();

        $response = $this->postJson('/api/cart', [
            'Booking_Date'    => 'not-a-date',
            'Pickup_Time'     => '07:00',
            'Pickup_Location' => 'Hotel',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            'Package_ID'      => $package->getKey(),
            'Payment'         => 300.00,
            'First_Name'      => 'Jane',
            'Last_Name'       => 'Smith',
            'Email'           => 'jane@example.com',
            'Phone_No'        => '0771234567',
            'NIC'             => '123456789V',
            'Country'         => 'UK',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Booking_Date']);

        $this->assertDatabaseCount('bookings', 0);
    }
}
