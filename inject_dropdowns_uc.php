<?php
$pages = [
    ['file' => 'Requests/UcRequest.jsx', 'pdf' => 'requests.uc.export.pdf', 'excel' => 'requests.uc.export.excel'],
    ['file' => 'Requests/UcHistory.jsx', 'pdf' => 'requests.uc.export.pdf', 'excel' => 'requests.uc.export.excel'],
    ['file' => 'Requests/UcApproval.jsx', 'pdf' => 'requests.uc.approval.export.pdf', 'excel' => 'requests.uc.approval.export.excel'],
];

foreach ($pages as $page) {
    $filename = "c:/xampp/htdocs/sanzaya2/resources/js/Pages/" . $page['file'];
    
    // In case the main file is called Index.jsx
    if (!file_exists($filename)) {
        if ($page['file'] == 'Requests/UcRequest.jsx') {
             $filename = "c:/xampp/htdocs/sanzaya2/resources/js/Pages/Requests/Index.jsx"; 
        }
    }

    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        
        if (strpos($content, 'ExportDropdown') !== false) {
            echo "Already updated {$page['file']}\n";
            continue; 
        }

        // 1. Inject Import at the top
        $content = "import ExportDropdown from '@/Components/ExportDropdown';\n" . $content;

        // 2. Inject Component
        $dropdownComponent = "<ExportDropdown pdfRoute={route('{$page['pdf']}')} excelRoute={route('{$page['excel']}')} />";

        $matched = false;
        
        if (preg_match('/<PrimaryButton[^>]*>.*?Tambah.*?<\/PrimaryButton>/s', $content)) {
            $content = preg_replace('/(<PrimaryButton[^>]*>.*?Tambah.*?<\/PrimaryButton>)/s', "<div className=\"flex items-center gap-3\">\n                                $dropdownComponent\n                                $1\n                            </div>", $content, 1);
            $matched = true;
        } else if (preg_match('/<button[^>]*>.*?Tambah.*?<\/button>/s', $content)) {
            $content = preg_replace('/(<button[^>]*>.*?Tambah.*?<\/button>)/s', "<div className=\"flex items-center gap-3\">\n                                $dropdownComponent\n                                $1\n                            </div>", $content, 1);
            $matched = true;
        } else if (preg_match('/<Link[^>]*>.*?Tambah.*?<\/Link>/s', $content)) {
             $content = preg_replace('/(<Link[^>]*>.*?Tambah.*?<\/Link>)/s', "<div className=\"flex items-center gap-3\">\n                                $dropdownComponent\n                                $1\n                            </div>", $content, 1);
             $matched = true;
        } 
        
        if (!$matched && preg_match('/<h3[^>]*>.*?<\/h3>/s', $content)) {
             $content = preg_replace('/(<div className="[^"]*flex justify-between[^"]*"[^>]*>.*?<h3[^>]*>.*?<\/h3>)/s', "$1\n                            $dropdownComponent\n", $content, 1);
        }
        
        file_put_contents($filename, $content);
        echo "Updated {$page['file']}\n";
    } else {
        echo "File not found: {$page['file']}\n";
    }
}
