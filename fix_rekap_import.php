<?php
$f = 'resources/js/Pages/Absensi/Rekap.jsx';
$c = file_get_contents($f);
if (strpos($c, 'import ExportDropdown') === false) {
    $c = str_replace("import AuthenticatedLayout", "import ExportDropdown from '@/Components/ExportDropdown';\nimport AuthenticatedLayout", $c);
    file_put_contents($f, $c);
    echo "Imported ExportDropdown in Absensi/Rekap.jsx\n";
} else {
    echo "Already imported\n";
}
