<?php
require __DIR__ . "/vendor/autoload.php";
$app = require_once __DIR__ . "/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pts = \App\Models\SyncLogistikData::select("nama_pt")->distinct()->get()->pluck("nama_pt");
print_r($pts->toArray());

$pts2 = \App\Models\Company::select("name")->distinct()->get()->pluck("name");
print_r($pts2->toArray());
?>
