<?php
$file = __DIR__ . '/app/Http/Controllers/UcRequestController.php';
$content = file_get_contents($file);

// Excel preview patch + modern CSS
$content = preg_replace_callback(
    '/return\s+(?:\\\\Maatwebsite\\\\Excel\\\\Facades\\\\)?Excel::download\((new\s+[a-zA-Z0-9_\\\\]+\([^)]*\)),\s*(.*?)\);/s',
    function ($m) {
        return "return request()->has('preview') ? response(\\App\\Helpers\\ExcelPreviewHelper::render({$m[1]}))->header('Content-Type', 'text/html') : \\Maatwebsite\\Excel\\Facades\\Excel::download({$m[1]}, {$m[2]});";
    },
    $content
);

// PDF preview patch
$content = preg_replace_callback(
    '/return\s+\$pdf->download\((.*?)\);/s',
    function ($m) {
        return "return request()->has('preview') ? \$pdf->stream({$m[1]}) : \$pdf->download({$m[1]});";
    },
    $content
);

// PDF Paper Size Patch (for exportPdf)
$content = str_replace(
    "->setPaper('a4', 'landscape')",
    "->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'))",
    $content
);

file_put_contents($file, $content);
echo "Fixed UcRequestController.\n";
