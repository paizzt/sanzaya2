<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyTarget extends Model
{
    protected $fillable = ['name', 'monthly_target', 'annual_target'];

    public function companies()
    {
        return $this->hasMany(Company::class);
    }
}
