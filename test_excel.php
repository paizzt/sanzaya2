<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$export = new \App\Exports\GenericExport(collect([['a', 'b']]), ['Col1', 'Col2']);
$html = \Maatwebsite\Excel\Facades\Excel::raw($export, \Maatwebsite\Excel\Excel::HTML);
echo $html;
