<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sop extends Model
{
    protected $fillable = ['sop_division_id', 'title', 'description', 'steps', 'image'];

    protected $casts = [
        'steps' => 'array',
    ];

    public function sopDivision()
    {
        return $this->belongsTo(SopDivision::class);
    }
}
