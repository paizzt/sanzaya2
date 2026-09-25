<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WbsReport extends Model
{
    protected $fillable = [
        'description',
        'file_path'
    ];
}
