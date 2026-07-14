<?php

namespace App\Http\Controllers;

use App\Models\BhpRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;


class BhpRequestController extends Controller
{
    public function index()
    {
        $requests = BhpRequest::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Requests/BHP', [
            'requests' => $requests,
            'today' => Carbon::now()->format('Y-m-d')
        ]);
    }
    
    public function generatePdf($id)
    {
        $bhp = BhpRequest::with('user')->findOrFail($id);
        
        $qrUrl = route('requests.bhp.index');
        $qrCode = base64_encode(QrCode::format('svg')->size(100)->generate($qrUrl));
        
        $pdf = Pdf::loadView('pdf.bhp_request', compact('bhp', 'qrCode'));
        return $pdf->download('BHP_Request_' . str_pad($bhp->id, 4, '0', STR_PAD_LEFT) . '.pdf');
    }

    public function store(Request $request)
    {
        $request->validate([
            'request_date' => 'required|date',
            'department' => 'required|string',
            'target_date' => 'required|date|after_or_equal:request_date',
            'product_name' => 'required|string',
            'specifications' => 'required|string',
        ]);

        BhpRequest::create([
            'request_number' => 'BHP-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
            'user_id' => Auth::id(),
            'request_date' => $request->request_date,
            'division_name' => $request->department,
            'target_date' => $request->target_date,
            'product_name' => $request->product_name,
            'specifications' => $request->specifications,
            'status' => 'Menunggu'
        ]);

        return redirect()->back()->with('success', 'Form Pengajuan BHP berhasil dikirim!');
    }
}
