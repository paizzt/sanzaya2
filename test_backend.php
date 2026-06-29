<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $att = App\Models\Attendance::with('user')->first();
    echo "Attendance OK. User: " . ($att ? ($att->user ? $att->user->name : 'No user rel') : 'No attendance record') . "\n";
    $req = App\Models\AttendanceRequest::with('user')->first();
    echo "Request OK. User: " . ($req ? ($req->user ? $req->user->name : 'No user rel') : 'No request record') . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
