<?php

namespace App\Http\Controllers;

use App\Models\ItemRequirement;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\ItemRequirementExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ItemRequirementController extends Controller
{
    public function index(Request $request)
    {
        $query = ItemRequirement::query();

        if ($request->search) {
            $query->where('item_name', 'like', "%{$request->search}%")
                  ->orWhere('outlet_name', 'like', "%{$request->search}%");
        }

        // Group by outlet name for the frontend accordion
        $items = $query->orderBy('created_at', 'desc')->get()->groupBy('outlet_name');
        
        $outlets = Outlet::pluck('name');

        $activeShares = [];
        foreach ($items->keys() as $outletName) {
            if (\Illuminate\Support\Facades\Cache::has('share_active_' . md5($outletName))) {
                $activeShares[$outletName] = true;
            }
        }

        return Inertia::render('ItemRequirements/Index', [
            'groupedItems' => $items,
            'outlets' => $outlets,
            'companies' => \App\Models\Company::orderBy('name')->pluck('name'),
            'filters' => $request->only('search'),
            'activeShares' => $activeShares
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'outlet_name' => 'required|string|max:255',
            'month_year' => 'required|string|max:255',
            'item_name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sent' => 'required|integer|min:0',
            'not_sent' => 'required|integer|min:0',
            'link' => 'nullable|string'
        ]);

        $validated['total'] = $validated['quantity'] * $validated['price'];

        ItemRequirement::create($validated);

        return redirect()->back()->with('success', 'Data kebutuhan barang berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $item = ItemRequirement::findOrFail($id);

        $validated = $request->validate([
            'outlet_name' => 'required|string|max:255',
            'month_year' => 'required|string|max:255',
            'item_name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sent' => 'required|integer|min:0',
            'not_sent' => 'required|integer|min:0',
            'link' => 'nullable|string'
        ]);

        $validated['total'] = $validated['quantity'] * $validated['price'];

        $item->update($validated);

        return redirect()->back()->with('success', 'Data kebutuhan barang berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $item = ItemRequirement::findOrFail($id);
        $item->delete();

        return redirect()->back()->with('success', 'Data kebutuhan barang berhasil dihapus.');
    }

    public function exportPdf(Request $request)
    {
        $outlet_name = $request->query('outlet');
        $query = ItemRequirement::query();
        
        if ($outlet_name) {
            $query->where('outlet_name', $outlet_name);
        }
        
        $items = $query->orderBy('outlet_name')->orderBy('id', 'desc')->get();

        $pdf = Pdf::loadView('pdf.item_requirements', compact('items', 'outlet_name'))
                  ->setPaper('a4', 'landscape');
                  
        $filename = 'Laporan_Kebutuhan_Barang' . ($outlet_name ? '_' . str_replace(' ', '_', $outlet_name) : '') . '.pdf';

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request)
    {
        $outlet_name = $request->query('outlet');
        $filename = 'Laporan_Kebutuhan_Barang' . ($outlet_name ? '_' . str_replace(' ', '_', $outlet_name) : '') . '.xlsx';
        
        return Excel::download(new ItemRequirementExport($outlet_name), $filename);
    }

    public function toggleShare(Request $request)
    {
        $request->validate([
            'outlet_name' => 'required|string',
            'is_active' => 'required|boolean'
        ]);

        $key = 'share_active_' . md5($request->outlet_name);

        if ($request->is_active) {
            \Illuminate\Support\Facades\Cache::forever($key, true);
        } else {
            \Illuminate\Support\Facades\Cache::forget($key);
        }

        return back()->with('success', $request->is_active ? 'Link bagikan diaktifkan.' : 'Link bagikan dimatikan.');
    }

    public function publicIndex(Request $request)
    {
        $outlet_name = $request->query('outlet');
        $month = $request->query('month');
        $year = $request->query('year');
        
        $query = ItemRequirement::query();

        if ($outlet_name) {
            $key = 'share_active_' . md5($outlet_name);
            if (!\Illuminate\Support\Facades\Cache::has($key)) {
                abort(403, 'Link ini tidak aktif atau telah dimatikan.');
            }
            $query->where('outlet_name', $outlet_name);
            
            if ($month) {
                $query->where('month_year', 'like', $month . ' %');
            }
            if ($year) {
                $query->where('month_year', 'like', '% ' . $year);
            }
        } else {
            abort(403, 'Outlet harus dipilih.');
        }

        $items = $query->orderBy('id', 'desc')->get();

        $groupedItems = $items->groupBy('outlet_name');

        return Inertia::render('Public/ItemRequirements', [
            'groupedItems' => $groupedItems,
            'outletName' => $outlet_name,
            'filterMonth' => $month,
            'filterYear' => $year
        ]);
    }
}
