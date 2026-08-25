<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;

        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }

    // =========================
    // GET ALL BOOKINGS (ADMIN)
    // =========================
    public function index()
    {
        return response()->json(
            Booking::with(['customer', 'package', 'vehicle.driver'])->latest()->get()
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
            'Area' => 'required|string|max:100',
            'Pickup_Location' => 'required|string',
            'No_of_adults' => 'required|integer',
            'No_of_child' => 'required|integer',
            'Customer_ID' => 'nullable',
            'Package_ID' => 'required',
        ]);

        $customerId = $request->Customer_ID;
        $isGuestBooking = !$customerId;

        if (!$customerId) {
            $customer = \App\Models\Customer::create([
                'First_Name' => $request->First_Name ?? 'Guest',
                'Last_Name' => $request->Last_Name ?? 'Customer',
                'Email' => $request->Email ?? null,
                'Phone_No' => $request->Phone_No ?? null,
                'NIC' => $request->NIC ?? null,
                'Country' => $request->Country ?? null,
                'Customer_Type' => 'Guest',
            ]);

            $customerId = $customer->Customer_ID;
        }

        $booking = Booking::create([
            'Booking_Date' => $request->Booking_Date,
            'Pickup_Time' => $request->Pickup_Time,
            'Area' => $request->Area,
            'Pickup_Location' => $request->Pickup_Location,
            'No_of_adults' => $request->No_of_adults,
            'No_of_child' => $request->No_of_child,
            'Payment' => $request->Payment ?? 0,
            'Status' => $isGuestBooking ? 'Confirmed' : 'Pending',
            'Customer_ID' => $customerId,
            'Package_ID' => $request->Package_ID,
            'Vehicle_ID' => $request->Vehicle_ID ?? null,
            'Admin_Seen' => false,
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
        $request->validate([
            'Vehicle_ID' => 'nullable|exists:vehicles,Vehicle_ID',
            'Package_ID' => 'sometimes|required|exists:packages,id',
            'Area' => 'sometimes|required|string|max:100',
        ]);

        $booking = Booking::findOrFail($id);

        $booking->update($request->only([
            'Booking_Date',
            'Pickup_Time',
            'Area',
            'Pickup_Location',
            'No_of_adults',
            'No_of_child',
            'Payment',
            'Status',
            'Package_ID',
            'Area',
            'Vehicle_ID'
        ]));

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    public function assignVehicle(Request $request, $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can assign vehicles.'], 403);
        }

        $validated = $request->validate([
            'Vehicle_ID' => 'required|exists:vehicles,Vehicle_ID',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(['Vehicle_ID' => $validated['Vehicle_ID']]);

        return response()->json([
            'message' => 'Vehicle assigned successfully',
            'booking' => $booking,
        ]);
    }

    // =========================
    // GET NEAREST UPCOMING BOOKING FOR A CUSTOMER
    // =========================
    public function upcomingBooking($customerId)
    {
        $booking = Booking::with(['package', 'vehicle.driver'])
            ->where('Customer_ID', $customerId)
            ->where('Status', 'Pending')
            ->whereDate('Booking_Date', '>=', now()->toDateString())
            ->orderBy('Booking_Date', 'asc')
            ->orderBy('Pickup_Time', 'asc')
            ->first();

        if (!$booking) {
            return response()->json(null, 200);
        }

        return response()->json($booking);
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
    public function unreadCount()
    {
        return response()->json([
            'count' => Booking::where('Admin_Seen', false)->count(),
        ]);
    }

    public function markAllAsSeen()
    {
        Booking::where('Admin_Seen', false)->update([
            'Admin_Seen' => true,
        ]);

        return response()->json([
            'message' => 'Booking notifications cleared',
        ]);
    }
}
