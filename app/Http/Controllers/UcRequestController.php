<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\UcRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;


class UcRequestController extends Controller
{
    public function index()
    {
        try {
            if (Schema::hasTable('uc_requests') && !Schema::hasColumn('uc_requests', 'description')) {
                Schema::table('uc_requests', function ($table) {
                    $table->text('description')->nullable()->after('destination_city');
                });
            }
        } catch (\Throwable $e) {}

        $users = \App\Models\User::select('id', 'name', 'bank_name', 'bank_account_number')->orderBy('name')->get();
        $vehicles = \App\Models\Vehicle::select('id', 'license_plate', 'brand_type')->orderBy('license_plate')->get();
        $companies = \App\Models\Company::select('id', 'name', 'logo', 'address')->get();
            
        return Inertia::render('Requests/UC', [
            'users' => $users,
            'vehicles' => $vehicles,
            'companies' => $companies,
            'isAdmin' => Auth::user()->isAdminUser()
        ]);
    }
    
    public function history()
    {
        $user = Auth::user();
        $query = UcRequest::with(['user', 'creator', 'items', 'approver'])->orderBy('created_at', 'desc');

        if (!$user->isSuperAdminUser() && !$user->isAdminUser() && !$user->can('approve uc')) {
            $query->where('user_id', $user->id);
        }

        $requests = $query->get();

        $today = now()->toDateString();
        $activeUcs = UcRequest::with(['user', 'creator', 'approver'])
            ->where('departure_date', '<=', $today)
            ->where('return_date', '>=', $today)
            ->whereIn('status', ['Disetujui', 'Selesai / Result Dikirim', 'Dicairkan'])
            ->get();

        return Inertia::render('Requests/UcHistory', [
            'requests' => $requests,
            'activeUcs' => $activeUcs,
            'isAdmin' => $user->isSuperAdminUser() || $user->isAdminUser() || $user->can('approve uc'),
        ]);
    }
    
