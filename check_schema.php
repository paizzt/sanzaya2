<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$columns = Schema::getColumnListing('sync_logistik_data');
print_r($columns);
$samples = DB::table('sync_logistik_data')->select('sheet_name', 'tanggal')->limit(10)->get();
print_r($samples);
