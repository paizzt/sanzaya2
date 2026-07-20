<?php
$f = 'resources/js/Pages/Reports/Index.jsx';
$c = file_get_contents($f);

// 1. Add id="data-table-container" to the table wrapper
$c = str_replace(
    '<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">',
    '<div id="data-table-container" className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">',
    $c
);

// 2. Add onClick to all summary cards
// They all start with: <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-transform hover:-translate-y-1">
$c = str_replace(
    '<div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-transform hover:-translate-y-1">',
    '<div onClick={() => document.getElementById(\'data-table-container\')?.scrollIntoView({ behavior: \'smooth\', block: \'start\' })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">',
    $c
);

file_put_contents($f, $c);
echo "Patched Reports/Index.jsx to make cards clickable\n";
