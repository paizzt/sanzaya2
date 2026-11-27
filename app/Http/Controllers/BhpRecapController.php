<?php

namespace App\Http\Controllers;

use App\Models\BhpRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BhpRecapController extends Controller
{
    public function index()
    {
        $requests = BhpRequest::with('user')->orderBy('created_at', 'desc')->get();
            
        return Inertia::render('Requests/BhpRecap', [
            'requests' => $requests
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Disetujui,Ditolak,Menunggu',
        ]);

        $bhp = BhpRequest::findOrFail($id);
        $bhp->status = $request->status;
        $bhp->approved_by = $request->status === 'Menunggu' ? null : Auth::id();
        $bhp->save();

        return redirect()->back()->with('success', 'Status pengajuan BHP berhasil diperbarui.');
    }

    public function exportPdf(Request $request)
    {
        $query = BhpRequest::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('year') && $request->year != 'Semua') {
            $query->whereYear('request_date', $request->year);
        }

        if ($request->filled('month') && $request->month != 'Semua') {
            $query->whereMonth('request_date', $request->month);
        }

        if ($request->filled('status') && $request->status != 'Semua') {
            $query->where('status', $request->status);
        }

        $requests = $query->get();

        // Perform additional search filtering if 'search' is provided
        if ($request->filled('search')) {
            $search = strtolower((string) $request->search);
            $requests = $requests->filter(function($req) use ($search) {
                return str_contains(strtolower((string) ($req->product_name ?? '')), $search) ||
                       str_contains(strtolower((string) ($req->request_number ?? '')), $search) ||
                       ($req->user && str_contains(strtolower((string) ($req->user->name ?? '')), $search));
            });
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.bhp_recap', [
            'requests' => $requests,
            'month' => $request->month,
            'year' => $request->year,
            'status' => $request->status
        ])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));

        return request()->has('preview') ? $pdf->stream('Rekap_BHP_' . date('Ymd_His') . '.pdf') : $pdf->download('Rekap_BHP_' . date('Ymd_His') . '.pdf');
    }
}
