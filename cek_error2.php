<?php
$possiblePaths = [
    __DIR__ . '/storage/logs/laravel.log',
    __DIR__ . '/../storage/logs/laravel.log',
    __DIR__ . '/../../storage/logs/laravel.log',
];

$found = false;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        echo "<b>Found log at: $path</b><br><br>";
        $lines = file($path);
        $lastLines = array_slice($lines, -40);
        echo "<pre>";
        foreach ($lastLines as $line) {
            echo htmlspecialchars($line);
        }
        echo "</pre>";
        $found = true;
        break;
    }
}

if (!$found) {
    echo "Could not find laravel.log.";
}
