<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SopDivision extends Model
{
    protected $fillable = ['name'];

    public function sops()
    {
        return $this->hasMany(Sop::class);
    }
}
