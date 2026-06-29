<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Outlet extends Model
{
    protected $guarded = [];

    public function marketingArea()
    {
        return $this->belongsTo(MarketingArea::class);
    }

    public function mappings()
    {
        return $this->hasMany(OutletMapping::class);
    }
}
