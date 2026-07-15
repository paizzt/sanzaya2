<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Outlet;
use App\Models\MarketingArea;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OutletController extends Controller
{
    public function index(Request $request)
    {
        $query = Outlet::with(['marketingArea', 'mappings'])->orderBy('id', 'desc');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $outlets = $query->get();
        $areas = MarketingArea::orderBy('name')->get();
        
        $types = Outlet::whereNotNull('type')->where('type', '!=', '')->select('type')->distinct()->orderBy('type')->pluck('type');
        $cities = Outlet::whereNotNull('city')->where('city', '!=', '')->select('city')->distinct()->orderBy('city')->pluck('city');

        return Inertia::render('Outlets/Index', [
            'outlets' => $outlets,
            'areas' => $areas,
            'types' => $types,
            'cities' => $cities,
            'filters' => $request->only(['type', 'city', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'marketing_area_id' => 'required|exists:marketing_areas,id',
            'pic_name' => 'nullable|string|max:255',
            'pic_position' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
        ]);

        Outlet::create($request->all());

        return redirect()->back()->with('success', 'Data outlet berhasil ditambahkan.');
    }

    public function update(Request $request, Outlet $outlet)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'marketing_area_id' => 'required|exists:marketing_areas,id',
            'pic_name' => 'nullable|string|max:255',
            'pic_position' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
        ]);

        $outlet->update($request->all());

        return redirect()->back()->with('success', 'Data outlet berhasil diperbarui.');
    }

    public function destroy(Outlet $outlet)
    {
        $outlet->delete();
        return redirect()->back()->with('success', 'Data outlet berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:outlets,id'
        ]);

        Outlet::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', 'Data outlet yang dipilih berhasil dihapus.');
    }

    public function exportPdf()
    {
        $items = \App\Models\Outlet::orderBy('id', 'desc')->get();
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
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Outlet', 'headings' => $headings, 'rows' => $rows])->setPaper([0, 0, 609.4488, 935.433], 'landscape');
        return $pdf->download(str_replace(' ', '_', 'Data Outlet') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\Outlet::orderBy('id', 'desc')->get();
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
        
        return Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Outlet') . '.xlsx');
    }
}
