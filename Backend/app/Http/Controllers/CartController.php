<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Booking;
use Illuminate\Http\Request;

class CartController extends Controller
{
    // Fetch all cart items for a customer
    public function index(Request $request, $customerId)
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user();
        if ($user) {
            $isAdmin = in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin']);
            if (!$isAdmin && (int) $user->Customer_ID !== (int) $customerId) {
                return response()->json([
                    'message' => 'Unauthorized: You cannot view this cart'
                ], 403);
            }
        }

        return response()->json(
            Cart::with(['booking.package'])
                ->where('Customer_ID', $customerId)
                ->latest()
                ->get()
        );
    }

    // Add booking to cart
    public function store(Request $request)
    {
        $rules = [
            'Booking_Date' => 'required|date',
            'Pickup_Time' => 'required',
            'Pickup_Location' => 'required|string',
            'Area' => 'nullable|string|max:100',
            'No_of_adults' => 'required|integer',
            'No_of_child' => 'required|integer',
            'Package_ID' => 'required',
            'Payment' => 'required|numeric',
        ];

        if ($request->has('Customer_ID') && $request->Customer_ID) {
            $rules['Customer_ID'] = 'required';
            $customerId = $request->Customer_ID;
        } else {
            $rules['First_Name'] = 'required|string|max:50';
            $rules['Last_Name'] = 'required|string|max:50';
            $rules['Email'] = 'required|email|max:100';
            $rules['Phone_No'] = 'required|string|max:20';
            $rules['NIC'] = 'required|string|max:20';
            $rules['Country'] = 'required|string|max:50';
        }

        $request->validate($rules);

        if (!$request->has('Customer_ID') || !$request->Customer_ID) {
            // Create customer on the fly
            $customer = \App\Models\Customer::create([
                'First_Name' => $request->First_Name,
                'Last_Name' => $request->Last_Name,
                'Email' => $request->Email,
                'Phone_No' => $request->Phone_No,
                'NIC' => $request->NIC,
                'Country' => $request->Country,
                'Customer_Type' => 'Guest',
            ]);
            $customerId = $customer->Customer_ID;
        } else {
            $customer = \App\Models\Customer::find($customerId);
        }

        // Create booking with status 'In Cart'
        $booking = Booking::create([
            'Booking_Date' => $request->Booking_Date,
            'Pickup_Time' => $request->Pickup_Time,
            'Pickup_Location' => $request->Pickup_Location,
            'Area' => $request->Area ?? null,
            'No_of_adults' => $request->No_of_adults,
            'No_of_child' => $request->No_of_child,
            'Payment' => $request->Payment,
            'Status' => 'In Cart',
            'Customer_ID' => $customerId,
            'Package_ID' => $request->Package_ID,
            'Vehicle_ID' => null,
            'Admin_Seen' => false,
        ]);

        // Create cart entry
        $cart = Cart::create([
            'Customer_ID' => $customerId,
            'Booking_ID' => $booking->Booking_ID,
        ]);

        return response()->json([
            'message' => 'Booking added to cart successfully',
            'cart' => $cart,
            'booking' => $booking,
            'customer' => $customer
        ], 201);
    }

    // Remove item from cart
    public function destroy(Request $request, $bookingId)
    {
        // 1. Verify that the cart entry exists for this booking ID
        $cart = Cart::where('Booking_ID', $bookingId)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Cart item not found'
            ], 404);
        }

        // 2. Verify that the booking exists and is currently in 'In Cart' status
        $booking = Booking::find($bookingId);

        if (!$booking || $booking->Status !== 'In Cart') {
            return response()->json([
                'message' => 'Only pending cart bookings can be removed from cart'
            ], 400);
        }

        // 3. Ownership check
        $user = $request->user('sanctum') ?? auth('sanctum')->user();
        if ($user) {
            $isAdmin = in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin']);
            if (!$isAdmin && (int) $user->Customer_ID !== (int) $cart->Customer_ID) {
                return response()->json([
                    'message' => 'Unauthorized: You do not own this cart item'
                ], 403);
            }
        } else {
            // Check request parameter / query / header for guest ownership verification if provided
            $reqCustomerId = $request->input('Customer_ID')
                ?? $request->query('Customer_ID')
                ?? $request->header('X-Customer-ID');

            if ($reqCustomerId && (int) $reqCustomerId !== (int) $cart->Customer_ID) {
                return response()->json([
                    'message' => 'Unauthorized: You do not own this cart item'
                ], 403);
            }
        }

        // Safe removal: delete cart record first, then the associated 'In Cart' booking
        $cart->delete();
        $booking->delete();

        return response()->json([
            'message' => 'Item removed from cart successfully'
        ]);
    }

    // Bulk checkout bookings from cart
    public function checkout(Request $request)
    {
        $request->validate([
            'Customer_ID' => 'required',
        ]);

        $customerId = $request->Customer_ID;

        $user = $request->user('sanctum') ?? auth('sanctum')->user();
        if ($user) {
            $isAdmin = in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin']);
            if (!$isAdmin && (int) $user->Customer_ID !== (int) $customerId) {
                return response()->json([
                    'message' => 'Unauthorized: You cannot checkout another customer\'s cart'
                ], 403);
            }
        }

        // Get all cart entries
        $cartEntries = Cart::where('Customer_ID', $customerId)->get();

        if ($cartEntries->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty'
            ], 400);
        }

        // Extract booking IDs
        $bookingIds = $cartEntries->pluck('Booking_ID');

        // Update booking status from 'In Cart' to 'Confirmed'
        Booking::whereIn('Booking_ID', $bookingIds)->update([
            'Status' => 'Confirmed'
        ]);

        // Delete cart entries
        Cart::where('Customer_ID', $customerId)->delete();

        return response()->json([
            'message' => 'All bookings in cart checked out successfully!'
        ]);
    }
}
