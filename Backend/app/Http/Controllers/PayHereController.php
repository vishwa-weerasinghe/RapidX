<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Payment;
use App\Services\PayHereService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmationMail;

class PayHereController extends Controller
{
    protected PayHereService $payHereService;

    public function __construct(PayHereService $payHereService)
    {
        $this->payHereService = $payHereService;
    }

    /**
     * Initiate a PayHere payment for a single booking or cart checkout.
     * Generates a pending payment record and the PayHere MD5 security hash.
     */
    public function initiate(Request $request)
    {
        // 1. Cart Checkout Flow
        if ($request->has('checkout_type') && $request->checkout_type === 'cart') {
            return $this->initiateCartCheckout($request);
        }

        // 2. Direct Single Booking Flow
        return $this->initiateSingleBookingCheckout($request);
    }

    /**
     * Handle single safari booking payment initiation.
     */
    protected function initiateSingleBookingCheckout(Request $request)
    {
        $rules = [
            'Booking_Date'    => 'required|date',
            'Pickup_Time'     => 'required',
            'Pickup_Location' => 'required|string',
            'No_of_adults'    => 'required|integer|min:1',
            'No_of_child'     => 'required|integer|min:0',
            'Package_ID'      => 'required|exists:packages,id',
            'Payment'         => 'required|numeric|min:1',
        ];

        if ($request->has('Customer_ID') && $request->Customer_ID) {
            $rules['Customer_ID'] = 'required|exists:customers,Customer_ID';
            $customerId = $request->Customer_ID;
        } else {
            $rules['First_Name'] = 'required|string|max:50';
            $rules['Last_Name']  = 'required|string|max:50';
            $rules['Email']      = 'required|email|max:100';
            $rules['Phone_No']   = 'required|string|max:20';
            $rules['NIC']        = 'required|string|max:20';
            $rules['Country']    = 'required|string|max:50';
        }

        $request->validate($rules);

        return DB::transaction(function () use ($request) {
            if (!$request->has('Customer_ID') || !$request->Customer_ID) {
                $customer = Customer::create([
                    'First_Name'    => $request->First_Name,
                    'Last_Name'     => $request->Last_Name,
                    'Email'         => $request->Email,
                    'Phone_No'      => $request->Phone_No,
                    'NIC'           => $request->NIC,
                    'Country'       => $request->Country,
                    'Customer_Type' => 'Guest',
                ]);
                $customerId = $customer->Customer_ID;
            } else {
                $customer = Customer::findOrFail($request->Customer_ID);
                $customerId = $customer->Customer_ID;
            }

            $package = Package::findOrFail($request->Package_ID);
            $amount = (float) $request->Payment;
            $currency = config('payhere.currency', 'USD');

            // Unique Order Reference
            $orderId = 'SAFARI_BK_' . time() . '_' . rand(100, 999);

            // Create Payment Record (Pending)
            $payment = Payment::create([
                'order_id'       => $orderId,
                'Customer_ID'    => $customerId,
                'amount'         => $amount,
                'currency'       => $currency,
                'payment_method' => 'PayHere',
                'status'         => 'Pending',
            ]);

            // Create Booking Record (Pending) linked to Payment
            $booking = Booking::create([
                'Booking_Date'    => $request->Booking_Date,
                'Pickup_Time'     => $request->Pickup_Time,
                'Pickup_Location' => $request->Pickup_Location,
                'Area'            => $request->Area ?? null,
                'No_of_adults'    => $request->No_of_adults,
                'No_of_child'     => $request->No_of_child,
                'Payment'         => $amount,
                'Status'          => 'Pending',
                'Customer_ID'     => $customerId,
                'Package_ID'      => $package->id,
                'Vehicle_ID'      => null,
                'Payment_ID'      => $payment->Payment_ID,
                'Admin_Seen'      => false,
                'Admin_Message'  => $request->boolean('Created_By_Admin')
                    ? 'New booking successfully placed by you.'
                    : 'A new booking has been placed by a customer.',
            ]);

            $payHereParams = $this->payHereService->prepareCheckoutPayload(
                $orderId,
                $amount,
                $package->Package_Name . ' Safari Tour',
                [
                    'first_name' => $customer->First_Name,
                    'last_name'  => $customer->Last_Name,
                    'email'      => $customer->Email,
                    'phone'      => $customer->Phone_No,
                    'address'    => $booking->Pickup_Location,
                    'city'       => $booking->Area ?? 'Sigiriya',
                    'country'    => $customer->Country,
                ],
                $currency
            );

            return response()->json([
                'success'        => true,
                'order_id'       => $orderId,
                'Payment_ID'     => $payment->Payment_ID,
                'Booking_ID'     => $booking->Booking_ID,
                'payhere_params' => $payHereParams,
            ], 201);
        });
    }

