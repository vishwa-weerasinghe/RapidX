<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'Package_Name',
        'Description',
        'Price_for_adult',
        'Price_for_child',
        'Image',
        'blog_id',
    ];

    public function bookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'Package_ID');
    }
}
