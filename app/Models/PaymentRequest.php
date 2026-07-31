<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentRequest extends Model
{
    use SoftDeletes;
    
    protected $guarded = ['id'];

    protected $casts = [
        'submission_date' => 'date',
        'payment_deadline' => 'date',
        'transaction_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'other_cost' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'account_used_before' => 'boolean',
        'account_changed' => 'boolean',
        'submitted_at' => 'datetime',
        'supervisor_approved_at' => 'datetime',
        'finance_verified_at' => 'datetime',
        'approved_for_payment_at' => 'datetime',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Provider::class, 'vendor_id');
    }

    public function items()
    {
        return $this->hasMany(PaymentRequestItem::class)->orderBy('sort_order');
    }

    public function attachments()
    {
        return $this->hasMany(PaymentRequestAttachment::class);
    }

    public function approvals()
    {
        return $this->hasMany(PaymentRequestApproval::class)->orderBy('acted_at');
    }

    public function financeVerifications()
    {
        return $this->hasMany(PaymentRequestFinanceVerification::class)->orderBy('verified_at', 'desc');
    }

    public function payments()
    {
        return $this->hasMany(PaymentRequestPayment::class)->orderBy('payment_date', 'desc');
    }
}
