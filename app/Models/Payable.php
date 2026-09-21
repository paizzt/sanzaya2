<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;

class Payable extends Model
{
    use LogsActivity;

    protected $guarded = [];

    protected $casts = [
        'details' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
