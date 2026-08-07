<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test Marketing
$user = App\Models\User::find(1);
Auth::login($user);

echo "Is Admin: " . ($user->isAdminUser() ? 'Yes' : 'No') . "\n";
echo "Roles: " . json_encode($user->roles->pluck('name')) . "\n";

$spreadsheetSalesName = $user->spreadsheet_sales_name;
echo "Spreadsheet Sales Name: " . var_export($spreadsheetSalesName, true) . "\n";

request()->headers->set('X-Inertia', 'true');

$ctrl = new App\Http\Controllers\MarketingDailyReportController();
$res = $ctrl->index();
$content = json_decode($res->toResponse(request())->getContent());
echo "Marketing Props: " . json_encode($content->props->spreadsheet ?? null) . "\n";
echo "Marketing Target: " . json_encode($content->props->target ?? null) . "\n";

// Test Users
$ctrl2 = new App\Http\Controllers\UserController();
$res2 = $ctrl2->index();
$content2 = json_decode($res2->toResponse(request())->getContent());
$users = $content2->props->users ?? [];
echo "Users count: " . count($users) . "\n";
