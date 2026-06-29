<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketingWeeklyTarget extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'target_outlets' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
