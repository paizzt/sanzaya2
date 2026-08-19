<?php
$u = App\Models\User::where('name', 'Superadmin')->first();
if ($u) {
    $u->assignRole('SUPERADMIN');
    echo "Assigned SUPERADMIN to " . $u->name . "\n";
}
