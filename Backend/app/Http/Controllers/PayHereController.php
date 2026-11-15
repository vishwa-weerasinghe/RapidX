<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PromotionCode;
use App\Services\PayHereService;
use App\Services\BookingSchedule;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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

        if (!BookingSchedule::isInFuture($request->Booking_Date, $request->Pickup_Time)) {
            throw ValidationException::withMessages([
                'Booking_Date' => 'The booking date and time must be later than the current date and time.',
            ]);
        }

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

            // Server-side price calculation to prevent client-side price tampering (including pickup area fee)
            $areaFee = Booking::getAreaFee($request->Area);
            $serverCalculatedAmount = $package->calculatePrice((int) $request->No_of_adults, (int) $request->No_of_child) + $areaFee;
            $amount = $serverCalculatedAmount > 0 ? $serverCalculatedAmount : (float) $request->Payment;

            $currency = config('payhere.currency', 'USD');

            $isPayLater = strcasecmp((string) $request->input('payment_method', 'PayHere'), 'Pay Later') === 0;
            $paymentMethod = $isPayLater ? 'Pay Later' : 'PayHere';

            // IM-19: Use UUID for order IDs to prevent enumeration attacks
            $orderId = 'SAFARI_BK_' . Str::uuid();

            // Create Payment Record (Pending)
            $payment = Payment::create([
                'order_id'       => $orderId,
                'Customer_ID'    => $customerId,
                'amount'         => $amount,
                'currency'       => $currency,
                'payment_method' => $paymentMethod,
                'status'         => 'Pending',
                'status_message' => $isPayLater ? 'Pay Later on Tour Date' : 'Pending Payment Initiation',
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
                    : ($isPayLater
                        ? 'A new "Pay Later" booking has been placed by a customer. Payment pending on tour date.'
                        : 'A new booking has been placed by a customer.'),
            ]);

            if ($isPayLater) {
                // Send confirmation emails immediately
                $this->sendConfirmationEmails($payment);

                return response()->json([
                    'success'        => true,
                    'payment_method' => 'Pay Later',
                    'order_id'       => $orderId,
                    'Payment_ID'     => $payment->Payment_ID,
                    'Booking_ID'     => $booking->Booking_ID,
                    'status'         => 'Pending',
                    'message'        => 'Booking reserved successfully with Pay Later. Confirmation emails sent.',
                ], 201);
            }

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
            'promotion_code' => 'nullable|string',
        ]);

        $customerId = $request->Customer_ID;
        $customer = Customer::findOrFail($customerId);

        $promo = null;
        if ($request->filled('promotion_code')) {
            $promo = \App\Models\PromotionCode::where('code', $request->promotion_code)->first();
            if (!$promo || $promo->is_hidden || ($promo->valid_until && now()->startOfDay()->greaterThan($promo->valid_until)) || ($promo->usage_limit !== null && $promo->usage_count >= $promo->usage_limit)) {
                return response()->json(['message' => 'Invalid or expired promotion code'], 400);
            }
        }

        $cartEntries = Cart::with(['booking.package'])
            ->where('Customer_ID', $customerId)
            ->get();

        if ($cartEntries->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }

        $bookingIds = $cartEntries->pluck('Booking_ID');
        $bookings = Booking::with('package')->whereIn('Booking_ID', $bookingIds)->get();

        // Server-side authoritative price recalculation to prevent cart price tampering (including pickup area fee)
        $totalAmount = (float) $bookings->sum(function ($b) {
            if ($b->package) {
                $areaFee = Booking::getAreaFee($b->Area);
                $expected = $b->package->calculatePrice((int) $b->No_of_adults, (int) $b->No_of_child) + $areaFee;
                if ($expected > 0) {
                    $b->update(['Payment' => $expected]);
                    return $expected;
                }
            }
            return (float) $b->Payment;
        });

        // IM-17: Branch on discount_type (percentage vs fixed); cap at total
        // IM-18: Do NOT increment usage_count here (payment not yet confirmed)
        $promoCode = null;
        if ($promo) {
            if (($promo->discount_type ?? 'percentage') === 'fixed') {
                $discount = min((float) $promo->discount_value, $totalAmount);
            } else {
                $discount = $totalAmount * (min((float) $promo->discount_value, 100) / 100);
            }
            $totalAmount = max(0, $totalAmount - $discount);
            $promoCode = $promo->code;
        }

        $currency = config('payhere.currency', 'USD');
        $isPayLater = strcasecmp((string) $request->input('payment_method', 'PayHere'), 'Pay Later') === 0;
        $paymentMethod = $isPayLater ? 'Pay Later' : 'PayHere';

        return DB::transaction(function () use ($customerId, $customer, $bookings, $totalAmount, $currency, $isPayLater, $paymentMethod, $promoCode) {
            // IM-19: Use UUID for cart order IDs to prevent enumeration attacks
            $orderId = 'SAFARI_CART_' . Str::uuid();

            // Create 1 parent Payment record for all bookings in this cart
            $payment = Payment::create([
                'order_id'       => $orderId,
                'Customer_ID'    => $customerId,
                'amount'         => $totalAmount,
                'currency'       => $currency,
                'payment_method' => $paymentMethod,
                'status'          => 'Pending',
                'status_message'  => $isPayLater ? 'Pay Later on Tour Date' : 'Pending Payment Initiation',
                // IM-18: Store promo code so IPN success branch can increment usage_count
                'promotion_code'  => $promoCode,
            ]);

            // Link all bookings to this Payment_ID
            Booking::whereIn('Booking_ID', $bookings->pluck('Booking_ID'))->update([
                'Payment_ID' => $payment->Payment_ID,
                'Status'     => 'Pending',
            ]);

            if ($isPayLater) {
                // IM-22: Only delete cart rows for bookings in this payment
                $paidBookingIds = $bookings->pluck('Booking_ID');
                Cart::whereIn('Booking_ID', $paidBookingIds)->delete();

                // IM-18: Pay Later is effectively confirmed immediately — increment now
                if ($promoCode) {
                    PromotionCode::where('code', $promoCode)->increment('usage_count');
                }

                // Send confirmation emails
                $this->sendConfirmationEmails($payment);

                return response()->json([
                    'success'        => true,
                    'payment_method' => 'Pay Later',
                    'order_id'       => $orderId,
                    'Payment_ID'     => $payment->Payment_ID,
                    'bookings_count' => $bookings->count(),
                    'status'         => 'Pending',
                    'message'        => 'Cart bookings reserved successfully with Pay Later. Confirmation emails sent.',
                ], 200);
            }

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

        // IM-08: Idempotency guard — do not re-process an already-confirmed payment
        if ($payment->status === 'Success') {
            Log::info('PayHere IPN: payment already confirmed, skipping re-processing for order: ' . $orderId);
            return response()->json(['status' => 'OK'], 200);
        }

        // IM-07: Verify that the notified amount and currency match what we stored
        $notifiedAmount   = (float) ($request->payhere_amount ?? $request->amount ?? 0);
        $notifiedCurrency = strtoupper(trim((string) ($request->payhere_currency ?? $request->currency ?? '')));
        $storedCurrency   = strtoupper(trim((string) $payment->currency));

        if ($notifiedAmount > 0 && abs($notifiedAmount - (float) $payment->amount) > 0.01) {
            Log::warning('PayHere IPN amount mismatch for order ' . $orderId . ': notified=' . $notifiedAmount . ' stored=' . $payment->amount);
            return response()->json(['error' => 'Amount mismatch'], 400);
        }

        if ($notifiedCurrency && $notifiedCurrency !== $storedCurrency) {
            Log::warning('PayHere IPN currency mismatch for order ' . $orderId . ': notified=' . $notifiedCurrency . ' stored=' . $storedCurrency);
            return response()->json(['error' => 'Currency mismatch'], 400);
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

                // IM-09: Only confirm bookings that are still Pending or In Cart
                // (never overwrite Cancelled bookings)
                Booking::where('Payment_ID', $payment->Payment_ID)
                    ->whereIn('Status', ['Pending', 'In Cart'])
                    ->update(['Status' => 'Confirmed']);

                // IM-22: Only delete cart rows for bookings in this payment,
                // not every cart item for the customer
                $paidBookingIds = Booking::where('Payment_ID', $payment->Payment_ID)
                    ->pluck('Booking_ID');
                Cart::whereIn('Booking_ID', $paidBookingIds)->delete();

                // IM-18: Increment promo usage_count now that payment succeeded
                if (!empty($payment->promotion_code)) {
                    PromotionCode::where('code', $payment->promotion_code)->increment('usage_count');
                }

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

                // IM-11: For cancelled payments (status -1), only revert to
                // 'In Cart' if a cart row actually exists for the booking.
                // Otherwise use 'Cancelled' so non-cart bookings are not
                // erroneously put into an 'In Cart' state.
                $pendingBookings = Booking::where('Payment_ID', $payment->Payment_ID)
                    ->where('Status', '!=', 'Confirmed')
                    ->get();

                foreach ($pendingBookings as $b) {
                    if ($statusCode === -1) {
                        $cartExists = Cart::where('Booking_ID', $b->Booking_ID)->exists();
                        $newStatus  = $cartExists ? 'In Cart' : 'Cancelled';
                    } else {
                        $newStatus = 'Failed';
                    }
                    $b->update(['Status' => $newStatus]);
                }

                Log::warning('Payment failed for order: ' . $payment->order_id . ' with status code: ' . $statusCode);
            }

            return response()->json(['status' => 'OK'], 200);
        });
    }

    /**
     * Confirm a payment after successful client SDK checkout or return.
     * Only confirms if already verified by signed webhook, verified by PayHere API, or invoked by admin.
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
        $isAdmin = false;
        if ($user) {
            $isAdmin = in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin']);
            if (!$isAdmin && (int) $user->Customer_ID !== (int) $payment->Customer_ID) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // Pay Later orders cannot be confirmed through PayHere gateway confirmation
        if ($payment->payment_method === 'Pay Later') {
            return response()->json([
                'success'  => false,
                'message'  => 'Pay Later orders must be collected and confirmed by an administrator.',
                'order_id' => $payment->order_id,
                'status'   => $payment->status,
                'payment'  => $payment,
            ], 400);
        }

        // 1. If already marked Success by PayHere signed IPN webhook, return confirmed
        if ($payment->status === 'Success') {
            return response()->json([
                'success'  => true,
                'message'  => 'Payment is already confirmed.',
                'order_id' => $payment->order_id,
                'status'   => 'Success',
                'payment'  => $payment,
            ]);
        }

        // 2. Verify with PayHere Merchant Search API if caller is not an admin
        $verified = false;
        if ($isAdmin) {
            $verified = true;
        } else {
            $payHereRecord = $this->payHereService->verifyPaymentWithPayHere($payment->order_id);
            if ($payHereRecord) {
                $status = strtoupper((string) ($payHereRecord['status'] ?? ''));
                $statusCode = isset($payHereRecord['status_code']) ? (int) $payHereRecord['status_code'] : null;

                $isSuccess = ($statusCode === 2) || in_array($status, ['RECEIVED', 'SUCCESS', 'COMPLETED']);
                $isFailed = ($statusCode === -1 || $statusCode === -2) || in_array($status, ['FAILED', 'CANCELLED', 'DECLINED']);

                $method = null;
                if (isset($payHereRecord['payment_method']['method'])) {
                    $method = $payHereRecord['payment_method']['method'];
                } elseif (isset($payHereRecord['method'])) {
                    $method = $payHereRecord['method'];
                }

                if ($isSuccess) {
                    $verified = true;
                    $payment->update([
                        'payhere_payment_id' => $payHereRecord['payment_id'] ?? $payment->payhere_payment_id,
                        'payment_method'     => $method ?? $payment->payment_method,
                        'status_code'        => 2,
                        'status_message'     => $payHereRecord['status_message'] ?? 'Payment Completed Successfully',
                    ]);
                } elseif ($isFailed) {
                    $isCancelled = ($statusCode === -1 || $status === 'CANCELLED');
                    $payment->update([
                        'status'         => $isCancelled ? 'Cancelled' : 'Failed',
                        'status_code'    => $statusCode ?? ($isCancelled ? -1 : -2),
                        'status_message' => $payHereRecord['status_message'] ?? 'Payment Failed or Declined',
                    ]);
                    Booking::where('Payment_ID', $payment->Payment_ID)
                        ->where('Status', '!=', 'Confirmed')
                        ->update([
                            'Status' => $isCancelled ? 'Cancelled' : 'Failed',
                        ]);
                }
            }
        }

        if ($verified) {
            return DB::transaction(function () use ($payment) {
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

                return response()->json([
                    'success'  => true,
                    'message'  => 'Payment confirmed and bookings updated successfully',
                    'order_id' => $payment->order_id,
                    'status'   => 'Success',
                    'payment'  => $payment->fresh(['bookings.package', 'customer']),
                ]);
            });
        }

        return response()->json([
            'success'  => false,
            'message'  => 'Payment is pending verification from the payment gateway.',
            'order_id' => $payment->order_id,
            'status'   => $payment->status,
            'payment'  => $payment,
        ], 200);
    }

    /**
     * Check payment status by order_id (polled by frontend after checkout).
     */
    public function status(Request $request, $orderId)
    {
        $payment = Payment::with(['bookings.package', 'customer'])
            ->where('order_id', $orderId)
            ->firstOrFail();

        // IM-19: Enforce ownership — authenticated users can only read their own payment.
        // Unauthenticated callers (guests) receive a reduced response with no PII.
        $user   = $request->user('sanctum') ?? auth('sanctum')->user();
        $isAdmin = $user && in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin']);

        if ($user && !$isAdmin && (int) $user->Customer_ID !== (int) $payment->Customer_ID) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // For authenticated owners or admins, return the full record.
        // For unauthenticated guests, return only the minimum needed to show a status page.
        if ($user) {
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

        // Guest: minimal response (no customer PII, no booking details)
        return response()->json([
            'order_id'   => $payment->order_id,
            'status'     => $payment->status,
            'amount'     => $payment->amount,
            'currency'   => $payment->currency,
            'created_at' => $payment->created_at,
        ]);
    }

    /**
     * Send confirmation emails to the customer and the admin.
     */
    private function sendConfirmationEmails(Payment $payment)
    {
        try {
            $payment->loadMissing(['customer', 'bookings.package']);

            $isPayLater = ($payment->payment_method === 'Pay Later');
            $subjectCustomer = $isPayLater
                ? 'Safari Reservation (Pay Later) - Order #' . $payment->order_id
                : 'Booking Confirmation - Order #' . $payment->order_id;
            $subjectAdmin = $isPayLater
                ? '[ADMIN NOTIFICATION] New Pay Later Booking - Order #' . $payment->order_id
                : '[ADMIN NOTIFICATION] Booking Confirmation - Order #' . $payment->order_id;

            // Send to Customer
            if ($payment->customer && $payment->customer->Email) {
                $htmlContent = (new BookingConfirmationMail($payment, false))->render();
                \App\Services\BrevoMailService::send(
                    $payment->customer->Email,
                    $subjectCustomer,
                    $htmlContent,
                    $payment->customer->Name ?? null
                );
            }

            // Send to Admin
            $adminEmail = env('ADMIN_EMAIL', env('CONTACT_DESTINATION_EMAIL', 'vishwaweerasinghe0@gmail.com'));
            if ($adminEmail) {
                $htmlContentAdmin = (new BookingConfirmationMail($payment, true))->render();
                \App\Services\BrevoMailService::send(
                    $adminEmail,
                    $subjectAdmin,
                    $htmlContentAdmin,
                    'Admin'
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation emails for order ' . $payment->order_id . ': ' . $e->getMessage());
        }
    }
}
