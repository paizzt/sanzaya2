<?php

namespace App\Http\Controllers;

use App\Models\LogisticReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogisticReportController extends Controller
{
    public function index()
    {
        $items = LogisticReport::orderBy('id', 'desc')->get();
        return Inertia::render('LogisticReports/Index', [
            'items' => $items
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
}
