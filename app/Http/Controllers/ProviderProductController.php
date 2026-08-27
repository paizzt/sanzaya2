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
            'hna' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0'
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
            'hna' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0'
        ]);

        $providerProduct->update($validated);

        return redirect()->back()->with('success', 'Produk penyedia berhasil diperbarui.');
    }

    public function destroy(\App\Models\ProviderProduct $providerProduct)
    {
        $providerProduct->delete();

        return redirect()->back()->with('success', 'Produk penyedia berhasil dihapus.');
    }

    public function exportPdf($provider)
    {
        $provider = \App\Models\Provider::findOrFail($provider);
        $items = \App\Models\ProviderProduct::where('provider_id', $provider->id)->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'code', 'jenis', 'registration_no', 'unit', 'tkdn', 'price', 'hna', 'qty'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $val = $item->$col;
                    if (in_array($col, ['price', 'hna'])) {
                        $val = 'Rp ' . number_format((float)$val, 0, ',', '.');
                    }
                    $row[] = $val;
                }
                return $row;
            });
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.generic_table', [
            'title' => 'Data Barang - ' . $provider->name,
            'headings' => $headings,
            'rows' => $rows
        ])->setPaper('a4', 'landscape');

        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Barang ' . $provider->name) . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Barang ' . $provider->name) . '.pdf');
    }

    public function exportExcel($provider)
    {
        $provider = \App\Models\Provider::findOrFail($provider);
        $items = \App\Models\ProviderProduct::where('provider_id', $provider->id)->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'code', 'jenis', 'registration_no', 'unit', 'tkdn', 'price', 'hna', 'qty'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $row[] = $item->$col;
                }
                return $row;
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new \App\Exports\GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\GenericExport($rows, $headings), str_replace(' ', '_', 'Data Barang ' . $provider->name) . '.xlsx');
    }
}
