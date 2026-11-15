<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PayHere Merchant Credentials
    |--------------------------------------------------------------------------
    |
    | Obtain these from your PayHere Merchant Portal (https://www.payhere.lk).
    | During development/testing, default sandbox credentials are used.
    |
    */

    'merchant_id' => env('PAYHERE_MERCHANT_ID'), // Set in .env — no default

    'merchant_secret' => env('PAYHERE_MERCHANT_SECRET'), // Set in .env — never use a hardcoded default

    'app_id' => env('PAYHERE_APP_ID', ''),

    'app_secret' => env('PAYHERE_APP_SECRET', ''),

    'mode' => env('PAYHERE_MODE', 'sandbox'), // 'sandbox' or 'live'

    'currency' => env('PAYHERE_CURRENCY', 'USD'),

    /*
    |--------------------------------------------------------------------------
    | PayHere Endpoints & URLs
    |--------------------------------------------------------------------------
    */

    'checkout_url' => env('PAYHERE_MODE', 'sandbox') === 'live'
        ? 'https://www.payhere.lk/pay/checkout'
        : 'https://sandbox.payhere.lk/pay/checkout',

    'return_url' => env('PAYHERE_RETURN_URL', 'http://localhost:5173/payment/success'),

    'cancel_url' => env('PAYHERE_CANCEL_URL', 'http://localhost:5173/payment/cancel'),

    'notify_url' => env('PAYHERE_NOTIFY_URL', 'http://127.0.0.1:8000/api/payhere/notify'),
];
