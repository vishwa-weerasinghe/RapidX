<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $table = 'vehicles';
    protected $primaryKey = 'Vehicle_ID';
    public $timestamps = true;

    protected $fillable = [
        'Vehicle_No',
        'Vehicle_Type',
        'No_of_Seats',
        'Driver_ID',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'Driver_ID', 'Driver_ID');
    }
}
