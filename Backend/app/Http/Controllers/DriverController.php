<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index()
    {
        return response()->json(Driver::latest('Driver_ID')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Driver_Name'  => 'required|string|max:100',
            'Phone_Number' => 'required|string|max:20',
            'Email'        => 'required|email|max:100',
        ]);

        $driver = Driver::create($validated);

        return response()->json($driver, 201);
    }

    public function show(Driver $driver)
    {
        return response()->json($driver);
    }

    public function update(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'Driver_Name'  => 'sometimes|required|string|max:100',
            'Phone_Number' => 'sometimes|required|string|max:20',
            'Email'        => 'sometimes|required|email|max:100',
        ]);

        $driver->update($validated);

        return response()->json($driver);
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();
        return response()->json(['message' => 'Driver deleted']);
    }
}
