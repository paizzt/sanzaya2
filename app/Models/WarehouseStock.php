<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class WarehouseStock extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'code',
        'category',
        'quantity',
        'unit',
        'minimum_stock',
        'location',
        'notes',
        'link'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
    ];
}
