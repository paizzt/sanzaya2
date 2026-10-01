<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Validator;

function testRegex($time) {
    $v = Validator::make(['time' => $time], [
        'time' => ['nullable', 'regex:/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/']
    ]);
    if ($v->fails()) {
        return "Failed: " . implode(", ", $v->errors()->all());
    }
    return "Passed";
}

echo "09:00 -> " . testRegex("09:00") . "\n";
echo "09:00:00 -> " . testRegex("09:00:00") . "\n";
echo "9:00 -> " . testRegex("9:00") . "\n";
echo "9:00:00 -> " . testRegex("9:00:00") . "\n";
echo "08:37:50 -> " . testRegex("08:37:50") . "\n";
