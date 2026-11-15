<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;
        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }

    public function index(Request $request)
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user();
        $isAdmin = $user && $this->isAdmin($user);

        $drivers = Driver::latest('Driver_ID')->get();
        if (!$isAdmin) {
            $drivers->makeHidden(['Phone_Number', 'Email']);
        }

        return response()->json($drivers);
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can create drivers.'], 403);
        }

        $validated = $request->validate([
            'Driver_Name'  => 'required|string|max:100',
            'Phone_Number' => 'required|string|max:20',
            'Email'        => 'required|email|max:100',
        ]);

        $driver = Driver::create($validated);

        return response()->json($driver, 201);
    }

    public function show(Request $request, Driver $driver)
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user();
        $isAdmin = $user && $this->isAdmin($user);

        if (!$isAdmin) {
            $driver->makeHidden(['Phone_Number', 'Email']);
        }

        return response()->json($driver);
    }

    public function update(Request $request, Driver $driver)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can update drivers.'], 403);
        }

        $validated = $request->validate([
            'Driver_Name'  => 'sometimes|required|string|max:100',
            'Phone_Number' => 'sometimes|required|string|max:20',
            'Email'        => 'sometimes|required|email|max:100',
        ]);

        $driver->update($validated);

        return response()->json($driver);
    }

    public function destroy(Request $request, Driver $driver)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can delete drivers.'], 403);
        }

        $driver->delete();
        return response()->json(['message' => 'Driver deleted']);
    }
}
