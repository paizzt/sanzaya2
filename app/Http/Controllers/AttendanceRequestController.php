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
            return redirect()->route('dashboard')->with('error', 'Akses ditolak: Fitur Izin/Sakit dinonaktifkan untuk akun Anda.');
        }

        $canApprove = $user->can('approve pengajuan absensi') || $user->isAdminUser() || $user->isSuperAdminUser();
        
        $query = AttendanceRequest::with('user')->orderBy('created_at', 'desc');
        
        if (!$canApprove) {
            $query->where('user_id', $user->id);
        }
            
        return Inertia::render('Absensi/Pengajuan', [
            'requests' => $query->get(),
            'canApprove' => $canApprove,
            'isSuperAdmin' => $user->isSuperAdminUser()
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!\App\Models\FeatureToggle::userHasFeature($user, 'Izin / Sakit') && !$user->isSuperAdminUser() && !$user->isAdminUser()) {
            return redirect()->back()->with('error', 'Akses ditolak: Fitur Izin/Sakit dinonaktifkan untuk akun Anda.');
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
                        $path = str_replace('://i.ibb.co/', '://i.ibb.co.com/', $response->json('data.url'));
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

    public function updateDates(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user->isSuperAdminUser()) {
            return redirect()->back()->with('error', 'Akses ditolak: Hanya Superadmin yang dapat mengubah rentang tanggal pengajuan.');
        }

        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $attendanceRequest = AttendanceRequest::findOrFail($id);
        $attendanceRequest->update([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return redirect()->back()->with('success', 'Rentang tanggal pengajuan berhasil diperbarui.');
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
            return redirect()->back()->with('error', 'Akses ditolak: Anda tidak memiliki izin untuk menghapus pengajuan ini.');
        }

        if ($attendanceRequest->attachment && !str_starts_with($attendanceRequest->attachment, 'http')) {
            Storage::disk('public')->delete($attendanceRequest->attachment);
        }
        
        $attendanceRequest->delete();

        return redirect()->back()->with('success', 'Data pengajuan absensi berhasil dihapus.');
    }

    public function attachment(Request $request, $id)
    {
        $attendanceRequest = AttendanceRequest::findOrFail($id);
        $user = Auth::user();

        $canView = $user->can('approve pengajuan absensi')
            || $user->can('view rekap absensi')
            || \App\Models\FeatureToggle::userHasFeature($user, 'Rekap Absensi')
            || $user->isAdminUser()
            || $user->isSuperAdminUser()
            || $attendanceRequest->user_id === $user->id;

        if (!$canView) {
            abort(403, 'Anda tidak memiliki izin untuk melihat lampiran ini.');
        }

        $rawPath = trim((string) ($attendanceRequest->attachment ?? ''));
        if ($rawPath === '') {
            abort(404, 'Lampiran tidak ditemukan.');
        }

        $isDownload = $request->boolean('download');

        if (str_starts_with($rawPath, 'http://') || str_starts_with($rawPath, 'https://')) {
            $cdnUrl = str_replace('://i.ibb.co/', '://i.ibb.co.com/', $rawPath);
            $parsedPath = parse_url($cdnUrl, PHP_URL_PATH) ?: '';
            $filename = basename($parsedPath) ?: ('lampiran-' . $attendanceRequest->id . '.jpg');
            $proxyUrl = 'https://wsrv.nl/?url=' . urlencode($cdnUrl);

            $response = null;
            foreach ([$cdnUrl, $proxyUrl] as $targetUrl) {
                try {
                    $res = Http::withoutVerifying()
                        ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                        ->timeout(15)
                        ->get($targetUrl);

                    $body = $res->body();
                    $ct = strtolower((string) $res->header('Content-Type'));
                    $bodyPrefix = strtolower(substr(ltrim($body), 0, 15));
                    $isHtml = str_contains($ct, 'text/html')
                        || str_starts_with($bodyPrefix, '<!doctype')
                        || str_starts_with($bodyPrefix, '<html');

                    if ($res->successful() && strlen($body) > 0 && !$isHtml) {
                        $response = $res;
                        break;
                    }
                } catch (\Throwable $e) {
                    continue;
                }
            }

            if ($response) {
                $contentType = $response->header('Content-Type');
                if (!$contentType || str_contains(strtolower($contentType), 'text/html')) {
                    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                    $contentType = match ($ext) {
                        'png' => 'image/png',
                        'webp' => 'image/webp',
                        'gif' => 'image/gif',
                        'pdf' => 'application/pdf',
                        default => 'image/jpeg',
                    };
                }

                $safeFilename = preg_replace('/["\r\n\\\\]/', '_', $filename);
                $disposition = $isDownload ? 'attachment' : 'inline';
                return response($response->body(), 200)
                    ->header('Content-Type', $contentType)
                    ->header('Content-Disposition', $disposition . '; filename="' . $safeFilename . '"')
                    ->header('Cache-Control', 'private, max-age=86400');
            }

            return redirect($proxyUrl);
        }

        if (Storage::disk('public')->exists($rawPath)) {
            if ($isDownload) {
                return Storage::disk('public')->download($rawPath);
            }
            return response()->file(Storage::disk('public')->path($rawPath));
        }

        $fallbackPath = public_path('storage/' . $rawPath);
        if (file_exists($fallbackPath)) {
            return $isDownload
                ? response()->download($fallbackPath)
                : response()->file($fallbackPath);
        }

        abort(404, 'File lampiran tidak ditemukan di server.');
    }
}
