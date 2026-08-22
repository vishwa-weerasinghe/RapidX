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
            $fileName = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            
            // Ensure uploads directory exists
            $uploadPath = public_path('uploads');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }

            $file->move($uploadPath, $fileName);
            $validated['file_path'] = '/uploads/' . $fileName;
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
                $oldFilePath = public_path($medium->file_path);
                if (File::exists($oldFilePath)) {
                    File::delete($oldFilePath);
                }
            }

            $file = $request->file('image');
            $fileName = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            
            $uploadPath = public_path('uploads');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }

            $file->move($uploadPath, $fileName);
            $validated['file_path'] = '/uploads/' . $fileName;
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
            $filePath = public_path($medium->file_path);
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
        }

        $medium->delete();

        return response()->json(['message' => 'Media deleted successfully']);
    }
}
