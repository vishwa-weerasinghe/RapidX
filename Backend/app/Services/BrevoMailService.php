<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoMailService
{
    /**
     * Send an email via Brevo REST API over HTTPS (Port 443).
     * This completely bypasses port 587/465 blocks on platforms like Render Free Tier.
     *
     * @param string $toEmail
     * @param string $subject
     * @param string $htmlContent
     * @param string|null $toName
     * @param string|null $replyToEmail
     * @param string|null $replyToName
     * @return array
     * @throws \Exception
     */
    public static function send(
        string $toEmail,
        string $subject,
        string $htmlContent,
        ?string $toName = null,
        ?string $replyToEmail = null,
        ?string $replyToName = null
    ): array {
        if (app()->environment('testing')) {
            return ['success' => true];
        }

        $apiKey = config('services.brevo.key') ?? env('BREVO_API_KEY');

        if (!$apiKey) {
            throw new \Exception('BREVO_API_KEY is not configured in environment variables.');
        }

        $senderEmail = config('mail.from.address', env('MAIL_FROM_ADDRESS', 'info@minneriyawildjeepsafari.com'));
        $senderName  = config('mail.from.name', env('MAIL_FROM_NAME', 'Wild Jeep Safari'));

        $payload = [
            'sender' => [
                'name'  => $senderName,
                'email' => $senderEmail,
            ],
            'to' => [
                [
                    'email' => $toEmail,
                    'name'  => $toName ?? $toEmail,
                ],
            ],
            'subject'     => $subject,
            'htmlContent' => $htmlContent,
        ];

        if ($replyToEmail) {
            $payload['replyTo'] = [
                'email' => $replyToEmail,
                'name'  => $replyToName ?? $replyToEmail,
            ];
        }

        $response = Http::withHeaders([
            'api-key'      => $apiKey,
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ])
        ->timeout(15)
        ->post('https://api.brevo.com/v3/smtp/email', $payload);

        if (!$response->successful()) {
            $errorBody = $response->body();
            Log::error('Brevo API Error: ' . $errorBody, [
                'status' => $response->status(),
                'payload' => $payload
            ]);
            throw new \Exception('Brevo API delivery failed: ' . ($response->json('message') ?? $errorBody));
        }

        return $response->json() ?? ['success' => true];
    }
}
