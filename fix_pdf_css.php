<?php
$files = glob('resources/views/pdf/*.blade.php');
$cssToAdd = "
        /* PDF Fixes for Overflow & Layout */
        table { width: 100%; border-collapse: collapse; table-layout: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        th, td { word-wrap: break-word; overflow-wrap: break-word; }
        .page-break { page-break-after: always; }
";

foreach ($files as $file) {
    $c = file_get_contents($file);
    $orig = $c;
    
    // check if it already has PDF Fixes
    if (strpos($c, '/* PDF Fixes for Overflow & Layout */') === false) {
        // Find closing </style> and insert our CSS before it
        $c = preg_replace('/<\/style>/i', $cssToAdd . "    </style>", $c);
        if ($c !== $orig) {
            file_put_contents($file, $c);
            echo "Added CSS to $file\n";
        }
    }
}
echo "Done.\n";
