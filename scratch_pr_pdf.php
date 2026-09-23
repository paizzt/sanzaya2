<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Find first PR
$pr = App\Models\PaymentRequest::first();
if (!$pr) {
    echo "No PR found.\n";
    exit;
}
echo "Found PR ID: " . $pr->id . "\n";

// Login as superadmin to bypass auth
$user = App\Models\User::where('email', 'like', '%superadmin%')->first() ?? App\Models\User::first();
Auth::login($user);

$request = Illuminate\Http\Request::create('/payment-requests/' . $pr->id . '/pdf', 'GET');
$response = $kernel->handle($request);

echo "Status Code: " . $response->getStatusCode() . "\n";
if ($response->getStatusCode() == 500 && isset($response->exception)) {
    echo $response->exception->getMessage() . "\n";
    echo $response->exception->getTraceAsString();
} else if ($response->getStatusCode() == 500) {
    echo $response->getContent();
}
