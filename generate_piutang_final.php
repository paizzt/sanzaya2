<?php
$file = 'c:\\xampp\\htdocs\\sanzaya2\\RINCIAN PIUTANG SANZAYA GROUP 2026 - DASBOARD.csv';
$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$output = "-- Update Script Piutang Sesuai Struktur Database Baru\n-- Aman untuk PT lain (PT MSI, CV Meraki, dll)\n\n";

function cleanNumber($str) {
    if (!$str || $str == '-' || trim($str) == 'Rp -' || trim($str) == 'Rp -') return 0;
    $str = str_replace(['Rp', '.', ' ', '"'], '', $str);
    $str = str_replace(',', '.', $str);
    if (!is_numeric($str)) return 0;
    return (float) $str;
}

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

    // Insert outlet if not exist
    $output .= "INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT '$nama', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = '$nama');\n";
    $output .= "SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = '$nama' LIMIT 1);\n\n";

    // PT Sanzaya (id 2)
    if ($sanzaya_total > 0) {
        $details = [];
        if ($sanzaya_2024 > 0) $details[] = ['year' => '2024', 'amount' => (string)$sanzaya_2024];
        if ($sanzaya_2025 > 0) $details[] = ['year' => '2025', 'amount' => (string)$sanzaya_2025];
        if ($sanzaya_2026 > 0) $details[] = ['year' => '2026', 'amount' => (string)$sanzaya_2026];
        $json = addslashes(json_encode($details));
        
        $output .= "DELETE FROM `receivables` WHERE `outlet_id` = @outlet_id AND `company_id` = 2;\n";
        $output .= "INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '$json', $sanzaya_total, NOW(), NOW());\n";
    }

    // PT Ruma (id 1)
    if ($ruma_total > 0) {
        $details = [];
        if ($ruma_2025 > 0) $details[] = ['year' => '2025', 'amount' => (string)$ruma_2025];
        if ($ruma_2026 > 0) $details[] = ['year' => '2026', 'amount' => (string)$ruma_2026];
        $json = addslashes(json_encode($details));
        
        $output .= "DELETE FROM `receivables` WHERE `outlet_id` = @outlet_id AND `company_id` = 1;\n";
        $output .= "INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '$json', $ruma_total, NOW(), NOW());\n";
    }

    // PT Harkes (id 4)
    if ($harkes > 0) {
        $details = [];
        $details[] = ['year' => '2026', 'amount' => (string)$harkes]; // Assumption: it's for 2026, or we can just use "Total" as year. The UI probably expects a year. Let's use "2026".
        $json = addslashes(json_encode($details));
        
        $output .= "DELETE FROM `receivables` WHERE `outlet_id` = @outlet_id AND `company_id` = 4;\n";
        $output .= "INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 4, '$json', $harkes, NOW(), NOW());\n";
    }
    
    $output .= "\n";
}

file_put_contents('c:\\xampp\\htdocs\\sanzaya2\\update_piutang_final.sql', $output);
echo "Done final.";
