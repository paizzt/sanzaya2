<?php
function checkDir($dir) {
    $files = glob($dir . '/*');
    foreach($files as $file) {
        if (is_dir($file)) {
            checkDir($file);
        } else if (substr($file, -4) === '.jsx') {
            $content = file_get_contents($file);
            $hasPdf = strpos($content, '.pdf') !== false || strpos($content, 'exportPdf') !== false || strpos($content, 'export-pdf') !== false || strpos($content, 'exportUrl') !== false;
            $hasDropdown = strpos($content, '<ExportDropdown') !== false;
            
            if ($hasPdf && !$hasDropdown) {
                echo $file . "\n";
            }
        }
    }
}
checkDir(__DIR__ . '/resources/js/Pages');
