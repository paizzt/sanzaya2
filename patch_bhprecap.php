<?php
$f = 'resources/js/Pages/Requests/BhpRecap.jsx';
$c = file_get_contents($f);
if (strpos($c, 'import ExportDropdown') === false) {
    $c = str_replace('import { Head', "import ExportDropdown from '@/Components/ExportDropdown';\nimport { Head", $c);
}
$c = preg_replace(
    '/<a\s+href=\{exportUrl\}\s+target="_blank"\s+rel="noreferrer"\s+className="([^"]+)"\s*>\s*<Download className="([^"]+)"\s*\/>\s*Unduh Rekap\s*<\/a>/s',
    '<ExportDropdown pdfRoute={exportUrl} trigger={
                                <button className="$1">
                                    <Download className="$2"/>
                                    Unduh Rekap
                                </button>
                            } />',
    $c
);
file_put_contents($f, $c);
echo "Patched BhpRecap\n";
