<?php
$files = glob(__DIR__ . '/app/Http/Controllers/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    $original = $content;

    // Find and replace the previously patched preview download with a raw HTML response
    $content = preg_replace_callback(
        '/\\\\Maatwebsite\\\\Excel\\\\Facades\\\\Excel::download\((new\s+[a-zA-Z0-9_\\\\]+\([^)]*\)),\s*\'preview\.html\',\s*\\\\Maatwebsite\\\\Excel\\\\Excel::HTML\)/s',
        function ($m) {
            return "response(\\Maatwebsite\\Excel\\Facades\\Excel::raw({$m[1]}, \\Maatwebsite\\Excel\\Excel::HTML))->header('Content-Type', 'text/html')";
        },
        $content
    );

    if ($content !== $original) {
        file_put_contents($file, $content);
        echo "Updated: " . basename($file) . "\n";
    }
}
echo "Done.\n";
