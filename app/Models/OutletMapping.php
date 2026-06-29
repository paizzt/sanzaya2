<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutletMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'raw_name',
        'outlet_id',
        'is_confirmed'
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}
