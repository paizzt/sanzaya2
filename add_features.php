<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$features = [
    ['name' => 'Menu Data Outlet'],
    ['name' => 'Menu Rekap Semua Marketing'],
    ['name' => 'Menu Data Armada'],
    ['name' => 'Menu Data Penyedia'],
    ['name' => 'Menu Notifikasi'],
    ['name' => 'Menu Pengaturan'],
    ['name' => 'Menu Dashboard']
];
foreach ($features as $f) {
    $toggle = App\Models\FeatureToggle::where('name', $f['name'])->first();
    if (!$toggle) {
        $toggle = new App\Models\FeatureToggle();
        $toggle->name = $f['name'];
        $toggle->is_active = true;
        $toggle->save();
    }
}
