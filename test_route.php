<?php
require 'vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/reports?tab=logistik&search=&sales_filter=&outlet_filter=&pt_filter=&month_filter=', 'GET');
$controller = app()->make(App\Http\Controllers\ReportController::class);

try {
    $response = $controller->index($request);
    echo "SUCCESS\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getFile() . ":" . $e->getLine() . "\n";
    echo $e->getTraceAsString();
}
