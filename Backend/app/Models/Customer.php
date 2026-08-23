<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $primaryKey = 'Customer_ID';

    protected $fillable = [
        'First_Name',
        'Last_Name',
        'Customer_Type',
        'Email',
        'Phone_No',
        'NIC',
        'Country',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class, 'Customer_ID');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'Customer_ID');
    }
}
