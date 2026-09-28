<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'raw_name',
        'provider_id',
        'is_confirmed'
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
