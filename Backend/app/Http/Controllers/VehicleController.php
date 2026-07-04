<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        return response()->json(Vehicle::latest('Vehicle_ID')->get());
    }

    public function store(Request $request)
    {
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
        return response()->json($vehicle);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
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
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted']);
    }
}
