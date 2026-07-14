<?php

namespace App\Http\Controllers;

use App\Models\Receivable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceivableController extends Controller
{
    public function index(Request $request)
    {
        $query = Receivable::orderBy('id', 'desc');

        if ($request->search) {
            $query->where('nama_outlet', 'like', '%' . $request->search . '%');
        }

        if ($request->pt) {
            $query->where('nama_pt', $request->pt);
        }

        if ($request->year) {
            $query->whereJsonContains('details', ['year' => $request->year]);
        }

        $items = $query->get();
        
        $outlets = \App\Models\Outlet::orderBy('name')->get();
        $companies = \App\Models\Company::orderBy('name')->get();
        
        return Inertia::render('Receivables/Index', [
            'items' => $items,
            'outlets' => $outlets,
            'companies' => $companies,
            'filters' => $request->only(['search', 'pt', 'year'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pt' => 'nullable|string',
            'nama_outlet' => 'nullable|string',
            'details' => 'nullable|array',
            'details.*.year' => 'nullable|string',
            'details.*.amount' => 'nullable|numeric'
        ]);

        // Calculate total
        $total = 0;
        if (!empty($validated['details'])) {
            foreach ($validated['details'] as $detail) {
                if (!empty($detail['amount'])) {
                    $total += (float) $detail['amount'];
                }
            }
        }
        
        // Encode details back to json string for DB storage or leave as array if Laravel casts it automatically
        // Laravel doesn't automatically cast JSON if not defined in $casts, but we can define it or json_encode here.
        // Actually, we'll just encode it to be safe.
        $dataToSave = [
            'nama_pt' => $validated['nama_pt'] ?? null,
            'nama_outlet' => $validated['nama_outlet'] ?? null,
            'details' => $validated['details'] ?? [],
            'total' => $total,
        ];
        
        if ($request->id) {
            Receivable::find($request->id)->update($dataToSave);
        } else {
            Receivable::create($dataToSave);
        }
        
        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function destroy($id)
    {
        Receivable::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
