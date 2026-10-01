<?php
$file = 'c:\\xampp\\htdocs\\sanzaya2\\RINCIAN PIUTANG SANZAYA GROUP 2026 - DASBOARD.csv';
$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$output = "TRUNCATE TABLE `receivables`;\n\nINSERT INTO `receivables` (`nama_outlet`, `tahun_1`, `tahun_2`, `tahun_3`, `tahun_4`, `total_sanzaya`, `ruma_1`, `ruma_2`, `ruma_3`, `total_ruma`, `total_gabungan`, `created_at`, `updated_at`) VALUES\n";

function cleanNumber($str) {
    if (!$str || $str == '-' || trim($str) == 'Rp -' || trim($str) == 'Rp -') return '0';
    $str = str_replace(['Rp', '.', ' ', '"'], '', $str);
    $str = str_replace(',', '.', $str);
    if (!is_numeric($str)) return '0';
    return $str;
}

$values = [];
$started = false;

foreach ($lines as $line) {
    $data = str_getcsv($line, ',', '"');
    if (count($data) < 20) continue;
    
    $no = trim($data[6]);
    if (!is_numeric($no)) {
        if (trim($data[7]) == 'GRAND TOTAL') break;
        continue;
    }
    
    $nama = trim($data[7]);
    if (empty($nama)) continue;

    $sanzaya_2024 = cleanNumber($data[8]);
    $sanzaya_2025 = cleanNumber($data[9]);
    $sanzaya_2026 = cleanNumber($data[10]);
    $sanzaya_total = cleanNumber($data[11]);
    
    $ruma_2025 = cleanNumber($data[13]);
    $ruma_2026 = cleanNumber($data[14]);
    $ruma_total = cleanNumber($data[15]);
    
    // For Harkes, we only have one column. Let's map it to ruma_3 (or maybe they added harkes to the migration?)
    // Let's check the receivables table migration again, but for now we map:
    // tahun_1 = sanzaya_2024, tahun_2 = sanzaya_2025, tahun_3 = sanzaya_2026
    // ruma_1 = ruma_2025, ruma_2 = ruma_2026, ruma_3 = harkes (as a workaround, but wait, the total_gabungan includes Harkes?)
    
    $harkes = cleanNumber($data[17]);
    $total_gabungan = cleanNumber($data[19]);
    
    $v = sprintf("('%s', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())", 
        addslashes($nama),
        $sanzaya_2024, // tahun_1 (2024)
        $sanzaya_2025, // tahun_2 (2025)
        $sanzaya_2026, // tahun_3 (2026)
        0, // tahun_4
        $sanzaya_total,
        $ruma_2025, // ruma_1
        $ruma_2026, // ruma_2
        $harkes, // ruma_3 -> using for harkes
        $ruma_total, // total ruma
        $total_gabungan
    );
    $values[] = $v;
}

$output .= implode(",\n", $values) . ";\n";

file_put_contents('c:\\xampp\\htdocs\\sanzaya2\\update_piutang_baru.sql', $output);
echo "Berhasil membuat file update_piutang_baru.sql dengan " . count($values) . " data.\n";
