<?php

namespace App\Http\Controllers;

use App\Models\WarehouseStock;
use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Cache;

class WarehouseStockController extends Controller
{
    public function index(Request $request)
    {
        $query = WarehouseStock::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%")
                  ->orWhere('link', 'like', "%{$request->search}%");
        }

        $items = $query->with('provider')->orderBy('name')->get();
        $isShared = Cache::has('share_warehouse_stocks_active');
        $providers = Provider::orderBy('name')->get();

        return Inertia::render('WarehouseStocks/Index', [
            'items' => $items,
            'providers' => $providers,
            'filters' => $request->only('search'),
            'isShared' => $isShared
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:255',
            'minimum_stock' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'link' => 'nullable|string',
            'incoming_date' => 'nullable|date',
            'po_date' => 'nullable|date',
            'provider_id' => 'nullable|exists:providers,id'
        ]);

        $validated['minimum_stock'] = $validated['minimum_stock'] ?? 0;

        WarehouseStock::create($validated);

        return redirect()->back()->with('success', 'Data stok gudang berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $stock = WarehouseStock::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:255',
            'minimum_stock' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'link' => 'nullable|string',
            'incoming_date' => 'nullable|date',
            'po_date' => 'nullable|date',
            'provider_id' => 'nullable|exists:providers,id'
        ]);

        $validated['minimum_stock'] = $validated['minimum_stock'] ?? 0;

        $stock->update($validated);

        return redirect()->back()->with('success', 'Data stok gudang berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $stock = WarehouseStock::findOrFail($id);
        $stock->delete();

        return redirect()->back()->with('success', 'Data stok gudang berhasil dihapus.');
    }

    public function exportPdf()
    {
        $items = WarehouseStock::orderBy('name')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'code', 'category', 'quantity', 'unit', 'link'];
            $headings = ['Nama Barang', 'Kode', 'Kategori', 'Stok', 'Satuan', 'Link E-Katalog'];
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $row[] = $item->$col;
                }
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Stok Gudang', 'headings' => $headings, 'rows' => $rows])
                ->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Stok Gudang') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Stok Gudang') . '.pdf');
    }

    public function exportExcel()
    {
        $items = WarehouseStock::orderBy('name')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'code', 'category', 'quantity', 'unit', 'link'];
            $headings = ['Nama Barang', 'Kode', 'Kategori', 'Stok', 'Satuan', 'Link E-Katalog'];
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $row[] = $item->$col;
                }
                return $row;
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Stok Gudang') . '.xlsx');
    }

    public function toggleShare(Request $request)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $key = 'share_warehouse_stocks_active';

        if ($request->is_active) {
            Cache::forever($key, true);
        } else {
            Cache::forget($key);
        }

        return back()->with('success', $request->is_active ? 'Link bagikan diaktifkan.' : 'Link bagikan dimatikan.');
    }

    public function publicIndex(Request $request)
    {
        $key = 'share_warehouse_stocks_active';
        if (!Cache::has($key)) {
            abort(403, 'Link ini tidak aktif atau telah dimatikan.');
        }

        $query = WarehouseStock::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%")
                  ->orWhere('link', 'like', "%{$request->search}%");
        }

        $items = $query->orderBy('name')->get();

        return Inertia::render('Public/WarehouseStocks', [
            'items' => $items,
            'filters' => $request->only('search')
        ]);
    }
}
