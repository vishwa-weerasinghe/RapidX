<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Booking::select(
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
            'drivers.Driver_ID',
            'drivers.Driver_Name',
            'drivers.Phone_Number as Driver_Phone_Number',
            'packages.Package_Name'
        )
        ->join('customers', 'bookings.Customer_ID', '=', 'customers.Customer_ID')
        ->leftJoin('vehicles', 'bookings.Vehicle_ID', '=', 'vehicles.Vehicle_ID')
        ->leftJoin('drivers', 'vehicles.Driver_ID', '=', 'drivers.Driver_ID')
        ->leftJoin('packages', 'bookings.Package_ID', '=', 'packages.id')
        ->where('bookings.Status', 'Confirmed')
        ->orderBy('bookings.Booking_Date', 'desc')
        ->orderBy('bookings.Pickup_Time')
        ->get();

        return response()->json($appointments);
    }

    public function summary()
    {
        $totalConfirmed = Booking::where('Status', 'Confirmed')->count();
        $totalEarnings = Booking::where('Status', 'Confirmed')->sum('Payment');

        return response()->json([
            'total_confirmed' => $totalConfirmed,
            'total_earnings' => $totalEarnings,
        ]);
    }

    public function updateDriver(Request $request, Booking $booking)
    {
        $user = $request->user();

        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can change the assigned driver.'], 403);
        }

        $validated = $request->validate([
            'Driver_ID' => 'required|integer|exists:drivers,Driver_ID',
        ]);

        $driver = Driver::find($validated['Driver_ID']);

        if (!$driver) {
            return response()->json(['message' => 'Driver not found.'], 404);
        }

        $vehicle = Vehicle::where('Driver_ID', $driver->Driver_ID)->first();
        if (!$vehicle) {
            return response()->json(['message' => 'No vehicle is assigned to this driver.'], 422);
        }

        $booking->Vehicle_ID = $vehicle->Vehicle_ID;
        $booking->save();

        return response()->json(['message' => 'Driver assignment updated successfully.']);
    }

    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;
        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }
}
