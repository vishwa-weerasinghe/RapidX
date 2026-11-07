<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;

        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }

    public function index()
    {
        if (!$this->isAdmin(request()->user())) {
            return response()->json(['message' => 'Only administrators can view vehicles.'], 403);
        }

        return response()->json(Vehicle::latest('Vehicle_ID')->get());
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can create vehicles.'], 403);
        }

        $validated = $request->validate([
            'Vehicle_No'   => 'required|string|max:20',
            'Vehicle_Type' => 'required|string|max:50',
            'No_of_Seats'  => 'required|integer|min:1',
            'Driver_ID'    => 'required|exists:drivers,Driver_ID',
        ]);

        $vehicle = Vehicle::create($validated);

        return response()->json($vehicle, 201);
    }

    public function show(Vehicle $vehicle)
    {
        if (!$this->isAdmin(request()->user())) {
            return response()->json(['message' => 'Only administrators can view vehicles.'], 403);
        }

        return response()->json($vehicle);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can update vehicles.'], 403);
        }

        $validated = $request->validate([
            'Vehicle_No'   => 'sometimes|required|string|max:20',
            'Vehicle_Type' => 'sometimes|required|string|max:50',
            'No_of_Seats'  => 'sometimes|required|integer|min:1',
            'Driver_ID'    => 'sometimes|required|exists:drivers,Driver_ID',
        ]);

        $vehicle->update($validated);

        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle)
    {
        if (!$this->isAdmin(request()->user())) {
            return response()->json(['message' => 'Only administrators can delete vehicles.'], 403);
        }

        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted']);
    }
}
