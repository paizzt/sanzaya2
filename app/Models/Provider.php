<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    use LogsActivity;

    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'business_type',
        'address',
        'phone',
        'pic_name',
        'pic_phone',
        'notes',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
