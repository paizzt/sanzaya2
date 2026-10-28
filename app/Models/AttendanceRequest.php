<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRequest extends Model
{
    protected $guarded = [];

    protected $appends = ['attachment_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if (!$this->attachment) {
            return null;
        }

        if (str_starts_with($this->attachment, 'http://') || str_starts_with($this->attachment, 'https://')) {
            return $this->attachment;
        }

        return asset('storage/' . $this->attachment);
    }
}
