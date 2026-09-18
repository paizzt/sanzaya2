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
        'latitude',
        'longitude',
        'radius',
        'company_target_id',
    ];

    public function target()
    {
        return $this->belongsTo(CompanyTarget::class, 'company_target_id');
    }
}
