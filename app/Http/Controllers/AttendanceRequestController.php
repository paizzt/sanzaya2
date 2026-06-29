<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AttendanceRequestController extends Controller
{
    public function index()
    {
        $requests = AttendanceRequest::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Absensi/Pengajuan', [
            'requests' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:Sakit,Izin,Izin Khusus',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'attachment' => 'nullable|file|max:5120' // max 5MB
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attendance_requests', 'public');
        }

        AttendanceRequest::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'attachment' => $path,
            'status' => 'Menunggu'
        ]);

        return redirect()->back()->with('success', 'Pengajuan berhasil dikirim dan menunggu persetujuan.');
    }
}
