<?php
$filename = "c:/xampp/htdocs/sanzaya2/routes/web.php";
$content = file_get_contents($filename);

$routesToAdd = [
    "Route::get('/logistic-reports-export-pdf', [\\App\\Http\\Controllers\\LogisticReportController::class, 'exportPdf'])->name('logistic-reports.export.pdf');\n    Route::get('/logistic-reports-export-excel', [\\App\\Http\\Controllers\\LogisticReportController::class, 'exportExcel'])->name('logistic-reports.export.excel');",
    "Route::get('/purchase-orders-export-pdf', [\\App\\Http\\Controllers\\PurchaseOrderController::class, 'exportPdf'])->name('purchase-orders.export.pdf');\n    Route::get('/purchase-orders-export-excel', [\\App\\Http\\Controllers\\PurchaseOrderController::class, 'exportExcel'])->name('purchase-orders.export.excel');",
    "Route::get('/receivables-export-pdf', [\\App\\Http\\Controllers\\ReceivableController::class, 'exportPdf'])->name('receivables.export.pdf');\n    Route::get('/receivables-export-excel', [\\App\\Http\\Controllers\\ReceivableController::class, 'exportExcel'])->name('receivables.export.excel');",
    "Route::get('/payables-export-pdf', [\\App\\Http\\Controllers\\PayableController::class, 'exportPdf'])->name('payables.export.pdf');\n    Route::get('/payables-export-excel', [\\App\\Http\\Controllers\\PayableController::class, 'exportExcel'])->name('payables.export.excel');",
    "Route::get('/company-export-pdf', [\\App\\Http\\Controllers\\CompanyController::class, 'exportPdf'])->name('company.export.pdf');\n    Route::get('/company-export-excel', [\\App\\Http\\Controllers\\CompanyController::class, 'exportExcel'])->name('company.export.excel');",
    "Route::get('/outlets-export-pdf', [\\App\\Http\\Controllers\\OutletController::class, 'exportPdf'])->name('outlets.export.pdf');\n    Route::get('/outlets-export-excel', [\\App\\Http\\Controllers\\OutletController::class, 'exportExcel'])->name('outlets.export.excel');",
    "Route::get('/vehicles-export-pdf', [\\App\\Http\\Controllers\\VehicleController::class, 'exportPdf'])->name('vehicles.export.pdf');\n    Route::get('/vehicles-export-excel', [\\App\\Http\\Controllers\\VehicleController::class, 'exportExcel'])->name('vehicles.export.excel');",
    "Route::get('/providers-export-pdf', [\\App\\Http\\Controllers\\ProviderController::class, 'exportPdf'])->name('providers.export.pdf');\n    Route::get('/providers-export-excel', [\\App\\Http\\Controllers\\ProviderController::class, 'exportExcel'])->name('providers.export.excel');",
    "Route::get('/products-export-pdf', [\\App\\Http\\Controllers\\ProductController::class, 'exportPdf'])->name('products.export.pdf');\n    Route::get('/products-export-excel', [\\App\\Http\\Controllers\\ProductController::class, 'exportExcel'])->name('products.export.excel');",
    "Route::get('/users-export-pdf', [\\App\\Http\\Controllers\\UserController::class, 'exportPdf'])->name('users.export.pdf');\n    Route::get('/users-export-excel', [\\App\\Http\\Controllers\\UserController::class, 'exportExcel'])->name('users.export.excel');",
    "Route::get('/marketing-export-pdf', [\\App\\Http\\Controllers\\MarketingDailyReportController::class, 'exportPdf'])->name('marketing.export.pdf');\n    Route::get('/marketing-export-excel', [\\App\\Http\\Controllers\\MarketingDailyReportController::class, 'exportExcel'])->name('marketing.export.excel');",
    "Route::get('/uc-export-pdf', [\\App\\Http\\Controllers\\UcRequestController::class, 'exportPdf'])->name('requests.uc.export.pdf');\n    Route::get('/uc-export-excel', [\\App\\Http\\Controllers\\UcRequestController::class, 'exportExcel'])->name('requests.uc.export.excel');",
    "Route::get('/uc-approval-export-pdf', [\\App\\Http\\Controllers\\UcApprovalController::class, 'exportPdf'])->name('requests.uc.approval.export.pdf');\n    Route::get('/uc-approval-export-excel', [\\App\\Http\\Controllers\\UcApprovalController::class, 'exportExcel'])->name('requests.uc.approval.export.excel');"
];

$routesString = "\n\n    // Added Export Routes\n    " . implode("\n    ", $routesToAdd) . "\n\n";

if (strpos($content, '// Added Export Routes') === false) {
    $content = preg_replace('/(Route::middleware\(\[\'auth\',\s*\'verified\'\]\)->group\(function\s*\(\)\s*\{)/', "$1$routesString", $content);
    file_put_contents($filename, $content);
    echo "Routes added to web.php\n";
} else {
    echo "Routes already exist.\n";
}
