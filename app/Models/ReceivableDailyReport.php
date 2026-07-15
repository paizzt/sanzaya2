<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceivableDailyReport extends Model
{
    protected $fillable = ['billing_date', 'user_id', 'outlet_id', 'result'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}
