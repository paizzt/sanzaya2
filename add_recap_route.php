<?php
$filename = 'routes/web.php';
$c = file_get_contents($filename);
$search = "Route::get('/marketing/recap-all/pdf', [\App\Http\Controllers\MarketingRecapController::class, 'exportPdf'])->name('marketing.recap.pdf');";
$replace = $search . "\n    Route::get('/marketing/recap-all/excel', [\App\Http\Controllers\MarketingRecapController::class, 'exportExcel'])->name('marketing.recap.excel');";
$c = str_replace($search, $replace, $c);
file_put_contents($filename, $c);
echo "Done";
