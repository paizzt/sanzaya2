<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$months = [
    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 
    5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 
    9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
];
$monthIndoManual = $months[\Carbon\Carbon::now()->month] . ' ' . \Carbon\Carbon::now()->year;
echo 'Current Month: ' . $monthIndoManual . PHP_EOL;

$data = \App\Models\SyncLogistikData::where('tanggal', 'LIKE', '%' . $monthIndoManual . '%')->get();
echo 'Records found: ' . $data->count() . PHP_EOL;
if ($data->count() > 0) {
    echo 'Sample tanggal: ' . $data->first()->tanggal . PHP_EOL;
}
