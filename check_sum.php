<?php
$file = 'c:\\xampp\\htdocs\\sanzaya2\\RINCIAN PIUTANG SANZAYA GROUP 2026 - DASBOARD.csv';
$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

function cleanNumber($str) {
    if (!$str || $str == '-' || trim($str) == 'Rp -') return 0;
    $str = str_replace(['Rp', '.', ' ', '"'], '', $str);
    $str = str_replace(',', '.', $str);
    if (!is_numeric($str)) return 0;
    return (float) $str;
}

$sanzaya2024 = 0;
$sanzaya2025 = 0;
$sanzaya2026 = 0;
$sanzayaTotal = 0;
$ruma2025 = 0;
$ruma2026 = 0;
$rumaTotal = 0;
$harkes = 0;
$grandTotal = 0;

foreach ($lines as $line) {
    $data = str_getcsv($line, ',', '"');
    if (count($data) < 20) continue;
    
    $no = trim($data[6]);
    if (!is_numeric($no)) continue;
    
    $sanzaya2024 += cleanNumber($data[8]);
    $sanzaya2025 += cleanNumber($data[9]);
    $sanzaya2026 += cleanNumber($data[10]);
    $sanzayaTotal += cleanNumber($data[11]);
    $ruma2025 += cleanNumber($data[13]);
    $ruma2026 += cleanNumber($data[14]);
    $rumaTotal += cleanNumber($data[15]);
    $harkes += cleanNumber($data[17]);
    $grandTotal += cleanNumber($data[18]);
}

echo "Sanzaya 2024: $sanzaya2024\n";
echo "Sanzaya 2025: $sanzaya2025\n";
echo "Sanzaya 2026: $sanzaya2026\n";
echo "Sanzaya Total: $sanzayaTotal\n";
echo "Ruma 2025: $ruma2025\n";
echo "Ruma 2026: $ruma2026\n";
echo "Ruma Total: $rumaTotal\n";
echo "Harkes: $harkes\n";
echo "Grand Total: $grandTotal\n";
