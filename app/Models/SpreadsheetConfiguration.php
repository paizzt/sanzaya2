<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpreadsheetConfiguration extends Model
{
    protected $guarded = [];
    protected $casts = [
        'sheets_config' => 'array',
    ];
}
