<?php

// 1. Patch UcHistory.jsx
$f = 'resources/js/Pages/Requests/UcHistory.jsx';
$c = file_get_contents($f);
if (strpos($c, 'import ExportDropdown') === false) {
    $c = str_replace('import { Head', "import ExportDropdown from '@/Components/ExportDropdown';\nimport { Head", $c);
}

$c = preg_replace(
    '/<a\s+href=\{route\(\'requests\.uc\.pdf\',\s*req\.id\)\}\s+className="([^"]+)"\s*>\s*<Download className="([^"]+)"\s*\/>\s*Unduh PDF\s*<\/a>/s',
    '<ExportDropdown pdfRoute={route(\'requests.uc.pdf\', req.id)} trigger={
                                                <button className="$1">
                                                    <Download className="$2" /> Unduh PDF
                                                </button>
                                            } />',
    $c
);
file_put_contents($f, $c);
echo "Patched UcHistory.jsx\n";

// 2. Patch BhpRecap.jsx
$f = 'resources/js/Pages/Requests/BhpRecap.jsx';
$c = file_get_contents($f);

// Match 1: <FileBarChart className="w-4 h-4" /> Unduh PDF
$c = preg_replace(
    '/<a\s+href=\{exportUrl\}\s+target="_blank"\s+rel="noreferrer"\s+className="([^"]+)"\s*>\s*<FileBarChart className="([^"]+)"\s*\/>\s*Unduh PDF\s*<\/a>/s',
    '<ExportDropdown pdfRoute={exportUrl} trigger={
                                        <button className="$1">
                                            <FileBarChart className="$2" /> Unduh PDF
                                        </button>
                                    } />',
    $c
);

// Match 2: <Download className="w-4 h-4" /> Unduh PDF Form Ini
$c = preg_replace(
    '/<a\s+href=\{route\(\'requests\.bhp\.pdf\',\s*selectedRequest\.id\)\}\s+className="([^"]+)"\s*>\s*<Download className="([^"]+)"\s*\/>\s*Unduh PDF Form Ini\s*<\/a>/s',
    '<ExportDropdown pdfRoute={route(\'requests.bhp.pdf\', selectedRequest.id)} trigger={
                                        <button className="$1">
                                            <Download className="$2" /> Unduh PDF Form Ini
                                        </button>
                                    } />',
    $c
);

file_put_contents($f, $c);
echo "Patched BhpRecap.jsx remainders\n";
