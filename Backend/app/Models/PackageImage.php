<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageImage extends Model
{
    protected $fillable = [
        'package_id',
        'image_url',
        'cloudinary_public_id',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}