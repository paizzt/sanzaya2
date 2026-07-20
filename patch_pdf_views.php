<?php
$files = glob(__DIR__ . '/resources/views/pdf/*.blade.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    $original = $content;

    // We want to inject:
    // body {
    //     font-family: {{ request('font', 'sans-serif') }} !important;
    //     font-size: {{ request('size', '12') }}px !important;
    // }
    // inside the <style> tag.
    
    // Some blade files might have multiple style tags, we just find the first one and inject right after <style>
    
    $injection = "
        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    ";
    
    if (strpos($content, "font-family: {{ request('font'") === false) {
        // If there's a <style> block
        if (strpos($content, '<style>') !== false) {
            $content = preg_replace('/<style>/i', "<style>\n" . $injection, $content, 1);
        } else {
            // No style block, insert before </head> or <body>
            if (strpos($content, '</head>') !== false) {
                $content = preg_replace('/<\/head>/i', "<style>\n" . $injection . "\n</style>\n</head>", $content, 1);
            } else {
                // Just prepend
                $content = "<style>\n" . $injection . "\n</style>\n" . $content;
            }
        }
        
        file_put_contents($file, $content);
        echo "Updated view: " . basename($file) . "\n";
    }
}
echo "Done views.\n";
