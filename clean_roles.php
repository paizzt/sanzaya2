<?php
use App\Models\User;
use Spatie\Permission\Models\Role;

$users = User::all();
foreach($users as $user) {
    if ($user->hasRole('Admin Marketing')) { $user->assignRole('MARKETING'); $user->removeRole('Admin Marketing'); }
    if ($user->hasRole('Cleaning Services')) { $user->assignRole('STAFF'); $user->removeRole('Cleaning Services'); }
    if ($user->hasRole('Driver')) { $user->assignRole('STAFF'); $user->removeRole('Driver'); }
    if ($user->hasRole('Fakturis')) { $user->assignRole('STAFF'); $user->removeRole('Fakturis'); }
    if ($user->hasRole('Pjt')) { $user->assignRole('STAFF'); $user->removeRole('Pjt'); }
}

$extraOldRoles = ['Admin Marketing', 'Cleaning Services', 'Driver', 'Fakturis', 'Pjt'];
Role::whereIn('name', $extraOldRoles)->delete();

app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
echo "Extra roles cleaned up!\n";
