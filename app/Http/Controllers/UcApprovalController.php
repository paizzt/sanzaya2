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
        // Get all UC requests with user and items relationships
        $requests = UcRequest::with(['user', 'items'])->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Requests/UcApproval', [
            'requests' => $requests,
            'isAdmin' => Auth::user()->isSuperAdminUser() || Auth::user()->isAdminUser()
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($request->status === 'ACC' || $request->status === 'acc') {
            $request->merge(['status' => 'Disetujui']);
        } elseif ($request->status === 'Tolak' || $request->status === 'tolak') {
            $request->merge(['status' => 'Ditolak']);
        }

        $request->validate([
            'status' => 'required|string|in:' . implode(',', \App\Enums\RequestStatus::ucStatuses()),
            'items' => 'nullable|array',
            'items.*.item_name' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.estimated_cost' => 'required_with:items|numeric|min:0',
            'approved_gas_cost' => 'nullable|numeric',
            'approved_meals_cost' => 'nullable|numeric',
            'approved_accommodation_cost' => 'nullable|numeric',
            'finance_note' => 'nullable|string',
        ]);

        $uc = UcRequest::with('items')->findOrFail($id);

        $updateData = [
            'status' => $request->status,
            'finance_note' => $request->finance_note,
            'approved_by' => Auth::id(),
        ];

        if ($request->has('items') && is_array($request->items)) {
            $uc->items()->delete();
            $totalApproved = 0;
            foreach ($request->items as $item) {
                $qty = (int)($item['quantity'] ?? 1);
                $cost = (float)($item['estimated_cost'] ?? 0);
                $subtotal = $qty * $cost;
                $totalApproved += $subtotal;
                $uc->items()->create([
                    'item_name' => $item['item_name'],
                    'quantity' => $qty,
                    'estimated_cost' => $cost,
                    'total_cost' => $subtotal,
                ]);
            }
            $updateData['approved_gas_cost'] = $totalApproved;
        } else {
            if ($request->has('approved_gas_cost')) $updateData['approved_gas_cost'] = $request->approved_gas_cost;
            if ($request->has('approved_meals_cost')) $updateData['approved_meals_cost'] = $request->approved_meals_cost;
            if ($request->has('approved_accommodation_cost')) $updateData['approved_accommodation_cost'] = $request->approved_accommodation_cost;
        }

        $uc->update($updateData);

        return redirect()->back()->with('success', 'Status pengajuan UC berhasil diperbarui!');
    }

    public function exportPdf()
    {
        $items = \App\Models\UcRequest::with(['user', 'items'])->orderBy('id', 'desc')->get();
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
                'Keterangan',
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
                    $item->description ?? '-',
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
        $items = \App\Models\UcRequest::with(['user', 'items'])->orderBy('id', 'desc')->get();
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
                'Keterangan',
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
                    $item->description ?? '-',
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
