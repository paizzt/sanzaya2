<?php
require 'vendor/autoload.php';
\ = require_once 'bootstrap/app.php';
\->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
\ = DB::table('sync_logistik_data')->pluck('tanggal')->unique();
foreach(\ as \) {
    if(\ && !strtotime(str_replace('/', '-', \))) {
        echo \ . PHP_EOL;
    }
}