    public function generatePdf($id)
    {
        $uc = UcRequest::with(['user', 'creator', 'items', 'approver'])->findOrFail($id);
        
        $qrUrl = route('requests.uc.index'); // Can be a verification URL
        $qrCode = base64_encode(QrCode::format('svg')->size(100)->generate($qrUrl));
        
        $entityName = $uc->entity;
        $logoPath = public_path('img/logo.png');
        $companyAddress = null;

        $clean = strtolower(preg_replace('/[^a-z0-9]/', '', $entityName ?? ''));
        $company = \App\Models\Company::all()->first(function($c) use ($clean) {
            $cClean = strtolower(preg_replace('/[^a-z0-9]/', '', $c->name ?? ''));
            return str_contains($clean, $cClean) || str_contains($cClean, $clean);
        });

        if ($company) {
            $companyAddress = $company->address;
            if ($company->logo && file_exists(public_path('storage/' . $company->logo))) {
                $logoPath = !str_contains($clean, 'sanzaya') ? public_path('storage/' . $company->logo) : public_path('img/logo.png');
            }
        }

        if (str_contains($clean, 'harkes')) {
            $logoPath = file_exists(public_path('img/company/harkes.png')) ? public_path('img/company/harkes.png') : public_path('img/logo.png');
        } elseif (str_contains($clean, 'meraki')) {
            $logoPath = file_exists(public_path('img/company/meraki.png')) ? public_path('img/company/meraki.png') : public_path('img/logo.png');
        } elseif (str_contains($clean, 'msi')) {
            $logoPath = file_exists(public_path('img/company/msi.png')) ? public_path('img/company/msi.png') : public_path('img/logo.png');
        } elseif (str_contains($clean, 'ruma')) {
            $logoPath = file_exists(public_path('img/company/ruma.png')) ? public_path('img/company/ruma.png') : public_path('img/logo.png');
        } elseif (str_contains($clean, 'sanzaya')) {
            $logoPath = public_path('img/logo.png');
        } elseif ($company && $company->logo && file_exists(public_path('storage/' . $company->logo))) {
            $logoPath = public_path('storage/' . $company->logo);
        }

        if (!$companyAddress) {
            if (str_contains($clean, 'sanzaya')) {
                $companyAddress = "Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala,\nKota Makassar, Sulawesi Selatan 90235\nTelp/WA: +6281264304010 | Email: admin@Sanzaya.id";
            } elseif (str_contains($clean, 'msi')) {
                $companyAddress = 'Jl. Taman Makam Pahlawan, Makassar, Indonesia.';
            } else {
                $companyAddress = '';
            }
        }

        // Convert logo to DomPDF-safe Base64 data URI so it reliably renders in all environments
        $logoBase64 = \App\Helpers\PdfImageHelper::toPdfSrc($logoPath, 400);
        if (empty($logoBase64) && !empty($logoPath) && file_exists($logoPath)) {
            $ext = strtolower(pathinfo($logoPath, PATHINFO_EXTENSION)) ?: 'png';
            $bytes = @file_get_contents($logoPath);
            if (!empty($bytes)) {
                $logoBase64 = 'data:image/' . ($ext === 'svg' ? 'svg+xml' : $ext) . ';base64,' . base64_encode($bytes);
            }
        }
        if (empty($logoBase64) && file_exists(public_path('img/company/sanzaya.png'))) {
            $bytes = @file_get_contents(public_path('img/company/sanzaya.png'));
            if (!empty($bytes)) {
                $logoBase64 = 'data:image/png;base64,' . base64_encode($bytes);
            }
        }
        if (empty($logoBase64) && file_exists(public_path('img/logo.png'))) {
            $bytes = @file_get_contents(public_path('img/logo.png'));
            if (!empty($bytes)) {
                $logoBase64 = 'data:image/png;base64,' . base64_encode($bytes);
            }
        }
        $logoPath = $logoBase64;

        $withoutResult = request()->boolean('without_result') 
            || request()->boolean('no_result') 
            || request('without_result') === '1' 
            || request('no_result') === '1'
            || request('type') === 'uc_only';

        $pdf = Pdf::setOptions(['isRemoteEnabled' => true, 'isHtml5ParserEnabled' => true])
            ->loadView('pdf.uc_request', compact('uc', 'qrCode', 'logoPath', 'logoBase64', 'companyAddress', 'withoutResult'))
            ->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        
        $safeNumber = preg_replace('/[^A-Za-z0-9_-]/', '_', $uc->request_number ?? ('UC_' . $uc->id));
        $filename = 'UC_' . $safeNumber . ($withoutResult ? '_Tanpa_Result' : '') . '.pdf';

        return request()->has('preview') ? $pdf->stream($filename) : $pdf->download($filename);
    }

