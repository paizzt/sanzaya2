<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pr = App\Models\PaymentRequest::first();
if (!$pr) {
    echo "No PR found.";
    exit;
}

$controller = new App\Http\Controllers\PaymentRequestController();
try {
    $controller->downloadPdf($pr);
    echo 'Success';
} catch (\Exception $e) {
    echo $e->getMessage();
}
