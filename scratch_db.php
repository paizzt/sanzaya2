<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$r = Illuminate\Support\Facades\DB::table('sync_logistik_data')->select('tanggal', 'sheet_name')->take(10)->get();
echo json_encode($r, JSON_PRETTY_PRINT);
