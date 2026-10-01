<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$att = App\Models\Attendance::first();
if (!$att) {
    echo "No attendance records found.\n";
    exit;
}
echo "Before: In=" . $att->check_in_time . " Out=" . $att->check_out_time . "\n";
$newIn = '10:10:' . rand(10, 50);
$newOut = '18:10:' . rand(10, 50);
$att->check_in_time = $newIn;
$att->check_out_time = $newOut;
$saved = $att->save();
echo "Attempted saving to In=$newIn Out=$newOut\n";
echo "Saved: " . ($saved ? 'true' : 'false') . "\n";

$att->refresh();
echo "After: In=" . $att->check_in_time . " Out=" . $att->check_out_time . "\n";
