<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WbsMessage extends Model
{
    protected $fillable = [
        'wbs_report_id',
        'user_id',
        'message',
        'is_admin'
    ];

    public function report()
    {
        return $this->belongsTo(WbsReport::class, 'wbs_report_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
