<?php
use Spatie\Permission\Models\Role;
$roles = ['LOGISTIK', 'FINANCE', 'MANAJEMEN', 'MARKETING', 'SUPERADMIN', 'STAFF'];
foreach($roles as $r) {
    Role::firstOrCreate(['name' => $r, 'guard_name' => 'web']);
}
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
echo "Roles: " . Role::pluck('name');
