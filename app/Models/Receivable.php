<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;

class Receivable extends Model
{
    use LogsActivity;

    protected $guarded = [];

    protected $casts = [
        'details' => 'array',
    ];
}
