<?php
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
file_put_contents('users_map.json', json_encode($users, JSON_PRETTY_PRINT));
