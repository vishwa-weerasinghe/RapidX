<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $Payment_ID
 * @property string $order_id
 * @property int $Customer_ID
 * @property float $amount
 * @property string $currency
 * @property string|null $payment_method
 * @property string $status
 * @property string|null $payhere_payment_id
 * @property int|null $status_code
 * @property string|null $status_message
 * @property string|null $card_holder_name
 * @property string|null $card_no
 * @property array|null $raw_response
 */
class Payment extends Model
{
    protected $primaryKey = 'Payment_ID';

    protected $fillable = [
        'order_id',
        'Customer_ID',
        'amount',
        'currency',
        'payment_method',
        'status',
        'payhere_payment_id',
        'status_code',
        'status_message',
        'card_holder_name',
        'card_no',
        'raw_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'status_code' => 'integer',
        'raw_response' => 'array',
    ];

    /**
     * Relationship: The customer who made this payment.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'Customer_ID');
    }

    /**
     * Relationship: The booking(s) covered by this payment.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'Payment_ID');
    }
}
