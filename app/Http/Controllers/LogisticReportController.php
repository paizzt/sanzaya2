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
    public function index()
    {
        $items = LogisticReport::orderBy('id', 'desc')->get();
        
        // Coba ambil user dengan role Sales, kalau kosong ambil semua (fallback)
        try {
            $sales = \App\Models\User::role('Sales')->get(['id', 'name']);
            if ($sales->isEmpty()) $sales = \App\Models\User::orderBy('name')->get(['id', 'name']);
        } catch (\Exception $e) {
            $sales = \App\Models\User::orderBy('name')->get(['id', 'name']);
        }

        $outlets = \App\Models\Outlet::orderBy('name')->get(['id', 'name']);

        return Inertia::render('LogisticReports/Index', [
            'items' => $items,
            'sales' => $sales,
            'outlets' => $outlets
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'nullable|date',
            'nama_sales' => 'nullable|string',
            'nama_outlet' => 'nullable|string',
            'nama_produk' => 'nullable|string',
            'total_sales' => 'nullable|numeric',
        ]);
        
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

    public function exportPdf()
    {
        $items = LogisticReport::orderBy('id', 'desc')->get();
        $headings = ['No', 'Tanggal', 'Sales', 'Outlet', 'Produk', 'Total Sales'];
        $rows = $items->map(function($item, $key) {
            return [$key + 1, $item->tanggal, $item->nama_sales, $item->nama_outlet, $item->nama_produk, number_format($item->total_sales, 0, ',', '.')];
        });
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Laporan Logistik', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream('Laporan_Logistik.pdf') : $pdf->download('Laporan_Logistik.pdf');
    }

    public function exportExcel()
    {
        $items = LogisticReport::orderBy('id', 'desc')->get();
        $headings = ['No', 'Tanggal', 'Sales', 'Outlet', 'Produk', 'Total Sales'];
        $rows = $items->map(function($item, $key) {
            return [$key + 1, $item->tanggal, $item->nama_sales, $item->nama_outlet, $item->nama_produk, $item->total_sales];
        });
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), 'Laporan_Logistik.xlsx');
    }
}
