<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;

class Receivable extends Model
{
    use LogsActivity;

    protected $guarded = [];

    protected $casts = [
        'details' => 'array',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
