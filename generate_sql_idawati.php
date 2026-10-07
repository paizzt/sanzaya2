<?php

$users = [
    12 => [ // IDAWATI
        "Rsud siwa",
        "Rs hikma belopa",
        "Rs batara guru",
        "Rs megabuana",
        "Rs bintang laut",
        "Rs madyang",
        "Rsud palemmai tandi",
        "Rs at medika",
        "Rs mujaisyah",
        "Rsud sawerigading",
        "Rs hikmah masamba",
        "Rsud andi djemma",
        "Rsud i lagaligo",
        "Rsud atue"
    ]
];

$sqlFile = "satw6559_sanzaya (5).sql";
$lines = file($sqlFile);
$outlets = [];
$inOutlets = false;

foreach ($lines as $line) {
    if (strpos($line, "INSERT INTO `outlets`") !== false) {
        $inOutlets = true;
    } else if ($inOutlets && strpos($line, "INSERT INTO `") !== false) {
        $inOutlets = false; // another table
    }
    
    if ($inOutlets) {
        preg_match_all("/^\(([0-9]+),\s*'([^']+)'/m", $line, $matches);
        if (count($matches[0]) > 0) {
            for ($i = 0; $i < count($matches[0]); $i++) {
                $id = $matches[1][$i];
                $name = $matches[2][$i];
                $outlets[$id] = $name;
            }
        }
    }
}

function findBestMatch($query, $outlets) {
    $bestMatchId = null;
    $bestMatchScore = -1;
    $queryUpper = strtoupper(trim($query));
    
    // exact match first
    foreach ($outlets as $id => $name) {
        if (strtoupper($name) === $queryUpper) {
            return $id;
        }
    }
    
    foreach ($outlets as $id => $name) {
        $nameUpper = strtoupper($name);
        similar_text($queryUpper, $nameUpper, $perc);
        // Add bonus if one string contains the other
        if (strpos($nameUpper, $queryUpper) !== false || strpos($queryUpper, $nameUpper) !== false) {
            $perc += 20;
        }
        
        if ($perc > $bestMatchScore) {
            $bestMatchScore = $perc;
            $bestMatchId = $id;
        }
    }
    
    if ($bestMatchScore > 50) {
        return $bestMatchId;
    }
    
    return null; // Not found
}

$queries = [];
$now = date('Y-m-d H:i:s');
$startDate = '2026-10-01';
$endDate = '2026-10-31';

foreach ($users as $userId => $outletList) {
    $targetOutlets = [];
    foreach ($outletList as $query) {
        $id = findBestMatch($query, $outlets);
        if ($id) {
            $targetOutlets[] = (string)$id;
        } else {
            echo "-- Not found: $query\n";
        }
    }
    
    $json = json_encode(array_values(array_unique($targetOutlets)));
    $targetVisits = count($targetOutlets);
    
    $queries[] = "INSERT INTO `marketing_weekly_targets` (`user_id`, `week_number`, `start_date`, `end_date`, `target_visits`, `target_new_outlets`, `target_transactions`, `target_outlets`, `strategy`, `notes`, `created_at`, `updated_at`) VALUES ($userId, 10, '$startDate', '$endDate', $targetVisits, 0, 0.00, '$json', NULL, NULL, '$now', '$now');";
}

echo implode("\n", $queries) . "\n";
