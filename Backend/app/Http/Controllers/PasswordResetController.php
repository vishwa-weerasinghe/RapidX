<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;

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

        // Check if user exists first to provide clear feedback
        $user = User::where('Email', $email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'We could not find a user with that email address.'
            ], 404);
        }

        $status = Password::broker()->sendResetLink(['Email' => $email]);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Reset link sent to your email.'
            ], 200);
        }

        return response()->json([
            'message' => 'Unable to send reset link to that email.'
        ], 400);
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
            'Password' => 'required|string|min:8|confirmed',
        ], [
            'token.required' => 'Reset token is missing or invalid.',
            'Email.required' => 'Email address is required.',
            'Email.email' => 'Valid email address is required.',
            'Password.required' => 'Password is required.',
            'Password.min' => 'Password must be at least 8 characters long.',
            'Password.confirmed' => 'Password confirmation does not match.',
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
