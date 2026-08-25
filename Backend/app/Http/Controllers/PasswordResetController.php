<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['Email' => 'required|email']);

        $status = Password::broker()->sendResetLink(
            ['Email' => $request->Email]
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Reset link sent to your email.']);
        }

        return response()->json(['message' => 'Unable to send reset link to that email.'], 400);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'Email' => 'required|email',
            'Password' => 'required|string|min:8|confirmed',
        ]);

        $credentials = [
            'Email' => $request->Email,
            'password' => $request->Password,
            'password_confirmation' => $request->input('Password_confirmation', $request->input('password_confirmation')),
            'token' => $request->token,
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
            return response()->json(['message' => 'Password has been successfully reset.']);
        }

        return response()->json(['message' => 'Invalid token or email.'], 400);
    }
}
