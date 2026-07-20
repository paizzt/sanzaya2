<?php
$files = glob('resources/js/Pages/Requests/*.jsx');
foreach($files as $f) {
    $c = file_get_contents($f);
    if (strpos($c, 'Unduh') !== false) {
        echo "Found Unduh in $f\n";
        preg_match_all('/.{0,50}Unduh.{0,50}/i', $c, $m);
        print_r($m[0]);
    }
}
