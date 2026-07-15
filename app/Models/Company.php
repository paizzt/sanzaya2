<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'logo',
        'address',
    ];
}
