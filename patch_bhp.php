<?php
$f = 'resources/js/Pages/Requests/BHP.jsx';
$c = file_get_contents($f);
if (strpos($c, 'import ExportDropdown') === false) {
    $c = str_replace('import { Head', "import ExportDropdown from '@/Components/ExportDropdown';\nimport { Head", $c);
}
$c = preg_replace(
    '/<a\s+href=\{route\(\'requests\.bhp\.pdf\',\s*req\.id\)\}\s+className="([^"]+)"\s*>\s*<Download className="([^"]+)"\s*\/>\s*PDF\s*<\/a>/s',
    '<ExportDropdown pdfRoute={route(\'requests.bhp.pdf\', req.id)} trigger={
                                                <button className="$1">
                                                    <Download className="$2" /> PDF
                                                </button>
                                            } />',
    $c
);
file_put_contents($f, $c);
echo "Patched BHP.jsx\n";
