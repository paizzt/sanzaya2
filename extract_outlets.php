<?php

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

file_put_contents("outlets.json", json_encode($outlets, JSON_PRETTY_PRINT));
