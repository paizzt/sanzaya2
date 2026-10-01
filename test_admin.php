<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$user = App\Models\User::where('name', 'FAISAL FAIZ')->first();
echo "FAISAL: " . ($user ? ($user->isAdminUser() ? 'Admin' : 'Not Admin') : 'Not found') . PHP_EOL;

$other = App\Models\User::where('name', '!=', 'FAISAL FAIZ')->first();
echo "OTHER: " . ($other ? ($other->isAdminUser() ? 'Admin' : 'Not Admin') : 'Not found') . PHP_EOL;
