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

    public function getCreatorNameAttribute()
    {
        if ($this->relationLoaded('creator') && $this->creator) {
            return $this->creator->name;
        }

        if (!empty($this->created_by)) {
            $creator = User::find($this->created_by);
            if ($creator) {
                return $creator->name;
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
                return $log->user->name;
            }
        } catch (\Throwable $e) {}

        return $this->user->name ?? 'Staff';
    }
}
