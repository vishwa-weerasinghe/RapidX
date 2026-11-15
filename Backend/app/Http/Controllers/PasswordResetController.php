<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;
use App\Mail\ResetPasswordMail;
use App\Services\BrevoMailService;

class PasswordResetController extends Controller
{
    /**
     * Send a reset link to the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        $email = $request->input('Email', $request->input('email'));

        $request->merge(['Email' => $email]);

        $request->validate([
            'Email' => 'required|email',
        ], [
            'Email.required' => 'Please provide an email address.',
            'Email.email' => 'Please enter a valid email address.',
        ]);

        // Check if user exists first; if not, return the same generic success response to prevent email enumeration (AUTH-10)
        $user = User::where('Email', $email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Reset link sent to your email.'
            ], 200);
        }

        try {
            // Generate secure token via Laravel password broker
            $token = Password::broker()->createToken($user);

            // Determine frontend SPA URL dynamically based on request origin
            $origin = $request->header('Origin') ?: $request->header('Referer');
            $frontendUrl = null;

            if ($origin) {
                $parsed = parse_url($origin);
                if (isset($parsed['scheme']) && isset($parsed['host'])) {
                    $frontendUrl = $parsed['scheme'] . '://' . $parsed['host'] . (isset($parsed['port']) ? ':' . $parsed['port'] : '');
                }
            }

            if (empty($frontendUrl)) {
                $frontendUrl = env('FRONTEND_URL') ?: config('app.frontend_url', 'http://localhost:5173');
            }

            $frontendUrl = rtrim($frontendUrl, '/');
            $resetUrl = $frontendUrl . '/password-reset/' . $token . '?email=' . urlencode($user->Email);
            $expireMinutes = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);

            // Render HTML content using Mailable (matching BookingConfirmationMail & ContactMessage)
            $htmlContent = (new ResetPasswordMail($user, $resetUrl, $expireMinutes))->render();

            // Send directly via Brevo REST API (Port 443)
            BrevoMailService::send(
                $user->Email,
                'Reset Your Password - Minneriya Wild Jeep Safari',
                $htmlContent,
                $user->User_Name ?? 'Valued Customer'
            );

            return response()->json([
                'message' => 'Reset link sent to your email.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to send reset password email: ' . $e->getMessage(), [
                'exception' => $e,
                'email' => $email,
            ]);

            return response()->json([
                'message' => 'Unable to send reset link to that email. Please try again later.'
            ], 500);
        }
    }

    /**
     * Reset the given user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function reset(Request $request)
    {
        $email = $request->input('Email', $request->input('email'));
        $password = $request->input('Password', $request->input('password'));
        $passwordConfirmation = $request->input('Password_confirmation', $request->input('password_confirmation'));
        $token = $request->input('token');

        $request->merge([
            'Email' => $email,
            'Password' => $password,
            'Password_confirmation' => $passwordConfirmation,
            'token' => $token,
        ]);

        $request->validate([
            'token' => 'required|string',
            'Email' => 'required|email',
            'Password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
            ],
        ], [
            'token.required' => 'Reset token is missing or invalid.',
            'Email.required' => 'Email address is required.',
            'Email.email' => 'Valid email address is required.',
            'Password.required' => 'Password is required.',
            'Password.min' => 'Password must be at least 8 characters long.',
            'Password.confirmed' => 'Password confirmation does not match.',
            'Password.regex' => 'Password must include uppercase, lowercase, numbers, and symbols.',
        ]);

        $credentials = [
            'Email' => $email,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
            'token' => $token,
        ];

        $status = Password::broker()->reset(
            $credentials,
            function ($user, $password) {
                $user->Password = Hash::make($password);
                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password has been successfully reset.'
            ], 200);
        }

        return response()->json([
            'message' => 'Invalid token or email.'
        ], 400);
    }
}
