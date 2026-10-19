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

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $role = strtolower((string) ($user->role ?? ''));

        if (!$user || !in_array($role, ['admin', 'administrator', 'superadmin'], true)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($user->Customer_ID && (int) $user->Customer_ID === (int) $id) {
            return response()->json(['message' => 'You cannot delete your own customer account.'], 422);
        }

        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully.']);
    }

    public function bulkDestroy(Request $request)
    {
        $user = $request->user();
        $role = strtolower((string) ($user->role ?? ''));

        if (!$user || !in_array($role, ['admin', 'administrator', 'superadmin'], true)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:customers,Customer_ID',
        ]);

        $ids = array_values(array_unique(array_map('intval', $validated['ids'])));

        if ($user->Customer_ID && in_array((int) $user->Customer_ID, $ids, true)) {
            return response()->json(['message' => 'You cannot delete your own customer account.'], 422);
        }

        Customer::whereIn('Customer_ID', $ids)->delete();

        return response()->json([
            'message' => count($ids) . ' customer(s) deleted successfully.',
            'deleted_ids' => $ids,
        ]);
    }
}
