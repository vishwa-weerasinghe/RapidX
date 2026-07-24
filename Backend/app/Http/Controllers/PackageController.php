<?php

namespace App\Http\Controllers;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json(Package::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Package_Name'     => 'required|string|max:100',
            'Description'      => 'required|string',
            'Price_for_adult'  => 'required|numeric|min:0',
            'Price_for_child'  => 'required|numeric|min:0',
            'Image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);
        if ($request->hasFile('Image')) {
            $validated['Image'] = $request->file('Image')
                ->store('package-images', 'public');
        }

        $package = Package::create($validated);

        return response()->json($package, 201);
    }

    public function show(Package $package)
    {
        return response()->json($package);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'Package_Name'     => 'sometimes|required|string|max:100',
            'Description'      => 'sometimes|required|string',
            'Price_for_adult'  => 'sometimes|required|numeric|min:0',
            'Price_for_child'  => 'sometimes|required|numeric|min:0',
            'Image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
    

        ]);
        if ($request->hasFile('Image')) {
            if ($package->Image) {
                Storage::disk('public')->delete($package->Image);
            }

            $validated['Image'] = $request->file('Image')
                ->store('package-images', 'public');
        }

        $package->update($validated);

        return response()->json($package);
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return response()->json(['message' => 'Package deleted']);
    }
}
