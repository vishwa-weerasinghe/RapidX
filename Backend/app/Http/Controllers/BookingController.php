<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // =========================
    // GET ALL BOOKINGS (ADMIN)
    // =========================
    public function index()
    {
        return response()->json(
            Booking::with(['customer', 'package', 'vehicle'])->latest()->get()
        );
    }

    // =========================
    // GET USER BOOKINGS
    // =========================
    public function userBookings($customerId)
    {
        return response()->json(
            Booking::with(['package', 'vehicle'])
                ->where('Customer_ID', $customerId)
                ->latest()
                ->get()
        );
    }

    // =========================
    // CREATE BOOKING (USER + ADMIN)
    // =========================
    public function store(Request $request)
    {
        $request->validate([
            'Booking_Date' => 'required|date',
            'Pickup_Time' => 'required',
            'Pickup_Location' => 'required|string',
            'No_of_adults' => 'required|integer',
            'No_of_child' => 'required|integer',
            'Customer_ID' => 'required',
            'Package_ID' => 'required',
        ]);

        $booking = Booking::create([
            'Booking_Date' => $request->Booking_Date,
            'Pickup_Time' => $request->Pickup_Time,
            'Pickup_Location' => $request->Pickup_Location,
            'No_of_adults' => $request->No_of_adults,
            'No_of_child' => $request->No_of_child,
            'Payment' => 0,
            'Status' => 'Pending',
            'Customer_ID' => $request->Customer_ID,
            'Package_ID' => $request->Package_ID,
            'Vehicle_ID' => $request->Vehicle_ID ?? null,
        ]);

        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking
        ]);
    }

    // =========================
    // SHOW SINGLE BOOKING
    // =========================
    public function show($id)
    {
        return Booking::with(['customer','package','vehicle'])
            ->findOrFail($id);
    }

    // =========================
    // UPDATE BOOKING (ADMIN)
    // =========================
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $booking->update($request->only([
            'Booking_Date',
            'Pickup_Time',
            'Pickup_Location',
            'No_of_adults',
            'No_of_child',
            'Payment',
            'Status',
            'Vehicle_ID'
        ]));

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    // =========================
    // DELETE BOOKING (ADMIN)
    // =========================
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully'
        ]);
    }
}