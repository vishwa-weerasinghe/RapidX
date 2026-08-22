<?php

namespace App\Http\Controllers;

use App\Models\Driver;
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
            'Driver_ID'    => 'nullable|exists:drivers,Driver_ID',
        ]);

        if (empty($validated['Driver_ID'])) {
            $validated['Driver_ID'] = Driver::query()->value('Driver_ID') ?? 1;
        }

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
            'Driver_ID'    => 'nullable|exists:drivers,Driver_ID',
        ]);

        if (array_key_exists('Driver_ID', $validated) && empty($validated['Driver_ID'])) {
            $validated['Driver_ID'] = Driver::query()->value('Driver_ID') ?? 1;
        }

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
