<?php

namespace App\Http\Controllers;

use App\Models\Payable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayableController extends Controller
{
    public function index()
    {
        $items = Payable::orderBy('id', 'desc')->get();
        $providers = \App\Models\Provider::orderBy('name')->get();
        return Inertia::render('Payables/Index', [
            'items' => $items,
            'providers' => $providers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_penyedia' => 'nullable|string',
            'nominal' => 'nullable|numeric',
        ]);
        
        if ($request->id) {
            Payable::find($request->id)->update($validated);
        } else {
            Payable::create($validated);
        }
        
        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function destroy($id)
    {
        Payable::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
