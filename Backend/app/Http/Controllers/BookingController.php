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
            'Admin_Message' => 'A new booking has been placed by a customer.',
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
    // CANCEL BOOKING (CUSTOMER SELF-SERVICE)
    // Applies the refund policy shown on the customer cancellation page
    // (Frontend/src/pages/user/cancellation.jsx):
    //   - More than 7 days before the tour date: 100% refund
    //   - 3-7 days before the tour date: 50% refund
    //   - Less than 3 days before the tour date (or no-show): no refund
    // =========================
    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);

        if (strtolower((string) $booking->Status) === 'cancelled') {
            return response()->json([
                'message' => 'This booking is already cancelled.',
            ], 422);
        }

        $today = now()->startOfDay();
        $tourDate = \Carbon\Carbon::parse($booking->Booking_Date)->startOfDay();
        $daysBeforeTour = (int) round($today->diffInDays($tourDate, false));

        if ($daysBeforeTour > 7) {
            $refundPercentage = 100;
        } elseif ($daysBeforeTour >= 3) {
            $refundPercentage = 50;
        } else {
            $refundPercentage = 0;
        }

        $booking->update([
            'Status' => 'Cancelled',
            'Admin_Seen' => false,
            'Admin_Message' => 'Customer cancelled this booking.',
        ]);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'booking' => $booking,
            'refund_percentage' => $refundPercentage,
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
    private function processRefund(Booking $booking)
    {
        $refundPercentage = 0;
        
        if ($booking->Status === 'Confirmed' && $booking->payment && $booking->payment->payhere_payment_id) {
            $bookingDate = \Carbon\Carbon::parse($booking->Booking_Date);
            $now = \Carbon\Carbon::now();
            $daysDifference = $now->diffInDays($bookingDate, false);

            if ($daysDifference > 7) {
                $refundPercentage = 100;
            } elseif ($daysDifference >= 3 && $daysDifference <= 7) {
                $refundPercentage = 50;
            }

            if ($refundPercentage > 0 && $booking->Payment > 0) {
                $refundAmount = ($booking->Payment * $refundPercentage) / 100;
                
                $payHereService = app(\App\Services\PayHereService::class);
                $description = "Automated Refund: {$refundPercentage}% (Cancelled {$daysDifference} days before tour)";
                
                try {
                    $payHereService->refund($booking->payment->payhere_payment_id, $refundAmount, $description);
                    \Illuminate\Support\Facades\Log::info("Refunded {$refundAmount} for Booking ID {$booking->Booking_ID}");
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to process refund for Booking ID {$booking->Booking_ID}: " . $e->getMessage());
                }
            }
        }
        
        return $refundPercentage;
    }

    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        // Authentication and admin check (from shanika)
        $user = request()->user('sanctum') ?? auth('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can delete bookings.'], 403);
        }

        $booking->update([
            'Status' => 'Cancelled',
            'Customer_Seen' => false,
            'Customer_Message' => 'Your booking was cancelled by an administrator.',
        ]);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'booking' => $booking,
        ]);
    }

    public function unreadCount()
    {
        return response()->json([
            'count' => Booking::where('Admin_Seen', false)->count(),
        ]);
    }

    public function adminNotifications(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can view booking notifications.'], 403);
        }

        return response()->json(
            Booking::with(['customer', 'package'])
                ->where('Admin_Seen', false)
                ->whereNotNull('Admin_Message')
                ->latest('Booking_ID')
                ->get()
        );
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

    public function customerUnreadCount(Request $request, $customerId)
    {
        if ((int) $request->user()->Customer_ID !== (int) $customerId) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'count' => Booking::where('Customer_ID', $customerId)
                ->where('Customer_Seen', false)
                ->whereNotNull('Customer_Message')
                ->count(),
        ]);
    }

    public function customerNotifications(Request $request, $customerId)
    {
        if ((int) $request->user()->Customer_ID !== (int) $customerId) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(
            Booking::with('package')
                ->where('Customer_ID', $customerId)
                ->whereNotNull('Customer_Message')
                ->latest('Booking_ID')
                ->get(['Booking_ID', 'Package_ID', 'Booking_Date', 'Status', 'Customer_Message', 'Customer_Seen'])
        );
    }

    public function markCustomerNotificationsAsSeen(Request $request, $customerId)
    {
        if ((int) $request->user()->Customer_ID !== (int) $customerId) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Booking::where('Customer_ID', $customerId)
            ->where('Customer_Seen', false)
            ->whereNotNull('Customer_Message')
            ->update(['Customer_Seen' => true]);

        return response()->json(['message' => 'Booking notifications cleared']);
    }
}
