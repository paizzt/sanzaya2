<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class UcRequest extends Model
{
    use LogsActivity;

    protected $guarded = [];
    protected $casts = [
        'companions' => 'array',
    ];
    protected $appends = ['creator_name', 'creator_division'];

    public function getKeteranganAttribute()
    {
        return $this->description;
    }

    public function setKeteranganAttribute($value)
    {
        $this->attributes['description'] = $value;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(UcRequestItem::class);
    }

    public function getCreatorUserAttribute()
    {
        if ($this->relationLoaded('creator') && $this->creator) {
            return $this->creator;
        }

        if (!empty($this->created_by)) {
            $creator = User::with('division')->find($this->created_by);
            if ($creator) {
                return $creator;
            }
        }

        // Check ActivityLog for historical records where created_by was not populated yet
        try {
            $log = ActivityLog::where('module', 'UcRequest')
                ->where('action', 'Created')
                ->where(function ($q) {
                    if (!empty($this->request_number)) {
                        $q->where('new_values', 'like', '%"request_number":"' . $this->request_number . '"%');
                    } else {
                        $q->where('new_values', 'like', '%"id":' . $this->id . '%');
                    }
                })
                ->first();

            if ($log && $log->user) {
                return $log->user;
            }
        } catch (\Throwable $e) {}

        return $this->user;
    }

    public function getCreatorNameAttribute()
    {
        $creator = $this->creator_user;
        return $creator->name ?? ($this->user->name ?? 'Staff');
    }

    public function getCreatorDivisionAttribute()
    {
        $creator = $this->creator_user;
        if ($creator) {
            if ($creator->division && !empty($creator->division->name)) {
                return $creator->division->name;
            }
            if (!empty($creator->division_name)) {
                return $creator->division_name;
            }
        }

        return 'Manager';
    }
}
