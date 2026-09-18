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
        'price_one_adult',
        'price_more_adult',
        'price_child',
        'Image',
        'related_package',
    ];

    /**
     * Adult price applied per person for the given number of adults:
     * exactly one adult uses price_one_adult, two or more adults use
     * price_more_adult per adult.
     */
    public function adultPriceFor(int $adults): float
    {
        return (float) (($adults <= 1) ? $this->price_one_adult : $this->price_more_adult);
    }

    /**
     * Package price for the given number of adults and children.
     * This is only the package adult/child portion – any additional
     * fees (e.g. pickup area surcharges) are added by callers.
     */
    public function calculatePrice(int $adults, int $children): float
    {
        if ($adults < 0 || $children < 0) {
            return 0.0;
        }

        return ($adults * $this->adultPriceFor($adults))
            + ($children * (float) $this->price_child);
    }

    public function bookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'Package_ID');
    }
}
