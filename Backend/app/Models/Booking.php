<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $primaryKey = 'Booking_ID';

    protected $fillable = [
        'Booking_Date',
        'Payment',
        'Pickup_Time',
        'Pickup_Location',
        'No_of_adults',
        'No_of_child',
        'Customer_ID',
        'Package_ID',
        'Vehicle_ID',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'Vehicle_ID', 'Vehicle_ID');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'Customer_ID', 'Customer_ID');
    }
}
