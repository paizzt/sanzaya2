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

    protected $appends = ['target_outlet_names'];

    public function getTargetOutletNamesAttribute()
    {
        $outletIds = $this->target_outlets ?? [];
        if (empty($outletIds)) return [];
        
        // Return array of outlet names for the frontend
        return \App\Models\Outlet::whereIn('id', $outletIds)->pluck('name')->toArray();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

