<?php
$files = glob(__DIR__ . '/app/Http/Controllers/*.php');
foreach($files as $file) {
    $content = file_get_contents($file);
    if (strpos($content, '->download') !== false && strpos($content, "request()->has('preview')") === false) {
        echo "Missing preview condition in: " . basename($file) . "\n";
    }
}
echo "Done checking.\n";
