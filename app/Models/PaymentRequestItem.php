<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRequestItem extends Model
{
    protected $guarded = ['id'];
    
    protected $casts = [
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function paymentRequest()
    {
        return $this->belongsTo(PaymentRequest::class);
    }
}
