<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$newFeatures = [
    'Menu Kebutuhan Barang',
    'Menu Laporan Logistik',
    'Menu Surat Pesanan',
    'Menu Data Piutang',
    'Menu Data Hutang'
];

foreach ($newFeatures as $name) {
    $f = \App\Models\FeatureToggle::firstOrCreate(['name' => $name], ['is_active' => true]);
    echo "Feature: {$f->name}, ID: {$f->id}\n";
}
