<?php
$data = [
    ["Roby Benyamin", "HADIR", "07:03:53", "17:14:14"],
    ["Akbar Saputra", "HADIR", "07:04:16", "19:06:37"],
    ["HAERUL", "HADIR", "07:49:01", "21:01:11"],
    ["Helga", "HADIR", "08:01:50", null],
    ["Yani", "HADIR", "08:07:05", null],
    ["Idawati", "HADIR", "08:08:27", null],
    ["adis", "HADIR", "08:09:19", "17:45:16"],
    ["Fikri", "HADIR", "08:11:10", null],
    ["Hijriah", "HADIR", "08:11:54", "18:29:11"],
    ["Melyani", "HADIR", "08:12:12", "18:11:55"],
    ["Akifah Hanaria Hawwa", "HADIR", "08:15:42", "18:23:09"],
    ["Chaidir Nursan", "HADIR", "08:17:35", null],
    ["ILHAM PURNAMA NURD", "HADIR", "08:23:42", null],
    ["Nur Safitri", "HADIR", "08:28:21", "17:58:16"],
    ["Sri Handayani", "HADIR", "08:33:18", "18:52:26"],
    ["Fadli Asdi", "HADIR", "08:36:40", null],
    ["Faiz", "HADIR", "08:38:08", null],
    ["Dilla", "HADIR", "08:43:23", "19:27:12"],
    ["Abdul", "HADIR", "08:43:59", null],
    ["Egi Saputra Chandra", "HADIR", "08:47:09", "23:08:26"],
    ["Azmirah", "HADIR", "08:58:08", "18:49:34"],
    ["fadjri", "IZIN", "09:06:17", null], 
    ["Mutiara Jamaluddin", "HADIR", "09:24:55", "19:36:38"],
    ["Fauzia", "HADIR", "09:25:53", "18:51:32"],
];

$sqlFile = "satw6559_sanzaya (5).sql";
$lines = file($sqlFile);
$users = [];
$inUsers = false;

foreach ($lines as $line) {
    if (strpos($line, "INSERT INTO `users`") !== false) {
        $inUsers = true;
    } else if ($inUsers && strpos($line, "INSERT INTO `") !== false) {
        $inUsers = false;
    }
    
    if ($inUsers) {
        preg_match_all("/^\(([0-9]+),\s*'([^']+)'/m", $line, $matches);
        if (count($matches[0]) > 0) {
            for ($i = 0; $i < count($matches[0]); $i++) {
                $id = $matches[1][$i];
                $name = $matches[2][$i];
                $users[$id] = $name;
            }
        }
    }
}

function findBestUser($query, $users) {
    $bestMatchId = null;
    $bestMatchScore = -1;
    $queryUpper = strtoupper(trim($query));
    
    // Strict matches first
    foreach ($users as $id => $name) {
        $nameUpper = strtoupper($name);
        if ($nameUpper === $queryUpper) {
            return $id;
        }
    }
    
    // Custom mapping for edge cases in this dataset
    $mappings = [
        "YANI" => null, // Ambiguous, skip
        "ADIS" => 39, // ADISTHA DWI ASTORY SUHARTO
        "FIKRI" => 20, // FIKRI ALMUKTASIM BILLAH
        "FAIZ" => 29, // FAISAL FAIZ
        "DILLA" => 16, // NUR FADHILA ? skip to be safe, but wait!
        "ABDUL" => 42, // ABDULLAH PARMANSYAH
        "AZMIRAH" => 35, // NUR AZMIRAH
        "FADJRI" => 45, // A. MUHAMMAD FADJRID
        "FAUZIA" => 34,
        "IDAWATI" => 12,
        "MELYANI" => 38,
        "NUR SAFITRI" => 37,
        "SRI HANDAYANI" => 27,
        "FADLI ASDI" => 6,
        "EGI SAPUTRA CHANDRA" => 23,
        "AKBAR SAPUTRA" => 40,
        "ROBY BENYAMIN" => 11,
        "HAERUL" => 59,
        "HELGA" => 60,
        "HIJRIAH" => 43,
        "AKIFAH HANARIA HAWWA" => 33,
        "CHAIDIR NURSAN" => 36,
        "ILHAM PURNAMA NURD" => 9,
        "MUTIARA JAMALUDDIN" => 18
    ];
    
    if (array_key_exists($queryUpper, $mappings)) {
        return $mappings[$queryUpper];
    }
    
    return null;
}

$queries = [];
$now = date('Y-m-d H:i:s');
$date = '2026-10-01';
$insertedUserIds = [];

foreach ($data as $row) {
    $name = $row[0];
    $status = $row[1];
    $checkIn = $row[2];
    $checkOut = $row[3];
    
    $userId = findBestUser($name, $users);
    
    if ($userId && !in_array($userId, $insertedUserIds)) {
        if ($status === 'HADIR') {
            $checkOutStr = $checkOut ? "'$checkOut'" : "NULL";
            $queries[] = "INSERT IGNORE INTO `attendances` (`user_id`, `date`, `check_in_time`, `check_in_photo`, `check_out_time`, `check_out_photo`, `status`, `notes`, `created_at`, `updated_at`) VALUES ($userId, '$date', '$checkIn', NULL, $checkOutStr, NULL, 'Hadir', NULL, '$now', '$now');";
        } else if ($status === 'IZIN') {
            $queries[] = "INSERT IGNORE INTO `attendance_requests` (`user_id`, `type`, `start_date`, `end_date`, `reason`, `attachment`, `status`, `approved_by`, `created_at`, `updated_at`) VALUES ($userId, 'Izin', '$date', '$date', 'Izin', NULL, 'Disetujui', 1, '$now', '$now');";
        }
        $insertedUserIds[] = $userId;
    } else {
        $queries[] = "-- User not found or duplicate: $name";
    }
}

echo implode("\n", $queries) . "\n";
