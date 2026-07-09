<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = \App\Models\User::role(['Sales', 'Marketing'])->pluck('name')->toArray();
if (empty($users)) {
    // maybe by department/division? Or just try filtering by role:
    $users = \App\Models\User::whereHas('roles', function($q) {
        $q->whereIn('name', ['Sales', 'Marketing', 'Manager', 'Direktur']);
    })->pluck('name')->toArray();
}
echo "Users: " . implode(', ', $users);
