<?php
$files = [
    __DIR__ . '/app/Http/Controllers/BhpRequestController.php',
    __DIR__ . '/app/Http/Controllers/ItemRequirementController.php',
    __DIR__ . '/app/Http/Controllers/ReportController.php',
    __DIR__ . '/app/Http/Controllers/UcRequestController.php',
];

// 1. BhpRequestController.php
$c = file_get_contents($files[0]);
$c = str_replace(
    "->setPaper([0, 0, 609.4488, 935.433], 'portrait')",
    "->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'portrait'))",
    $c
);
file_put_contents($files[0], $c);

// 2. ItemRequirementController.php
$c = file_get_contents($files[1]);
$c = str_replace(
    "->setPaper([0, 0, 609.4488, 935.433], 'landscape')",
    "->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'))",
    $c
);
file_put_contents($files[1], $c);

// 3. ReportController.php
$c = file_get_contents($files[2]);
$c = str_replace(
    "->setPaper([0, 0, 609.4488, 935.433], 'portrait')",
    "->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'portrait'))",
    $c
);
file_put_contents($files[2], $c);

// 4. UcRequestController.php (No setPaper originally)
$c = file_get_contents($files[3]);
$c = str_replace(
    "Pdf::loadView('pdf.uc_request', compact('uc', 'qrCode'));",
    "Pdf::loadView('pdf.uc_request', compact('uc', 'qrCode'))->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'portrait'));",
    $c
);
file_put_contents($files[3], $c);

// Apply Excel preview patch
foreach ($files as $file) {
    $content = file_get_contents($file);
    // Excel preview patch
    $content = preg_replace_callback(
        '/return\s+(?:\\\\Maatwebsite\\\\Excel\\\\Facades\\\\)?Excel::download\((new\s+[a-zA-Z0-9_\\\\]+\([^)]*\)),\s*(.*?)\);/s',
        function ($m) {
            return "return request()->has('preview') ? response(\\Maatwebsite\\Excel\\Facades\\Excel::raw({$m[1]}, \\Maatwebsite\\Excel\\Excel::HTML))->header('Content-Type', 'text/html') : \\Maatwebsite\\Excel\\Facades\\Excel::download({$m[1]}, {$m[2]});";
        },
        $content
    );
    file_put_contents($file, $content);
}

// Apply PDF preview patch
foreach ($files as $file) {
    $content = file_get_contents($file);
    // PDF preview patch
    $content = preg_replace_callback(
        '/return\s+\$pdf->download\((.*?)\);/s',
        function ($m) {
            return "return request()->has('preview') ? \$pdf->stream({$m[1]}) : \$pdf->download({$m[1]});";
        },
        $content
    );
    file_put_contents($file, $content);
}
echo "Done patching the 4 files!";