    public function store(Request $request)
    {
        try {
            if (Schema::hasTable('uc_requests')) {
                if (!Schema::hasColumn('uc_requests', 'description')) {
                    Schema::table('uc_requests', function ($table) {
                        $table->text('description')->nullable()->after('destination_city');
                    });
                }
                if (!Schema::hasColumn('uc_requests', 'created_by')) {
                    Schema::table('uc_requests', function ($table) {
                        $table->unsignedBigInteger('created_by')->nullable()->after('user_id');
                    });
                }
            }
        } catch (\Throwable $e) {}

        $request->validate([
            'entity' => 'required|string',
            'department' => 'required|string',
            'destination_city' => 'required|string',
            'description' => 'nullable|string',
            'departure_date' => 'required|date',
            'return_date' => 'required|date|after_or_equal:departure_date',
            'estimated_days' => 'required|integer',
            'companions' => 'nullable|array|max:2',
            'companions.*' => 'nullable|string',
            'transportation_type' => 'required|string',
            'vehicle_number' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_cost' => 'required|numeric|min:0',
            'user_id' => 'nullable|exists:users,id',
            'payment_option' => 'required|string|in:PANJAR BIAYA 50%,BAYAR FULL',
        ]);

        $userId = $request->filled('user_id') ? $request->user_id : Auth::id();

        $companions = array_values(array_filter($request->companions ?? [], fn($c) => !empty(trim((string)$c))));
        $companions = array_slice($companions, 0, 2);

        $ucRequest = UcRequest::create([
            'request_number' => 'UC-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
            'user_id' => $userId,
            'created_by' => Auth::id(),
            'entity' => $request->entity,
            'department' => $request->department,
            'destination_city' => $request->destination_city,
            'description' => $request->description ?? $request->keterangan,
            'departure_date' => $request->departure_date,
            'return_date' => $request->return_date,
            'estimated_days' => $request->estimated_days,
            'companions' => $companions,
            'transport_type' => $request->transportation_type,
            'vehicle_number' => $request->vehicle_number,
            'payment_option' => $request->payment_option,
            'status' => 'Menunggu'
        ]);

        foreach ($request->items as $item) {
            $ucRequest->items()->create([
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity'],
                'estimated_cost' => $item['estimated_cost'],
                'total_cost' => $item['quantity'] * $item['estimated_cost']
            ]);
        }

        return redirect()->back()->with('success', 'Form Pengajuan UC berhasil dikirim!');
    }

    public function storeResult(Request $request, $id)
    {
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

        $request->validate([
            'result_summary' => 'required|string',
            'receipt_photos' => 'nullable|array',
            'receipt_photos.*' => 'file|mimes:jpeg,png,jpg|max:5120',
            'total_nota' => 'nullable|numeric|min:0',
            'dibayarkan' => 'nullable|numeric|min:0',
            'reimburse_sisa_dana' => 'nullable|numeric|min:0',
            'pengembalian_dana' => 'nullable|numeric|min:0',
        ]);

        $uc = UcRequest::findOrFail($id);
        $user = Auth::user();

        $isOwner = $uc->user_id === $user->id || $uc->created_by === $user->id;
        $isAdmin = $user->isSuperAdminUser() || $user->isAdminUser() || $user->can('approve uc') || $user->can('approve uc requests');

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Akses ditolak.');
        }

        if ($uc->status === 'Selesai') {
            return redirect()->back()->with('error', 'Result pengajuan UC ini sudah di-ACC (Selesai) dan tidak dapat diubah lagi.');
        }

        $existingPhotos = [];
        try {
            if ($uc->result_receipts) {
                $decoded = json_decode($uc->result_receipts, true);
                if (is_array($decoded)) $existingPhotos = $decoded;
            }
        } catch (\Throwable $e) {}

        if (empty($existingPhotos) && !$request->hasFile('receipt_photos')) {
            $request->validate([
                'receipt_photos' => 'required|array|min:1',
            ], [
                'receipt_photos.required' => 'Foto nota wajib diunggah minimal 1 foto.',
            ]);
        }

        $photos = $existingPhotos;
        if ($request->hasFile('receipt_photos')) {
            $newPhotos = [];
            foreach ($request->file('receipt_photos') as $file) {
                try {
                    $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(15)->attach(
                        'image',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    )->post('https://api.imgbb.com/1/upload', [
                        'key' => '5950b44b24860057ff810fe73f58868b'
                    ]);

                    if ($response->successful() && $response->json('data.url')) {
                        $path = $response->json('data.url');
                    } else {
                        $path = $file->store('uc_receipts', 'public');
                    }
                } catch (\Throwable $e) {
                    $path = $file->store('uc_receipts', 'public');
                }
                $newPhotos[] = $path;
            }
            $photos = array_merge($photos, $newPhotos);
        }

        $totalNota = (float)($request->total_nota ?? 0);
        $dibayarkan = (float)($request->dibayarkan ?? 0);
        $reimburse = $request->filled('reimburse_sisa_dana') ? (float)$request->reimburse_sisa_dana : ($totalNota > $dibayarkan ? $totalNota - $dibayarkan : 0);
        $pengembalian = $request->filled('pengembalian_dana') ? (float)$request->pengembalian_dana : ($dibayarkan > $totalNota ? $dibayarkan - $totalNota : 0);

