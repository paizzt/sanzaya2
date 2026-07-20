<?php
$f = 'resources/js/Pages/Absensi/Rekap.jsx';
$c = file_get_contents($f);
if (strpos($c, 'import ExportDropdown') === false) {
    $c = str_replace('import { Head, Link, useForm, router } from \'@inertiajs/react\';', "import { Head, Link, useForm, router } from '@inertiajs/react';\nimport ExportDropdown from '@/Components/ExportDropdown';", $c);
}
$c = preg_replace(
    '/<button\s+onClick=\{\(\) => window\.open\(route\(\'absensi\.rekap\.export-pdf\', \{ month: data\.month, year: data\.year, user_id: data\.user_id \}\), \'_blank\'\)\}\s+className="([^"]+)"\s*>\s*<Download className="([^"]+)"\/> Export PDF\s*<\/button>/s',
    '<ExportDropdown pdfRoute={route(\'absensi.rekap.export-pdf\', { month: data.month, year: data.year, user_id: data.user_id })} trigger={
                            <button className="$1">
                                <Download className="$2"/> Export PDF
                            </button>
                        } />',
    $c
);
file_put_contents($f, $c);
echo 'Patched Absensi/Rekap.jsx';
