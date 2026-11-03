<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AttendanceRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!\App\Models\FeatureToggle::userHasFeature($user, 'Izin / Sakit') && !$user->isSuperAdminUser() && !$user->isAdminUser()) {
            abort(403, 'Akses ditolak. Fitur Izin/Sakit dinonaktifkan untuk akun Anda.');
        }

        $canApprove = $user->can('approve pengajuan absensi') || $user->isAdminUser() || $user->isSuperAdminUser();
        
        $query = AttendanceRequest::with('user')->orderBy('created_at', 'desc');
        
        if (!$canApprove) {
            $query->where('user_id', $user->id);
        }
            
        return Inertia::render('Absensi/Pengajuan', [
            'requests' => $query->get(),
            'canApprove' => $canApprove
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!\App\Models\FeatureToggle::userHasFeature($user, 'Izin / Sakit') && !$user->isSuperAdminUser() && !$user->isAdminUser()) {
            abort(403, 'Akses ditolak. Fitur Izin/Sakit dinonaktifkan untuk akun Anda.');
        }

        $request->validate([
            'type' => 'required|in:Sakit,Izin,Izin Khusus,Cuti',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:5120' // max 5MB
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $ext = strtolower($file->getClientOriginalExtension());

            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'])) {
                try {
                    $response = Http::withoutVerifying()->timeout(15)->attach(
                        'image',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    )->post('https://api.imgbb.com/1/upload', [
                        'key' => '5950b44b24860057ff810fe73f58868b'
                    ]);

                    if ($response->successful() && $response->json('data.url')) {
                        $path = $response->json('data.url');
                    } else {
                        $path = $file->store('attendance_requests', 'public');
                    }
                } catch (\Throwable $e) {
                    $path = $file->store('attendance_requests', 'public');
                }
            } else {
                $path = $file->store('attendance_requests', 'public');
            }
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

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user->can('approve pengajuan absensi') && !$user->isAdminUser() && !$user->isSuperAdminUser()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses.');
        }

        $request->validate([
            'status' => 'required|in:Disetujui,Ditolak'
        ]);

        $attendanceRequest = AttendanceRequest::findOrFail($id);
        $attendanceRequest->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', 'Status pengajuan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $attendanceRequest = AttendanceRequest::findOrFail($id);
        
        $user = Auth::user();
        if (!$user->isAdminUser() && !$user->isSuperAdminUser() && $attendanceRequest->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        if ($attendanceRequest->attachment && !str_starts_with($attendanceRequest->attachment, 'http')) {
            Storage::disk('public')->delete($attendanceRequest->attachment);
        }
        
        $attendanceRequest->delete();

        return redirect()->back()->with('success', 'Data pengajuan absensi berhasil dihapus.');
    }
}
