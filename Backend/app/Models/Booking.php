<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $primaryKey = 'Booking_ID';

    protected $casts = [
        'Admin_Seen' => 'boolean',
        'Customer_Seen' => 'boolean',
    ];

    protected $fillable = [
        'Booking_Date',
        'Pickup_Time',
        'Area',
        'Pickup_Location',
        'No_of_adults',
        'No_of_child',
        'Payment',
        'Status',
        'Customer_ID',
        'Package_ID',
        'Vehicle_ID',
        'Payment_ID',
        'Admin_Seen',
        'Admin_Message',
        'Customer_Seen',
        'Customer_Message'
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

    /**
     * All vehicles assigned to this booking (a booking can require more
     * than one vehicle depending on the number of passengers).
     */
    public function vehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'booking_vehicles', 'Booking_ID', 'Vehicle_ID');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'Payment_ID');
    }

    /**
     * Map of additional pickup area fees
     */
    public static function getAreaFee(?string $area): float
    {
        $areaFees = [
            'Dambulla'  => 12.0,
            'Sigiriya'  => 10.0,
            'Habarana'  => 3.0,
            'Kandalama' => 16.0,
        ];

        return $area && isset($areaFees[$area]) ? (float) $areaFees[$area] : 0.0;
    }
}