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
    public function index(Request $request)
    {
        $user = Auth::user();
        $savedPt = '';
        if ($request->has('pt')) {
            $savedPt = (string)$request->query('pt');
            session(['uc_approval_selected_pt' => $savedPt]);
            try {
                $prefs = $user->preferences ?: [];
                $prefs['uc_approval_selected_pt'] = $savedPt;
                $user->preferences = $prefs;
                $user->save();
            } catch (\Throwable $e) {}
        } else {
            $savedPt = (string)(session('uc_approval_selected_pt') ?? ($user->preferences['uc_approval_selected_pt'] ?? ''));
        }

        // Get all UC requests with user, creator, approver and items relationships
        $requests = UcRequest::with(['user.division', 'creator.division', 'approver.division', 'items'])->orderBy('created_at', 'desc')->get();
        $companies = \App\Models\Company::orderBy('name')->get();
        
        return Inertia::render('Requests/UcApproval', [
            'requests' => $requests,
            'companies' => $companies,
            'savedPt' => $savedPt,
            'isAdmin' => $user->isSuperAdminUser() || $user->isAdminUser()
        ]);
    }

    public function savePreference(Request $request)
    {
        $pt = (string)$request->input('pt', '');
        session(['uc_approval_selected_pt' => $pt]);
        try {
            $user = Auth::user();
            if ($user) {
                $prefs = $user->preferences ?: [];
                $prefs['uc_approval_selected_pt'] = $pt;
                $user->preferences = $prefs;
                $user->save();
            }
        } catch (\Throwable $e) {}

        return response()->json(['success' => true]);
    }

    public function update(Request $request, $id)
    {
        if ($request->status === 'ACC' || $request->status === 'acc') {
            $request->merge(['status' => 'Disetujui']);
        } elseif ($request->status === 'Tolak' || $request->status === 'tolak') {
            $request->merge(['status' => 'Ditolak']);
        } elseif ($request->status === 'Revisi' || $request->status === 'revisi') {
            $request->merge(['status' => 'Direvisi']);
        } elseif ($request->status === 'Selesai' || $request->status === 'selesai') {
            $request->merge(['status' => 'Selesai']);
        }

        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('uc_requests')) {
                \Illuminate\Support\Facades\Schema::table('uc_requests', function ($table) {
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('uc_requests', 'total_nota')) {
                        $table->decimal('total_nota', 15, 2)->nullable()->default(0);
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('uc_requests', 'dibayarkan')) {
                        $table->decimal('dibayarkan', 15, 2)->nullable()->default(0);
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('uc_requests', 'reimburse_sisa_dana')) {
                        $table->decimal('reimburse_sisa_dana', 15, 2)->nullable()->default(0);
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('uc_requests', 'pengembalian_dana')) {
                        $table->decimal('pengembalian_dana', 15, 2)->nullable()->default(0);
                    }
                });
            }
        } catch (\Throwable $e) {}

        // Sanitize and normalize items payload
        if ($request->has('items') && is_array($request->items)) {
            $cleanedItems = [];
            foreach ($request->items as $item) {
                $name = trim($item['item_name'] ?? '');
                $rawQty = $item['quantity'] ?? 1;
                $rawCost = $item['estimated_cost'] ?? 0;

                // Skip rows where name is empty and cost is zero/empty
                if ($name === '' && (empty($rawCost) || $rawCost === '0' || $rawCost === 0)) {
                    continue;
                }

                $qty = max(1, (int)$rawQty);

                if (is_string($rawCost)) {
                    $digits = preg_replace('/[^0-9]/', '', $rawCost);
                    $cost = $digits !== '' ? (float)$digits : 0;
                } else {
                    $cost = (float)$rawCost;
                }

                $cleanedItems[] = [
                    'item_name' => $name,
                    'quantity' => $qty,
                    'estimated_cost' => $cost,
                ];
            }
            $request->merge(['items' => $cleanedItems]);
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
            'total_nota' => 'nullable|numeric|min:0',
            'dibayarkan' => 'nullable|numeric|min:0',
            'reimburse_sisa_dana' => 'nullable|numeric|min:0',
            'pengembalian_dana' => 'nullable|numeric|min:0',
        ]);

        $uc = UcRequest::with('items')->findOrFail($id);

        $updateData = [
            'status' => $request->status,
            'finance_note' => $request->finance_note,
            'approved_by' => Auth::id(),
        ];

        if ($request->filled('total_nota')) $updateData['total_nota'] = $request->total_nota;
        if ($request->filled('dibayarkan')) $updateData['dibayarkan'] = $request->dibayarkan;
        if ($request->filled('reimburse_sisa_dana')) $updateData['reimburse_sisa_dana'] = $request->reimburse_sisa_dana;
        if ($request->filled('pengembalian_dana')) $updateData['pengembalian_dana'] = $request->pengembalian_dana;

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
        $query = \App\Models\UcRequest::with(['user', 'items'])->orderBy('id', 'desc');
        if (request()->filled('pt')) {
            $query->where('entity', request('pt'));
        } elseif (request()->filled('entity')) {
            $query->where('entity', request('entity'));
        }
        $items = $query->get();
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
        $query = \App\Models\UcRequest::with(['user', 'items'])->orderBy('id', 'desc');
        if (request()->filled('pt')) {
            $query->where('entity', request('pt'));
        } elseif (request()->filled('entity')) {
            $query->where('entity', request('entity'));
        }
        $items = $query->get();
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
