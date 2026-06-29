<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$f = new App\Models\FeatureToggle();
$f->name = 'Menu Dashboard Laporan';
$f->is_active = 1;
$f->save();

echo "Added FeatureToggle: " . $f->id . "\n";
