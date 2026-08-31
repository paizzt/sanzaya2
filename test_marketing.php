<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = \App\Models\User::where('name', 'YANI')->first();
    Auth::login($user);
    $req = Illuminate\Http\Request::create('/marketing', 'GET');
    $res = $app->handle($req);
    echo "Status Code: " . $res->getStatusCode() . "\n";
    if ($res->getStatusCode() == 500) {
        if ($res->exception) {
            echo "Exception: " . $res->exception->getMessage() . "\n";
            echo $res->exception->getTraceAsString() . "\n";
        }
    }
} catch (Exception $e) {
    echo "Fatal Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
