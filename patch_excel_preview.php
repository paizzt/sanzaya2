<?php
$files = glob(__DIR__ . '/app/Http/Controllers/*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    $original = $content;

    // Pattern to match:
    // \Maatwebsite\Excel\Facades\Excel::raw(ANYTHING, \Maatwebsite\Excel\Excel::HTML)
    // Actually, EVERYTHING between \Maatwebsite\Excel\Facades\Excel::raw( and , \Maatwebsite\Excel\Excel::HTML)
    
    $content = preg_replace_callback(
        '/\\\\Maatwebsite\\\\Excel\\\\Facades\\\\Excel::raw\((new\s+[a-zA-Z0-9_\\\\]+\([^)]*\)),\s*\\\\Maatwebsite\\\\Excel\\\\Excel::HTML\)/s',
        function ($m) {
            return "\\App\\Helpers\\ExcelPreviewHelper::render({$m[1]})";
        },
        $content
    );

    if ($content !== $original) {
        file_put_contents($file, $content);
        echo "Updated Excel preview in: " . basename($file) . "\n";
    }
}
echo "Done patching Excel preview controllers.\n";
