<?php
$files = [
    'app/Http/Controllers/UcRequestController.php',
    'app/Http/Controllers/UcApprovalController.php'
];

foreach ($files as $file) {
    if (!file_exists($file)) continue;
    $content = file_get_contents($file);
    
    // Replace exportPdf and exportExcel body
    $replacement = <<<'PHP'
$items = \App\Models\UcRequest::with('user')->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $headings = [
                'No', 
                'No Request', 
                'Pemohon', 
                'Entitas', 
                'Kota Asal', 
                'Kota Tujuan', 
                'Tgl Berangkat', 
                'Tgl Pulang', 
                'Transportasi', 
                'Status'
            ];
            
            $rows = $items->map(function($item, $key) {
                return [
                    $key + 1,
                    $item->request_number,
                    $item->user ? $item->user->name : '-',
                    $item->entity,
                    $item->departure_city,
                    $item->destination_city,
                    date('d/m/Y', strtotime($item->departure_date)),
                    date('d/m/Y', strtotime($item->return_date)),
                    $item->transport_type,
                    $item->status
                ];
            });
        }
PHP;

    $content = preg_replace(
        '/\$items = \\\\App\\\\Models\\\\UcRequest::orderBy.*?\} else \{.*?return \$row;\s*\}\);\s*\}/s',
        $replacement,
        $content
    );
    
    file_put_contents($file, $content);
}
echo "Done replacing UC columns.\n";
