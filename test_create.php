<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    App\Models\MarketingDailyReport::create([
        'user_id' => 1,
        'activity_type' => 'Kunjungan',
        'visit_date' => '2026-10-05',
        'visit_time' => '15:17',
        'outlet_status' => 'Prospek Lama',
        'visit_type' => 'Kunjungan Awal',
        'issue_type' => 'Tidak Ada Kendala',
        'visit_result' => 'Test',
        'signature' => null
    ]);
    echo "Success\n";
} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