    /**
     * Handle cart bulk checkout payment initiation.
     */
    protected function initiateCartCheckout(Request $request)
    {
        $request->validate([
            'Customer_ID' => 'required|exists:customers,Customer_ID',
        ]);

        $customerId = $request->Customer_ID;
        $customer = Customer::findOrFail($customerId);

        $cartEntries = Cart::with(['booking.package'])
            ->where('Customer_ID', $customerId)
            ->get();

        if ($cartEntries->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }

        $bookingIds = $cartEntries->pluck('Booking_ID');
        $bookings = Booking::whereIn('Booking_ID', $bookingIds)->get();

        $totalAmount = (float) $bookings->sum('Payment');
        $currency = config('payhere.currency', 'USD');

        return DB::transaction(function () use ($customerId, $customer, $bookings, $totalAmount, $currency) {
            $orderId = 'SAFARI_CART_' . $customerId . '_' . time() . '_' . rand(100, 999);

            // Create 1 parent Payment record for all bookings in this cart
            $payment = Payment::create([
                'order_id'       => $orderId,
                'Customer_ID'    => $customerId,
                'amount'         => $totalAmount,
                'currency'       => $currency,
                'payment_method' => 'PayHere',
                'status'         => 'Pending',
            ]);

            // Link all bookings to this Payment_ID
            Booking::whereIn('Booking_ID', $bookings->pluck('Booking_ID'))->update([
                'Payment_ID' => $payment->Payment_ID,
                'Status'     => 'In Cart',
            ]);

            $payHereParams = $this->payHereService->prepareCheckoutPayload(
                $orderId,
                $totalAmount,
                'Safari Booking Cart Checkout (' . $bookings->count() . ' items)',
                [
                    'first_name' => $customer->First_Name,
                    'last_name'  => $customer->Last_Name,
                    'email'      => $customer->Email,
                    'phone'      => $customer->Phone_No,
                    'address'    => 'Sri Lanka',
                    'city'       => 'Colombo',
                    'country'    => $customer->Country,
                ],
                $currency
            );

            return response()->json([
                'success'        => true,
                'order_id'       => $orderId,
                'Payment_ID'     => $payment->Payment_ID,
                'bookings_count' => $bookings->count(),
                'payhere_params' => $payHereParams,
            ], 200);
        });
    }

