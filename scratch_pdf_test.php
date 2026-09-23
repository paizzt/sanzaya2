<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/reports/pdf?tab=logistik&period=1_bulan&preview=1&datasets[]=logistik&months[]=8', 'GET');
$response = $kernel->handle($request);

echo $response->getStatusCode() . "\n";
if ($response->getStatusCode() == 500 && isset($response->exception)) {
    echo $response->exception->getMessage() . "\n";
    echo $response->exception->getTraceAsString();
} else if ($response->getStatusCode() == 500) {
    echo $response->getContent();
}
