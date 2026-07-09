<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = \App\Models\User::whereHas('roles', function($q) {
    $q->whereIn('name', ['Sales']);
})->pluck('name')->toArray();

echo "Sales Users: " . implode(', ', $users);
