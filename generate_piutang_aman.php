<?php
$file = 'c:\\xampp\\htdocs\\sanzaya2\\RINCIAN PIUTANG SANZAYA GROUP 2026 - DASBOARD.csv';
$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$output = "-- Update Script Piutang (Aman untuk data/kolom PT lain)\n\n";

function cleanNumber($str) {
    if (!$str || $str == '-' || trim($str) == 'Rp -' || trim($str) == 'Rp -') return '0';
    $str = str_replace(['Rp', '.', ' ', '"'], '', $str);
    $str = str_replace(',', '.', $str);
    if (!is_numeric($str)) return '0';
    return $str;
}

$values = [];

foreach ($lines as $line) {
    $data = str_getcsv($line, ',', '"');
    if (count($data) < 20) continue;
    
    $no = trim($data[6]);
    if (!is_numeric($no)) {
        if (trim($data[7]) == 'GRAND TOTAL') break;
        continue;
    }
    
    $nama = addslashes(trim($data[7]));
    if (empty($nama)) continue;

    $sanzaya_2024 = cleanNumber($data[8]);
    $sanzaya_2025 = cleanNumber($data[9]);
    $sanzaya_2026 = cleanNumber($data[10]);
    $sanzaya_total = cleanNumber($data[11]);
    
    $ruma_2025 = cleanNumber($data[13]);
    $ruma_2026 = cleanNumber($data[14]);
    $ruma_total = cleanNumber($data[15]);
    
    $harkes = cleanNumber($data[17]);
    $total_gabungan = cleanNumber($data[19]);

    // 1. Pastikan nama_outlet ada di tabel (jika belum ada, buat baru kosong)
    $output .= "INSERT INTO `receivables` (`nama_outlet`) SELECT '$nama' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = '$nama');\n";
    
    // 2. Update kolom khusus Sanzaya, Ruma, & Harkes saja, tanpa menyentuh kolom lain
    $output .= "UPDATE `receivables` SET "
             . "`tahun_1` = $sanzaya_2024, "
             . "`tahun_2` = $sanzaya_2025, "
             . "`tahun_3` = $sanzaya_2026, "
             . "`total_sanzaya` = $sanzaya_total, "
             . "`ruma_1` = $ruma_2025, "
             . "`ruma_2` = $ruma_2026, "
             . "`ruma_3` = $harkes, "
             . "`total_ruma` = $ruma_total, "
             . "`total_gabungan` = $total_gabungan "
             . "WHERE `nama_outlet` = '$nama';\n\n";
}

file_put_contents('c:\\xampp\\htdocs\\sanzaya2\\update_piutang_aman.sql', $output);
echo "Berhasil membuat script aman.";
