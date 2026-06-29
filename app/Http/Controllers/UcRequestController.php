<?php

namespace App\Http\Controllers;

use App\Models\UcRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;


class UcRequestController extends Controller
{
    public function index()
    {
        $users = \App\Models\User::select('id', 'name')->orderBy('name')->get();
            
        return Inertia::render('Requests/UC', [
            'users' => $users
        ]);
    }
    
    public function history()
    {
        $requests = UcRequest::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Requests/UcHistory', [
            'requests' => $requests,
        ]);
    }
    
    public function generatePdf($id)
    {
        $uc = UcRequest::with('user')->findOrFail($id);
        
        $qrUrl = route('requests.uc.index'); // Can be a verification URL
        $qrCode = base64_encode(QrCode::format('png')->size(100)->generate($qrUrl));
        
        $pdf = Pdf::loadView('pdf.uc_request', compact('uc', 'qrCode'));
        return $pdf->download('UC_Request_' . str_pad($uc->id, 4, '0', STR_PAD_LEFT) . '.pdf');
    }

    public function store(Request $request)
    {
        $request->validate([
            'entity' => 'required|string',
            'department' => 'required|string',
            'destination_city' => 'required|string',
            'departure_date' => 'required|date',
            'return_date' => 'required|date|after_or_equal:departure_date',
            'estimated_days' => 'required|integer',
            'companions' => 'nullable|array',
            'transportation_type' => 'required|string',
            'vehicle_number' => 'nullable|string',
            'estimated_gas_cost' => 'nullable|numeric',
            'estimated_meals_cost' => 'nullable|numeric',
            'estimated_accommodation_cost' => 'nullable|numeric',
        ]);

        UcRequest::create([
            'request_number' => 'UC-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
            'user_id' => Auth::id(),
            'entity' => $request->entity,
            'department' => $request->department,
            'destination_city' => $request->destination_city,
            'departure_date' => $request->departure_date,
            'return_date' => $request->return_date,
            'estimated_days' => $request->estimated_days,
            'companions' => $request->companions,
            'transport_type' => $request->transportation_type,
            'vehicle_number' => $request->vehicle_number,
            'estimated_gas_cost' => $request->estimated_gas_cost,
            'estimated_meals_cost' => $request->estimated_meals_cost,
            'estimated_accommodation_cost' => $request->estimated_accommodation_cost,
            'status' => 'Menunggu'
        ]);

        return redirect()->back()->with('success', 'Form Pengajuan UC berhasil dikirim!');
    }

    public function storeResult(Request $request, $id)
    {
        $request->validate([
            'result_summary' => 'required|string',
            'receipt_photos' => 'required|array',
            'receipt_photos.*' => 'file|image|max:5120'
        ]);

        $uc = UcRequest::findOrFail($id);

        if ($uc->user_id !== Auth::id()) {
            abort(403);
        }

        $photos = [];
        if ($request->hasFile('receipt_photos')) {
            foreach ($request->file('receipt_photos') as $file) {
                $path = $file->store('uc_receipts', 'public');
                $photos[] = $path;
            }
        }

        $uc->update([
            'result_summary' => $request->result_summary,
            'receipt_photos' => $photos,
            'status' => 'Selesai / Result Dikirim'
        ]);

        return redirect()->back()->with('success', 'Result UC dan Nota berhasil dikirim!');
    }
}
