<?php
$u = \App\Models\User::where('email', 'admin@gmail.com')->first();
if ($u) {
    echo "Direct permissions: " . json_encode($u->getDirectPermissions()->pluck('name')) . PHP_EOL;
    echo "All permissions: " . json_encode($u->getAllPermissions()->pluck('name')) . PHP_EOL;
}
