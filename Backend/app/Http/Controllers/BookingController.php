<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\CancellationService;
use Carbon\WeekDay;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private CancellationService $cancellationService)
    {
    }

    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;

        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }

    // =========================
    // GET ALL BOOKINGS (ADMIN)
    // =========================
    // Supports optional query params so the admin screen never has to load
    // every booking into the browser:
    //   period     -> this_week | this_month | last_month | this_year |
    //                 last_year | all_time | custom
    //   from_date  -> inclusive range start (only used when period=custom)
    //   to_date    -> inclusive range end (only used when period=custom)
    //   search     -> free-text across ID, customer, package, date, time,
    //                 pickup location, area and status
    public function index(Request $request)
    {
        $query = Booking::with(['customer', 'package', 'vehicle.driver', 'vehicles.driver', 'payment']);

        $this->applyPeriodFilter($query, $request);
        $this->applySearchFilter($query, $request);

        // Order by Booking_ID descending so the most recently created bookings
        // appear first (105 above 104, above 103, ...). Booking_ID is the
        // creation order, unlike Booking_Date which is the safari date and can
        // place an older booking above a newer one.
        return response()->json(
            $query->orderByDesc('Booking_ID')->get()
        );
    }

    /**
     * Restrict the query to a booking date period.
     *
     * When no `period` is supplied (or the value is `all_time`) the query is
     * left untouched so existing API consumers keep getting all bookings.
     */
    private function applyPeriodFilter($query, Request $request): void
    {
        $period = trim((string) ($request->query('period') ?? ''));

        $from = null;
        $to = null;

        switch ($period) {
            case 'this_week':
                // Monday -> Sunday of the current week.
                // Carbon instances are mutable, so `addDays()` must run on a
                // copy: `$from->addDays(6)` would move $from forward by 6 days
                // and collapse the range into a single Sunday.
                $from = now()->startOfWeek(WeekDay::Monday);
                $to = $from->copy()->addDays(6);
                break;
            case 'this_month':
                $from = now()->startOfMonth();
                $to = now()->endOfMonth();
                break;
            case 'last_month':
                $from = now()->subMonth()->startOfMonth();
                $to = now()->subMonth()->endOfMonth();
                break;
            case 'this_year':
                $from = now()->startOfYear();
                $to = now()->endOfYear();
                break;
            case 'last_year':
                $from = now()->subYear()->startOfYear();
                $to = now()->subYear()->endOfYear();
                break;
            case 'custom':
                $from = trim((string) ($request->query('from_date') ?? ''));
                $to = trim((string) ($request->query('to_date') ?? ''));
                break;
            default:
                // all_time (or an unknown value) => no date restriction
                return;
        }

        if ($from !== '') {
            $query->whereDate('Booking_Date', '>=', $this->formatDate($from));
        }

        if ($to !== '') {
            $query->whereDate('Booking_Date', '<=', $this->formatDate($to));
        }
    }

    /**
     * Free-text search across the columns and relations that the admin
     * booking table exposes. Combined with the period filter it only ever
     * matches bookings inside the selected date range.
     */
    private function applySearchFilter($query, Request $request): void
    {
        $search = trim((string) ($request->query('search') ?? ''));

        if ($search === '') {
            return;
        }

        $like = "%{$search}%";

        $query->where(function ($q) use ($like) {
            $q
                ->where('Booking_ID', 'like', $like)
                ->orWhere('Booking_Date', 'like', $like)
                ->orWhere('Pickup_Time', 'like', $like)
                ->orWhere('Pickup_Location', 'like', $like)
                ->orWhere('Area', 'like', $like)
                ->orWhere('Status', 'like', $like)
                ->orWhereHas('customer', function ($customer) use ($like) {
                    $customer
                        ->where('First_Name', 'like', $like)
                        ->orWhere('Last_Name', 'like', $like);
                })
                ->orWhereHas('package', function ($package) use ($like) {
                    $package->where('Package_Name', 'like', $like);
                });
        });
    }

    private function formatDate($value): string
    {
        if ($value instanceof \Carbon\CarbonInterface) {
            return $value->toDateString();
        }

        return trim((string) $value);
    }

    // =========================
    // GET USER BOOKINGS
    // =========================
    public function userBookings($customerId)
    {
        $user = request()->user('sanctum') ?? auth('sanctum')->user();
        if ($user && !$this->isAdmin($user) && (int) $user->Customer_ID !== (int) $customerId) {
            return response()->json(['message' => 'Unauthorized: You can only view your own bookings.'], 403);
        }

        return response()->json(
            Booking::with(['package', 'vehicle.driver', 'vehicles.driver', 'payment'])
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

        $user = request()->user('sanctum') ?? auth('sanctum')->user();
        $customerId = $user ? $request->Customer_ID : null;
        $isGuestBooking = !$customerId;
        // The public booking endpoint is intentionally usable without a login,
        // so also accept the explicit flag sent by the admin booking screen.
        $createdByAdmin = $this->isAdmin($request->user('sanctum') ?? $request->user())
            || $request->boolean('Created_By_Admin');

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

        // Server-side authoritative price calculation (prevents client price tampering, including pickup area fee)
        $package = \App\Models\Package::find($request->Package_ID);
        $areaFee = Booking::getAreaFee($request->Area);
        $expectedPayment = $package
            ? ($package->calculatePrice((int) $request->No_of_adults, (int) $request->No_of_child) + $areaFee)
            : 0;
        $paymentAmount = ($expectedPayment > 0 && !$createdByAdmin) ? $expectedPayment : (float) ($request->Payment ?? 0);

        $booking = Booking::create([
            'Booking_Date' => $request->Booking_Date,
            'Pickup_Time' => $request->Pickup_Time,
            'Area' => $request->Area,
            'Pickup_Location' => $request->Pickup_Location,
            'No_of_adults' => $request->No_of_adults,
            'No_of_child' => $request->No_of_child,
            'Payment' => $paymentAmount,
            'Status' => $isGuestBooking ? 'Confirmed' : 'Pending',
            'Customer_ID' => $customerId,
            'Package_ID' => $request->Package_ID,
            'Vehicle_ID' => $request->Vehicle_ID ?? null,
            'Admin_Seen' => false,
            'Admin_Message' => $createdByAdmin
                ? 'New booking successfully placed by you.'
                : 'A new booking has been placed by a customer.',
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
        $booking = Booking::with(['customer', 'package', 'vehicle.driver', 'vehicles.driver', 'payment'])
            ->findOrFail($id);

        $user = request()->user('sanctum') ?? auth('sanctum')->user();
        if ($user && !$this->isAdmin($user) && (int) $user->Customer_ID !== (int) $booking->Customer_ID) {
            return response()->json(['message' => 'Unauthorized: Access to this booking is restricted.'], 403);
        }

        return response()->json($booking);
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

        $booking = Booking::with('payment')->findOrFail($id);

        $user = request()->user('sanctum') ?? auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Ownership: a customer may only edit their own booking (admins retain full control).
        if (!$this->isAdmin($user) && (int) $user->Customer_ID !== (int) $booking->Customer_ID) {
            return response()->json(['message' => 'Unauthorized: You can only edit your own bookings.'], 403);
        }

        // Status gate: customers may only modify bookings that are still editable
        // (Pending / In Cart). Confirmed, cancelled, completed or failed bookings
        // cannot be modified. Admins are exempt so they can manage any booking.
        if (!$this->isAdmin($user) && !in_array($booking->Status, ['Pending', 'In Cart', 'InCart'])) {
            return response()->json([
                'message' => 'This booking cannot be modified.',
            ], 422);
        }

        // Customers may only edit schedule/guest details; only admins can change
        // the booking status directly (prevents a customer self-confirming a booking).
        $allowedFields = [
            'Booking_Date',
            'Pickup_Time',
            'Area',
            'Pickup_Location',
            'No_of_adults',
            'No_of_child',
            'Payment',
            'Package_ID',
            'Vehicle_ID',
        ];

        if ($this->isAdmin($user)) {
            $allowedFields[] = 'Status';
        }

        $booking->update($request->only($allowedFields));

        // If admin confirms a booking that has a pending payment (e.g. Pay Later collected on tour),
        // mark the payment as Success.
        if ($this->isAdmin($user) && $request->input('Status') === 'Confirmed' && $booking->payment && $booking->payment->status === 'Pending') {
            $booking->payment->update([
                'status'         => 'Success',
                'status_code'    => 2,
                'status_message' => 'Payment collected and confirmed by Admin on tour date',
            ]);
        }

        // Keep the multi-vehicle pivot in sync whenever the single Vehicle_ID
        // column is changed through this generic endpoint.
        if ($request->has('Vehicle_ID')) {
            $singleVehicleId = $request->input('Vehicle_ID');
            $booking->vehicles()->sync($singleVehicleId ? [$singleVehicleId] : []);
        }

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking->fresh(['customer', 'package', 'vehicle.driver', 'vehicles.driver', 'payment'])
        ]);
    }

    // =========================
    // COLLECT PAYMENT ON TOUR (ADMIN)
    // =========================
    public function collectPayment(Request $request, $id)
    {
        $user = request()->user('sanctum') ?? auth('sanctum')->user();
        if (!$user || !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized: Only administrators can collect payment.'], 403);
        }

        $booking = Booking::with('payment')->findOrFail($id);

        $booking->update([
            'Status' => 'Confirmed',
        ]);

        if ($booking->payment) {
            $booking->payment->update([
                'status'         => 'Success',
                'status_code'    => 2,
                'status_message' => 'Payment collected by Admin on tour date',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment collected and booking confirmed successfully.',
            'booking' => $booking->fresh(['customer', 'package', 'vehicle.driver', 'vehicles.driver', 'payment']),
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
        // Validate the scalar field the client actually sent first, so validation
        // errors are reported under 'Vehicle_ID' instead of 'Vehicle_IDs.0'.
        $validated = $request->validate([
            'Vehicle_ID' => 'required|integer|exists:vehicles,Vehicle_ID',
        ]);

        $request->merge(['Vehicle_IDs' => [(int) $validated['Vehicle_ID']]]);

        return $this->assignVehicles($request, $id);
    }

    // =========================
    // GET NEAREST UPCOMING BOOKING FOR A CUSTOMER
    // =========================
    public function upcomingBooking($customerId)
    {
        $booking = Booking::with(['package', 'vehicle.driver', 'vehicles.driver'])
            ->where('Customer_ID', $customerId)
            ->whereIn('Status', ['Pending', 'Confirmed'])
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
    public function destroy(Request $request, $id)
    {
        $booking = Booking::with('payment')->findOrFail($id);

        // Authentication and admin check (from shanika)
        $user = request()->user('sanctum') ?? auth('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin($user)) {
            return response()->json(['message' => 'Only administrators can delete bookings.'], 403);
        }

        // A confirmed booking whose safari date has passed cannot be cancelled
        // by anyone — the same rule the customer flow enforces, and checked
        // first so the expiry is reported rather than a missing checkbox. Unpaid
        // bookings stay cancellable even when their date has passed.
        if ($this->cancellationService->isConfirmedBooking($booking)
            && $this->cancellationService->isExpired($booking)) {
            return response()->json([
                'message' => 'Sorry, your request cannot be completed as your booking date is expired.',
            ], 422);
        }

        // The policy must be acknowledged just like on the customer flow, and
        // admins may pick the refund tier themselves (the modal offers
        // 100/50/25/0%). When no tier is sent we fall back to the automatic
        // policy-calculated percentage.
        $validated = $request->validate([
            'agreed' => ['required', 'accepted'],
            'Refund_Percentage' => ['sometimes', 'nullable', 'in:0,25,50,100'],
        ]);

        $refundPercentage = $this->cancellationService->processRefund(
            $booking,
            isset($validated['Refund_Percentage'])
                ? (int) $validated['Refund_Percentage']
                : null
        );

        $booking->update([
            'Status' => 'Cancelled',
            'Customer_Seen' => false,
            'Customer_Message' => 'Your booking was cancelled by an administrator.',
            // Persist the applied percentage (auto-calculated or the admin's
            // override) so the record matches what was actually refunded.
            'Refund_Percentage' => $refundPercentage,
            'Cancelled_At' => now(),
        ]);

        // An "In Cart" booking leaves its cart entry behind unless it is dropped
        // here, and the cart page would keep showing a cancelled item.
        $this->cancellationService->removeFromCart($booking);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'booking' => $booking,
            'refund_percentage' => $refundPercentage
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
                ->where('Customer_Seen', false)
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
