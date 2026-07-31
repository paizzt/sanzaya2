<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRequestApproval extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'acted_at' => 'datetime',
    ];

    public function paymentRequest()
    {
        return $this->belongsTo(PaymentRequest::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
