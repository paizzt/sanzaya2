<?php
$lines = file('resources/js/Pages/Requests/UcHistory.jsx');
foreach($lines as $i => $l) {
    if (strpos($l, 'Unduh PDF') !== false) {
        echo 'UcHistory.jsx ' . ($i + 1) . ': ' . trim($l) . "\n";
    }
}
$lines = file('resources/js/Pages/Requests/BhpRecap.jsx');
foreach($lines as $i => $l) {
    if (strpos($l, 'Unduh PDF') !== false) {
        echo 'BhpRecap.jsx ' . ($i + 1) . ': ' . trim($l) . "\n";
    }
}
