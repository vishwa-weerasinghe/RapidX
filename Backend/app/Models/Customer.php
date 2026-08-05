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
}
