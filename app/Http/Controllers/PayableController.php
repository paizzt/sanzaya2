<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
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

    public function exportPdf()
    {
        $items = \App\Models\Payable::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['nama_penyedia', 'nominal'];
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
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Hutang', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Hutang') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Hutang') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\Payable::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['nama_penyedia', 'nominal'];
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
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Hutang') . '.xlsx');
    }
}
