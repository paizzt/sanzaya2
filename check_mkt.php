<?php
$c = file_get_contents('resources/js/Pages/Marketing/Index.jsx');
echo 'Has pdf: ' . (strpos(strtolower($c), '.pdf') !== false ? 'yes' : 'no') . "\n";
echo 'Has export: ' . (strpos(strtolower($c), 'export') !== false ? 'yes' : 'no') . "\n";
