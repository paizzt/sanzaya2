<?php
$f = 'resources/js/Pages/Reports/Index.jsx';
$c = file_get_contents($f);
if (strpos($c, 'import ExportDropdown') === false) {
    $c = str_replace('import { Head', "import ExportDropdown from '@/Components/ExportDropdown';\nimport { Head", $c);
}

// Replace the 4 window.open calls with ExportDropdowns wrapping the <a> tags
$c = preg_replace(
    '/<a href="#" onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*setIsDownloadOpen\(false\);\s*window\.open\(route\(\'reports\.pdf\',\s*\{\s*tab:\s*tab,\s*period:\s*\'([^\']+)\'\s*\}\),\s*\'_blank\'\);\s*\}\}\s*className="([^"]+)">([^<]+)<\/a>/',
    '<ExportDropdown pdfRoute={route(\'reports.pdf\', { tab: tab, period: \'$1\' })} trigger={<a href="#" onClick={(e) => { e.preventDefault(); setIsDownloadOpen(false); }} className="$2">$3</a>} />',
    $c
);

file_put_contents($f, $c);
echo "Patched Reports/Index.jsx\n";
