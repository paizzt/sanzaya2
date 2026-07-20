<?php
$f = 'resources/js/Pages/Marketing/Index.jsx';
$c = file_get_contents($f);
if (strpos($c, 'import ExportDropdown') === false) {
    $c = str_replace('import { Head', "import ExportDropdown from '@/Components/ExportDropdown';\nimport { Head", $c);
}

// 1. Laporan Harian PDF
$c = preg_replace(
    '/<a href=\{route\(\'marketing\.export\.pdf\'\)\} className="([^"]+)">\s*<Download className="([^"]+)" \/>\s*Export PDF\s*<\/a>/s',
    '<ExportDropdown pdfRoute={route(\'marketing.export.pdf\')} excelRoute={route(\'marketing.export.excel\')} trigger={
                                        <button className="$1">
                                            <Download className="$2" /> Export
                                        </button>
                                    } />',
    $c
);

// 2. Target Mingguan PDF
$c = preg_replace(
    '/<a href=\{route\(\'marketing\.export_target\.pdf\'\)\} className="([^"]+)">\s*<Download className="([^"]+)" \/>\s*Export PDF\s*<\/a>/s',
    '<ExportDropdown pdfRoute={route(\'marketing.export_target.pdf\')} trigger={
                                        <button className="$1">
                                            <Download className="$2" /> Export
                                        </button>
                                    } />',
    $c
);

file_put_contents($f, $c);
echo "Patched Marketing/Index.jsx\n";
