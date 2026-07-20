<?php
$files = glob(__DIR__ . '/app/Http/Controllers/*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    $original = $content;

    // Pattern for ->setPaper(..., 'landscape')
    // We match ->setPaper( followed by anything until a string 'portrait' or 'landscape' )
    $content = preg_replace_callback(
        '/->setPaper\([^;]+?\'(portrait|landscape)\'\)/i',
        function ($m) {
            $defaultOrientation = strtolower($m[1]);
            return "->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', '$defaultOrientation'))";
        },
        $content
    );

    if ($content !== $original) {
        file_put_contents($file, $content);
        echo "Updated: " . basename($file) . "\n";
    }
}

echo "Done controllers.\n";
