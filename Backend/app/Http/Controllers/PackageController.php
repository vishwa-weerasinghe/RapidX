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
            try {
                $result = cloudinary()->uploadApi()->upload($request->file('Image')->getRealPath(), [
                    'folder' => 'package-images',
                ]);
                $validated['Image'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to upload image to Cloudinary: ' . $e->getMessage()], 500);
            }
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
                $this->deleteImageFile($package->Image);
            }

            try {
                $result = cloudinary()->uploadApi()->upload($request->file('Image')->getRealPath(), [
                    'folder' => 'package-images',
                ]);
                $validated['Image'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to upload image to Cloudinary: ' . $e->getMessage()], 500);
            }
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

        if ($package->Image) {
            $this->deleteImageFile($package->Image);
        }

        $package->delete();
        return response()->json(['message' => 'Package deleted']);
    }

    private function deleteImageFile($imagePath)
    {
        if (str_contains($imagePath, 'cloudinary.com')) {
            // extract public_id
            $parts = explode('/upload/', $imagePath);
            if (count($parts) > 1) {
                $path = $parts[1]; // e.g. v123/package-images/file.jpg
                // remove version
                $path = preg_replace('/^v\d+\//', '', $path);

                $dir = pathinfo($path, PATHINFO_DIRNAME);
                $filename = pathinfo($path, PATHINFO_FILENAME);

                $publicId = ($dir === '.') ? $filename : $dir . '/' . $filename;

                if (str_starts_with($publicId, './')) {
                    $publicId = substr($publicId, 2);
                }

                try {
                    cloudinary()->uploadApi()->destroy($publicId);
                } catch (\Exception $e) {
                    // Ignore failure to delete from Cloudinary
                }
            }
        } else {
            // Legacy local file
            Storage::disk('public')->delete($imagePath);
        }
    }
}
