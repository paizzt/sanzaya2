<?php
$file = 'app/Http/Controllers/UcRequestController.php';
$c = file_get_contents($file);
$lines = explode("\n", $c);
$seen = [];
$out = [];
foreach ($lines as $line) {
    if (strpos($line, 'use ') === 0) {
        $key = trim($line);
        if (isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
    }
    $out[] = $line;
}
file_put_contents($file, implode("\n", $out));
