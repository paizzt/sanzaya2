<?php

$file = 'resources/js/Pages/Reports/Index.jsx';
$lines = file($file);

// Find the start and end of the filters div
$startFilters = -1;
$endFilters = -1;

for ($i = 0; $i < count($lines); $i++) {
    if (strpos($lines[$i], '<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">') !== false && strpos($lines[$i+1], '<div className="relative w-full lg:w-auto z-40" ref={tabDropdownRef}>') !== false) {
        $startFilters = $i;
    }
}

// Find the end by counting div tags (since it's a self-contained JSX block)
$divCount = 0;
for ($i = $startFilters; $i < count($lines); $i++) {
    $divsOpen = substr_count($lines[$i], '<div');
    $divsClose = substr_count($lines[$i], '</div');
    $divCount += ($divsOpen - $divsClose);
    
    if ($divCount === 0 && $i > $startFilters) {
        $endFilters = $i;
        break;
    }
}

if ($startFilters !== -1 && $endFilters !== -1) {
    echo "Found filters from $startFilters to $endFilters\n";
    
    $filtersBlock = array_slice($lines, $startFilters, $endFilters - $startFilters + 1);
    
    // Remove it from original
    array_splice($lines, $startFilters, $endFilters - $startFilters + 1);
    
    // Find where to insert (before "Data Laporan Tersinkronisasi")
    $insertPos = -1;
    for ($i = 0; $i < count($lines); $i++) {
        if (strpos($lines[$i], 'Data Laporan Tersinkronisasi') !== false) {
            // Found the title. The container starts a few lines above.
            // Look up to find `<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">`
            for ($j = $i; $j >= 0; $j--) {
                if (strpos($lines[$j], '<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">') !== false) {
                    $insertPos = $j;
                    break 2;
                }
            }
        }
    }
    
    if ($insertPos !== -1) {
        echo "Inserting at $insertPos\n";
        
        // Add a margin bottom to the filters block since it will now be at the top
        $filtersBlock[0] = str_replace('gap-4 bg-white', 'gap-4 mb-6 bg-white', $filtersBlock[0]);
        
        array_splice($lines, $insertPos, 0, $filtersBlock);
        
        file_put_contents($file, implode("", $lines));
        echo "Success!\n";
    } else {
        echo "Could not find insert position\n";
    }
} else {
    echo "Could not find filters block\n";
}
