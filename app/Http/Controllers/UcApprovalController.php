<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\UcRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class UcApprovalController extends Controller
{
    public function index()
    {
        // Temukan ID toggle fitur Menu Persetujuan UC secara otomatis untuk ditambahkan jika belum ada
        if (!\App\Models\FeatureToggle::where('name', 'Menu Persetujuan UC')->exists()) {
            \Illuminate\Support\Facades\DB::table('feature_toggles')->insert([
                'name' => 'Menu Persetujuan UC',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Get all UC requests with user relationship
        $requests = UcRequest::with('user')->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Requests/UcApproval', [
            'requests' => $requests
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'approved_gas_cost' => 'nullable|numeric',
            'approved_meals_cost' => 'nullable|numeric',
            'approved_accommodation_cost' => 'nullable|numeric',
            'finance_note' => 'nullable|string',
        ]);

        $uc = UcRequest::findOrFail($id);

        $uc->update([
            'status' => $request->status,
            'approved_gas_cost' => $request->approved_gas_cost,
            'approved_meals_cost' => $request->approved_meals_cost,
            'approved_accommodation_cost' => $request->approved_accommodation_cost,
            'finance_note' => $request->finance_note,
            'approved_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Status pengajuan UC berhasil diperbarui!');
    }

    public function exportPdf()
    {
        $items = \App\Models\UcRequest::with('user')->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $headings = [
                'No', 
                'No Request', 
                'Pemohon', 
                'Entitas', 
                'Kota Asal', 
                'Kota Tujuan', 
                'Tgl Berangkat', 
                'Tgl Pulang', 
                'Transportasi', 
                'Status'
            ];
            
            $rows = $items->map(function($item, $key) {
                return [
                    $key + 1,
                    $item->request_number,
                    $item->user ? $item->user->name : '-',
                    $item->entity,
                    $item->departure_city,
                    $item->destination_city,
                    date('d/m/Y', strtotime($item->departure_date)),
                    date('d/m/Y', strtotime($item->return_date)),
                    $item->transport_type,
                    $item->status
                ];
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Persetujuan UC', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Persetujuan UC') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Persetujuan UC') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\UcRequest::with('user')->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $headings = [
                'No', 
                'No Request', 
                'Pemohon', 
                'Entitas', 
                'Kota Asal', 
                'Kota Tujuan', 
                'Tgl Berangkat', 
                'Tgl Pulang', 
                'Transportasi', 
                'Status'
            ];
            
            $rows = $items->map(function($item, $key) {
                return [
                    $key + 1,
                    $item->request_number,
                    $item->user ? $item->user->name : '-',
                    $item->entity,
                    $item->departure_city,
                    $item->destination_city,
                    date('d/m/Y', strtotime($item->departure_date)),
                    date('d/m/Y', strtotime($item->return_date)),
                    $item->transport_type,
                    $item->status
                ];
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Persetujuan UC') . '.xlsx');
    }
}
