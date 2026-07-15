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
            $hidden = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'];
            $headings = array_diff(array_keys($items->first()->getAttributes()), $hidden);
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $headings);
            array_unshift($headings, 'No');
            
            $rows = $items->map(function($item, $key) use ($hidden) {
                $row = [$key + 1];
                foreach ($item->getAttributes() as $col => $val) {
                    if (!in_array($col, $hidden)) {
                        $row[] = $val;
                    }
                }
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Surat Pesanan', 'headings' => $headings, 'rows' => $rows])->setPaper([0, 0, 609.4488, 935.433], 'landscape');
        return $pdf->download(str_replace(' ', '_', 'Surat Pesanan') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\PurchaseOrder::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $hidden = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'];
            $headings = array_diff(array_keys($items->first()->getAttributes()), $hidden);
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $headings);
            array_unshift($headings, 'No');
            
            $rows = $items->map(function($item, $key) use ($hidden) {
                $row = [$key + 1];
                foreach ($item->getAttributes() as $col => $val) {
                    if (!in_array($col, $hidden)) {
                        $row[] = $val;
                    }
                }
                return $row;
            });
        }
        
        return Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Surat Pesanan') . '.xlsx');
    }
}
