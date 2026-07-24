<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $primaryKey = 'Cart_ID';

    protected $fillable = [
        'Customer_ID',
        'Booking_ID',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'Customer_ID');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'Booking_ID');
    }
}
