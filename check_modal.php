<?php
$c = file_get_contents('resources/js/Pages/Reports/Index.jsx');
echo strpos($c, 'import Modal') !== false ? 'Yes' : 'No';
