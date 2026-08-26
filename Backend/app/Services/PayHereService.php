<?php

namespace App\Services;

class PayHereService
{
    protected string $merchantId;
    protected string $merchantSecret;
    protected string $appId;
    protected string $appSecret;
    protected string $currency;
    protected string $mode;
    protected string $returnUrl;
    protected string $cancelUrl;
    protected string $notifyUrl;

    public function __construct()
    {
        $this->merchantId = (string) config('payhere.merchant_id', '1211149');
        $this->merchantSecret = (string) config('payhere.merchant_secret', '');
        $this->appId = (string) config('payhere.app_id', '');
        $this->appSecret = (string) config('payhere.app_secret', '');
        $this->currency = (string) config('payhere.currency', 'USD');
        $this->mode = (string) config('payhere.mode', 'sandbox');
        $this->returnUrl = (string) config('payhere.return_url', '');
        $this->cancelUrl = (string) config('payhere.cancel_url', '');
        $this->notifyUrl = (string) config('payhere.notify_url', '');
    }

    /**
     * Get the base URL for the PayHere Merchant API
     */
    protected function getMerchantApiBaseUrl(): string
    {
        return $this->mode === 'sandbox'
            ? 'https://sandbox.payhere.lk/merchant/v1'
            : 'https://www.payhere.lk/merchant/v1';
    }

    /**
     * Generate an Access Token using App ID and App Secret
     */
    public function getAccessToken(): ?string
    {
        if (empty($this->appId) || empty($this->appSecret)) {
            \Illuminate\Support\Facades\Log::error('PayHere App ID or App Secret is not configured.');
            return null;
        }

        $authCode = base64_encode("{$this->appId}:{$this->appSecret}");
        
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => "Basic {$authCode}",
        ])->asForm()->post($this->getMerchantApiBaseUrl() . '/oauth/token', [
            'grant_type' => 'client_credentials'
        ]);

        if ($response->successful()) {
            return $response->json('access_token');
        }

        \Illuminate\Support\Facades\Log::error('Failed to get PayHere Access Token: ' . $response->body());
        return null;
    }

    /**
     * Process a refund via PayHere Refund API
     */
    public function refund(string $paymentId, float|int|string $amount, string $description = 'Booking Cancellation'): bool
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return false;
        }

        $response = \Illuminate\Support\Facades\Http::withToken($accessToken)
            ->post($this->getMerchantApiBaseUrl() . '/payment/refund', [
                'payment_id' => $paymentId,
                'description' => $description,
                'amount' => number_format((float) $amount, 2, '.', '')
            ]);

        if ($response->successful() && $response->json('status') === 1) {
            return true;
        }

        \Illuminate\Support\Facades\Log::error('PayHere Refund Failed for Payment ID ' . $paymentId . ': ' . $response->body());
        return false;
    }

    /**
     * Generate the MD5 security hash required by PayHere for checkout.
     *
     * Formula: strtoupper(md5(merchant_id + order_id + amountFormatted + currency + strtoupper(md5(merchant_secret))))
     */
    public function generateHash(string $orderId, float|int|string $amount, ?string $currency = null): string
    {
        $currency = $currency ?: $this->currency;
        $formattedAmount = number_format((float) $amount, 2, '.', '');
        $hashedSecret = strtoupper(md5($this->merchantSecret));

        return strtoupper(
            md5($this->merchantId . $orderId . $formattedAmount . $currency . $hashedSecret)
        );
    }

    /**
     * Verify the MD5 signature sent by PayHere on the IPN Webhook callback.
     *
     * Formula: strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
     */
    public function verifySignature(array $payload): bool
    {
        if (empty($payload['merchant_id']) || empty($payload['order_id']) || empty($payload['md5sig'])) {
            return false;
        }

        $merchantId = (string) $payload['merchant_id'];
        $orderId = (string) $payload['order_id'];
        $payhereAmount = (string) ($payload['payhere_amount'] ?? '');
        $payhereCurrency = (string) ($payload['payhere_currency'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $receivedMd5sig = (string) $payload['md5sig'];

        $hashedSecret = strtoupper(md5($this->merchantSecret));
        $calculatedMd5sig = strtoupper(
            md5($merchantId . $orderId . $payhereAmount . $payhereCurrency . $statusCode . $hashedSecret)
        );

        return hash_equals($calculatedMd5sig, $receivedMd5sig);
    }

    /**
     * Prepare full PayHere checkout payload parameters for frontend / SDK.
     */
    public function prepareCheckoutPayload(
        string $orderId,
        float $amount,
        string $itemsDescription,
        array $customerData,
        ?string $currency = null
    ): array {
        $currency = $currency ?: $this->currency;
        $hash = $this->generateHash($orderId, $amount, $currency);

        return [
            'sandbox' => $this->mode === 'sandbox',
            'merchant_id' => $this->merchantId,
            'return_url' => $this->returnUrl,
            'cancel_url' => $this->cancelUrl,
            'notify_url' => $this->notifyUrl,
            'order_id' => $orderId,
            'items' => $itemsDescription,
            'amount' => number_format($amount, 2, '.', ''),
            'currency' => $currency,
            'hash' => $hash,
            'first_name' => $customerData['first_name'] ?? 'Guest',
            'last_name' => $customerData['last_name'] ?? 'Customer',
            'email' => $customerData['email'] ?? '',
            'phone' => $customerData['phone'] ?? '',
            'address' => $customerData['address'] ?? 'Sri Lanka',
            'city' => $customerData['city'] ?? 'Colombo',
            'country' => $customerData['country'] ?? 'Sri Lanka',
        ];
    }
}
