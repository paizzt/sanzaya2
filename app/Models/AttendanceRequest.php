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
            if ($this->id && (str_contains($this->attachment, '://i.ibb.co/') || str_contains($this->attachment, '://i.ibb.co.com/'))) {
                try {
                    return route('absensi.pengajuan.attachment', $this->id);
                } catch (\Throwable $e) {
                    $cdnUrl = str_replace('://i.ibb.co/', '://i.ibb.co.com/', $this->attachment);
                    return 'https://wsrv.nl/?url=' . urlencode($cdnUrl);
                }
            }
            return $this->attachment;
        }

        return asset('storage/' . $this->attachment);
    }
}