        $uc->update([
            'result_report' => $request->result_summary,
            'result_receipts' => json_encode($photos),
            'total_nota' => $totalNota,
            'dibayarkan' => $dibayarkan,
            'reimburse_sisa_dana' => $reimburse,
            'pengembalian_dana' => $pengembalian,
            'status' => 'Selesai / Result Dikirim'
        ]);

        return redirect()->back()->with('success', 'Result UC dan Nota berhasil dikirim!');
    }

    public function edit($id)
    {
        $uc = UcRequest::with('items')->findOrFail($id);
        $user = Auth::user();
        
        $isOwner = $uc->user_id === $user->id || $uc->created_by === $user->id;
        $isAdmin = $user->isSuperAdminUser() || $user->isAdminUser() || $user->can('approve uc') || $user->can('approve uc requests');

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Akses ditolak: Anda tidak memiliki izin untuk mengedit pengajuan ini.');
        }

        if ($uc->status === 'Selesai') {
            return redirect()->route('requests.uc.history')->with('error', 'Pengajuan UC yang sudah selesai (Result di-ACC) tidak dapat diedit.');
        }

        if ($uc->status === 'Ditolak' || $uc->status === 'Dibatalkan' || $uc->status === 'Batal') {
            return redirect()->route('requests.uc.history')->with('error', 'Pengajuan UC yang telah ditolak atau dibatalkan tidak dapat diedit.');
        }

        if (!empty($uc->result_report)) {
            return redirect()->route('requests.uc.history')->with('error', 'Pengajuan UC yang sudah memiliki laporan result tidak dapat diedit melalui formulir ini.');
        }

        $users = \App\Models\User::select('id', 'name', 'bank_name', 'bank_account_number')->orderBy('name')->get();
        $vehicles = \App\Models\Vehicle::select('id', 'license_plate', 'brand_type')->orderBy('license_plate')->get();
        $companies = \App\Models\Company::select('id', 'name', 'logo', 'address')->get();

        return Inertia::render('Requests/UcEdit', [
            'ucRequest' => $uc,
            'users' => $users,
            'vehicles' => $vehicles,
            'companies' => $companies,
            'isAdmin' => $isAdmin
        ]);
    }

    public function update(Request $request, $id)
    {
        $uc = UcRequest::findOrFail($id);
        $user = Auth::user();

        $isOwner = $uc->user_id === $user->id || $uc->created_by === $user->id;
        $isAdmin = $user->isSuperAdminUser() || $user->isAdminUser() || $user->can('approve uc') || $user->can('approve uc requests');

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Akses ditolak: Anda tidak memiliki izin untuk memperbarui pengajuan ini.');
        }

        if ($uc->status === 'Selesai' || !empty($uc->result_report)) {
            return redirect()->route('requests.uc.history')->with('error', 'Pengajuan UC yang sudah memiliki laporan result atau sudah selesai di-ACC tidak dapat diedit.');
        }

        if ($uc->status === 'Ditolak' || $uc->status === 'Dibatalkan' || $uc->status === 'Batal') {
            return redirect()->route('requests.uc.history')->with('error', 'Pengajuan UC yang telah ditolak atau dibatalkan tidak dapat diedit.');
        }

        $request->validate([
            'entity' => 'required|string',
            'department' => 'required|string',
            'destination_city' => 'required|string',
            'description' => 'nullable|string',
            'departure_date' => 'required|date',
            'return_date' => 'required|date|after_or_equal:departure_date',
            'estimated_days' => 'required|integer',
            'companions' => 'nullable|array|max:2',
            'companions.*' => 'nullable|string',
            'transportation_type' => 'required|string',
            'vehicle_number' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_cost' => 'required|numeric|min:0',
            'user_id' => 'nullable|exists:users,id',
            'payment_option' => 'required|string|in:PANJAR BIAYA 50%,BAYAR FULL',
        ]);

        $companions = array_values(array_filter($request->companions ?? [], fn($c) => !empty(trim((string)$c))));
        $companions = array_slice($companions, 0, 2);

        $updateData = [
            'entity' => $request->entity,
            'department' => $request->department,
            'destination_city' => $request->destination_city,
            'description' => $request->description ?? $request->keterangan,
            'departure_date' => $request->departure_date,
            'return_date' => $request->return_date,
            'estimated_days' => $request->estimated_days,
            'companions' => $companions,
            'transport_type' => $request->transportation_type,
            'vehicle_number' => $request->vehicle_number,
            'payment_option' => $request->payment_option,
        ];
        if ($request->filled('user_id')) {
            $updateData['user_id'] = $request->user_id;
        }

        // Jika pengajuan diedit (terutama setelah Direvisi atau Disetujui), kembalikan status ke Menunggu agar finance memeriksa ulang
        if ($uc->status === 'Direvisi' || $uc->status === 'Disetujui' || $uc->status === 'ACC') {
            $updateData['status'] = 'Menunggu';
            $updateData['approved_by'] = null;
            $updateData['approved_gas_cost'] = null;
        }

        $uc->update($updateData);

        $uc->items()->delete();
        foreach ($request->items as $item) {
            $uc->items()->create([
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity'],
                'estimated_cost' => $item['estimated_cost'],
                'total_cost' => $item['quantity'] * $item['estimated_cost']
            ]);
        }

        if (Auth::user()->can('approve uc requests') && !str_contains(request()->header('referer', ''), 'history')) {
            return redirect()->route('requests.uc.approval.index')->with('success', 'Form Pengajuan UC berhasil diperbarui!');
        }

        return redirect()->route('requests.uc.history')->with('success', 'Form Pengajuan UC berhasil diperbarui!');
    }

    public function cancel($id)
    {
        $uc = UcRequest::findOrFail($id);
        $user = Auth::user();

        $isOwner = $uc->user_id === $user->id || $uc->created_by === $user->id;
        $isAdmin = $user->isSuperAdminUser() || $user->isAdminUser() || $user->can('approve uc') || $user->can('approve uc requests');

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Akses ditolak: Anda tidak memiliki izin untuk membatalkan pengajuan ini.');
        }

        if ($uc->status === 'Selesai' || !empty($uc->result_report)) {
            return redirect()->back()->with('error', 'Pengajuan UC yang sudah memiliki laporan result atau sudah selesai di-ACC tidak dapat dibatalkan.');
        }

        if ($uc->status === 'Dibatalkan' || $uc->status === 'Batal') {
            return redirect()->back()->with('error', 'Pengajuan UC sudah dalam status dibatalkan.');
        }

        $uc->update([
            'status' => 'Dibatalkan',
            'finance_note' => $uc->finance_note ? $uc->finance_note . "\n(Dibatalkan oleh pemohon)" : 'Dibatalkan oleh pemohon'
        ]);

        return redirect()->back()->with('success', 'Pengajuan UC berhasil dibatalkan!');
    }

    public function destroy($id)
    {
        $uc = UcRequest::findOrFail($id);
        $user = Auth::user();

        $isOwner = $uc->user_id === $user->id || $uc->created_by === $user->id;
        $isAdmin = $user->isSuperAdminUser() || $user->isAdminUser() || $user->can('approve uc') || $user->can('approve uc requests');

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus pengajuan ini.');
        }

        if ($uc->status === 'Selesai') {
            return redirect()->back()->with('error', 'Pengajuan UC yang sudah selesai (Result di-ACC) tidak dapat dihapus.');
        }

        $uc->items()->delete();
        $uc->delete();

        return redirect()->back()->with('success', 'Pengajuan UC berhasil dihapus!');
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
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Form UC', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Form UC') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Form UC') . '.pdf');
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
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Form UC') . '.xlsx');
    }
}
