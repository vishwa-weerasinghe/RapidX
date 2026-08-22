<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can view appointments.'], 403);
        }

        $query = Booking::select(
            'bookings.Booking_ID',
            'bookings.Booking_Date',
            'bookings.Pickup_Time',
            'bookings.Pickup_Location',
            'bookings.Customer_ID',
            'bookings.Vehicle_ID',
            'bookings.Payment',
            'bookings.Status',
            'customers.First_Name',
            'customers.Last_Name',
            'customers.Phone_No',
            'customers.Email',
            'customers.Customer_Type',
            'packages.Package_Name'
        )
        ->join('customers', 'bookings.Customer_ID', '=', 'customers.Customer_ID')
        ->leftJoin('packages', 'bookings.Package_ID', '=', 'packages.id');

        // Optional monthly filter: ?month=YYYY-MM
        if ($request->has('month') && $request->month) {
            $month = $request->month;
            if (preg_match('/^\d{4}-\d{2}$/', $month)) {
                $query->whereBetween('bookings.Booking_Date', [
                    $month . '-01',
                    $month . '-31',
                ]);
            }
        }

        $appointments = $query
            ->orderBy('bookings.Booking_Date', 'desc')
            ->orderBy('bookings.Pickup_Time')
            ->get();

        return response()->json($appointments);
    }

    public function summary(Request $request)
    {
        $user = $request->user();

        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can view appointments.'], 403);
        }

        $query = Booking::query();

        if ($request->has('month') && $request->month) {
            $month = $request->month;
            if (preg_match('/^\d{4}-\d{2}$/', $month)) {
                $query->whereBetween('Booking_Date', [
                    $month . '-01',
                    $month . '-31',
                ]);
            }
        }

        $totalConfirmed = (clone $query)->where('Status', 'Confirmed')->count();
        $totalUnconfirmed = (clone $query)->where('Status', '!=', 'Confirmed')->count();
        $totalEarningsConfirmed = (clone $query)->where('Status', 'Confirmed')->sum('Payment');
        $totalEarningsUnconfirmed = (clone $query)->where('Status', '!=', 'Confirmed')->sum('Payment');

        return response()->json([
            'total_confirmed' => $totalConfirmed,
            'total_unconfirmed' => $totalUnconfirmed,
            'total_earnings' => $totalEarningsConfirmed,
            'total_earnings_confirmed' => $totalEarningsConfirmed,
            'total_earnings_unconfirmed' => $totalEarningsUnconfirmed,
        ]);
    }

    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;
        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }
}
