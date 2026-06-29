<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Crypt;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $guarded = ['id'];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'start_date' => 'date',
            'is_active' => 'boolean',
            'require_password_change' => 'boolean',
        ];
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Crypt::encryptString($value);
    }

    public function getDecryptedPassword()
    {
        try {
            return Crypt::decryptString($this->password);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function marketingAreas()
    {
        return $this->belongsToMany(MarketingArea::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
