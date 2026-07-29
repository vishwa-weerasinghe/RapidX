<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $primaryKey = 'Review_ID';

    public $timestamps = false;

    protected $fillable = [
        'Rate',
        'Description',
        'Customer_ID',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'Customer_ID', 'Customer_ID');
    }
}
