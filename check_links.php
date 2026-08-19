<?php
$dir = new RecursiveDirectoryIterator('c:/xampp/htdocs/sanzaya2/resources/js/Pages');
$iterator = new RecursiveIteratorIterator($dir);

foreach ($iterator as $file) {
    if ($file->getExtension() == 'jsx') {
        $content = file_get_contents($file->getPathname());
        if (strpos($content, '<Link') !== false && !preg_match('/import\s+\{[^}]*\bLink\b[^}]*\}\s+from\s+[\'"]@inertiajs\/react[\'"]/i', $content)) {
            echo "Missing Link import: " . $file->getPathname() . PHP_EOL;
        }
    }
}
