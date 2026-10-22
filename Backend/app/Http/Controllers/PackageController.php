<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\PackageImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PackageController extends Controller
{
    private const MAX_PACKAGE_IMAGES = 3;

    private function isAdmin($user): bool
    {
        $role = $user?->role ?? $user?->Role ?? $user?->user_type ?? null;

        return in_array(strtolower((string) $role), ['admin', 'administrator', 'superadmin'], true);
    }

    public function index()
    {
        $packages = Package::with('images')
            ->withCount('bookings')
            ->orderByDesc('bookings_count')
            ->latest()
            ->get()
            ->map(fn (Package $package) => $this->packagePayload($package));

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

        $validated = $request->validate($this->packageRules());
        if ($request->hasFile('Image') && $request->hasFile('Images')) {
            return $this->imageValidationError('Upload package images using either Images or Image, not both.');
        }

        $files = $this->newImageFiles($request);
        if ($request->hasFile('Image')) {
            $files = [$request->file('Image')];
        }
        if (count($files) > self::MAX_PACKAGE_IMAGES) {
            return $this->imageValidationError('A package can have no more than 3 images.');
        }

        unset($validated['Image'], $validated['Images'], $validated['retain_image_ids'], $validated['keep_legacy_image'], $validated['manage_images']);
        $uploaded = [];

        try {
            $uploaded = $this->uploadImages($files);
            $package = DB::transaction(function () use ($validated, $uploaded) {
                $package = new Package();
                $package->fill($validated);

                $urls = [];
                foreach ($uploaded as $image) {
                    $urls[] = $image['url'];
                }
                $package->Image = $urls[0] ?? null;
                $package->save();

                foreach ($uploaded as $image) {
                    $package->images()->create([
                        'image_url' => $image['url'],
                        'cloudinary_public_id' => $image['public_id'],
                    ]);
                }

                return $package->load('images');
            });
        } catch (Throwable $exception) {
            $this->deleteUploadedImages($uploaded);
            report($exception);

            return response()->json(['message' => 'Package image upload or save failed. Please try again.'], 500);
        }

        return response()->json($this->packagePayload($package), 201);
    }

    public function show(Package $package)
    {
        return response()->json($this->packagePayload($package->load('images')));
    }

    public function update(Request $request, Package $package)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Only administrators can update packages.'], 403);
        }

        $validated = $request->validate($this->packageRules(true));
        if ($request->hasFile('Image') && $request->hasFile('Images')) {
            return $this->imageValidationError('Upload package images using either Images or Image, not both.');
        }

        $currentImages = $package->images()->get();
        $currentUrls = $currentImages->pluck('image_url')->all();
        $legacyUrl = $package->Image && !in_array($package->Image, $currentUrls, true)
            ? $package->Image
            : null;
        $legacyReplacement = $request->hasFile('Image') && !$request->hasFile('Images');
        $manageImages = $legacyReplacement
            || $request->boolean('manage_images')
            || $request->exists('retain_image_ids')
            || $request->exists('keep_legacy_image')
            || $request->hasFile('Images');

        $files = $this->newImageFiles($request);
        if ($request->hasFile('Image')) {
            $files = [$request->file('Image')];
        }
        $keepLegacy = $legacyUrl !== null;
        if ($legacyReplacement) {
            $keepIds = [];
            $keepLegacy = false;
            $files = [$request->file('Image')];
        } elseif ($manageImages) {
            $keepIds = $request->exists('manage_images') || $request->exists('retain_image_ids')
                ? array_map('intval', (array) $request->input('retain_image_ids', []))
                : $currentImages->pluck('id')->map(fn ($id) => (int) $id)->all();
            $keepLegacy = $request->exists('keep_legacy_image')
                ? $request->boolean('keep_legacy_image')
                : $legacyUrl !== null;

            $knownIds = $currentImages->pluck('id')->map(fn ($id) => (int) $id)->all();
            if (array_diff($keepIds, $knownIds)) {
                return $this->imageValidationError('One or more selected package images are invalid.');
            }
        } else {
            $keepIds = $currentImages->pluck('id')->map(fn ($id) => (int) $id)->all();
        }

        if (count($files) > self::MAX_PACKAGE_IMAGES) {
            return $this->imageValidationError('A package can have no more than 3 images.');
        }

        $retainedCount = count($keepIds) + ($keepLegacy && $legacyUrl ? 1 : 0);
        if ($manageImages && $retainedCount + count($files) > self::MAX_PACKAGE_IMAGES) {
            return $this->imageValidationError('A package can have no more than 3 images. Remove an image before adding another.');
        }

        unset($validated['Image'], $validated['Images'], $validated['retain_image_ids'], $validated['keep_legacy_image'], $validated['manage_images']);
        $uploaded = [];
        $removedImages = [];

        try {
            $uploaded = $this->uploadImages($files);
            $package = DB::transaction(function () use ($package, $validated, $uploaded, $manageImages, $keepIds, $keepLegacy, $legacyUrl, &$removedImages) {
                $package->fill($validated);

                if ($manageImages) {
                    $retained = $package->images()->whereIn('id', $keepIds)->get();
                    $removed = $package->images()->whereNotIn('id', $keepIds)->get();
                    $removedImages = $removed->map(fn (PackageImage $image) => [
                        'url' => $image->image_url,
                        'public_id' => $image->cloudinary_public_id,
                    ])->all();
                    $package->images()->whereNotIn('id', $keepIds)->delete();

                    foreach ($uploaded as $image) {
                        $package->images()->create([
                            'image_url' => $image['url'],
                            'cloudinary_public_id' => $image['public_id'],
                        ]);
                    }

                    $urls = [];
                    if ($keepLegacy && $legacyUrl) {
                        $urls[] = $legacyUrl;
                    }
                    foreach ($retained as $image) {
                        $urls[] = $image->image_url;
                    }
                    foreach ($uploaded as $image) {
                        $urls[] = $image['url'];
                    }
                    $package->Image = $urls[0] ?? null;
                    if ($legacyUrl && !$keepLegacy) {
                        $removedImages[] = ['url' => $legacyUrl, 'public_id' => null];
                    }
                }

                $package->save();

                return $package->load('images');
            });
        } catch (Throwable $exception) {
            $this->deleteUploadedImages($uploaded);
            report($exception);

            return response()->json(['message' => 'Package image upload or update failed. Please try again.'], 500);
        }

        foreach ($removedImages as $image) {
            $this->deleteImageIfUnreferenced($image['url'], $image['public_id'] ?? null);
        }

        return response()->json($this->packagePayload($package));
    }

    public function destroy(Package $package)
    {
        if (!request()->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$this->isAdmin(request()->user())) {
            return response()->json(['message' => 'Only administrators can delete packages.'], 403);
        }

        $images = $package->images()->get()->map(fn (PackageImage $image) => [
            'url' => $image->image_url,
            'public_id' => $image->cloudinary_public_id,
        ])->all();
        if ($package->Image) {
            $images[] = ['url' => $package->Image, 'public_id' => null];
        }

        DB::transaction(fn () => $package->delete());
        foreach ($images as $image) {
            $this->deleteImageIfUnreferenced($image['url'], $image['public_id'] ?? null);
        }

        return response()->json(['message' => 'Package deleted']);
    }

    private function packageRules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';

        return [
            'Package_Name' => "$required|string|max:100",
            'Description' => "$required|string",
            'price_one_adult' => "$required|numeric|min:0",
            'price_more_adult' => "$required|numeric|min:0",
            'price_child' => "$required|numeric|min:0",
            'Image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:10240',
            'Images' => 'sometimes|array|max:3',
            'Images.*' => 'image|mimes:jpeg,jpg,png,webp|max:10240',
            'retain_image_ids' => 'sometimes|array',
            'retain_image_ids.*' => 'integer|distinct',
            'keep_legacy_image' => 'sometimes|boolean',
            'manage_images' => 'sometimes|boolean',
            'related_package' => ($partial ? 'sometimes|' : '') . 'nullable|string|max:255',
            'blog_id' => ($partial ? 'sometimes|' : '') . 'nullable|integer',
        ];
    }

    private function newImageFiles(Request $request): array
    {
        $files = $request->file('Images', []);
        if (!$request->hasFile('Images')) {
            return [];
        }

        return is_array($files) ? array_values($files) : [$files];
    }

    private function cloudinary(): \Cloudinary\Cloudinary
    {
        $rawUrl = config('filesystems.disks.cloudinary.url')
            ?: config('cloudinary.cloud_url')
            ?: env('CLOUDINARY_URL')
            ?: getenv('CLOUDINARY_URL');
        $cleanUrl = str_replace(['<', '>'], '', (string) $rawUrl);

        return new \Cloudinary\Cloudinary($cleanUrl);
    }

    private function uploadImages(array $files): array
    {
        $uploaded = [];
        try {
            $cloudinary = $this->cloudinary();
            foreach ($files as $file) {
                $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'package-images',
                ]);
                $url = $result['secure_url'] ?? null;
                if (!$url) {
                    throw new \RuntimeException('Cloudinary did not return an image URL.');
                }
                $uploaded[] = [
                    'url' => $url,
                    'public_id' => $result['public_id'] ?? null,
                ];
            }
        } catch (Throwable $exception) {
            $this->deleteUploadedImages($uploaded);
            throw $exception;
        }

        return $uploaded;
    }

    private function deleteUploadedImages(array $images): void
    {
        foreach ($images as $image) {
            $this->deleteImageFile($image['url'], $image['public_id'] ?? null);
        }
    }

    private function packagePayload(Package $package): array
    {
        $package->loadMissing('images');
        $payload = $package->toArray();
        $relationImages = $package->images->map(fn (PackageImage $image) => [
            'id' => $image->id,
            'url' => $image->image_url,
            'legacy' => false,
        ])->values();
        $legacyImage = $package->Image;

        if ($legacyImage && !$relationImages->contains(fn ($image) => $image['url'] === $legacyImage)) {
            $relationImages->prepend([
                'id' => null,
                'url' => $legacyImage,
                'legacy' => true,
            ]);
        }

        $payload['images'] = $relationImages->values()->all();

        return $payload;
    }

    private function imageValidationError(string $message)
    {
        return response()->json([
            'message' => 'The given data was invalid.',
            'errors' => ['Images' => [$message]],
        ], 422);
    }

    private function deleteImageIfUnreferenced(?string $imagePath, ?string $publicId = null): void
    {
        if (!$imagePath) {
            return;
        }

        if (Package::where('Image', $imagePath)->exists()
            || PackageImage::where('image_url', $imagePath)->exists()) {
            return;
        }

        $this->deleteImageFile($imagePath, $publicId);
    }

    private function deleteImageFile(?string $imagePath, ?string $publicId = null): void
    {
        if (!$imagePath) {
            return;
        }

        if ($publicId || str_contains($imagePath, 'cloudinary.com')) {
            if (!$publicId) {
                $parts = explode('/upload/', $imagePath);
                if (count($parts) < 2) {
                    return;
                }
                $path = preg_replace('/^v\d+\//', '', $parts[1]);
                $dir = pathinfo($path, PATHINFO_DIRNAME);
                $filename = pathinfo($path, PATHINFO_FILENAME);
                $publicId = $dir === '.' ? $filename : $dir . '/' . $filename;
                $publicId = ltrim($publicId, './');
            }

            try {
                $this->cloudinary()->uploadApi()->destroy($publicId);
            } catch (Throwable $exception) {
                report($exception);
            }

            return;
        }

        Storage::disk('public')->delete($imagePath);
    }
}