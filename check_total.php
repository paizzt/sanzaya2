<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$t = 0; 
foreach(DB::table('sync_logistik_data')->get() as $r) { 
    $t += (float) str_replace(['.', ','], ['', '.'], (string)$r->total); 
} 
echo "Total: " . $t . "\n";

$gt = 0; 
foreach(DB::table('sync_logistik_data')->get() as $r) { 
    $gt += (float) str_replace(['.', ','], ['', '.'], (string)$r->grand_total); 
} 
echo "Grand Total: " . $gt . "\n";
