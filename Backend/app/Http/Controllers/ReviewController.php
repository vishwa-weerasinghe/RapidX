<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        return response()->json(Review::with('customer')->orderByDesc('Review_ID')->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'Rate' => ['required', 'integer', 'min:1', 'max:5'],
            'Description' => ['required', 'string', 'max:1000'],
            'Email' => ['nullable', 'email', 'max:255'],
        ]);

        $customerId = $user->Customer_ID ?? $user->customer_id ?? $user->id ?? null;

        if ($user) {
            if (!$customerId) {
                return response()->json(['message' => 'Customer profile not found.'], 403);
            }

            // Resolve customer email from linked customer profile or user record
            $customer = \App\Models\Customer::find($customerId);
            $email = trim((string) ($customer?->Email ?? $user->Email ?? $user->email ?? ''));

            if ($email === '') {
                return response()->json(['message' => 'Email is required to submit a review.'], 422);
            }

            $booking = Booking::with('customer')
                ->whereHas('customer', function ($query) use ($email) {
                    $query->where('Email', $email);
                })
                ->latest('Booking_ID')
                ->first();

            if (!$booking || !$booking->customer) {
                return response()->json(['message' => 'Sorry you have not booked a safari. you are failed to upload a review'], 422);
            }

            $customerId = $booking->customer->Customer_ID;
        } else {
            $email = trim((string) ($validated['Email'] ?? ''));

            if ($email === '') {
                return response()->json(['message' => 'Email is required to submit a public review.'], 422);
            }

            $booking = Booking::with('customer')
                ->whereHas('customer', function ($query) use ($email) {
                    $query->where('Email', $email);
                })
                ->latest('Booking_ID')
                ->first();

            if (!$booking || !$booking->customer) {
                return response()->json(['message' => 'Please use the email from a booked safari to submit a review.'], 422);
            }

            $customerId = $booking->customer->Customer_ID;
        }

        $validated['Customer_ID'] = $customerId;

        $review = Review::create($validated);

        return response()->json($review->load('customer'), 201);
    }

    public function show(Review $review)
    {
        return response()->json($review);
    }

    public function update(Request $request, Review $review)
    {
        $validated = $request->validate([
            'Rate' => ['sometimes', 'required', 'integer', 'min:1', 'max:5'],
            'Description' => ['sometimes', 'required', 'string', 'max:1000'],
            'Customer_ID' => ['nullable', 'integer', 'exists:customers,Customer_ID'],
        ]);

        if (array_key_exists('Customer_ID', $validated) && ($validated['Customer_ID'] === null || $validated['Customer_ID'] === '')) {
            $validated['Customer_ID'] = $request->user()?->Customer_ID ?? null;
        }

        $review->update($validated);

        return response()->json($review);
    }

    public function destroy(Request $request, Review $review)
    {
        $user = $request->user();

        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can delete reviews.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;

        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }
}