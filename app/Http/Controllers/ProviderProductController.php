<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProviderProductController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'jenis' => 'nullable|string|in:Alat Kesehatan,BMHP',
            'link' => 'nullable|string',
            'provider_id' => 'required|exists:providers,id',
            'registration_no' => 'nullable|string|max:100',
            'qty' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'tkdn' => 'nullable|numeric|min:0|max:100',
            'hna' => 'nullable|numeric|min:0'
        ]);

        \App\Models\ProviderProduct::create($validated);

        return redirect()->back()->with('success', 'Produk penyedia berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\ProviderProduct $providerProduct)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'jenis' => 'nullable|string|in:Alat Kesehatan,BMHP',
            'link' => 'nullable|string',
            'registration_no' => 'nullable|string|max:100',
            'qty' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'tkdn' => 'nullable|numeric|min:0|max:100',
            'hna' => 'nullable|numeric|min:0'
        ]);

        $providerProduct->update($validated);

        return redirect()->back()->with('success', 'Produk penyedia berhasil diperbarui.');
    }

    public function destroy(\App\Models\ProviderProduct $providerProduct)
    {
        $providerProduct->delete();

        return redirect()->back()->with('success', 'Produk penyedia berhasil dihapus.');
    }
}
