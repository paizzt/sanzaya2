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

        // Calculate Summary
        $summaryQuery = SyncLogistikData::query();
        if ($salesFilter) {
            $summaryQuery->where('nama_sales', $salesFilter);
        }
        if ($outletFilter) {
            $summaryQuery->where(function($q) use ($outletNamesToSearch) {
                foreach ($outletNamesToSearch as $name) {
                    $q->orWhere('nama_outlet', 'like', $name);
                }
            });
        }
        if ($monthFilter) {
            $summaryQuery->where('tanggal', 'like', "%{$monthFilter}%");
        }
        $logistikAll = $summaryQuery->get();

        $totalPenjualan = 0;
        $outletCounts = [];
        $produkCounts = [];

        foreach ($logistikAll as $row) {
            $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->total_sales);
            $totalPenjualan += $val;

            $outlet = $row->nama_outlet;
            if ($outlet) {
                $outletCounts[$outlet] = ($outletCounts[$outlet] ?? 0) + 1;
            }

            $produk = $row->nama_produk;
            if ($produk) {
                $produkCounts[$produk] = ($produkCounts[$produk] ?? 0) + 1;
            }
        }

        arsort($outletCounts);
        arsort($produkCounts);

        $summary = [
            'total_penjualan' => 'Rp ' . number_format($totalPenjualan, 0, ',', '.'),
            'top_outlet' => key($outletCounts) ?: '-',
            'top_produk' => key($produkCounts) ?: '-',
            'total_pesanan' => $logistikAll->count()
        ];

        // Summary Pesanan
        $summaryPesananQuery = SyncPesananData::query();
        if ($outletFilter) {
            $summaryPesananQuery->where(function($q) use ($outletNamesToSearch) {
                foreach ($outletNamesToSearch as $name) {
                    $q->orWhere('nama_outlet', 'like', $name);
                }
            });
        }
        if ($monthFilter) {
            $summaryPesananQuery->where('tanggal', 'like', "%{$monthFilter}%");
        }
        $pesananAll = $summaryPesananQuery->get();

        $totalFaktur = 0;
        $totalTerkirim = 0;
        $totalBelumTerkirim = 0;
        foreach ($pesananAll as $row) {
            $faktur = (float) str_replace(['.', ','], ['', '.'], (string)$row->total_faktur);
            $totalFaktur += $faktur;
            $totalTerkirim += (float) str_replace(['.', ','], ['', '.'], (string)$row->terkirim);
            $totalBelumTerkirim += (float) str_replace(['.', ','], ['', '.'], (string)$row->belum_terkirim);
        }

        $totalItems = $totalTerkirim + $totalBelumTerkirim;
        $pctTerkirim = $totalItems > 0 ? round(($totalTerkirim / $totalItems) * 100, 1) : 0;
        $pctBelum = $totalItems > 0 ? round(($totalBelumTerkirim / $totalItems) * 100, 1) : 0;

        $summaryPesanan = [
            'total_faktur' => 'Rp ' . number_format($totalFaktur, 0, ',', '.'),
            'total_terkirim' => $pctTerkirim . '%',
            'total_belum_terkirim' => $pctBelum . '%',
            'total_pesanan' => $pesananAll->count()
        ];

        // Summary Piutang
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
        $piutangAll = $summaryPiutangQuery->get();

        $totalSanzaya = 0;
        $totalRuma = 0;
        $totalGabungan = 0;
        foreach ($piutangAll as $row) {
            $totalSanzaya += (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->total_sanzaya));
            $totalRuma += (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->total_ruma));
            $totalGabungan += (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->total_gabungan));
        }
        $summaryPiutang = [
            'total_sanzaya' => 'Rp ' . number_format($totalSanzaya, 0, ',', '.'),
            'total_ruma' => 'Rp ' . number_format($totalRuma, 0, ',', '.'),
            'total_gabungan' => 'Rp ' . number_format($totalGabungan, 0, ',', '.'),
            'total_outlet' => $piutangAll->count()
        ];

        // Summary Hutang
        $summaryHutangQuery = SyncHutangData::query();
        if ($search && $tab === 'hutang') {
            $summaryHutangQuery->where('nama_penyedia', 'like', "%{$search}%");
        }
        $hutangAll = $summaryHutangQuery->get();

        $totalNominalHutang = 0;
        $penyediaList = [];
        foreach ($hutangAll as $row) {
            $totalNominalHutang += (float) str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\.-]/', '', (string)$row->nominal));
            if ($row->nama_penyedia) {
                $penyediaList[] = $row->nama_penyedia;
            }
        }
        $summaryHutang = [
            'total_nominal' => 'Rp ' . number_format($totalNominalHutang, 0, ',', '.'),
            'total_data' => $hutangAll->count(),
            'total_penyedia' => count(array_unique($penyediaList))
        ];

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

        $days = 1;
        if ($period === '1_minggu') {
            $days = 7;
        } elseif ($period === '1_bulan') {
            $days = 30;
        } elseif ($period === '1_tahun') {
            $days = 365;
        }

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

        $pdf = Pdf::loadView('pdf.reports', compact('logistik', 'pesanan', 'piutang', 'hutang', 'title'));
        return $pdf->download("laporan_gabungan_{$period}.pdf");
    }
}
