<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Receivable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceivableController extends Controller
{
    public function index(Request $request)
    {
        $query = Receivable::with(['outlet', 'company'])->orderBy('id', 'desc');

        if ($request->search) {
            $query->whereHas('outlet', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->pt) {
            $query->where('company_id', $request->pt);
        }

        if ($request->year) {
            $query->whereJsonContains('details', ['year' => $request->year]);
        }

        $items = $query->get();
        
        $outlets = \App\Models\Outlet::orderBy('name')->get();
        $companies = \App\Models\Company::orderBy('name')->get();
        
        $dailyReports = \App\Models\ReceivableDailyReport::with(['user', 'outlet'])->orderBy('billing_date', 'desc')->get();
        $users = \App\Models\User::orderBy('name')->get();

        return Inertia::render('Receivables/Index', [
            'items' => $items,
            'outlets' => $outlets,
            'companies' => $companies,
            'dailyReports' => $dailyReports,
            'users' => $users,
            'filters' => $request->only(['search', 'pt', 'year'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'outlet_id' => 'nullable|exists:outlets,id',
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
        
        $dataToSave = [
            'company_id' => $validated['company_id'] ?? null,
            'outlet_id' => $validated['outlet_id'] ?? null,
            'details' => $validated['details'] ?? [],
            'total' => $total,
        ];
        
        if ($request->id) {
            Receivable::findOrFail($request->id)->update($dataToSave);
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

    public function exportPdf()
    {
        $items = \App\Models\Receivable::with(['outlet', 'company'])->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['nama_outlet', 'nama_pt', 'total'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) {
                $row = [$key + 1];
                $row[] = $item->outlet ? $item->outlet->name : '-';
                $row[] = $item->company ? $item->company->name : '-';
                $row[] = $item->total;
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Piutang', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'portrait'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Piutang') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Piutang') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\Receivable::with(['outlet', 'company'])->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['nama_outlet', 'nama_pt', 'total'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) {
                $row = [$key + 1];
                $row[] = $item->outlet ? $item->outlet->name : '-';
                $row[] = $item->company ? $item->company->name : '-';
                $row[] = $item->total;
                return $row;
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Piutang') . '.xlsx');
    }

    public function storeDailyReport(Request $request)
    {
        $validated = $request->validate([
            'billing_date' => 'required|date',
            'user_id' => 'required|exists:users,id',
            'outlet_id' => 'required|exists:outlets,id',
            'result' => 'required|string',
        ]);

        \App\Models\ReceivableDailyReport::create($validated);

        return redirect()->back()->with('success', 'Laporan harian penagihan berhasil disimpan.');
    }
}
