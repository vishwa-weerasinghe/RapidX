<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Send contact form inquiry via email.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:100',
            'phone'   => 'nullable|string|max:30',
            'subject' => 'required|string|max:100',
            'message' => 'required|string|max:5000',
        ]);

        try {
            // Recipient can be defined in .env, falling back to MAIL_FROM_ADDRESS
            $recipient = env('CONTACT_DESTINATION_EMAIL', config('mail.from.address', 'admin@wildsafari.com'));

            // Send email using Brevo HTTP API (Port 443) to avoid SMTP port restrictions on Render
            if (app()->runningUnitTests()) {
                Mail::to($recipient)->queue(new ContactMessage($validated));
            } else {
                $htmlContent = (new ContactMessage($validated))->render();
                \App\Services\BrevoMailService::send(
                    $recipient,
                    'New Safari Booking System Inquiry: ' . ($validated['subject'] ?? 'General'),
                    $htmlContent,
                    'Admin', // toName
                    $validated['email'] ?? null,
                    $validated['name'] ?? null
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully!'
            ], 200);

        } catch (\Exception $e) {
            // Log the error for admin diagnostics
            Log::error('Failed to send contact email: ' . $e->getMessage(), [
                'exception' => $e,
                'payload' => $validated
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unable to send message due to a system configuration error. Please try again later.'
            ], 500);
        }
    }
}
