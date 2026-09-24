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
        'link',
        'incoming_date',
        'po_date',
        'provider_id'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
        'incoming_date' => 'date',
        'po_date' => 'date',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
