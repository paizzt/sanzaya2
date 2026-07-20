<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $providers = Provider::latest()->get();
        return Inertia::render('Providers/Index', [
            'providers' => $providers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'pic_name' => 'nullable|string|max:255',
            'pic_phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        Provider::create($validated);

        return redirect()->route('providers.index')->with('success', 'Data penyedia berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Provider $provider)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'pic_name' => 'nullable|string|max:255',
            'pic_phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $provider->update($validated);

        return redirect()->route('providers.index')->with('success', 'Data penyedia berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Provider $provider)
    {
        $provider->delete();

        return redirect()->route('providers.index')->with('success', 'Data penyedia berhasil dihapus.');
    }

    public function exportPdf()
    {
        $items = \App\Models\Provider::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'type', 'address', 'phone', 'pic_name'];
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
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Penyedia', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Penyedia') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Penyedia') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\Provider::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'type', 'address', 'phone', 'pic_name'];
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
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Penyedia') . '.xlsx');
    }
}
