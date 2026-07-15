<?php
foreach (glob('app/Http/Controllers/*.php') as $file) {
    $c = file_get_contents($file);
    $orig = $c;
    
    // Remove the accidental duplicate
    $c = str_replace("->setPaper([0, 0, 609.4488, 935.433], 'landscape')->setPaper([0, 0, 609.4488, 935.433], 'portrait')", "->setPaper([0, 0, 609.4488, 935.433], 'landscape')", $c);
    
    if ($c !== $orig) {
        file_put_contents($file, $c);
        echo "Fixed $file\n";
    }
}
echo "Done.\n";
