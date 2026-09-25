<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WbsReport extends Model
{
    protected $fillable = [
        'description',
        'file_path',
        'status',
        'is_anonymous',
        'reporter_name',
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(WbsMessage::class);
    }
}
