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
            Booking::with(['customer', 'package', 'vehicle.driver', 'vehicles.driver'])->latest()->get()
        );
    }

    // =========================
    // GET USER BOOKINGS
    // =========================
    public function userBookings($customerId)
    {
        return response()->json(
            Booking::with(['package', 'vehicle.driver', 'vehicles.driver'])
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
        return Booking::with(['customer', 'package', 'vehicle.driver', 'vehicles.driver'])
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

        // Keep the multi-vehicle pivot in sync whenever the single Vehicle_ID
        // column is changed through this generic endpoint.
        if ($request->has('Vehicle_ID')) {
            $singleVehicleId = $request->input('Vehicle_ID');
            $booking->vehicles()->sync($singleVehicleId ? [$singleVehicleId] : []);
        }

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    // =========================
    // ASSIGN VEHICLE(S) (ADMIN)
    // Supports assigning multiple vehicles to one booking. The number of
    // vehicles required is derived from the passenger count (max 6 passengers
    // per vehicle) on the frontend and double-checked here.
    // =========================
    public function assignVehicles(Request $request, $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can assign vehicles.'], 403);
        }

        $validated = $request->validate([
            'Vehicle_IDs'    => 'required|array|min:1',
            'Vehicle_IDs.*'  => 'integer|distinct|exists:vehicles,Vehicle_ID',
            'Required_Count' => 'nullable|integer|min:1',
        ]);

        $booking = Booking::findOrFail($id);

        $vehicleIds = array_values(array_map('intval', $validated['Vehicle_IDs']));
        $requiredCount = max(
            1,
            (int) ($validated['Required_Count'] ?? ceil(($booking->No_of_adults + $booking->No_of_child) / 6))
        );

        if (count($vehicleIds) < $requiredCount) {
            return response()->json([
                'message' => "This booking needs at least {$requiredCount} vehicle(s) for its passengers.",
            ], 422);
        }

        $booking->vehicles()->sync($vehicleIds);

        // Keep the legacy single-vehicle column pointing at the first vehicle
        // so screens still relying on booking.vehicle keep working.
        $booking->update(['Vehicle_ID' => $vehicleIds[0]]);

        return response()->json([
            'message' => count($vehicleIds) . ' vehicle(s) assigned successfully',
            'booking' => $booking->load(['customer', 'package', 'vehicle.driver', 'vehicles.driver']),
        ]);
    }

    public function assignVehicle(Request $request, $id)
    {
        // Delegate the legacy single-vehicle endpoint to the multi-assign logic.
        $request->merge([
            'Vehicle_IDs' => array_values(array_filter([(int) $request->input('Vehicle_ID')])),
        ]);

        return $this->assignVehicles($request, $id);
    }

    // =========================
    // GET NEAREST UPCOMING BOOKING FOR A CUSTOMER
    // =========================
    public function upcomingBooking($customerId)
    {
        $booking = Booking::with(['package', 'vehicle.driver', 'vehicles.driver'])
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
