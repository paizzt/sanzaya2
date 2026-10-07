<?php

$file = 'resources/js/Pages/Reports/Index.jsx';
$content = file_get_contents($file);

// Find the header block
$headerStart = strpos($content, '<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">');
$headerEndStr = "</div>\n\n                {/* Summary Cards */}";
$headerEnd = strpos($content, $headerEndStr, $headerStart);
$headerBlock = substr($content, $headerStart, $headerEnd - $headerStart + mb_strlen("</div>\n"));

// Remove header block from original position
$content = str_replace($headerBlock, '', $content);

// Find the filter block
$filterStartStr = '<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">';
$filterStart = strpos($content, $filterStartStr);

// Insert header block before filter block
$newContent = substr($content, 0, $filterStart) . $headerBlock . "\n                " . substr($content, $filterStart);

file_put_contents($file, $newContent);
echo "Swapped successfully.";

?>
