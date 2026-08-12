<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\FeatureToggle;
use Spatie\Permission\Models\Permission;

$features = FeatureToggle::all();
$users = User::all();

$featurePermissions = [
    1 => ['manage spreadsheet sync'],
    2 => ['view absensi'],
    3 => ['view marketing'],
    4 => ['view uc requests'],
    5 => ['view bhp requests'],
    6 => ['view users'],
    7 => ['view laporan finansial'],
    8 => ['approve uc requests'],
    9 => ['manage master data'],
    10 => ['view marketing'],
    11 => ['manage master data'],
    12 => ['manage master data'],
    16 => ['manage master data'],
    17 => ['view purchase orders'],
    18 => ['view purchase orders'],
    19 => ['view receivables'],
    20 => ['view payables'],
    21 => ['manage company'],
    22 => ['manage master data'],
    23 => ['manage master data'],
    24 => ['approve bhp requests'],
    25 => ['payment-request.view-own', 'payment-request.create', 'payment-request.update-own', 'payment-request.submit', 'payment-request.delete-draft'],
];

foreach ($users as $user) {
    $permissionsToGrant = [];
    foreach ($features as $feature) {
        $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
        // If user is NOT in disabled list, it means the feature is ENABLED for them
        if (!in_array($user->id, $disabledUsers)) {
            if (isset($featurePermissions[$feature->id])) {
                $permissionsToGrant = array_merge($permissionsToGrant, $featurePermissions[$feature->id]);
            }
        }
    }
    
    if (!empty($permissionsToGrant)) {
        $permissionsToGrant = array_unique($permissionsToGrant);
        // We only want to ensure these permissions are assigned.
        // syncPermissions replaces all direct permissions, which is what we want to keep it clean.
        $user->syncPermissions($permissionsToGrant);
        echo "Synced " . count($permissionsToGrant) . " direct permissions for user {$user->name} ({$user->id})\n";
    }
}

echo "All users synced successfully.\n";
