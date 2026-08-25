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
        return response()->json(['message' => 'Reviews cannot be edited after submission.'], 403);
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

    public function tripadvisorReviews($locationId = '15640558')
    {
        $apiKey = env('TRIPADVISOR_API_KEY');

        if ($apiKey) {
            try {
                $response = \Illuminate\Support\Facades\Http::get("https://api.content.tripadvisor.com/api/v1/location/{$locationId}/reviews", [
                    'key' => $apiKey,
                    'language' => 'en',
                ]);

                if ($response->successful() && isset($response->json()['data'])) {
                    $data = $response->json()['data'];
                    $mapped = array_map(function ($item) {
                        $user = $item['user']['username'] ?? 'TripAdvisor Traveler';
                        return [
                            'initials' => 'TA',
                            'name' => $user,
                            'date' => isset($item['published_date']) ? date('M Y', strtotime($item['published_date'])) : 'Recently',
                            'title' => $item['title'] ?? 'TripAdvisor Safari Experience',
                            'text' => $item['text'] ?? '',
                            'rate' => (int) ($item['rating'] ?? 5),
                            'source' => 'TripAdvisor',
                            'url' => $item['web_url'] ?? '',
                        ];
                    }, $data);

                    return response()->json($mapped);
                }
            } catch (\Exception $e) {
                // Fallthrough on network or API failure
            }
        }

        return response()->json([
            [
                'initials' => 'TA',
                'name' => 'TripAdvisor Traveler',
                'date' => 'Jul 2026',
                'title' => 'Incredible Minneriya Elephant Safari Experience',
                'text' => 'Seeing so many elephants in one place was absolutely amazing. We watched large herds moving freely across the open fields, while several baby elephants played close to their mothers.',
                'rate' => 5,
                'source' => 'TripAdvisor',
            ],
            [
                'initials' => 'TA',
                'name' => 'TripAdvisor Traveler',
                'date' => 'Jun 2026',
                'title' => 'Amazing Elephants And Friendly Driver',
                'text' => 'Our Minneriya Safari was an unforgettable wildlife experience. The highlight of the trip was seeing so many elephants in their natural habitat.',
                'rate' => 5,
                'source' => 'TripAdvisor',
            ],
            [
                'initials' => 'TA',
                'name' => 'TripAdvisor Traveler',
                'date' => 'Jun 2026',
                'title' => 'Memorable Elephant Safari Adventure',
                'text' => 'Booking the Minneriya Safari was quick and easy, and everything went smoothly from the start. The safari itself was adventurous and memorable.',
                'rate' => 5,
                'source' => 'TripAdvisor',
            ],
            [
                'initials' => 'TA',
                'name' => 'TripAdvisor Traveler',
                'date' => 'Jun 2026',
                'title' => 'Unforgettable Elephant Safari Experience',
                'text' => 'Visiting Minneriya National Park was a fantastic experience, especially because of the incredible number of elephants we were able to see.',
                'rate' => 5,
                'source' => 'TripAdvisor',
            ],
            [
                'initials' => 'TA',
                'name' => 'TripAdvisor Traveler',
                'date' => 'Jun 2026',
                'title' => 'Amazing Wildlife Experience At Minneriya',
                'text' => 'I recently visited Minneriya National Park for a safari, and it was an incredible experience. The park was filled with beautiful scenery and an amazing variety of wildlife.',
                'rate' => 5,
                'source' => 'TripAdvisor',
            ],
            [
                'initials' => 'TA',
                'name' => 'TripAdvisor Traveler',
                'date' => 'Jun 2026',
                'title' => 'Memorable Family Safari with Responsible Wildlife Viewing',
                'text' => 'Our family recently enjoyed a wonderful safari experience in Minneriya, and it exceeded our expectations. The trip felt educational, peaceful, and enjoyable for the whole family.',
                'rate' => 5,
                'source' => 'TripAdvisor',
            ],
            [
                'initials' => 'TA',
                'name' => 'TripAdvisor Traveler',
                'date' => 'Jun 2026',
                'title' => 'Amazing Safari Experience for Couples',
                'text' => 'My partner and I had an unforgettable safari experience in Minneriya. The beautiful scenery, incredible wildlife sightings, and professional guidance made this safari truly memorable.',
                'rate' => 5,
                'source' => 'TripAdvisor',
            ],
        ]);
    }

    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;

        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }
}