    /**
     * PayHere IPN Webhook Notification Endpoint.
     * PayHere calls this URL asynchronously when payment completes.
     */
    public function notify(Request $request)
    {
        Log::info('PayHere IPN Notification received', $request->all());

        // 1. Verify MD5 Signature
        if (!$this->payHereService->verifySignature($request->all())) {
            Log::warning('PayHere signature verification failed', $request->all());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $orderId = $request->order_id;
        $payment = Payment::where('order_id', $orderId)->first();

        if (!$payment) {
            Log::error('PayHere order_id not found: ' . $orderId);
            return response()->json(['error' => 'Order not found'], 404);
        }

        $statusCode = (int) $request->status_code;

        return DB::transaction(function () use ($payment, $request, $statusCode) {
            // Status Code 2 = SUCCESS
            if ($statusCode === 2) {
                $payment->update([
                    'status'             => 'Success',
                    'payhere_payment_id' => $request->payment_id,
                    'payment_method'     => $request->method ?? 'PayHere',
                    'status_code'        => $statusCode,
                    'status_message'     => $request->status_message ?? 'Payment Completed Successfully',
                    'card_holder_name'   => $request->card_holder_name ?? null,
                    'card_no'            => $request->card_no ?? null,
                    'raw_response'       => $request->all(),
                ]);

                // Mark all associated bookings as 'Confirmed'
                Booking::where('Payment_ID', $payment->Payment_ID)->update([
                    'Status' => 'Confirmed',
                ]);

                // If this was a cart checkout, clean up cart items
                Cart::where('Customer_ID', $payment->Customer_ID)->delete();

                Log::info('Payment & Bookings confirmed for order: ' . $payment->order_id);
                
                $this->sendConfirmationEmails($payment);
            } elseif ($statusCode === 0) {
                // Status Code 0 = Pending
                $payment->update([
                    'status'         => 'Pending',
                    'status_code'    => $statusCode,
                    'status_message' => $request->status_message ?? 'Payment Pending',
                    'raw_response'   => $request->all(),
                ]);
            } else {
                // Status Code < 0 = Failed / Cancelled / Declined
                $payment->update([
                    'status'         => $statusCode === -1 ? 'Cancelled' : 'Failed',
                    'status_code'    => $statusCode,
                    'status_message' => $request->status_message ?? 'Payment Failed or Declined',
                    'raw_response'   => $request->all(),
                ]);

                // Revert pending booking status back to 'In Cart' (for cart items) or 'Cancelled' so they are not confirmed
                Booking::where('Payment_ID', $payment->Payment_ID)
                    ->where('Status', '!=', 'Confirmed')
                    ->update([
                        'Status' => $statusCode === -1 ? 'In Cart' : 'Failed',
                    ]);

                Log::warning('Payment failed for order: ' . $payment->order_id . ' with status code: ' . $statusCode);
            }

            return response()->json(['status' => 'OK'], 200);
        });
    }

    /**
     * Confirm a payment after successful client SDK checkout or return.
     * Marks Payment as Success, all associated Bookings as Confirmed, and clears the Customer's Cart.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
        ]);

        $orderId = $request->order_id;
        $payment = Payment::with(['bookings.package', 'customer'])
            ->where('order_id', $orderId)
            ->firstOrFail();

        // Ownership check for authenticated users
        $user = $request->user('sanctum') ?? auth('sanctum')->user();
        if ($user) {
            $isAdmin = in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin']);
            if (!$isAdmin && (int) $user->Customer_ID !== (int) $payment->Customer_ID) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        return DB::transaction(function () use ($payment) {
            if ($payment->status !== 'Success') {
                $payment->update([
                    'status'         => 'Success',
                    'status_message' => 'Payment Completed & Confirmed',
                ]);

                // Update all bookings linked to this payment to 'Confirmed'
                Booking::where('Payment_ID', $payment->Payment_ID)->update([
                    'Status' => 'Confirmed',
                ]);

                // Clear customer's cart items
                if ($payment->Customer_ID) {
                    Cart::where('Customer_ID', $payment->Customer_ID)->delete();
                }
                
                $this->sendConfirmationEmails($payment);
            }

            return response()->json([
                'success'  => true,
                'message'  => 'Payment confirmed and bookings updated successfully',
                'order_id' => $payment->order_id,
                'status'   => 'Success',
                'payment'  => $payment->fresh(['bookings.package', 'customer']),
            ]);
        });
    }

    /**
     * Check payment status by order_id (polled by frontend after checkout).
     */
    public function status($orderId)
    {
        $payment = Payment::with(['bookings.package', 'customer'])
            ->where('order_id', $orderId)
            ->firstOrFail();

        return response()->json([
            'order_id'           => $payment->order_id,
            'status'             => $payment->status,
            'amount'             => $payment->amount,
            'currency'           => $payment->currency,
            'payment_method'     => $payment->payment_method,
            'payhere_payment_id' => $payment->payhere_payment_id,
            'created_at'         => $payment->created_at,
            'customer'           => $payment->customer ? [
                'First_Name' => $payment->customer->First_Name,
                'Last_Name'  => $payment->customer->Last_Name,
            ] : null,
            'bookings'           => $payment->bookings,
        ]);
    }

    /**
     * Send confirmation emails to the customer and the admin.
     */
    private function sendConfirmationEmails(Payment $payment)
    {
        try {
            $payment->loadMissing(['customer', 'bookings.package']);

            // Send to Customer
            if ($payment->customer && $payment->customer->Email) {
                Mail::to($payment->customer->Email)->send(new BookingConfirmationMail($payment, false));
            }

            // Send to Admin
            $adminEmail = env('ADMIN_EMAIL');
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new BookingConfirmationMail($payment, true));
            }
        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation emails for order ' . $payment->order_id . ': ' . $e->getMessage());
        }
    }
}
