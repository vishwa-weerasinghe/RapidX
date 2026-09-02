<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class MediaController extends Controller
{
    private function isAdmin($user): bool
    {
        $role = $user->role ?? $user->Role ?? $user->user_type ?? null;
        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }

    public function index()
    {
        return response()->json(Media::latest()->get());
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can upload media.'], 403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:100',
            'description' => 'nullable|string',
            'image'       => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            
            try {
                $result = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'uploads',
                ]);
                $validated['file_path'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to upload image to Cloudinary: ' . $e->getMessage()], 500);
            }
        }

        $media = Media::create($validated);

        return response()->json($media, 201);
    }

    public function show(Media $medium)
    {
        return response()->json($medium);
    }

    public function update(Request $request, Media $medium)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can update media.'], 403);
        }

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240',
        ]);

        if ($request->hasFile('image')) {
            // Delete old file
            if ($medium->file_path) {
                $this->deleteMediaFile($medium->file_path);
            }

            $file = $request->file('image');
            
            try {
                $result = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'uploads',
                ]);
                $validated['file_path'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to upload image to Cloudinary: ' . $e->getMessage()], 500);
            }
        }

        $medium->update($validated);

        return response()->json($medium);
    }

    public function destroy(Request $request, Media $medium)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can delete media.'], 403);
        }

        if ($medium->file_path) {
            $this->deleteMediaFile($medium->file_path);
        }

        $medium->delete();

        return response()->json(['message' => 'Media deleted successfully']);
    }

    private function deleteMediaFile($filePath)
    {
        if (str_contains($filePath, 'cloudinary.com')) {
            // extract public_id
            $parts = explode('/upload/', $filePath);
            if (count($parts) > 1) {
                $path = $parts[1]; // e.g. v123/folder/file.jpg
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
            // Local file
            $localPath = public_path($filePath);
            if (File::exists($localPath)) {
                File::delete($localPath);
            }
        }
    }
}
