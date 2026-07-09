<?php

namespace App\Http\Controllers;

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
}
