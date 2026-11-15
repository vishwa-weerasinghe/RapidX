<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Cart;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Orchestrates booking cancellation: status rules, the real PayHere refund
 * payout and the atomic status/refund bookkeeping.
 *
 * The percentage itself always comes from RefundCalculator so the tiers are
 * defined in exactly one place.
 */
class CancellationService
{
    public function __construct(private RefundCalculator $refundCalculator)
    {
    }

    /**
     * Cancel a booking on behalf of its customer.
     *
     * Returns a result array (instead of an HTTP response) so the controller
     * stays thin and only maps the outcome to a status code.
     */
    public function cancel(Booking $booking, ?int $overridePercentage = null): array
    {
        $status = $this->refundCalculator->normalizeStatus($booking->Status);

        // 1. Already cancelled -> 409
        if ($status === 'cancelled') {
            return $this->fail(409, 'This booking is already cancelled.');
        }

        // 2. Completed / failed bookings are final and cannot be cancelled.
        if (in_array($status, ['completed', 'failed'], true)) {
            return $this->fail(422, 'A completed or failed booking cannot be cancelled.');
        }

        $safariDay = $booking->Booking_Date
            ? Carbon::parse($booking->Booking_Date)->startOfDay()
            : null;
        $today = Carbon::now()->startOfDay();

        // 3. Confirmed + safari date already passed -> 422 (expired).
        if ($status === 'confirmed' && $this->isExpired($booking)) {
            return $this->fail(422, 'Sorry, your request cannot be completed as your booking date is expired.');
        }

        // 4. Percentage from the single-source-of-truth tier service. This
        //    also pushes the real PayHere refund when the booking was paid.
        $refundPercentage = $this->processRefund($booking, $overridePercentage);

        // 5. Persist the cancellation + refund bookkeeping atomically. A cart
        //    entry only ever exists for an "In Cart" booking, so dropping it
        //    here keeps a cancelled item from lingering in the cart list.
        DB::transaction(function () use ($booking, $refundPercentage) {
            $this->removeFromCart($booking);

            $booking->update([
                'Status' => 'Cancelled',
                'Refund_Percentage' => $refundPercentage,
                'Cancelled_At' => now(),
                'Admin_Seen' => false,
                'Admin_Message' => 'Customer cancelled this booking.',
            ]);
        });

        return [
            'ok' => true,
            'http_status' => 200,
            'message' => 'Booking cancelled successfully',
            'refund_percentage' => $refundPercentage,
        ];
    }

    /**
     * Drop the cart entry belonging to a booking.
     *
     * A cart row is only created for an "In Cart" booking (and is deleted on
     * checkout), so cancelling one has to clean it up too — otherwise the cart
     * page keeps listing an item whose booking is now cancelled. A no-op for
     * bookings that were never in a cart.
     *
     * Shared by the customer cancellation flow and the admin delete flow.
     */
    public function removeFromCart(Booking $booking): void
    {
        Cart::where('Booking_ID', $booking->Booking_ID)->delete();
    }

    /**
     * True when the booking is in the confirmed state (i.e. it was paid for and
     * therefore subject to the refund tiers).
     */
    public function isConfirmedBooking(Booking $booking): bool
    {
        return $this->refundCalculator->isConfirmed((string) $booking->Status);
    }

    /**
     * True when the safari date has already passed. Compared at midnight so
     * the time of day never shifts the outcome.
     *
     * Shared by the customer cancellation flow and the admin delete flow so
     * "expired" means exactly the same thing for both.
     */
    public function isExpired(Booking $booking): bool
    {
        if (!$booking->Booking_Date) {
            return false;
        }

        return Carbon::parse($booking->Booking_Date)->startOfDay()
            ->lt(Carbon::now()->startOfDay());
    }

    /**
     * Work out the refund percentage for a booking and, when it really has a
     * paid PayHere payment, push the refund to the gateway. The gateway call
     * is best effort: a hiccup is logged but never blocks the cancellation.
     *
     * Shared by the customer cancellation flow and the admin delete flow.
     *
     * $overridePercentage lets an administrator apply a refund that differs
     * from the automatic tier (e.g. a goodwill 100% on a late cancellation).
     * The customer flow never passes one, so its tiers stay untouched.
     */
    public function processRefund(Booking $booking, ?int $overridePercentage = null): int
    {
        // A booking that was never paid (pending / in cart / ...) can never
        // earn money back, so no override can invent a refund for it.
        if (!$this->refundCalculator->isConfirmed((string) $booking->Status)) {
            return RefundCalculator::NO_REFUND;
        }

        // `??` (not `?:`) so a deliberate 0% override is never mistaken for
        // "no override supplied".
        $percentage = $overridePercentage ?? $this->refundCalculator->calculate(
            (string) $booking->Status,
            $booking->Booking_Date
        );

        $payment = $booking->payment;
        $paidViaPayHere = $this->refundCalculator->isConfirmed((string) $booking->Status)
            && $payment
            && $payment->payhere_payment_id;

        if ($paidViaPayHere && $percentage > 0 && $booking->Payment > 0) {
            $refundAmount = ((float) $booking->Payment * $percentage) / 100;
            $days = $this->refundCalculator->daysUntilSafari($booking->Booking_Date) ?? 0;
            $description = "Automated Refund: {$percentage}% (Cancelled {$days} days before tour)";

            try {
                app(PayHereService::class)->refund($payment->payhere_payment_id, $refundAmount, $description);
                Log::info("Refunded {$refundAmount} for Booking ID {$booking->Booking_ID}");
            } catch (\Exception $e) {
                // IM-20: Log at ERROR level so the admin is alerted, and
                // update the booking with a Refund_Status note when the
                // column is available. The cancellation itself still proceeds
                // so the customer is not stuck, but the admin must manually
                // issue the refund through the PayHere dashboard.
                Log::error(
                    "REFUND GATEWAY FAILURE for Booking ID {$booking->Booking_ID}: "
                    . $e->getMessage()
                    . " | Amount: {$refundAmount} | PayHere Payment ID: {$payment->payhere_payment_id}"
                    . " | ADMIN ACTION REQUIRED: issue refund manually."
                );

                // Store a note on the booking if the Admin_Message column exists
                try {
                    $booking->update([
                        'Admin_Message' => '[REFUND FAILED] Gateway error when processing '
                            . $percentage . '% refund of $' . number_format($refundAmount, 2)
                            . '. Admin must issue refund manually via PayHere dashboard.'
                            . ' PayHere Payment ID: ' . $payment->payhere_payment_id,
                        'Admin_Seen'    => false,
                    ]);
                } catch (\Exception $innerEx) {
                    Log::error('Could not update Admin_Message for Booking ID ' . $booking->Booking_ID . ': ' . $innerEx->getMessage());
                }
            }
        }

        return $percentage;
    }

    private function fail(int $httpStatus, string $message): array
    {
        return [
            'ok' => false,
            'http_status' => $httpStatus,
            'message' => $message,
            'refund_percentage' => RefundCalculator::NO_REFUND,
        ];
    }
}
