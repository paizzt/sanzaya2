<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\FeatureToggle;

// 1. Give basic payment-request permissions to ALL roles
$basicPermissions = [
    'payment-request.view-own',
    'payment-request.create',
    'payment-request.update-own',
    'payment-request.delete-draft',
    'payment-request.submit',
];

// Ensure they exist
foreach ($basicPermissions as $perm) {
    Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
}

$roles = Role::all();
foreach ($roles as $role) {
    // Only give if the role doesn't have them
    foreach ($basicPermissions as $perm) {
        if (!$role->hasPermissionTo($perm)) {
            $role->givePermissionTo($perm);
            echo "Gave $perm to role {$role->name}\n";
        }
    }
}

// 2. Ensure Feature Toggle exists for Pengajuan Pembayaran
$toggleName = 'Menu Pengajuan Pembayaran';
$toggle = FeatureToggle::firstOrCreate(
    ['name' => $toggleName],
    ['is_active' => true, 'disabled_for_users' => '[]']
);
echo "Feature Toggle '$toggleName' verified. ID: {$toggle->id}\n";

echo "Done fixing permissions and feature toggles.\n";
