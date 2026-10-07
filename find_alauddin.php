<?php

$sqlFile = "satw6559_sanzaya (5).sql";
$lines = file($sqlFile);
$inOutlets = false;
$found = [];

foreach ($lines as $line) {
    if (strpos($line, "INSERT INTO `outlets`") !== false) {
        $inOutlets = true;
    } else if ($inOutlets && strpos($line, "INSERT INTO `") !== false) {
        $inOutlets = false;
    }
    
    if ($inOutlets) {
        if (stripos($line, 'aluddin') !== false || stripos($line, 'alauddin') !== false) {
            preg_match("/^\(([0-9]+),\s*'([^']+)'/", $line, $matches);
            if (count($matches) > 0) {
                $found[$matches[1]] = $matches[2];
            }
        }
    }
}
print_r($found);
