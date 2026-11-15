<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\Package;
use App\Models\Review;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;
        if (!in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true)) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        // ---- Core Counts ----
        $totalBookings  = Booking::count();
        $totalReviews   = Review::count();

        // ---- Revenue (only realized: Confirmed or Completed) ----
        $totalRevenue   = Booking::whereIn('Status', ['Confirmed', 'Completed'])->sum('Payment');

        // ---- Average Rating ----
        $avgRating = Review::avg('Rate') ?? 0;

        // ---- Bookings by Status ----
        $bookingsByStatus = Booking::select('Status', DB::raw('count(*) as count'))
            ->groupBy('Status')
            ->pluck('count', 'Status');

        // ---- Recent Bookings (last 5) ----
        $recentBookings = Booking::with(['customer', 'package'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($b) {
                return [
                    'id'           => $b->Booking_ID,
                    'customer'     => $b->customer
                        ? $b->customer->First_Name . ' ' . $b->customer->Last_Name
                        : 'Guest',
                    'package'      => $b->package->Package_Name ?? '—',
                    'date'         => $b->Booking_Date,
                    'status'       => $b->Status,
                    'payment'      => $b->Payment,
                ];
            });

        // ---- Bookings per month (last 6 months) ----
        $isSqlite = DB::connection()->getDriverName() === 'sqlite';
        $monthSelector = $isSqlite 
            ? "strftime('%Y-%m', Booking_Date)"
            : "DATE_FORMAT(Booking_Date, '%Y-%m')";

        $bookingsPerMonth = Booking::select(
                DB::raw("{$monthSelector} as month"),
                DB::raw('count(*) as count')
            )
            ->where('Booking_Date', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // ---- Recent Reviews (last 4) ----
        $recentReviews = Review::orderByDesc('Review_ID')
            ->take(4)
            ->get()
            ->map(function ($r) {
                return [
                    'id'          => $r->Review_ID,
                    'rating'      => $r->Rate,
                    'description' => $r->Description,
                    'customer_id' => $r->Customer_ID,
                ];
            });

        return response()->json([
            'total_bookings'     => $totalBookings,
            'total_reviews'      => $totalReviews,
            'total_revenue'      => $totalRevenue,
            'avg_rating'         => round($avgRating, 1),
            'bookings_by_status' => $bookingsByStatus,
            'recent_bookings'    => $recentBookings,
            'bookings_per_month' => $bookingsPerMonth,
            'recent_reviews'     => $recentReviews,
        ]);
    }
}
