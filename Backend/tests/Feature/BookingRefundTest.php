<?php

namespace Tests\Feature;

use App\Models\{Booking, Cart, Customer, Package, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingRefundTest extends TestCase
{
    use RefreshDatabase;

    private Customer $customer;
    private User $user;
    private Package $package;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = Customer::create([
            'First_Name' => 'Test', 'Last_Name' => 'User',
            'Email' => 'a@test.com', 'Phone_No' => '077', 'NIC' => '1', 'Country' => 'LK',
        ]);
        $this->user = User::create([
            'User_Name' => 'T', 'Email' => 'a@test.com',
            'Password' => bcrypt('Password123'), 'role' => 'user',
            'Customer_ID' => $this->customer->Customer_ID,
        ]);
        $this->package = Package::create([
            'Package_Name' => 'P', 'Description' => 'D',
            'price_one_adult' => 100, 'price_more_adult' => 100, 'price_child' => 50,
        ]);
    }

    private function makeBooking(string $date, string $status = 'Confirmed', ?Customer $owner = null): Booking
    {
        return Booking::create([
            'Booking_Date' => $date, 'Pickup_Time' => '07:00', 'Pickup_Location' => 'X',
            'No_of_adults' => 2, 'No_of_child' => 0, 'Payment' => 200, 'Status' => $status,
            'Customer_ID' => ($owner ?? $this->customer)->Customer_ID,
            'Package_ID' => $this->package->id,
        ]);
    }

    private function cancel(User $as, Booking $booking, bool $agreed = true)
    {
        return $this->actingAs($as, 'sanctum')
            ->patchJson("/api/user/bookings/{$booking->Booking_ID}/cancel", [
                'agreed' => $agreed,
            ]);
    }

    // ---------------------------------------------------------------
    // Authorization
    // ---------------------------------------------------------------

    public function test_cancel_rejects_another_customers_booking(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $otherCustomer = Customer::create([
            'First_Name' => 'Other', 'Last_Name' => 'Person',
            'Email' => 'b@test.com', 'Phone_No' => '078', 'NIC' => '2', 'Country' => 'LK',
        ]);
        $otherUser = User::create([
            'User_Name' => 'O', 'Email' => 'b@test.com',
            'Password' => bcrypt('Password123'), 'role' => 'user',
            'Customer_ID' => $otherCustomer->Customer_ID,
        ]);

        $this->cancel($otherUser, $booking)->assertStatus(403);

        // The booking must be untouched.
        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID, 'Status' => 'Confirmed',
        ]);
    }

    public function test_cancel_unknown_booking_returns_404(): void
    {
        $this->actingAs($this->user, 'sanctum')
            ->patchJson('/api/user/bookings/999999/cancel')
            ->assertStatus(404);
    }

    // ---------------------------------------------------------------
    // Already cancelled
    // ---------------------------------------------------------------

    public function test_cancel_already_cancelled_returns_409(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString(), 'Cancelled');

        $this->cancel($this->user, $booking)
            ->assertStatus(409)
            ->assertJsonStructure(['message']);
    }

    public function test_cancelled_booking_cannot_be_cancelled_again(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking)->assertOk();
        $this->cancel($this->user, $booking)->assertStatus(409);
    }

    // ---------------------------------------------------------------
    // Unconfirmed bookings (never paid -> 0%)
    // ---------------------------------------------------------------

    public function test_cancel_unconfirmed_pending_gives_zero_refund(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString(), 'Pending');

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID, 'Status' => 'Cancelled',
        ]);
    }

    public function test_cancel_unconfirmed_in_cart_gives_zero_refund(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString(), 'In Cart');

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);
    }

    public function test_unconfirmed_booking_in_the_past_still_cancels_with_zero(): void
    {
        // The "expired" rejection only applies to confirmed bookings.
        $booking = $this->makeBooking(now()->subDay()->toDateString(), 'Pending');

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);
    }

    // ---------------------------------------------------------------
    // Expired confirmed booking -> 422
    // ---------------------------------------------------------------

    public function test_cancel_expired_confirmed_returns_422(): void
    {
        $booking = $this->makeBooking(now()->subDay()->toDateString(), 'Confirmed');

        $this->cancel($this->user, $booking)
            ->assertStatus(422)
            ->assertJsonPath('message', 'Sorry, your request cannot be completed as your booking date is expired.');

        // The booking must be untouched.
        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID, 'Status' => 'Confirmed',
        ]);
    }

    // ---------------------------------------------------------------
    // Completed / failed cannot be cancelled -> 422
    // ---------------------------------------------------------------

    public function test_cancel_completed_returns_422(): void
    {
        $booking = $this->makeBooking(now()->addDays(5)->toDateString(), 'Completed');

        $this->cancel($this->user, $booking)->assertStatus(422);
        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID, 'Status' => 'Completed',
        ]);
    }

    public function test_cancel_failed_returns_422(): void
    {
        $booking = $this->makeBooking(now()->addDays(5)->toDateString(), 'Failed');

        $this->cancel($this->user, $booking)->assertStatus(422);
    }

    // ---------------------------------------------------------------
    // Refund tiers for confirmed, upcoming bookings
    // ---------------------------------------------------------------

    public function test_cancel_more_than_7_days_gives_100_percent(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 100);
    }

    public function test_cancel_exactly_8_days_gives_100_percent(): void
    {
        $booking = $this->makeBooking(now()->addDays(8)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 100);
    }

    public function test_cancel_exactly_7_days_gives_50_percent(): void
    {
        $booking = $this->makeBooking(now()->addDays(7)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 50);
    }

    public function test_cancel_5_days_before_gives_50_percent(): void
    {
        $booking = $this->makeBooking(now()->addDays(5)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 50);
    }

    public function test_cancel_exactly_3_days_gives_50_percent(): void
    {
        $booking = $this->makeBooking(now()->addDays(3)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 50);
    }

    public function test_cancel_exactly_2_days_gives_zero_percent(): void
    {
        $booking = $this->makeBooking(now()->addDays(2)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);
    }

    public function test_cancel_1_day_before_gives_zero_percent(): void
    {
        $booking = $this->makeBooking(now()->addDay()->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);
    }

    // ---------------------------------------------------------------
    // Response shape + persistence
    // ---------------------------------------------------------------

    public function test_successful_cancel_returns_message_and_refund_percentage(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonStructure(['message', 'refund_percentage']);
    }

    public function test_successful_cancel_stores_status_refund_and_timestamp(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking)->assertOk();

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Refund_Percentage' => 100,
        ]);

        $this->assertNotNull(Booking::find($booking->Booking_ID)->Cancelled_At);
    }

    // ---------------------------------------------------------------
    // Admin refund override (DELETE /bookings/{id})
    // ---------------------------------------------------------------

    private function admin(): User
    {
        return User::create([
            'User_Name' => 'Admin',
            'Email' => fake()->unique()->safeEmail(),
            'Password' => bcrypt('Password123'),
            'role' => 'admin',
        ]);
    }

    private function adminCancel(Booking $booking, ?int $refundPercentage = null, bool $agreed = true)
    {
        return $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson("/api/bookings/{$booking->Booking_ID}", array_filter([
                'agreed' => $agreed,
                'Refund_Percentage' => $refundPercentage,
            ], fn ($value) => $value !== null));
    }

    public function test_admin_can_override_refund_to_zero_on_eligible_booking(): void
    {
        // 10 days out -> policy would grant 100%. Admin chooses 0 instead.
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->adminCancel($booking, 0)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Refund_Percentage' => 0,
        ]);
    }

    public function test_admin_can_override_refund_upwards_on_late_cancellation(): void
    {
        // 1 day out -> policy grants 0%. Admin grants a goodwill 25% instead.
        $booking = $this->makeBooking(now()->addDay()->toDateString());

        $this->adminCancel($booking, 25)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 25);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Refund_Percentage' => 25,
        ]);
    }

    public function test_admin_override_accepts_all_offered_tiers(): void
    {
        foreach ([100, 50, 25, 0] as $percentage) {
            $booking = $this->makeBooking(now()->addDays(10)->toDateString());

            $this->adminCancel($booking, $percentage)
                ->assertOk()
                ->assertJsonPath('refund_percentage', $percentage);
        }
    }

    public function test_admin_override_rejects_unsupported_percentage(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->adminCancel($booking, 33)->assertStatus(422);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
        ]);
    }

    public function test_admin_cancel_without_percentage_uses_policy_tier(): void
    {
        // 10 days out -> automatic 100%.
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->adminCancel($booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 100);
    }

    /**
     * The customer's "Booking Cancellation" card reads the percentage straight
     * off the bookings API, so the applied value must be exposed there — an
     * admin override (25%) has to reach the customer unchanged rather than the
     * card recomputing a different tier from the booking date.
     */
    public function test_customer_bookings_endpoint_exposes_applied_refund_percentage(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        // Policy alone would be 100% here; the admin withholds it to 25%.
        $this->adminCancel($booking, 25)->assertOk();

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/user-bookings/{$this->customer->Customer_ID}")
            ->assertOk();

        $this->assertSame(25, $response->json('0.Refund_Percentage'));
    }

    // ---------------------------------------------------------------
    // The cancellation policy must be explicitly agreed to
    // ---------------------------------------------------------------

    public function test_customer_cannot_cancel_without_agreeing(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        // No `agreed` field at all.
        $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/user/bookings/{$booking->Booking_ID}/cancel")
            ->assertStatus(422)
            ->assertJsonValidationErrors('agreed');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
        ]);
    }

    public function test_customer_cannot_cancel_when_agreement_is_false(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking, agreed: false)
            ->assertStatus(422)
            ->assertJsonValidationErrors('agreed');

        // Untouched, and crucially no refund was recorded.
        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
            'Refund_Percentage' => null,
        ]);
    }

    public function test_customer_can_cancel_once_agreed(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking, agreed: true)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 100);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Refund_Percentage' => 100,
        ]);
    }

    /**
     * A non-confirmed booking is still cancellable without a refund, but the
     * policy still has to be agreed to first.
     */
    public function test_unconfirmed_booking_also_requires_agreement(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString(), 'Pending');

        $this->cancel($this->user, $booking, agreed: false)
            ->assertStatus(422)
            ->assertJsonValidationErrors('agreed');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Pending',
        ]);

        // Agreeing now lets it through, still with no refund.
        $this->cancel($this->user, $booking, agreed: true)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);
    }

    /**
     * An expired confirmed booking is refused for its own reason, so that check
     * must run before the agreement is even considered.
     */
    public function test_expired_booking_is_rejected_before_agreement_is_checked(): void
    {
        $booking = $this->makeBooking(now()->subDay()->toDateString());

        $response = $this->cancel($this->user, $booking, agreed: false);

        $response->assertStatus(422);
        $this->assertStringNotContainsString(
            'agreed',
            json_encode($response->json('errors') ?? []),
            'An expired booking should fail on expiry, not on the missing agreement.'
        );

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
        ]);
    }

    public function test_admin_cannot_cancel_without_agreeing(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson("/api/bookings/{$booking->Booking_ID}", [
                'Refund_Percentage' => 50,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('agreed');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
        ]);
    }

    public function test_admin_cannot_cancel_when_agreement_is_false(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        // Even with a refund tier chosen, a false agreement blocks it.
        $this->adminCancel($booking, 25, agreed: false)
            ->assertStatus(422)
            ->assertJsonValidationErrors('agreed');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
            'Refund_Percentage' => null,
        ]);
    }

    public function test_admin_can_cancel_once_agreed(): void
    {
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->adminCancel($booking, 25, agreed: true)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 25);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Refund_Percentage' => 25,
        ]);
    }

    /**
     * The admin flow must report expiry, not a missing agreement, when both
     * would apply.
     */
    public function test_admin_expired_booking_is_rejected_before_agreement_is_checked(): void
    {
        $booking = $this->makeBooking(now()->subDay()->toDateString());

        $response = $this->adminCancel($booking, 100, agreed: false);

        $response->assertStatus(422);
        $this->assertStringNotContainsString(
            'agreed',
            json_encode($response->json('errors') ?? []),
            'An expired booking should fail on expiry, not on the missing agreement.'
        );

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
        ]);
    }

    // ---------------------------------------------------------------
    // Cancelling an "In Cart" booking removes it from the cart
    // ---------------------------------------------------------------

    /**
     * An "In Cart" booking with its cart entry — cancelling it has to drop the
     * cart row too, or the cart page keeps listing a cancelled booking.
     */
    private function makeCartBooking(string $date, ?Customer $owner = null): Booking
    {
        $booking = $this->makeBooking($date, 'In Cart', $owner);

        Cart::create([
            'Customer_ID' => $booking->Customer_ID,
            'Booking_ID' => $booking->Booking_ID,
        ]);

        return $booking;
    }

    public function test_cancelling_an_in_cart_booking_removes_it_from_the_cart(): void
    {
        $booking = $this->makeCartBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);

        $this->assertDatabaseMissing('carts', [
            'Booking_ID' => $booking->Booking_ID,
        ]);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
        ]);
    }

    public function test_cart_endpoint_no_longer_lists_a_cancelled_in_cart_booking(): void
    {
        $booking = $this->makeCartBooking(now()->addDays(10)->toDateString());

        // Visible before cancelling.
        $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/cart/{$this->customer->Customer_ID}")
            ->assertOk()
            ->assertJsonCount(1);

        $this->cancel($this->user, $booking)->assertOk();

        $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/cart/{$this->customer->Customer_ID}")
            ->assertOk()
            ->assertJsonCount(0);
    }

    public function test_cancelling_one_cart_item_leaves_the_others_in_place(): void
    {
        $cancelled = $this->makeCartBooking(now()->addDays(10)->toDateString());
        $kept = $this->makeCartBooking(now()->addDays(11)->toDateString());

        $this->cancel($this->user, $cancelled)->assertOk();

        $this->assertDatabaseMissing('carts', ['Booking_ID' => $cancelled->Booking_ID]);
        $this->assertDatabaseHas('carts', ['Booking_ID' => $kept->Booking_ID]);

        $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/cart/{$this->customer->Customer_ID}")
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_admin_cancelling_an_in_cart_booking_removes_it_from_the_cart(): void
    {
        $booking = $this->makeCartBooking(now()->addDays(10)->toDateString());

        $this->adminCancel($booking)->assertOk();

        $this->assertDatabaseMissing('carts', [
            'Booking_ID' => $booking->Booking_ID,
        ]);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
        ]);
    }

    public function test_cancelling_a_paid_booking_is_unaffected_by_cart_cleanup(): void
    {
        // A confirmed booking was never in a cart, so the cleanup is a no-op and
        // the normal refund still applies.
        $booking = $this->makeBooking(now()->addDays(10)->toDateString());

        $this->cancel($this->user, $booking)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 100);

        $this->assertDatabaseMissing('carts', ['Booking_ID' => $booking->Booking_ID]);
    }

    // ---------------------------------------------------------------
    // Guest (non-registered) bookings: admin may cancel, guest may not
    // ---------------------------------------------------------------

    /**
     * A booking made without an account belongs to a Guest-typed customer
     * record with no matching login, so it can never be cancelled through the
     * customer endpoint — the guest has no credentials to present.
     */
    private function makeGuestBooking(string $date, string $status = 'Confirmed'): Booking
    {
        $guestCustomer = Customer::create([
            'First_Name' => 'Guest',
            'Last_Name' => 'Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0770000000',
            'NIC' => '9',
            'Country' => 'Sri Lanka',
            'Customer_Type' => 'Guest',
        ]);

        return $this->makeBooking($date, $status, $guestCustomer);
    }

    public function test_admin_can_cancel_a_guest_booking(): void
    {
        $booking = $this->makeGuestBooking(now()->addDays(10)->toDateString());

        $this->adminCancel($booking, 50)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 50);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Refund_Percentage' => 50,
        ]);
    }

    public function test_unauthenticated_guest_cannot_cancel_a_booking(): void
    {
        // No token at all: the endpoint is behind auth:sanctum.
        $booking = $this->makeGuestBooking(now()->addDays(10)->toDateString());

        $this->patchJson("/api/user/bookings/{$booking->Booking_ID}/cancel", [
            'agreed' => true,
        ])->assertStatus(401);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
        ]);
    }

    public function test_guest_cannot_cancel_a_booking_by_claiming_its_customer_id(): void
    {
        // The ownership check compares the signed-in user's Customer_ID, so a
        // booking id alone is never enough.
        $booking = $this->makeGuestBooking(now()->addDays(10)->toDateString());

        $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/user/bookings/{$booking->Booking_ID}/cancel", [
                'agreed' => true,
                'Customer_ID' => $booking->Customer_ID,
            ])
            ->assertStatus(403);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
        ]);
    }

    // ---------------------------------------------------------------
    // Expired confirmed bookings cannot be cancelled by anyone
    // ---------------------------------------------------------------

    public function test_admin_cannot_cancel_expired_confirmed_booking(): void
    {
        // Safari date already passed -> the admin flow must refuse, exactly
        // like the customer flow.
        $booking = $this->makeBooking(now()->subDay()->toDateString());

        $this->adminCancel($booking, 100)->assertStatus(422);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Confirmed',
            'Refund_Percentage' => null,
        ]);
    }

    // ---------------------------------------------------------------
    // An override can never invent a refund for an unpaid booking
    // ---------------------------------------------------------------

    public function test_admin_override_cannot_refund_an_unpaid_booking(): void
    {
        // Pending = never paid. Even a requested 100% must resolve to 0.
        $booking = $this->makeBooking(now()->addDays(10)->toDateString(), 'Pending');

        $this->adminCancel($booking, 100)
            ->assertOk()
            ->assertJsonPath('refund_percentage', 0);

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Status' => 'Cancelled',
            'Refund_Percentage' => 0,
        ]);
    }
}