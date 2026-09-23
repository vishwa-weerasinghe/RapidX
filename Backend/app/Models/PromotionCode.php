<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromotionCode extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'valid_until',
        'usage_limit',
        'usage_count',
        'is_hidden'
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
        'valid_until' => 'date',
        'discount_value' => 'decimal:2',
    ];
}
