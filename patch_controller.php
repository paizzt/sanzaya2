<?php
$f = 'app/Http/Controllers/ReportController.php';
$c = file_get_contents($f);

// We need to modify the summary for logistik.
// Let's find the inertia defer block for logistik.
$search = <<<'EOD'
        $summary = Inertia::defer(function () use ($salesFilter, $outletFilter, $monthFilter, $outletNamesToSearch) {
            $summaryQuery = SyncLogistikData::query();
            if ($salesFilter) $summaryQuery->where('nama_sales', $salesFilter);
            if ($outletFilter) {
                $summaryQuery->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('nama_outlet', 'like', $name);
                    }
                });
            }
            if ($monthFilter) $summaryQuery->where('tanggal', 'like', "%{$monthFilter}%");
            
            $logistikAll = $summaryQuery->select('total_sales', 'nama_outlet', 'nama_produk')->get();
            $totalPenjualan = 0; $outletCounts = []; $produkCounts = [];
            foreach ($logistikAll as $row) {
                $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->total_sales);
                $totalPenjualan += $val;
                if ($row->nama_outlet) $outletCounts[$row->nama_outlet] = ($outletCounts[$row->nama_outlet] ?? 0) + 1;
                if ($row->nama_produk) $produkCounts[$row->nama_produk] = ($produkCounts[$row->nama_produk] ?? 0) + 1;
            }
            arsort($outletCounts); arsort($produkCounts);
            return [
                'total_penjualan' => 'Rp ' . number_format($totalPenjualan, 0, ',', '.'),
                'top_outlet' => key($outletCounts) ?: '-',
                'top_produk' => key($produkCounts) ?: '-',
                'total_pesanan' => $logistikAll->count()
            ];
        });
EOD;

$replace = <<<'EOD'
        $summary = Inertia::defer(function () use ($salesFilter, $outletFilter, $monthFilter, $outletNamesToSearch) {
            $summaryQuery = SyncLogistikData::query();
            if ($salesFilter) $summaryQuery->where('nama_sales', $salesFilter);
            if ($outletFilter) {
                $summaryQuery->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('nama_outlet', 'like', $name);
                    }
                });
            }
            if ($monthFilter) $summaryQuery->where('tanggal', 'like', "%{$monthFilter}%");
            
            $logistikAll = $summaryQuery->select('total_sales', 'nama_outlet', 'nama_produk', 'nama_sales')->get();
            $totalPenjualan = 0; $outletCounts = []; $produkCounts = []; $salesBreakdown = []; $pesananSales = [];
            foreach ($logistikAll as $row) {
                $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->total_sales);
                $totalPenjualan += $val;
                if ($row->nama_outlet) $outletCounts[$row->nama_outlet] = ($outletCounts[$row->nama_outlet] ?? 0) + 1;
                if ($row->nama_produk) $produkCounts[$row->nama_produk] = ($produkCounts[$row->nama_produk] ?? 0) + 1;
                if ($row->nama_sales) {
                    $salesBreakdown[$row->nama_sales] = ($salesBreakdown[$row->nama_sales] ?? 0) + $val;
                    $pesananSales[$row->nama_sales] = ($pesananSales[$row->nama_sales] ?? 0) + 1;
                }
            }
            arsort($outletCounts); arsort($produkCounts); arsort($salesBreakdown); arsort($pesananSales);
            
            $salesBreakdownFormatted = [];
            foreach($salesBreakdown as $s => $v) $salesBreakdownFormatted[$s] = 'Rp ' . number_format($v, 0, ',', '.');

            return [
                'total_penjualan' => 'Rp ' . number_format($totalPenjualan, 0, ',', '.'),
                'top_outlet' => key($outletCounts) ?: '-',
                'top_produk' => key($produkCounts) ?: '-',
                'total_pesanan' => $logistikAll->count(),
                'penjualan_detail' => array_slice($salesBreakdownFormatted, 0, 10, true),
                'outlet_detail' => array_slice($outletCounts, 0, 10, true),
                'produk_detail' => array_slice($produkCounts, 0, 10, true),
                'pesanan_detail' => array_slice($pesananSales, 0, 10, true)
            ];
        });
EOD;

$c = str_replace($search, $replace, $c);
file_put_contents($f, $c);
echo "Patched ReportController.php\n";
