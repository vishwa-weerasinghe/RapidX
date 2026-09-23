<?php

namespace App\Http\Controllers;

use App\Models\PromotionCode;
use Illuminate\Http\Request;

class PromotionCodeController extends Controller
{
    // List all codes (Admin)
    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        if (!$user || !in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(PromotionCode::latest()->get());
    }

    // Create a new code (Admin)
    public function store(Request $request)
    {
        $user = $request->user('sanctum');
        if (!$user || !in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|unique:promotion_codes,code',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'valid_until' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'is_hidden' => 'boolean',
        ]);

        $code = PromotionCode::create($validated);
        return response()->json($code, 201);
    }

    // Update a code (Admin)
    public function update(Request $request, $id)
    {
        $user = $request->user('sanctum');
        if (!$user || !in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $code = PromotionCode::findOrFail($id);

        $validated = $request->validate([
            'code' => 'string|unique:promotion_codes,code,' . $code->id,
            'discount_type' => 'in:percentage,fixed',
            'discount_value' => 'numeric|min:0',
            'valid_until' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'is_hidden' => 'boolean',
        ]);

        $code->update($validated);
        return response()->json($code);
    }

    // Delete a code (Admin)
    public function destroy(Request $request, $id)
    {
        $user = $request->user('sanctum');
        if (!$user || !in_array(strtolower($user->role ?? ''), ['admin', 'administrator', 'superadmin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $code = PromotionCode::findOrFail($id);
        $code->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Validate code (Customer)
    public function validateCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $promo = PromotionCode::where('code', $request->code)->first();

        if (!$promo) {
            return response()->json(['message' => 'Invalid promotion code'], 404);
        }

        if ($promo->is_hidden) {
            return response()->json(['message' => 'Invalid promotion code'], 404);
        }

        if ($promo->valid_until && now()->startOfDay()->greaterThan($promo->valid_until)) {
            return response()->json(['message' => 'Promotion code has expired'], 400);
        }

        if ($promo->usage_limit !== null && $promo->usage_count >= $promo->usage_limit) {
            return response()->json(['message' => 'Promotion code usage limit reached'], 400);
        }

        return response()->json([
            'message' => 'Valid promotion code',
            'promotion' => $promo
        ]);
    }
}
