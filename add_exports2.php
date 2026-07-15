<?php
$controllers = [
    'MarketingDailyReportController' => ['MarketingDailyReport', 'Laporan Marketing'],
    'UcRequestController' => ['UcRequest', 'Form UC'],
    'UcApprovalController' => ['UcRequest', 'Persetujuan UC'],
];

foreach ($controllers as $controllerFile => $info) {
    $modelClass = $info[0];
    $title = $info[1];
    $filename = "c:/xampp/htdocs/sanzaya2/app/Http/Controllers/{$controllerFile}.php";
    
    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        
        // Add imports if missing
        $imports = "use App\\Exports\\GenericExport;\nuse Maatwebsite\\Excel\\Facades\\Excel;\nuse Barryvdh\\DomPDF\\Facade\\Pdf;\n";
        if (strpos($content, 'App\Exports\GenericExport') === false) {
            $content = preg_replace('/(namespace App\\\\Http\\\\Controllers;\s*)/s', "$1\n$imports", $content);
        }

        if (strpos($content, 'function exportPdf') === false) {
            $exportCode = "
    public function exportPdf()
    {
        \$items = \\App\\Models\\$modelClass::orderBy('id', 'desc')->get();
        if (\$items->isEmpty()) {
            \$headings = [];
            \$rows = collect([]);
        } else {
            \$hidden = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'];
            \$headings = array_diff(array_keys(\$items->first()->getAttributes()), \$hidden);
            \$headings = array_map(function(\$h) { return ucwords(str_replace('_', ' ', \$h)); }, \$headings);
            array_unshift(\$headings, 'No');
            
            \$rows = \$items->map(function(\$item, \$key) use (\$hidden) {
                \$row = [\$key + 1];
                foreach (\$item->getAttributes() as \$col => \$val) {
                    if (!in_array(\$col, \$hidden)) {
                        \$row[] = is_array(\$val) ? json_encode(\$val) : \$val;
                    }
                }
                return \$row;
            });
        }
        
        \$pdf = Pdf::loadView('pdf.generic_table', ['title' => '$title', 'headings' => \$headings, 'rows' => \$rows])->setPaper('a4', 'landscape');
        return \$pdf->download(str_replace(' ', '_', '$title') . '.pdf');
    }

    public function exportExcel()
    {
        \$items = \\App\\Models\\$modelClass::orderBy('id', 'desc')->get();
        if (\$items->isEmpty()) {
            \$headings = [];
            \$rows = collect([]);
        } else {
            \$hidden = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'];
            \$headings = array_diff(array_keys(\$items->first()->getAttributes()), \$hidden);
            \$headings = array_map(function(\$h) { return ucwords(str_replace('_', ' ', \$h)); }, \$headings);
            array_unshift(\$headings, 'No');
            
            \$rows = \$items->map(function(\$item, \$key) use (\$hidden) {
                \$row = [\$key + 1];
                foreach (\$item->getAttributes() as \$col => \$val) {
                    if (!in_array(\$col, \$hidden)) {
                        \$row[] = is_array(\$val) ? json_encode(\$val) : \$val;
                    }
                }
                return \$row;
            });
        }
        
        return Excel::download(new GenericExport(\$rows, \$headings), str_replace(' ', '_', '$title') . '.xlsx');
    }
}
";
            $content = preg_replace('/}\s*$/', $exportCode, $content);
            file_put_contents($filename, $content);
            echo "Added exports to $controllerFile\n";
        }
    } else {
        echo "File not found: $controllerFile\n";
    }
}
