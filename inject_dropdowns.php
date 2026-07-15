<?php
$pages = [
    ['file' => 'LogisticReports/Index.jsx', 'pdf' => 'logistic-reports.export.pdf', 'excel' => 'logistic-reports.export.excel'],
    ['file' => 'PurchaseOrders/Index.jsx', 'pdf' => 'purchase-orders.export.pdf', 'excel' => 'purchase-orders.export.excel'],
    ['file' => 'Receivables/Index.jsx', 'pdf' => 'receivables.export.pdf', 'excel' => 'receivables.export.excel'],
    ['file' => 'Payables/Index.jsx', 'pdf' => 'payables.export.pdf', 'excel' => 'payables.export.excel'],
    ['file' => 'Company/Index.jsx', 'pdf' => 'company.export.pdf', 'excel' => 'company.export.excel'],
    ['file' => 'Outlets/Index.jsx', 'pdf' => 'outlets.export.pdf', 'excel' => 'outlets.export.excel'],
    ['file' => 'Vehicles/Index.jsx', 'pdf' => 'vehicles.export.pdf', 'excel' => 'vehicles.export.excel'],
    ['file' => 'Providers/Index.jsx', 'pdf' => 'providers.export.pdf', 'excel' => 'providers.export.excel'],
    ['file' => 'Products/Index.jsx', 'pdf' => 'products.export.pdf', 'excel' => 'products.export.excel'], // Might be Product/Index.jsx
    ['file' => 'Users/Index.jsx', 'pdf' => 'users.export.pdf', 'excel' => 'users.export.excel'],
    ['file' => 'Marketing/Index.jsx', 'pdf' => 'marketing.export.pdf', 'excel' => 'marketing.export.excel'],
    ['file' => 'UC/Index.jsx', 'pdf' => 'requests.uc.export.pdf', 'excel' => 'requests.uc.export.excel'],
    ['file' => 'UC/UcHistory.jsx', 'pdf' => 'requests.uc.export.pdf', 'excel' => 'requests.uc.export.excel'],
    ['file' => 'UC/UcApproval.jsx', 'pdf' => 'requests.uc.approval.export.pdf', 'excel' => 'requests.uc.approval.export.excel'],
];

foreach ($pages as $page) {
    // Handle both Product and Products folder names
    $filename = "c:/xampp/htdocs/sanzaya2/resources/js/Pages/" . $page['file'];
    if (!file_exists($filename) && strpos($page['file'], 'Products/') !== false) {
        $filename = "c:/xampp/htdocs/sanzaya2/resources/js/Pages/" . str_replace('Products/', 'Product/', $page['file']);
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
            // If no Tambah button, inject it right after the h3 inside the flex container
             $content = preg_replace('/(<div className="[^"]*flex justify-between[^"]*"[^>]*>.*?<h3[^>]*>.*?<\/h3>)/s', "$1\n                            $dropdownComponent\n", $content, 1);
        }
        
        file_put_contents($filename, $content);
        echo "Updated {$page['file']}\n";
    } else {
        echo "File not found: {$page['file']}\n";
    }
}
