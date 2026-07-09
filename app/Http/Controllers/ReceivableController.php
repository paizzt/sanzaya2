<?php

namespace App\Http\Controllers;

use App\Models\Receivable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceivableController extends Controller
{
    public function index()
    {
        $items = Receivable::orderBy('id', 'desc')->get();
        return Inertia::render('Receivables/Index', [
            'items' => $items
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_outlet' => 'nullable|string',
            'tahun_1' => 'nullable|numeric',
            'tahun_2' => 'nullable|numeric',
            'tahun_3' => 'nullable|numeric',
            'tahun_4' => 'nullable|numeric',
            'total_sanzaya' => 'nullable|numeric',
            'ruma_1' => 'nullable|numeric',
            'ruma_2' => 'nullable|numeric',
            'ruma_3' => 'nullable|numeric',
            'total_ruma' => 'nullable|numeric',
            'total_gabungan' => 'nullable|numeric',
        ]);
        
        if ($request->id) {
            Receivable::find($request->id)->update($validated);
        } else {
            Receivable::create($validated);
        }
        
        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function destroy($id)
    {
        Receivable::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
