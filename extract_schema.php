<?php
$lines = file('satw6559_sanzaya (5).sql');
$inTable = false;
foreach ($lines as $line) {
    if (strpos($line, "CREATE TABLE `attendances`") !== false) {
        $inTable = true;
    }
    if ($inTable) {
        echo $line;
        if (strpos($line, ";") !== false || strpos($line, "ENGINE=") !== false) {
            $inTable = false;
            break;
        }
    }
}
