<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;

class Outlet extends Model
{
    use LogsActivity;

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
