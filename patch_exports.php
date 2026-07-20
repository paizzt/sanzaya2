<?php
$files = glob(__DIR__ . '/app/Http/Controllers/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    $original = $content;

    // Patch PDF
    $content = preg_replace_callback(
        '/return\s+\$pdf->download\((.*?)\);/s',
        function ($m) {
            return "return request()->has('preview') ? \$pdf->stream({$m[1]}) : \$pdf->download({$m[1]});";
        },
        $content
    );

    // Patch Excel
    $content = preg_replace_callback(
        '/return\s+(?:\\\\Maatwebsite\\\\Excel\\\\Facades\\\\)?Excel::download\((new\s+[a-zA-Z0-9_\\\\]+\([^)]*\)),\s*(.*?)\);/s',
        function ($m) {
            return "return request()->has('preview') ? \Maatwebsite\Excel\Facades\Excel::download({$m[1]}, 'preview.html', \Maatwebsite\Excel\Excel::HTML) : \Maatwebsite\Excel\Facades\Excel::download({$m[1]}, {$m[2]});";
        },
        $content
    );

    if ($content !== $original) {
        file_put_contents($file, $content);
        echo "Updated: " . basename($file) . "\n";
    }
}
echo "Done.\n";
