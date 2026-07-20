<?php

function patchFile($f, $regex, $replacement) {
    if (!file_exists($f)) return;
    $c = file_get_contents($f);
    if (strpos($c, 'import ExportDropdown') === false) {
        $c = str_replace('import { Head', "import ExportDropdown from '@/Components/ExportDropdown';\nimport { Head", $c);
    }
    $c = preg_replace($regex, $replacement, $c);
    file_put_contents($f, $c);
    echo "Patched $f\n";
}

// 1. Marketing/Index.jsx
// It doesn't seem to have direct window.open or a href exports. Wait, let me check manually first.
