<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = strtolower((string) ($user->role ?? ''));

        if (!$user || !in_array($role, ['admin', 'administrator', 'superadmin'], true)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $customers = Customer::withCount('bookings')
            ->orderByDesc('Customer_ID')
            ->get();

        return response()->json($customers);
    }
}
