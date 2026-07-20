<?php
function checkDir($dir) {
    $files = glob($dir . '/*');
    foreach($files as $file) {
        if (is_dir($file)) {
            checkDir($file);
        } else if (substr($file, -4) === '.jsx') {
            $content = file_get_contents($file);
            if (preg_match('/window\.open\([^)]*pdf[^)]*\)/i', $content)) {
                echo "Still has window.open pdf: $file\n";
            }
            if (preg_match('/<a[^>]+href=\{[^}]*pdf[^}]*\}[^>]*>/i', $content)) {
                if (strpos($content, '<ExportDropdown') === false) {
                    echo "Still has a href pdf without ExportDropdown: $file\n";
                }
            }
        }
    }
}
checkDir(__DIR__ . '/resources/js/Pages');
echo "Done checking remaining.\n";
