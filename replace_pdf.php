<?php
$f4 = "[0, 0, 609.4488, 935.433]";

foreach (glob('app/Http/Controllers/*.php') as $file) {
    $c = file_get_contents($file);
    $orig = $c;
    
    // Replace 'a4', 'landscape'
    $c = preg_replace("/->setPaper\(\s*['\"]a4['\"]\s*,\s*(['\"]landscape['\"])\s*\)/i", "->setPaper($f4, $1)", $c);
    
    // Replace 'a4' without landscape (or portrait)
    $c = preg_replace("/->setPaper\(\s*['\"]a4['\"]\s*\)/i", "->setPaper($f4, 'portrait')", $c);
    
    // Check for loadView without setPaper:
    // we match Pdf::loadView( ... ); or \Barryvdh\DomPDF\Facade\Pdf::loadView( ... );
    // and append ->setPaper(...) before the semicolon.
    // To be safe, let's just find Pdf::loadView(...); where it ends with ; and no ->setPaper
    $c = preg_replace("/(Pdf::loadView\([^;]+(?:\)(?!\s*->)[^;]*))\s*;/i", "$1->setPaper($f4, 'portrait');", $c);

    // Also handle case where it's assigned and we just add ->setPaper before semicolon
    // e.g. $pdf = Pdf::loadView('view', compact('a', 'b')); -> $pdf = Pdf::loadView('view', compact('a', 'b'))->setPaper($f4, 'portrait');
    
    if ($c !== $orig) {
        file_put_contents($file, $c);
        echo "Updated $file\n";
    }
}
echo "Done.\n";
