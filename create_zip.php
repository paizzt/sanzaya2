<?php
$source = __DIR__;
$destination = dirname(__DIR__) . '/sanzaya2-cpanel.zip';

if (file_exists($destination)) {
    unlink($destination);
}

$zip = new ZipArchive();
if (!$zip->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
    die("Failed to create zip file");
}

$iterator = new RecursiveIteratorIterator(
    new RecursiveCallbackFilterIterator(
        new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS),
        function ($fileInfo, $key, $iterator) {
            $name = $fileInfo->getFilename();
            // Exclude these directories/files
            if ($fileInfo->isDir() && in_array($name, ['node_modules', '.git'])) {
                return false;
            }
            if ($name === 'sanzaya2-cpanel.zip') {
                return false;
            }
            return true;
        }
    )
);

foreach ($iterator as $file) {
    if (!$file->isDir()) {
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($source) + 1);
        
        // Use error suppression to avoid warnings on locked files
        $content = @file_get_contents($filePath);
        if ($content !== false) {
            $zip->addFromString($relativePath, $content);
        }
    }
}

$zip->close();
echo "Zip created at $destination\n";
