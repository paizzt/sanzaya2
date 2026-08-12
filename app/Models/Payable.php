<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;

class Payable extends Model
{
    use LogsActivity;

    protected $guarded = [];

    protected $appends = ['umur_hutang'];

    protected function casts(): array
    {
        return [
            'tanggal_terima_invoice' => 'date',
        ];
    }

    public function getUmurHutangAttribute()
    {
        if (!$this->tanggal_terima_invoice || !$this->jatuh_tempo_hari) return 0;
        
        $dueDate = \Carbon\Carbon::parse($this->tanggal_terima_invoice)->addDays($this->jatuh_tempo_hari);
        $now = \Carbon\Carbon::now()->startOfDay();
        
        if ($now->greaterThan($dueDate)) {
            return $dueDate->diffInDays($now);
        }
        
        return 0;
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
