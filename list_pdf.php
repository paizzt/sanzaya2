<?php
$files = glob(__DIR__ . '/app/Http/Controllers/*.php');
foreach($files as $file) {
    $content = file_get_contents($file);
    if (strpos($content, '.pdf') !== false) {
        echo basename($file) . "\n";
    }
}
