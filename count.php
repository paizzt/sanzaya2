<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo 'Receivables: '.\App\Models\Receivable::count()."\n";
echo 'Payables: '.\App\Models\Payable::count()."\n";
echo 'PurchaseOrders: '.\App\Models\PurchaseOrder::count()."\n";
echo 'LogisticReports: '.\App\Models\LogisticReport::count()."\n";
echo 'ItemRequirements: '.\App\Models\ItemRequirement::count()."\n";
