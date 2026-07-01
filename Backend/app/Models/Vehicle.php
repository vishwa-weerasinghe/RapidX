<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $primaryKey = 'Vehicle_ID';

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'Driver_ID', 'Driver_ID');
    }
}
