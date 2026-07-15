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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    //
}
