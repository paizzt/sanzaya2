<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UcRequest extends Model
{
    protected $guarded = [];
    protected $casts = [
        'companions' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    //
}
