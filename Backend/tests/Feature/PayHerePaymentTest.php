<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Payment;
use App\Services\PayHereService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PayHerePaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function createPackage(array $overrides = []): Package
    {
        return Package::create(array_merge([
            'Package_Name'    => 'Minneriya Elephant Safari',
            'Description'     => 'World famous elephant gathering tour.',
            'Price_for_adult' => 150.00,
            'Price_for_child' => 75.00,
        ], $overrides));
    }

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name'    => 'John',
            'Last_Name'     => 'Doe',
            'Email'         => fake()->unique()->safeEmail(),
            'Phone_No'      => '0771234567',
            'NIC'           => '123456789V',
            'Country'       => 'Sri Lanka',
            'Customer_Type' => 'Guest',
        ], $overrides));
    }

    protected function createBookingInCart(int $customerId, int $packageId, float $paymentAmount = 150.00): Booking
    {
        $booking = Booking::create([
            'Booking_Date'    => '2026-09-01',
            'Pickup_Time'     => '06:00:00',
            'Pickup_Location' => 'Sigiriya Hotel',
            'Area'            => 'Sigiriya',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            'Payment'         => $paymentAmount,
            'Status'          => 'In Cart',
            'Customer_ID'     => $customerId,
            'Package_ID'      => $packageId,
            'Vehicle_ID'      => null,
            'Admin_Seen'      => false,
        ]);

        Cart::create([
            'Customer_ID' => $customerId,
            'Booking_ID'  => $booking->Booking_ID,
        ]);

        return $booking;
    }

    // -------------------------------------------------------------------------
    // PayHere Service Hash & Signature Tests
    // -------------------------------------------------------------------------

    public function test_payhere_service_generates_valid_md5_hash(): void
    {
        $service = app(PayHereService::class);
        $hash = $service->generateHash('ORD_1001', 150.00, 'USD');

        $this->assertNotEmpty($hash);
        $this->assertEquals(32, strlen($hash)); // MD5 string length
        $this->assertEquals(strtoupper($hash), $hash); // PayHere hashes must be uppercase
    }

    public function test_payhere_service_verifies_valid_ipn_signature(): void
    {
        $service = app(PayHereService::class);
        $merchantId = config('payhere.merchant_id', '1211149');
        $merchantSecret = config('payhere.merchant_secret', '4MjIyMzE0NTgxNDQyNjY5Njg4MTg4MDgzODczODAyMTIyMzE0NTg=');
        $orderId = 'ORD_TEST_1001';
        $amount = '150.00';
        $currency = 'USD';
        $statusCode = '2';

        $validSig = strtoupper(
            md5($merchantId . $orderId . $amount . $currency . $statusCode . strtoupper(md5($merchantSecret)))
        );

        $payload = [
            'merchant_id'      => $merchantId,
            'order_id'         => $orderId,
            'payhere_amount'   => $amount,
            'payhere_currency' => $currency,
            'status_code'      => $statusCode,
            'md5sig'           => $validSig,
        ];

        $this->assertTrue($service->verifySignature($payload));
    }

    public function test_payhere_service_rejects_tampered_ipn_signature(): void
    {
        $service = app(PayHereService::class);
        $payload = [
            'merchant_id'      => '1211149',
            'order_id'         => 'ORD_FAKE',
            'payhere_amount'   => '150.00',
            'payhere_currency' => 'USD',
            'status_code'      => '2',
            'md5sig'           => 'INVALID_MD5_SIGNATURE',
        ];

        $this->assertFalse($service->verifySignature($payload));
    }

    // -------------------------------------------------------------------------
    // Single Booking Checkout Initiation Tests
    // -------------------------------------------------------------------------

    public function test_single_booking_initiation_creates_pending_payment_and_booking(): void
    {
        $package = $this->createPackage();

        $response = $this->postJson('/api/payhere/initiate', [
            'Booking_Date'    => '2026-09-15',
            'Pickup_Time'     => '06:30',
            'Pickup_Location' => 'Heritance Kandalama',
            'Area'            => 'Kandalama',
            'No_of_adults'    => 2,
            'No_of_child'     => 1,
            'Package_ID'      => $package->id,
            'Payment'         => 375.00,
            'First_Name'      => 'Alice',
            'Last_Name'       => 'Walker',
            'Email'           => 'alice@example.com',
            'Phone_No'        => '0779988776',
            'NIC'             => '998877665V',
            'Country'         => 'United Kingdom',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'order_id',
                'Payment_ID',
                'Booking_ID',
                'payhere_params' => [
                    'merchant_id',
                    'order_id',
                    'items',
                    'amount',
                    'currency',
                    'hash',
                    'first_name',
                    'last_name',
                    'email',
                ],
            ]);

        $orderId = $response->json('order_id');
        $paymentId = $response->json('Payment_ID');

        // Check Payment row in DB
        $this->assertDatabaseHas('payments', [
            'Payment_ID' => $paymentId,
            'order_id'   => $orderId,
            'amount'     => 375.00,
            'status'     => 'Pending',
        ]);

        // Check Booking row in DB linked to Payment_ID
        $this->assertDatabaseHas('bookings', [
            'Payment_ID' => $paymentId,
            'Status'     => 'Pending',
            'Payment'    => 375.00,
        ]);
    }

    public function test_single_booking_initiation_validates_required_fields(): void
    {
        $response = $this->postJson('/api/payhere/initiate', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Booking_Date', 'Pickup_Time', 'Pickup_Location', 'No_of_adults', 'Package_ID', 'Payment']);

        $this->assertDatabaseCount('payments', 0);
        $this->assertDatabaseCount('bookings', 0);
    }

    // -------------------------------------------------------------------------
    // Cart Bulk Checkout Initiation Tests
    // -------------------------------------------------------------------------

    public function test_cart_checkout_initiation_creates_single_parent_payment_for_all_cart_bookings(): void
    {
        $package1 = $this->createPackage(['Package_Name' => 'Morning Tour']);
        $package2 = $this->createPackage(['Package_Name' => 'Evening Tour']);
        $customer = $this->createCustomer();

        $booking1 = $this->createBookingInCart($customer->Customer_ID, $package1->id, 150.00);
        $booking2 = $this->createBookingInCart($customer->Customer_ID, $package2->id, 200.00);

        $response = $this->postJson('/api/payhere/initiate', [
            'checkout_type' => 'cart',
            'Customer_ID'   => $customer->Customer_ID,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('bookings_count', 2);

        $paymentId = $response->json('Payment_ID');

        // Verify Payment amount is sum of cart bookings (150 + 200 = 350)
        $this->assertDatabaseHas('payments', [
            'Payment_ID' => $paymentId,
            'amount'     => 350.00,
            'status'     => 'Pending',
        ]);

        // Both bookings now reference the single Payment_ID
        $this->assertEquals($paymentId, $booking1->fresh()->Payment_ID);
        $this->assertEquals($paymentId, $booking2->fresh()->Payment_ID);
    }

    // -------------------------------------------------------------------------
    // IPN Webhook Notification Tests
    // -------------------------------------------------------------------------

    public function test_ipn_webhook_with_valid_signature_confirms_payment_and_bookings(): void
    {
        $package = $this->createPackage();
        $customer = $this->createCustomer();

        $payment = Payment::create([
            'order_id'       => 'ORD_TEST_CONFIRM_100',
            'Customer_ID'    => $customer->Customer_ID,
            'amount'         => 150.00,
            'currency'       => 'USD',
            'payment_method' => 'PayHere',
            'status'         => 'Pending',
        ]);

        $booking = Booking::create([
            'Booking_Date'    => '2026-09-01',
            'Pickup_Time'     => '06:00',
            'Pickup_Location' => 'Hotel',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            'Payment'         => 150.00,
            'Status'          => 'Pending',
            'Customer_ID'     => $customer->Customer_ID,
            'Package_ID'      => $package->id,
            'Payment_ID'      => $payment->Payment_ID,
            'Admin_Seen'      => false,
        ]);

        $merchantId = config('payhere.merchant_id', '1211149');
        $merchantSecret = config('payhere.merchant_secret', '4MjIyMzE0NTgxNDQyNjY5Njg4MTg4MDgzODczODAyMTIyMzE0NTg=');
        $validSig = strtoupper(
            md5($merchantId . $payment->order_id . '150.00' . 'USD' . '2' . strtoupper(md5($merchantSecret)))
        );

        $response = $this->postJson('/api/payhere/notify', [
            'merchant_id'        => $merchantId,
            'order_id'           => $payment->order_id,
            'payment_id'         => 'PAYHERE_TXN_987654',
            'payhere_amount'     => '150.00',
            'payhere_currency'   => 'USD',
            'status_code'        => 2,
            'status_message'     => 'Successfully completed',
            'method'             => 'VISA',
            'card_holder_name'   => 'John Doe',
            'card_no'            => '************1111',
            'md5sig'             => $validSig,
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'OK']);

        // Payment must be Success
        $payment->refresh();
        $this->assertEquals('Success', $payment->status);
        $this->assertEquals('PAYHERE_TXN_987654', $payment->payhere_payment_id);
        $this->assertEquals('VISA', $payment->payment_method);

        // Booking must be Confirmed
        $booking->refresh();
        $this->assertEquals('Confirmed', $booking->Status);
    }

    public function test_ipn_webhook_with_invalid_signature_returns_400(): void
    {
        $response = $this->postJson('/api/payhere/notify', [
            'merchant_id'    => '1211149',
            'order_id'       => 'ORD_TEST_FAKE',
            'payhere_amount' => '100.00',
            'status_code'    => 2,
            'md5sig'         => 'INVALID_FAKE_SIGNATURE',
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'Invalid signature']);
    }

    public function test_ipn_webhook_with_failed_status_updates_payment_status_to_failed(): void
    {
        $customer = $this->createCustomer();

        $payment = Payment::create([
            'order_id'       => 'ORD_TEST_FAIL_200',
            'Customer_ID'    => $customer->Customer_ID,
            'amount'         => 150.00,
            'currency'       => 'USD',
            'status'         => 'Pending',
        ]);

        $merchantId = config('payhere.merchant_id', '1211149');
        $merchantSecret = config('payhere.merchant_secret', '4MjIyMzE0NTgxNDQyNjY5Njg4MTg4MDgzODczODAyMTIyMzE0NTg=');
        $validSig = strtoupper(
            md5($merchantId . $payment->order_id . '150.00' . 'USD' . '-2' . strtoupper(md5($merchantSecret)))
        );

        $response = $this->postJson('/api/payhere/notify', [
            'merchant_id'      => $merchantId,
            'order_id'         => $payment->order_id,
            'payhere_amount'   => '150.00',
            'payhere_currency' => 'USD',
            'status_code'      => -2, // -2 = Failed
            'status_message'   => 'Insufficient funds',
            'md5sig'           => $validSig,
        ]);

        $response->assertStatus(200);

        $payment->refresh();
        $this->assertEquals('Failed', $payment->status);
    }

    public function test_ipn_webhook_with_cancelled_status_updates_payment_status_to_cancelled(): void
    {
        $customer = $this->createCustomer();
        $package  = $this->createPackage();

        $payment = Payment::create([
            'order_id'       => 'ORD_TEST_CANCEL_100',
            'Customer_ID'    => $customer->Customer_ID,
            'amount'         => 120.00,
            'currency'       => 'USD',
            'status'         => 'Pending',
        ]);

        $booking = Booking::create([
            'Booking_Date'    => '2026-09-01',
            'Pickup_Time'     => '06:00:00',
            'Pickup_Location' => 'Sigiriya Hotel',
            'Area'            => 'Sigiriya',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            'Payment'         => 120.00,
            'Status'          => 'In Cart',
            'Customer_ID'     => $customer->Customer_ID,
            'Package_ID'      => $package->id,
            'Payment_ID'      => $payment->Payment_ID,
            'Admin_Seen'      => false,
        ]);

        $merchantId = config('payhere.merchant_id', '1211149');
        $merchantSecret = config('payhere.merchant_secret', '4MjIyMzE0NTgxNDQyNjY5Njg4MTg4MDgzODczODAyMTIyMzE0NTg=');
        $validSig = strtoupper(
            md5($merchantId . $payment->order_id . '120.00' . 'USD' . '-1' . strtoupper(md5($merchantSecret)))
        );

        $response = $this->postJson('/api/payhere/notify', [
            'merchant_id'      => $merchantId,
            'order_id'         => $payment->order_id,
            'payhere_amount'   => '120.00',
            'payhere_currency' => 'USD',
            'status_code'      => -1, // -1 = Cancelled
            'status_message'   => 'Cancelled by user',
            'md5sig'           => $validSig,
        ]);

        $response->assertStatus(200);

        $payment->refresh();
        $this->assertEquals('Cancelled', $payment->status);

        // Pending bookings tied to a cancelled payment must not stay pending/confirmed
        $booking->refresh();
        $this->assertEquals('In Cart', $booking->Status);
    }



    // -------------------------------------------------------------------------
    // Payment Status Polling Test
    // -------------------------------------------------------------------------

    public function test_can_fetch_payment_status_by_order_id(): void
    {
        $customer = $this->createCustomer();
        $package = $this->createPackage();

        $payment = Payment::create([
            'order_id'           => 'ORD_POLL_300',
            'Customer_ID'        => $customer->Customer_ID,
            'amount'             => 150.00,
            'currency'           => 'USD',
            'status'             => 'Success',
            'payhere_payment_id' => 'TXN_300',
        ]);

        Booking::create([
            'Booking_Date'    => '2026-09-01',
            'Pickup_Time'     => '06:00',
            'Pickup_Location' => 'Sigiriya',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            'Payment'         => 150.00,
            'Status'          => 'Confirmed',
            'Customer_ID'     => $customer->Customer_ID,
            'Package_ID'      => $package->id,
            'Payment_ID'      => $payment->Payment_ID,
            'Admin_Seen'      => false,
        ]);

        $response = $this->getJson('/api/payhere/status/' . $payment->order_id);

        $response->assertStatus(200)
            ->assertJsonPath('order_id', 'ORD_POLL_300')
            ->assertJsonPath('status', 'Success')
            ->assertJsonPath('amount', '150.00')
            ->assertJsonCount(1, 'bookings');
    }

    // -------------------------------------------------------------------------
    // Payment Client Confirm Test
    // -------------------------------------------------------------------------

    public function test_confirm_endpoint_updates_payment_and_bookings_and_clears_cart(): void
    {
        $customer = $this->createCustomer();
        $package  = $this->createPackage();

        $payment = Payment::create([
            'order_id'       => 'SAFARI_CART_TEST_CONFIRM',
            'Customer_ID'    => $customer->Customer_ID,
            'amount'         => 300.00,
            'currency'       => 'USD',
            'status'         => 'Pending',
        ]);

        $booking = Booking::create([
            'Booking_Date'    => '2026-09-01',
            'Pickup_Time'     => '06:00',
            'Pickup_Location' => 'Sigiriya',
            'No_of_adults'    => 2,
            'No_of_child'     => 0,
            'Payment'         => 300.00,
            'Status'          => 'Pending',
            'Customer_ID'     => $customer->Customer_ID,
            'Package_ID'      => $package->id,
            'Payment_ID'      => $payment->Payment_ID,
            'Admin_Seen'      => false,
        ]);

        Cart::create([
            'Customer_ID' => $customer->Customer_ID,
            'Booking_ID'  => $booking->Booking_ID,
        ]);

        $response = $this->postJson('/api/payhere/confirm', [
            'order_id' => 'SAFARI_CART_TEST_CONFIRM',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('status', 'Success');

        $payment->refresh();
        $this->assertEquals('Success', $payment->status);

        $booking->refresh();
        $this->assertEquals('Confirmed', $booking->Status);

        $this->assertDatabaseMissing('carts', [
            'Customer_ID' => $customer->Customer_ID,
        ]);
    }
}
