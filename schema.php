<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = DB::select('SELECT name FROM sqlite_master WHERE type=\'table\' AND name NOT IN (\'sqlite_sequence\', \'migrations\', \'password_reset_tokens\', \'personal_access_tokens\', \'failed_jobs\', \'cache\', \'cache_locks\', \'jobs\', \'job_batches\', \'sessions\');');

foreach($tables as $t) {
    echo "Table: {$t->name}\n";
    $cols = DB::select("PRAGMA table_info({$t->name})");
    foreach($cols as $c) {
        echo "- {$c->name} ({$c->type})\n";
    }
    echo "\n";
}
