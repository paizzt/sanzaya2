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
        $items = Payable::with('provider')->orderBy('id', 'desc')->get();
        $providers = \App\Models\Provider::orderBy('name')->get();

        $summary = [
            'total_nominal' => $items->sum('nominal'),
            'total_penyedia' => $items->pluck('provider_id')->unique()->count(),
            'total_data' => $items->count(),
        ];

        $summary['hutang_detail'] = $items->groupBy(function($item) {
            return $item->provider ? $item->provider->name : 'Lainnya';
        })->map(function($group) {
            return $group->sum('nominal');
        })->sortDesc()->take(10)->toArray();

        return Inertia::render('Payables/Index', [
            'items' => $items,
            'providers' => $providers,
            'summary' => $summary
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider_id' => 'nullable|exists:providers,id',
            'nominal' => 'nullable|numeric',
            'tanggal_terima_invoice' => 'nullable|date',
            'nomor_transaksi' => 'nullable|string|max:255',
            'memo' => 'nullable|string',
            'jatuh_tempo_hari' => 'nullable|integer|in:14,30',
        ]);
        
        if ($request->id) {
            Payable::findOrFail($request->id)->update($validated);
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
        $items = \App\Models\Payable::with('provider')->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['tanggal_terima_invoice', 'nomor_transaksi', 'nama_penyedia', 'memo', 'jatuh_tempo_hari', 'nominal', 'umur_hutang'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) {
                $row = [$key + 1];
                $row[] = $item->tanggal_terima_invoice ? $item->tanggal_terima_invoice->format('d/m/Y') : '-';
                $row[] = $item->nomor_transaksi ?: '-';
                $row[] = $item->provider ? $item->provider->name : '-';
                $row[] = $item->memo ?: '-';
                $row[] = $item->jatuh_tempo_hari ? $item->jatuh_tempo_hari . ' Hari' : '-';
                $row[] = $item->nominal;
                $row[] = $item->umur_hutang > 0 ? $item->umur_hutang . ' Hari Terlambat' : 'Belum Jatuh Tempo';
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Hutang', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Hutang') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Hutang') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\Payable::with('provider')->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['tanggal_terima_invoice', 'nomor_transaksi', 'nama_penyedia', 'memo', 'jatuh_tempo_hari', 'nominal', 'umur_hutang'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) {
                $row = [$key + 1];
                $row[] = $item->tanggal_terima_invoice ? $item->tanggal_terima_invoice->format('d/m/Y') : '-';
                $row[] = $item->nomor_transaksi ?: '-';
                $row[] = $item->provider ? $item->provider->name : '-';
                $row[] = $item->memo ?: '-';
                $row[] = $item->jatuh_tempo_hari ? $item->jatuh_tempo_hari . ' Hari' : '-';
                $row[] = $item->nominal;
                $row[] = $item->umur_hutang > 0 ? $item->umur_hutang . ' Hari Terlambat' : 'Belum Jatuh Tempo';
                return $row;
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Hutang') . '.xlsx');
    }
}
