<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\CancellationService;
use Illuminate\Http\Request;

/**
 * Customer-facing booking cancellation.
 *
 * Kept deliberately thin: locate the booking, make sure the caller owns it,
 * then hand every business rule to CancellationService.
 */
class CancellationController extends Controller
{
    public function __construct(private CancellationService $cancellationService)
    {
    }

    public function cancel(Request $request, $id)
    {
        $booking = Booking::with('payment')->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $user = $request->user('sanctum') ?? auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated. Only registered users can cancel bookings.'], 401);
        }

        // A customer may only ever cancel their own booking.
        if ((int) $user->Customer_ID !== (int) $booking->Customer_ID) {
            return response()->json(['message' => 'Unauthorized. You can only cancel your own bookings.'], 403);
        }

        // An expired confirmed booking is refused for its own reason, before the
        // agreement is even considered, so the customer sees "your booking date
        // is expired" rather than a complaint about a missing checkbox. The
        // modal never offers a cancel action for these, so this only guards a
        // direct API call.
        if ($this->cancellationService->isConfirmedBooking($booking)
            && $this->cancellationService->isExpired($booking)) {
            return response()->json([
                'message' => 'Sorry, your request cannot be completed as your booking date is expired.',
            ], 422);
        }

        // The cancellation policy has to be explicitly acknowledged. The modal
        // keeps its confirm button disabled until the agreement box is ticked,
        // and the backend enforces the same thing so a direct API call cannot
        // cancel a booking without accepting the policy first.
        //
        // Validated after the lookup/ownership/expiry checks so an unknown
        // booking still answers 404, a foreign booking still answers 403 and an
        // expired one still explains itself.
        $request->validate([
            'agreed' => ['required', 'accepted'],
        ]);

        $refundPercentage = $request->input('refund_percentage');

        $result = $this->cancellationService->cancel($booking, $refundPercentage);

        if (!$result['ok']) {
            return response()->json(['message' => $result['message']], $result['http_status']);
        }

        $refundAmount = 0;
        if ($result['refund_percentage'] > 0 && $booking->Payment > 0) {
            $refundAmount = ($booking->Payment * $result['refund_percentage']) / 100;
        }

        return response()->json([
            'message' => $result['message'],
            'refund_percentage' => $result['refund_percentage'],
            'refund_amount' => $refundAmount,
            'booking' => $booking,
        ]);
    }
}
