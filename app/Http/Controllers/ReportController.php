<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SyncLogistikData;
use App\Models\SyncPesananData;
use App\Models\SyncPiutangData;
use App\Models\SyncHutangData;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->query('tab', 'logistik');
        $search = $request->query('search', '');
        $salesFilter = $request->query('sales_filter', '');
        $outletFilter = $request->query('outlet_filter', '');
        $monthFilter = $request->query('month_filter', '');

        $outletNamesToSearch = [];
        if ($outletFilter) {
            $outletNamesToSearch[] = $outletFilter;
            $outletMaster = \App\Models\Outlet::where('name', $outletFilter)->first();
            if ($outletMaster) {
                $mappedNames = \App\Models\OutletMapping::where('outlet_id', $outletMaster->id)->pluck('raw_name')->toArray();
                $outletNamesToSearch = array_merge($outletNamesToSearch, $mappedNames);
            }
        }

        $salesNames = SyncLogistikData::select('nama_sales')->distinct()->whereNotNull('nama_sales')->pluck('nama_sales');
        $outletNames = \App\Models\Outlet::pluck('name');
        $months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        $data = [];
        if ($tab === 'logistik') {
            $query = SyncLogistikData::query();
            if ($salesFilter) {
                $query->where('nama_sales', $salesFilter);
            }
            if ($outletFilter) {
                $query->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('nama_outlet', 'like', $name);
                    }
                });
            }
            if ($monthFilter) {
                $query->where('tanggal', 'like', "%{$monthFilter}%");
            }
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('nama_outlet', 'like', "%{$search}%")
                      ->orWhere('nama_sales', 'like', "%{$search}%")
                      ->orWhere('nama_produk', 'like', "%{$search}%");
                });
            }
            $data = $query->orderBy('id', 'desc')->paginate(50)->withQueryString();
        } elseif ($tab === 'pesanan') {
            $query = SyncPesananData::query();
            if ($outletFilter) {
                $query->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('nama_outlet', 'like', $name);
                    }
                });
            }
            if ($monthFilter) {
                $query->where('tanggal', 'like', "%{$monthFilter}%");
            }
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('nama_outlet', 'like', "%{$search}%")
                      ->orWhere('nama_produk', 'like', "%{$search}%");
                });
            }
            $data = $query->orderBy('id', 'desc')->paginate(50)->withQueryString();
        } elseif ($tab === 'piutang') {
            $query = SyncPiutangData::query();
            if ($outletFilter) {
                $query->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('nama_outlet', 'like', $name);
                    }
                });
            }
            if ($monthFilter) {
                $monthNum = array_search($monthFilter, $months) + 1;
                $query->whereMonth('created_at', $monthNum);
            }
            if ($search) {
                $query->where('nama_outlet', 'like', "%{$search}%");
            }
            $data = $query->orderBy('id', 'desc')->paginate(50)->withQueryString();
        } elseif ($tab === 'hutang') {
            $query = SyncHutangData::query();
            if ($search) {
                $query->where('nama_penyedia', 'like', "%{$search}%");
            }
            $data = $query->orderBy('id', 'desc')->paginate(50)->withQueryString();
        }

        // Calculate Summaries using Inertia::defer
        $summary = Inertia::defer(function () use ($salesFilter, $outletFilter, $monthFilter, $outletNamesToSearch) {
            $summaryQuery = SyncLogistikData::query();
            if ($salesFilter) $summaryQuery->where('nama_sales', $salesFilter);
            if ($outletFilter) {
                $summaryQuery->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('pelanggan', 'like', $name);
                    }
                });
            }
            if ($monthFilter) $summaryQuery->where('tanggal', 'like', "%{$monthFilter}%");
            
            $logistikAll = $summaryQuery->select('grand_total', 'pelanggan', 'nama_produk', 'nama_sales')->get();
            $totalPenjualan = 0; $outletCounts = []; $produkCounts = []; $salesBreakdown = []; $pesananSales = [];
            foreach ($logistikAll as $row) {
                $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->grand_total);
                $totalPenjualan += $val;
                if ($row->pelanggan) $outletCounts[$row->pelanggan] = ($outletCounts[$row->pelanggan] ?? 0) + 1;
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

        $summaryPesanan = Inertia::defer(function () use ($outletFilter, $monthFilter, $outletNamesToSearch) {
            $summaryPesananQuery = SyncPesananData::query();
            if ($outletFilter) {
                $summaryPesananQuery->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('nama_outlet', 'like', $name);
                    }
                });
            }
            if ($monthFilter) $summaryPesananQuery->where('tanggal', 'like', "%{$monthFilter}%");
            
            $pesananAll = $summaryPesananQuery->select('total_faktur', 'terkirim', 'belum_terkirim', 'nama_outlet', 'nama_produk')->get();
            $totalFaktur = 0; $totalTerkirim = 0; $totalBelumTerkirim = 0;
            $fakturOutlet = []; $terkirimOutlet = [];
            foreach ($pesananAll as $row) {
                $f = (float) str_replace(['.', ','], ['', '.'], (string)$row->total_faktur);
                $totalFaktur += $f;
                $t = (float) str_replace(['.', ','], ['', '.'], (string)$row->terkirim);
                $totalTerkirim += $t;
                $bt = (float) str_replace(['.', ','], ['', '.'], (string)$row->belum_terkirim);
                $totalBelumTerkirim += $bt;

                if ($row->nama_outlet) {
                    $fakturOutlet[$row->nama_outlet] = ($fakturOutlet[$row->nama_outlet] ?? 0) + $f;
                    $terkirimOutlet[$row->nama_outlet] = ($terkirimOutlet[$row->nama_outlet] ?? 0) + $t;
                }
            }
            arsort($fakturOutlet); arsort($terkirimOutlet);
            
            $fakturOutletFormatted = [];
            foreach($fakturOutlet as $o => $v) $fakturOutletFormatted[$o] = 'Rp ' . number_format($v, 0, ',', '.');
            
            $terkirimOutletFormatted = [];
            foreach($terkirimOutlet as $o => $v) $terkirimOutletFormatted[$o] = number_format($v, 0, ',', '.') . ' Terkirim';

            $totalItems = $totalTerkirim + $totalBelumTerkirim;
            return [
                'total_faktur' => 'Rp ' . number_format($totalFaktur, 0, ',', '.'),
                'total_terkirim' => ($totalItems > 0 ? round(($totalTerkirim / $totalItems) * 100, 1) : 0) . '%',
                'total_belum_terkirim' => ($totalItems > 0 ? round(($totalBelumTerkirim / $totalItems) * 100, 1) : 0) . '%',
                'total_pesanan' => $pesananAll->count(),
                'faktur_detail' => array_slice($fakturOutletFormatted, 0, 10, true),
                'terkirim_detail' => array_slice($terkirimOutletFormatted, 0, 10, true)
            ];
        });

        $summaryPiutang = Inertia::defer(function () use ($outletFilter, $monthFilter, $outletNamesToSearch, $months) {
            $summaryPiutangQuery = SyncPiutangData::query();
            if ($outletFilter) {
                $summaryPiutangQuery->where(function($q) use ($outletNamesToSearch) {
                    foreach ($outletNamesToSearch as $name) {
                        $q->orWhere('nama_outlet', 'like', $name);
                    }
                });
            }
            if ($monthFilter) {
                $monthNum = array_search($monthFilter, $months) + 1;
                $summaryPiutangQuery->whereMonth('created_at', $monthNum);
            }
            $piutangAll = $summaryPiutangQuery->select('total_sanzaya', 'total_ruma', 'total_gabungan', 'nama_outlet')->get();
            $totalSanzaya = 0; $totalRuma = 0; $totalGabungan = 0;
            $sanzayaOutlet = []; $rumaOutlet = []; $gabunganOutlet = [];
            
            foreach ($piutangAll as $row) {
                $s = (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->total_sanzaya));
                $totalSanzaya += $s;
                $r = (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->total_ruma));
                $totalRuma += $r;
                $g = (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->total_gabungan));
                $totalGabungan += $g;
                
                if ($row->nama_outlet) {
                    $sanzayaOutlet[$row->nama_outlet] = ($sanzayaOutlet[$row->nama_outlet] ?? 0) + $s;
                    $rumaOutlet[$row->nama_outlet] = ($rumaOutlet[$row->nama_outlet] ?? 0) + $r;
                    $gabunganOutlet[$row->nama_outlet] = ($gabunganOutlet[$row->nama_outlet] ?? 0) + $g;
                }
            }
            arsort($sanzayaOutlet); arsort($rumaOutlet); arsort($gabunganOutlet);
            
            $sanzayaOutletFormatted = []; foreach($sanzayaOutlet as $o => $v) $sanzayaOutletFormatted[$o] = 'Rp ' . number_format($v, 0, ',', '.');
            $rumaOutletFormatted = []; foreach($rumaOutlet as $o => $v) $rumaOutletFormatted[$o] = 'Rp ' . number_format($v, 0, ',', '.');
            $gabunganOutletFormatted = []; foreach($gabunganOutlet as $o => $v) $gabunganOutletFormatted[$o] = 'Rp ' . number_format($v, 0, ',', '.');
            
            return [
                'total_sanzaya' => 'Rp ' . number_format($totalSanzaya, 0, ',', '.'),
                'total_ruma' => 'Rp ' . number_format($totalRuma, 0, ',', '.'),
                'total_gabungan' => 'Rp ' . number_format($totalGabungan, 0, ',', '.'),
                'total_outlet' => $piutangAll->count(),
                'sanzaya_detail' => array_slice($sanzayaOutletFormatted, 0, 10, true),
                'ruma_detail' => array_slice($rumaOutletFormatted, 0, 10, true),
                'gabungan_detail' => array_slice($gabunganOutletFormatted, 0, 10, true),
            ];
        });

        $summaryHutang = Inertia::defer(function () use ($search, $tab) {
            $summaryHutangQuery = SyncHutangData::query();
            if ($search && $tab === 'hutang') $summaryHutangQuery->where('nama_penyedia', 'like', "%{$search}%");
            $hutangAll = $summaryHutangQuery->select('nominal', 'nama_penyedia')->get();
            $totalNominalHutang = 0; $penyediaList = [];
            $hutangPenyedia = [];
            
            foreach ($hutangAll as $row) {
                $n = (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->nominal));
                $totalNominalHutang += $n;
                if ($row->nama_penyedia) {
                    $penyediaList[] = $row->nama_penyedia;
                    $hutangPenyedia[$row->nama_penyedia] = ($hutangPenyedia[$row->nama_penyedia] ?? 0) + $n;
                }
            }
            arsort($hutangPenyedia);
            $hutangPenyediaFormatted = [];
            foreach($hutangPenyedia as $p => $v) $hutangPenyediaFormatted[$p] = 'Rp ' . number_format($v, 0, ',', '.');
            
            return [
                'total_nominal' => 'Rp ' . number_format($totalNominalHutang, 0, ',', '.'),
                'total_data' => $hutangAll->count(),
                'total_penyedia' => count(array_unique($penyediaList)),
                'hutang_detail' => array_slice($hutangPenyediaFormatted, 0, 10, true)
            ];
        });

        return Inertia::render('Reports/Index', [
            'tab' => $tab,
            'search' => $search,
            'salesFilter' => $salesFilter,
            'outletFilter' => $outletFilter,
            'salesNames' => $salesNames,
            'outletNames' => $outletNames,
            'reportData' => $data,
            'summary' => $summary,
            'summaryPesanan' => $summaryPesanan,
            'summaryPiutang' => $summaryPiutang,
            'summaryHutang' => $summaryHutang
        ]);
    }

    public function exportPdf(Request $request)
    {
        ini_set('memory_limit', '2G');
        set_time_limit(300);

        $tab = $request->query('tab', 'logistik');
        $period = $request->query('period', '1_bulan'); 
        $datasets = $request->query('datasets', ['logistik', 'pesanan', 'piutang', 'hutang']);

        $days = 1;
        if ($period === '1_minggu') {
            $days = 7;
        } elseif ($period === '1_bulan') {
            $days = 30;
        } elseif ($period === '1_tahun') {
            $days = 365;
        }

        $selectedMonths = $request->query('months', []);
        $monthsNameMap = [
            '1' => 'Januari', '2' => 'Februari', '3' => 'Maret', '4' => 'April',
            '5' => 'Mei', '6' => 'Juni', '7' => 'Juli', '8' => 'Agustus',
            '9' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember'
        ];

        if (!empty($selectedMonths)) {
            $currentYear = \Carbon\Carbon::now()->year;
            $title = "Laporan Rekapitulasi (Bulan Pilihan Tahun $currentYear)";
            
            $logistik = SyncLogistikData::where(function($q) use ($selectedMonths, $monthsNameMap, $currentYear) {
                foreach($selectedMonths as $m) {
                    $q->orWhere('tanggal', 'LIKE', '%' . $monthsNameMap[$m] . ' ' . $currentYear . '%');
                }
            })->get();
            
            $pesanan = SyncPesananData::where(function($q) use ($selectedMonths, $monthsNameMap, $currentYear) {
                foreach($selectedMonths as $m) {
                    $q->orWhere('tanggal', 'LIKE', '%' . $monthsNameMap[$m] . ' ' . $currentYear . '%');
                }
            })->get();
            
            $piutang = SyncPiutangData::whereYear('created_at', $currentYear)
                ->where(function($q) use ($selectedMonths) {
                    foreach($selectedMonths as $m) {
                        $q->orWhereMonth('created_at', $m);
                    }
                })->get();
                
            $hutang = SyncHutangData::whereYear('created_at', $currentYear)
                ->where(function($q) use ($selectedMonths) {
                    foreach($selectedMonths as $m) {
                        $q->orWhereMonth('created_at', $m);
                    }
                })->get();
        } else {
            $dateStrings = [];
            $months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            for ($i = 0; $i < $days; $i++) {
                $d = Carbon::today()->subDays($i);
                $m = $months[$d->month - 1];
                $dateStrings[] = $d->format('j') . ' ' . $m . ' ' . $d->format('Y');
                $dateStrings[] = $d->format('d') . ' ' . $m . ' ' . $d->format('Y');
            }
            $dateStrings = array_unique($dateStrings);

            $startDate = Carbon::today()->subDays($days - 1);

            $title = "Laporan Rekapitulasi (" . ucwords(str_replace('_', ' ', $period)) . ")";

            $logistik = SyncLogistikData::whereIn('tanggal', $dateStrings)->get();
            $pesanan = SyncPesananData::whereIn('tanggal', $dateStrings)->get();
            $piutang = SyncPiutangData::where('created_at', '>=', $startDate)->get();
            $hutang = SyncHutangData::where('created_at', '>=', $startDate)->get();
        }

        // --- HITUNG RINGKASAN ---
        $totalPenjualan = 0;
        $salesPenjualan = [];
        $outletPenjualan = [];
        foreach ($logistik as $row) {
            $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->grand_total);
            $totalPenjualan += $val;
            
            $salesName = $row->nama_sales ?? '-';
            $salesPenjualan[$salesName] = ($salesPenjualan[$salesName] ?? 0) + $val;

            $outletName = $row->pelanggan ?? '-';
            $outletPenjualan[$outletName] = ($outletPenjualan[$outletName] ?? 0) + $val;
        }
        arsort($salesPenjualan);
        arsort($outletPenjualan);

        $totalPiutang = 0;
        foreach ($piutang as $row) {
            $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->total_gabungan);
            $totalPiutang += $val;
        }

        $totalHutang = 0;
        foreach ($hutang as $row) {
            $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->nominal);
            $totalHutang += $val;
        }

        $pesananTerkirim = 0;
        $pesananBelum = 0;
        foreach ($pesanan as $row) {
            if (strtolower(trim($row->status_pengiriman)) === 'terkirim') {
                $pesananTerkirim++;
            } else {
                $pesananBelum++;
            }
        }

        $summary = [
            'total_penjualan' => $totalPenjualan,
            'total_piutang' => $totalPiutang,
            'total_hutang' => $totalHutang,
            'pesanan_terkirim' => $pesananTerkirim,
            'pesanan_belum' => $pesananBelum,
            'sales_penjualan' => $salesPenjualan,
            'outlet_penjualan' => $outletPenjualan,
        ];

        // --- BUAT GRAFIK (QUICKCHART.IO) ---
        $charts = [
            'piutang_hutang' => null,
            'pesanan' => null,
            'outlets' => null,
        ];

        // 1. Chart Piutang vs Hutang
        if (in_array('piutang', $datasets) || in_array('hutang', $datasets)) {
            $phLabels = [];
            $phData = [];
            $phColors = [];
            if (in_array('piutang', $datasets)) { $phLabels[] = 'Piutang'; $phData[] = round($totalPiutang / 1000000, 2); $phColors[] = '#f59e0b'; }
            if (in_array('hutang', $datasets)) { $phLabels[] = 'Hutang'; $phData[] = round($totalHutang / 1000000, 2); $phColors[] = '#ef4444'; }
            
            $configPH = [
                'type' => 'bar',
                'data' => [
                    'labels' => $phLabels,
                    'datasets' => [['label' => 'Total (Juta)', 'data' => $phData, 'backgroundColor' => $phColors]]
                ],
                'options' => ['scales' => ['yAxes' => [['ticks' => ['beginAtZero' => true]]]]]
            ];
            try {
                $res = \Illuminate\Support\Facades\Http::timeout(10)->get('https://quickchart.io/chart?w=300&h=200&c=' . urlencode(json_encode($configPH)));
                if ($res->successful()) $charts['piutang_hutang'] = 'data:image/png;base64,' . base64_encode($res->body());
            } catch (\Exception $e) {}
        }

        // 2. Chart Doughnut Pesanan
        if (in_array('pesanan', $datasets)) {
            $configPesanan = [
                'type' => 'doughnut',
                'data' => [
                    'labels' => ['Terkirim', 'Belum'],
                    'datasets' => [['data' => [$pesananTerkirim, $pesananBelum], 'backgroundColor' => ['#10b981', '#f43f5e']]]
                ],
                'options' => ['plugins' => ['datalabels' => ['color' => '#fff']]]
            ];
            try {
                $res = \Illuminate\Support\Facades\Http::timeout(10)->get('https://quickchart.io/chart?w=250&h=200&c=' . urlencode(json_encode($configPesanan)));
                if ($res->successful()) $charts['pesanan'] = 'data:image/png;base64,' . base64_encode($res->body());
            } catch (\Exception $e) {}
        }

        // 3. Chart Top Outlets
        if (in_array('logistik', $datasets) && !empty($outletPenjualan)) {
            $topOutlets = array_slice($outletPenjualan, 0, 5, true);
            $configOutlets = [
                'type' => 'bar',
                'data' => [
                    'labels' => array_map(function($l) { return \Illuminate\Support\Str::limit($l, 10); }, array_keys($topOutlets)),
                    'datasets' => [['label' => 'Penjualan (Juta)', 'data' => array_map(function($v) { return round($v/1000000, 2); }, array_values($topOutlets)), 'backgroundColor' => '#8b5cf6']]
                ],
                'options' => ['scales' => ['yAxes' => [['ticks' => ['beginAtZero' => true]]]]]
            ];
            try {
                $res = \Illuminate\Support\Facades\Http::timeout(10)->get('https://quickchart.io/chart?w=400&h=200&c=' . urlencode(json_encode($configOutlets)));
                if ($res->successful()) $charts['outlets'] = 'data:image/png;base64,' . base64_encode($res->body());
            } catch (\Exception $e) {}
        }

        $pdf = Pdf::loadView('pdf.reports', compact('logistik', 'pesanan', 'piutang', 'hutang', 'title', 'summary', 'charts', 'datasets'))->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream("laporan_gabungan_{$period}.pdf") : $pdf->download("laporan_gabungan_{$period}.pdf");
    }
}
