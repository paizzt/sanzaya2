<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentApprovalThreshold extends Model
{
    protected $guarded = ['id'];
    
    protected $casts = [
        'minimum_amount' => 'decimal:2',
        'maximum_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_until' => 'date',
    ];
}
