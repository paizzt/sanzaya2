<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\AttendanceRecapController;
use Illuminate\Http\Request;

try {
    $request = Request::create('/absensi/rekap', 'GET', [
        'month' => 10,
        'year' => 2026,
        'user_id' => 'all'
    ]);

    // Bypass auth
    \Auth::loginUsingId(1); // User 1 is TUHAN

    $controller = new AttendanceRecapController();
    $response = $controller->index($request);

    echo "Status: " . $response->getStatusCode() . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
} catch (\Error $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
