<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Customer;
use App\Models\User;
use Closure;
use libphonenumber\PhoneNumberUtil;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $phoneUtil = PhoneNumberUtil::getInstance();
        $supportedRegions = $phoneUtil->getSupportedRegions();

        $validatedData = $request->validate([
            'Email' => 'required|email|unique:users,Email',
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
            'First_Name' => ['required', 'string', 'max:50', 'regex:/^[\p{L}]+(?:[ \-\'\x{2019}][\p{L}]+)*$/u'],
            'Last_Name' => ['required', 'string', 'max:50', 'regex:/^[\p{L}]+(?:[ \-\'\x{2019}][\p{L}]+)*$/u'],
            'Phone_No' => [
                'required',
                'string',
                'max:25',
                function (string $attribute, mixed $value, Closure $fail) use ($request, $phoneUtil): void {
                    $region = strtoupper($request->input('Country_Code', ''));
                    if ($region === '' && strcasecmp($request->input('Country', ''), 'Sri Lanka') === 0) {
                        $region = 'LK';
                    }

                    try {
                        $number = $phoneUtil->parse($value, $region ?: null);
                        $isValid = $region !== ''
                            ? $phoneUtil->isValidNumberForRegion($number, $region)
                            : $phoneUtil->isValidNumber($number);
                        if (!$isValid) {
                            $fail('Enter a valid phone number for the selected country.');
                        }
                    } catch (\Throwable) {
                        $fail('Enter a valid phone number for the selected country.');
                    }
                },
            ],
            'NIC' => ['required', 'string', 'max:20', 'regex:/^[A-Za-z0-9\/-]+$/'],
            'Country' => 'required|string|max:50',
            'Country_Code' => ['nullable', 'string', 'size:2', 'in:' . implode(',', $supportedRegions)],
        ]);

        $region = strtoupper($validatedData['Country_Code'] ?? '');
        if ($region === '' && strcasecmp($validatedData['Country'], 'Sri Lanka') === 0) {
            $region = 'LK';
        }
        $phoneNumber = $phoneUtil->parse($validatedData['Phone_No'], $region ?: null);
        $validatedData['Phone_No'] = $phoneUtil->format($phoneNumber, \libphonenumber\PhoneNumberFormat::E164);

        $customer = Customer::create([
            'First_Name' => $validatedData['First_Name'],
            'Last_Name' => $validatedData['Last_Name'],
            'Email' => $validatedData['Email'],
            'Phone_No' => $validatedData['Phone_No'],
            'NIC' => $validatedData['NIC'],
            'Country' => $validatedData['Country'],
        ]);

        $user = User::create([
            'Email' => $validatedData['Email'],
            'User_Name' => $validatedData['First_Name'] . ' ' . $validatedData['Last_Name'],
            'Password' => bcrypt($validatedData['Password']),
            'Customer_ID' => $customer->Customer_ID,
            ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' => 'Registration successful', 'user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'Email' => 'required|email',
            'Password' => 'required|string',
        ]);

        $user = User::where('Email', $validatedData['Email'])->first();

        if (!$user || !Hash::check($validatedData['Password'], $user->Password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' => 'Login successful', 'user' => $user, 'token' => $token], 200);
    }

    public function dashboard()
    {
        $user = Auth::user();
        return response()->json(['message' => 'Dashboard', 'user' => $user], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->Customer_ID) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        $validated = $request->validate([
            'First_Name' => 'required|string|max:50',
            'Last_Name' => 'required|string|max:50',
            'Email' => 'required|email|unique:users,Email,' . $user->Member_ID . ',Member_ID',
            'Phone_No' => 'required|string|max:20',
            'NIC' => 'required|string|max:20',
            'Country' => 'required|string|max:50',
        ]);

        $customer = Customer::findOrFail($user->Customer_ID);
        $customer->update([
            'First_Name' => $validated['First_Name'],
            'Last_Name' => $validated['Last_Name'],
            'Email' => $validated['Email'],
            'Phone_No' => $validated['Phone_No'],
            'NIC' => $validated['NIC'],
            'Country' => $validated['Country'],
        ]);

        if ($user->Email !== $validated['Email']) {
            $user->Email = $validated['Email'];
        }

        $user->User_Name = trim($validated['First_Name'] . ' ' . $validated['Last_Name']);
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'customer' => $customer->fresh(),
            'user' => $user->fresh(),
        ]);
    }
}
