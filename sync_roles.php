<?php
$users = App\Models\User::all();
foreach($users as $user) {
    if ($user->hasRole('Manager') || $user->hasRole('HR')) { $user->assignRole('MANAJEMEN'); $user->removeRole('Manager'); $user->removeRole('HR'); }
    if ($user->hasRole('General Accounting') || $user->hasRole('Finance')) { $user->assignRole('FINANCE'); $user->removeRole('General Accounting'); $user->removeRole('Finance'); }
    if ($user->hasRole('Direktur') || $user->hasRole('Superadmin')) { $user->assignRole('SUPERADMIN'); $user->removeRole('Direktur'); $user->removeRole('Superadmin'); }
    if ($user->hasRole('Karyawan') || $user->hasRole('Admin')) { $user->assignRole('STAFF'); $user->removeRole('Karyawan'); $user->removeRole('Admin'); }
    if ($user->hasRole('Sales')) { $user->assignRole('MARKETING'); $user->removeRole('Sales'); }
    if ($user->hasRole('Logistik')) { $user->assignRole('LOGISTIK'); $user->removeRole('Logistik'); }
}

$oldRoles = ['Manager', 'General Accounting', 'Direktur', 'Finance', 'Karyawan', 'Admin', 'Sales', 'HR', 'Superadmin', 'Logistik'];
Spatie\Permission\Models\Role::whereIn('name', $oldRoles)->delete();
