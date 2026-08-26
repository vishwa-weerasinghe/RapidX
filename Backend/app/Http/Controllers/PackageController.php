<?php

namespace App\Http\Controllers;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PackageController extends Controller
{
    private function isAdmin($user): bool
    {
        $role = $user?->role ?? $user?->Role ?? $user?->user_type ?? null;

        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }

    public function index()
    {
        $packages = Package::withCount('bookings')
            ->orderByDesc('bookings_count')
            ->latest()
            ->get();

        return response()->json($packages);
    }

    public function store(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can create packages.'], 403);
        }

        $validated = $request->validate([
            'Package_Name'     => 'required|string|max:100',
            'Description'      => 'required|string',
            'Price_for_adult'  => 'required|numeric|min:0',
            'Price_for_child'  => 'required|numeric|min:0',
            'Image' => 'nullable|image|mimes:jpeg,png,jpg,webp',
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
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can update packages.'], 403);
        }

        $validated = $request->validate([
            'Package_Name'     => 'sometimes|required|string|max:100',
            'Description'      => 'sometimes|required|string',
            'Price_for_adult'  => 'sometimes|required|numeric|min:0',
            'Price_for_child'  => 'sometimes|required|numeric|min:0',
            'Image' => 'nullable|image|mimes:jpeg,png,jpg,webp',
    

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
        if (!request()->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin(request()->user())) {
            return response()->json(['message' => 'Only administrators can delete packages.'], 403);
        }

        $package->delete();
        return response()->json(['message' => 'Package deleted']);
    }
}
