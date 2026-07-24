<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $primaryKey = 'Booking_ID';

    protected $fillable = [
        'Booking_Date',
        'Pickup_Time',
        'Pickup_Location',
        'No_of_adults',
        'No_of_child',
        'Payment',
        'Status',
        'Customer_ID',
        'Package_ID',
        'Vehicle_ID'
    ];

    // relationships

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'Customer_ID');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'Package_ID');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'Vehicle_ID');
    }
}