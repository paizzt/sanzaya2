<?php

namespace App\Models;

use App\Traits\LogsActivity;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use LogsActivity;

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
            'password' => 'hashed',
            'birth_date' => 'date',
            'start_date' => 'date',
            'is_active' => 'boolean',
            'require_password_change' => 'boolean',
            'preferences' => 'array',
            'allowed_companies' => 'array',
        ];
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

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function latestPayroll()
    {
        return $this->hasOne(Payroll::class)->latestOfMany();
    }

    /**
     * Get list of allowed company IDs for this user.
     * Returns null if user is Super Admin or has unrestricted access.
     */
    public function getAllowedCompanyIds(): ?array
    {
        if ($this->hasAnyRole(['Super Admin', 'super_admin', 'super-admin', 'Superadmin', 'superadmin', 'SUPERADMIN', 'SUPER ADMIN'])) {
            return null; // Null means all access
        }
        if ($this->allowed_companies !== null && is_array($this->allowed_companies)) {
            return array_values(array_map('intval', array_filter($this->allowed_companies)));
        }
        if ($this->company_id) {
            return [(int)$this->company_id];
        }
        return null;
    }

    /**
     * Get list of allowed company names for this user.
     * Returns null if user has unrestricted access.
     */
    public function getAllowedCompanyNames(): ?array
    {
        $ids = $this->getAllowedCompanyIds();
        if ($ids === null) {
            return null;
        }
        return \App\Models\Company::whereIn('id', $ids)->pluck('name')->toArray();
    }

    /**
     * Check if user has admin-level role.
     * Centralized helper to avoid hardcoded role arrays across controllers.
     */
    public function isAdminUser(): bool
    {
        return $this->hasAnyRole(['Superadmin', 'Admin', 'Manager', 'Direktur']);
    }

    /**
     * Check if user has satpam (security guard) role or division.
     */
    public function isSatpam(): bool
    {
        if ($this->hasAnyRole(['SATPAM', 'Satpam', 'satpam', 'SECURITY', 'Security', 'security'])) {
            return true;
        }
        if ($this->division && in_array(strtoupper(trim($this->division->name)), ['SATPAM', 'SECURITY', 'SATPAM/SECURITY'])) {
            return true;
        }
        return false;
    }
}
