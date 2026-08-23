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

    'merchant_id' => env('PAYHERE_MERCHANT_ID', '1211149'), // Default Sandbox ID

    'merchant_secret' => env('PAYHERE_MERCHANT_SECRET', '4MjIyMzE0NTgxNDQyNjY5Njg4MTg4MDgzODczODAyMTIyMzE0NTg='), // Default Sandbox Secret

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
