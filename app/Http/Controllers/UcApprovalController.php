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
        $items = \App\Models\UcRequest::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['request_number', 'department', 'departure_city', 'destination_city', 'departure_date', 'status'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');
            
            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $val = $item->$col;
                    $row[] = is_array($val) ? json_encode($val) : $val;
                }
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Persetujuan UC', 'headings' => $headings, 'rows' => $rows])->setPaper([0, 0, 609.4488, 935.433], 'landscape');
        return $pdf->download(str_replace(' ', '_', 'Persetujuan UC') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\UcRequest::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $hidden = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'];
            $headings = array_diff(array_keys($items->first()->getAttributes()), $hidden);
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $headings);
            array_unshift($headings, 'No');
            
            $rows = $items->map(function($item, $key) use ($hidden) {
                $row = [$key + 1];
                foreach ($item->getAttributes() as $col => $val) {
                    if (!in_array($col, $hidden)) {
                        $row[] = is_array($val) ? json_encode($val) : $val;
                    }
                }
                return $row;
            });
        }
        
        return Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Persetujuan UC') . '.xlsx');
    }
}
