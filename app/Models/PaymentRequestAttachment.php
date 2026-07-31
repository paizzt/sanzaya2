<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRequestAttachment extends Model
{
    protected $guarded = ['id'];

    public function paymentRequest()
    {
        return $this->belongsTo(PaymentRequest::class);
    }
}
