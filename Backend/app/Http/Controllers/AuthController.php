<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Customer;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'Email' => 'required|email|unique:users,Email',
            'Password' => 'required|string|min:8|confirmed',
            'First_Name' => 'required|string|max:50',
            'Last_Name' => 'required|string|max:50',
            'Phone_No' => 'required|string|max:20',
            'NIC' => 'required|string|max:20',
            'Country' => 'required|string|max:50',
        ]);

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
}
