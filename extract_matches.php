<?php
$c = file_get_contents('resources/js/Pages/Marketing/Index.jsx');
preg_match_all('/<a[^>]+href=\{[^}]*pdf[^}]*\}[^>]*>/i', $c, $matches);
print_r($matches);
