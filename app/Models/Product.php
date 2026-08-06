<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class Product extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'code',
        'price',
        'description',
        'is_active',
        'jenis',
        'link',
        'provider_id',
        'registration_no',
        'qty',
        'unit',
        'tkdn',
        'hna',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'hna' => 'decimal:2',
        'tkdn' => 'decimal:2',
        'qty' => 'integer',
    ];
}
