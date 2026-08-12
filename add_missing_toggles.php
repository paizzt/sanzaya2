<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\FeatureToggle;

$features = [
    26 => 'Persetujuan Pembayaran',
    27 => 'Riwayat Perubahan',
    28 => 'Manajemen SOP'
];

foreach ($features as $id => $name) {
    FeatureToggle::updateOrCreate(
        ['id' => $id],
        ['name' => $name, 'is_active' => true, 'disabled_for_users' => '[]']
    );
    echo "Verified Feature Toggle ID $id: $name\n";
}
