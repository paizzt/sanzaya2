<?php

namespace App\Http\Controllers;

use App\Models\LogisticReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class LogisticReportController extends Controller
{
    private function attachGrandTotals($items)
    {
        $totalsByFaktur = [];
        foreach ($items as $item) {
            if (!empty($item->no_faktur)) {
                if (!isset($totalsByFaktur[$item->no_faktur])) {
                    $totalsByFaktur[$item->no_faktur] = 0;
                }
                $totalsByFaktur[$item->no_faktur] += (float) $item->total;
            }
        }

        return $items->map(function ($item) use ($totalsByFaktur) {
            if (!empty($item->no_faktur) && isset($totalsByFaktur[$item->no_faktur])) {
                $item->grand_total = $totalsByFaktur[$item->no_faktur];
            } else {
                $item->grand_total = (float) $item->total;
            }
            return $item;
        });
    }

    public function index(Request $request)
    {
        $query = LogisticReport::query();

        if ($request->filled('bulan')) {
            $bulans = (array) $request->bulan;
            $query->where(function ($q) use ($bulans) {
                foreach ($bulans as $bulan) {
                    $q->orWhereMonth('tanggal', $bulan);
                }
            });
        }
        if ($request->filled('tahun')) {
            $query->whereYear('tanggal', $request->tahun);
        }
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('nama_sales')) {
            $query->where('nama_sales', $request->nama_sales);
        }
        if ($request->filled('jenis_barang')) {
            $query->where('jenis_barang', $request->jenis_barang);
        }
        if ($request->filled('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        $items = $query->with(['company', 'outlet'])->orderBy('tanggal', 'desc')->orderBy('id', 'desc')->get();
        $items = $this->attachGrandTotals($items);
        
        $summary = [
            'total_transaksi' => $items->count(),
            'total_pendapatan' => $items->sum('total'),
            'pendapatan_bmhp' => $items->where('jenis_barang', 'BMHP')->sum('total'),
            'pendapatan_alat' => $items->where('jenis_barang', 'ALAT')->sum('total'),
        ];

        // Prepare chart data (monthly revenue)
        \Carbon\Carbon::setLocale('id');
        $chartData = $items->groupBy(function($item) {
            return \Carbon\Carbon::parse($item->tanggal)->format('Y-m');
        })->map(function ($monthItems, $month) {
            return [
                'tanggal' => \Carbon\Carbon::parse($month.'-01')->translatedFormat('F'),
                'total' => $monthItems->sum('total'),
                'sort_key' => $month
            ];
        })->sortBy('sort_key')->values();
        
        // Coba ambil user dengan role Sales, kalau kosong ambil semua (fallback)
        try {
            $sales = \App\Models\User::role('Sales')->get(['id', 'name']);
            if ($sales->isEmpty()) $sales = \App\Models\User::orderBy('name')->get(['id', 'name']);
        } catch (\Exception $e) {
            $sales = \App\Models\User::orderBy('name')->get(['id', 'name']);
        }

        $outlets = \App\Models\Outlet::orderBy('name')->get(['id', 'name']);
        $companies = \App\Models\Company::orderBy('name')->get(['id', 'name']);

        $page = \Illuminate\Pagination\Paginator::resolveCurrentPage() ?: 1;
        $perPage = 50;
        $paginatedItems = new \Illuminate\Pagination\LengthAwarePaginator(
            $items->forPage($page, $perPage)->values(), 
            $items->count(), 
            $perPage, 
            $page, 
            ['path' => \Illuminate\Pagination\Paginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        return Inertia::render('LogisticReports/Index', [
            'items' => $paginatedItems,
            'sales' => $sales,
            'outlets' => $outlets,
            'companies' => $companies,
            'filters' => $request->only(['bulan', 'tahun', 'company_id', 'jenis_barang', 'outlet_id', 'nama_sales']),
            'summary' => $summary,
            'chartData' => $chartData
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'outlet_id' => 'nullable|exists:outlets,id',
            'jenis_pelanggan' => 'nullable|string',
            'tanggal' => 'nullable|date',
            'nama_sales' => 'nullable|string',
            'no_faktur' => 'nullable|string',
            'id_paket' => 'nullable|string',
            'brand' => 'nullable|string',
            'nama_produk' => 'nullable|string',
            'qty' => 'nullable|string',
            'satuan' => 'nullable|string',
            'hna' => 'nullable|numeric',
            'subtotal' => 'nullable|numeric',
            'ppn' => 'nullable|numeric',
            'jenis_barang' => 'nullable|string',
        ]);
        
        $qty = (float)str_replace(',', '.', $validated['qty'] ?? 0);
        $hna = (float)($validated['hna'] ?? 0);
        $validated['subtotal'] = $qty * $hna;

        $validated['total'] = $validated['subtotal'] + (float)($validated['ppn'] ?? 0);
        $validated['grand_total'] = 0; // Field ini diabaikan karena akan dikalkulasi ulang

        if ($request->id) {
            LogisticReport::find($request->id)->update($validated);
        } else {
            LogisticReport::create($validated);
        }
        
        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function destroy($id)
    {
        LogisticReport::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    public function exportPdf(Request $request)
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', 300);

        $query = LogisticReport::query();

        if ($request->filled('bulan')) {
            $bulans = (array) $request->bulan;
            $query->where(function ($q) use ($bulans) {
                foreach ($bulans as $bulan) {
                    $q->orWhereMonth('tanggal', $bulan);
                }
            });
        }
        if ($request->filled('tahun')) {
            $query->whereYear('tanggal', $request->tahun);
        }
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('nama_sales')) {
            $query->where('nama_sales', $request->nama_sales);
        }
        if ($request->filled('jenis_barang')) {
            $query->where('jenis_barang', $request->jenis_barang);
        }
        if ($request->filled('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        $items = $query->with(['company', 'outlet'])->orderBy('tanggal', 'desc')->orderBy('id', 'desc')->get();
        $items = $this->attachGrandTotals($items);
        
        $summary = [
            'total_transaksi' => $items->count(),
            'total_pendapatan' => $items->sum('total'),
            'pendapatan_bmhp' => $items->where('jenis_barang', 'BMHP')->sum('total'),
            'pendapatan_alat' => $items->where('jenis_barang', 'ALAT')->sum('total'),
        ];
        
        $activeFilters = [];
        if ($request->filled('bulan')) {
            $monthNames = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];
            $bulans = (array) $request->bulan;
            $bulanTexts = array_map(function($b) use ($monthNames) {
                return $monthNames[(int)$b] ?? $b;
            }, $bulans);
            $activeFilters['Bulan'] = implode(', ', $bulanTexts);
        }
        if ($request->filled('tahun')) $activeFilters['Tahun'] = $request->tahun;
        if ($request->filled('company_id')) {
            $company = \App\Models\Company::find($request->company_id);
            if($company) $activeFilters['Nama PT'] = $company->name;
        }
        if ($request->filled('nama_sales')) $activeFilters['Nama Sales'] = $request->nama_sales;
        if ($request->filled('jenis_barang')) $activeFilters['Jenis Barang'] = $request->jenis_barang;
        if ($request->filled('outlet_id')) {
            $outlet = \App\Models\Outlet::find($request->outlet_id);
            if($outlet) $activeFilters['Pelanggan'] = $outlet->name;
        }

        $allHeadings = ['No', 'Nama PT', 'Pelanggan', 'Jenis', 'Tanggal', 'Sales Name', 'No Faktur', 'ID PAKET', 'BRAND', 'Nama Produk', 'Qty', 'Satuan', 'HNA', 'Subtotal', 'PPN', 'Total', 'Grand Total', 'Jenis Brg'];
        
        $requestedColumns = $request->query('columns', $allHeadings);
        
        // Filter headings based on requested columns, keeping original order
        $headings = array_values(array_filter($allHeadings, function($h) use ($requestedColumns) {
            return in_array($h, $requestedColumns);
        }));

        $rows = $items->map(function($item, $key) use ($allHeadings, $headings) {
            $fullRow = [
                'No' => $key + 1, 
                'Nama PT' => $item->company ? $item->company->name : '-', 
                'Pelanggan' => $item->outlet ? $item->outlet->name : '-', 
                'Jenis' => $item->jenis_pelanggan, 
                'Tanggal' => $item->tanggal, 
                'Sales Name' => $item->nama_sales, 
                'No Faktur' => $item->no_faktur, 
                'ID PAKET' => $item->id_paket, 
                'BRAND' => $item->brand, 
                'Nama Produk' => $item->nama_produk, 
                'Qty' => $item->qty, 
                'Satuan' => $item->satuan, 
                'HNA' => number_format((float)$item->hna, 0, ',', '.'), 
                'Subtotal' => number_format((float)$item->subtotal, 0, ',', '.'), 
                'PPN' => number_format((float)$item->ppn, 0, ',', '.'), 
                'Total' => number_format((float)$item->total, 0, ',', '.'), 
                'Grand Total' => number_format((float)$item->grand_total, 0, ',', '.'),
                'Jenis Brg' => $item->jenis_barang
            ];
            
            $filteredRow = [];
            foreach ($headings as $h) {
                $filteredRow[] = $fullRow[$h] ?? '';
            }
            return $filteredRow;
        });
        
        $revenuePerPt = $items->groupBy(function($item) {
            return $item->company ? $item->company->name : '-';
        })->map(function($ptItems) {
            return $ptItems->sum('total');
        });
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Laporan Logistik', 'headings' => $headings, 'rows' => $rows, 'summary' => $summary, 'activeFilters' => $activeFilters, 'revenuePerPt' => $revenuePerPt])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream('Laporan_Logistik.pdf') : $pdf->download('Laporan_Logistik.pdf');
    }

    public function exportExcel(Request $request)
    {
        $query = LogisticReport::query();

        if ($request->filled('bulan')) {
            $bulans = (array) $request->bulan;
            $query->where(function ($q) use ($bulans) {
                foreach ($bulans as $bulan) {
                    $q->orWhereMonth('tanggal', $bulan);
                }
            });
        }
        if ($request->filled('tahun')) {
            $query->whereYear('tanggal', $request->tahun);
        }
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('nama_sales')) {
            $query->where('nama_sales', $request->nama_sales);
        }
        if ($request->filled('jenis_barang')) {
            $query->where('jenis_barang', $request->jenis_barang);
        }
        if ($request->filled('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        $items = $query->with(['company', 'outlet'])->orderBy('tanggal', 'desc')->orderBy('id', 'desc')->get();
        $items = $this->attachGrandTotals($items);

        $allHeadings = ['No', 'Nama PT', 'Pelanggan', 'Jenis', 'Tanggal', 'Sales Name', 'No Faktur', 'ID PAKET', 'BRAND', 'Nama Produk', 'Qty', 'Satuan', 'HNA', 'Subtotal', 'PPN', 'Total', 'Grand Total', 'Jenis Brg'];
        
        $requestedColumns = $request->query('columns', $allHeadings);
        
        $headings = array_values(array_filter($allHeadings, function($h) use ($requestedColumns) {
            return in_array($h, $requestedColumns);
        }));

        $rows = $items->map(function($item, $key) use ($allHeadings, $headings) {
            $fullRow = [
                'No' => $key + 1, 
                'Nama PT' => $item->company ? $item->company->name : '-', 
                'Pelanggan' => $item->outlet ? $item->outlet->name : '-', 
                'Jenis' => $item->jenis_pelanggan, 
                'Tanggal' => $item->tanggal, 
                'Sales Name' => $item->nama_sales, 
                'No Faktur' => $item->no_faktur, 
                'ID PAKET' => $item->id_paket, 
                'BRAND' => $item->brand, 
                'Nama Produk' => $item->nama_produk, 
                'Qty' => $item->qty, 
                'Satuan' => $item->satuan, 
                'HNA' => $item->hna, 
                'Subtotal' => $item->subtotal, 
                'PPN' => $item->ppn, 
                'Total' => $item->total, 
                'Grand Total' => $item->grand_total,
                'Jenis Brg' => $item->jenis_barang
            ];
            
            $filteredRow = [];
            foreach ($headings as $h) {
                $filteredRow[] = $fullRow[$h] ?? '';
            }
            return $filteredRow;
        });
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), 'Laporan_Logistik.xlsx');
    }
}
