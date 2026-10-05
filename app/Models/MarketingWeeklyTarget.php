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

    protected $appends = ['target_outlet_names', 'realized_visits'];

    public function getTargetOutletNamesAttribute()
    {
        $outletIds = $this->target_outlets ?? [];
        if (empty($outletIds)) return [];
        
        // Return array of outlet names for the frontend
        return \App\Models\Outlet::whereIn('id', $outletIds)->pluck('name')->toArray();
    }

    public function getRealizedVisitsAttribute()
    {
        if (!$this->user_id || !$this->start_date || !$this->end_date) return 0;

        return \App\Models\MarketingDailyReport::where('user_id', $this->user_id)
            ->where('activity_type', 'Kunjungan')
            ->whereDate('visit_date', '>=', $this->start_date)
            ->whereDate('visit_date', '<=', $this->end_date)
            ->count();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

