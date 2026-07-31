<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRequestFinanceVerification extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'account_verified' => 'boolean',
        'recipient_verified' => 'boolean',
        'amount_verified' => 'boolean',
        'vat_verified' => 'boolean',
        'deadline_verified' => 'boolean',
        'invoice_verified' => 'boolean',
        'tax_document_verified' => 'boolean',
        'account_change_confirmed' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function paymentRequest()
    {
        return $this->belongsTo(PaymentRequest::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verifier_id');
    }
}
