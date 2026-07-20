<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $items = PurchaseOrder::orderBy('id', 'desc')->get();
        return Inertia::render('PurchaseOrders/Index', [
            'items' => $items
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'nullable|date',
            'nama_outlet' => 'nullable|string',
            'nama_produk' => 'nullable|string',
            'jumlah' => 'nullable|integer',
            'satuan' => 'nullable|string',
            'total_faktur' => 'nullable|numeric',
            'terkirim' => 'nullable|integer',
            'belum_terkirim' => 'nullable|integer',
            'persen_terpenuhi' => 'nullable|numeric',
            'persen_belum_terpenuhi' => 'nullable|numeric',
            'keterangan' => 'nullable|string',
        ]);
        
        if ($request->id) {
            PurchaseOrder::find($request->id)->update($validated);
        } else {
            PurchaseOrder::create($validated);
        }
        
        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function destroy($id)
    {
        PurchaseOrder::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    public function exportPdf()
    {
        $items = \App\Models\PurchaseOrder::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['tanggal', 'nama_outlet', 'nama_produk', 'jumlah', 'satuan', 'total_faktur'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $row[] = $item->$col;
                }
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Surat Pesanan', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Surat Pesanan') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Surat Pesanan') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\PurchaseOrder::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['tanggal', 'nama_outlet', 'nama_produk', 'jumlah', 'satuan', 'total_faktur'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $row[] = $item->$col;
                }
                return $row;
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Surat Pesanan') . '.xlsx');
    }
}
