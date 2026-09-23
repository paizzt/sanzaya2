<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->format('Y-m-d');
        $attendance = Attendance::where('user_id', Auth::id())
            ->where('date', $today)
            ->first();

        // Cek apakah ada check-in hari sebelumnya yang belum check-out
        if (!$attendance) {
            $yesterday = Carbon::yesterday()->format('Y-m-d');
            $uncompleted = Attendance::where('user_id', Auth::id())
                ->where('date', $yesterday)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->first();
            
            if ($uncompleted) {
                $attendance = $uncompleted;
            }
        }

        $now = Carbon::now();
        $isOvertime = false;
        
        if ($attendance && $attendance->check_in_time && !$attendance->check_out_time) {
            $attDate = Carbon::parse($attendance->date);
            if ($now->isSameDay($attDate)) {
                if ($now->hour >= 20) {
                    $isOvertime = true;
                }
            } else if ($now->isAfter($attDate)) {
                $isOvertime = true;
            }
        }

        $startOfMonth = Carbon::now()->startOfMonth()->format('Y-m-d');
        $endOfMonth = Carbon::now()->endOfMonth()->format('Y-m-d');
        
        $history = Attendance::where('user_id', Auth::id())
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Absensi/Index', [
            'attendance' => $attendance,
            'today' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
            'currentTime' => Carbon::now()->format('H:i'),
            'isOvertime' => $isOvertime,
            'history' => $history,
            'company' => Auth::user()->company,
            'isMarketing' => Auth::user()->hasRole(['Marketing', 'marketing']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:check_in,check_out',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $user = Auth::user();
        
        $company = $user->company;
        if (!$company || !$company->latitude || !$company->longitude) {
            return redirect()->back()->with('error', 'PT Anda belum memiliki pengaturan lokasi. Silakan hubungi admin.');
        }

        $userLat = $request->latitude;
        $userLon = $request->longitude;
        $compLat = $company->latitude;
        $compLon = $company->longitude;

        // Haversine formula
        $earthRadius = 6371000; // Radius bumi dalam meter
        $dLat = deg2rad($compLat - $userLat);
        $dLon = deg2rad($compLon - $userLon);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($userLat)) * cos(deg2rad($compLat)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;
        $maxRadius = $company->radius ?? 300;

        // Bypass validasi radius untuk role Marketing karena kerja di lapangan
        if (!$user->hasRole(['Marketing', 'marketing'])) {
            if ($distance > $maxRadius) {
                if (empty($request->photo_url)) {
                    $formattedDistance = number_format($distance, 0, ',', '.');
                    return redirect()->back()->with('error', "Anda berada di luar jangkauan area absen PT. Jarak Anda: {$formattedDistance} meter (Maksimal: {$maxRadius} meter). Wajib sertakan foto.");
                }
            }
        }

        $today = Carbon::today()->format('Y-m-d');
        $currentTime = Carbon::now()->format('H:i:s');

        if ($request->type === 'check_in') {
            $attendance = Attendance::firstOrCreate(
                ['user_id' => $user->id, 'date' => $today],
                ['status' => 'Hadir']
            );

            if ($attendance->check_in_time) {
                return redirect()->back()->with('error', 'Anda sudah melakukan absensi masuk hari ini.');
            }
            $attendance->check_in_time = $currentTime;
            $attendance->latitude = $userLat;
            $attendance->longitude = $userLon;
            if (!empty($request->photo_url)) {
                $attendance->check_in_photo = $request->photo_url;
            }
            $attendance->save();
        } else {
            // Find the active uncompleted attendance
            $attendance = Attendance::where('user_id', $user->id)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->orderBy('date', 'desc')
                ->first();

            if (!$attendance) {
                return redirect()->back()->with('error', 'Tidak ada absensi masuk yang bisa di-checkout.');
            }

            $now = Carbon::now();
            $attDate = Carbon::parse($attendance->date);
            
            $isOvertime = false;
            if ($now->isSameDay($attDate)) {
                if ($now->hour >= 20) {
                    $isOvertime = true;
                }
            } else if ($now->isAfter($attDate)) {
                $isOvertime = true;
            }

            if ($isOvertime && empty($request->notes)) {
                return redirect()->back()->with('error', 'Catatan lembur wajib diisi karena Anda pulang di atas jam 20:00!');
            }

            if ($now->isAfter($attDate) && !$now->isSameDay($attDate)) {
                // If it's the next day (e.g. 01:00 AM), cap the checkout time to 23:59:59 of the attendance date
                $attendance->check_out_time = '23:59:59';
            } else {
                $attendance->check_out_time = $now->format('H:i:s');
            }
            
            $attendance->latitude = $userLat;
            $attendance->longitude = $userLon;
            
            if ($isOvertime) {
                $attendance->notes = $request->notes;
            }

            if (!empty($request->photo_url)) {
                $attendance->check_out_photo = $request->photo_url;
            }
            
            $attendance->save();
        }

        $message = $request->type === 'check_in' ? 'Berhasil Absen Masuk!' : 'Berhasil Absen Pulang!';
        return redirect()->back()->with('success', $message);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        
        $user = Auth::user();
        if (!$user->hasRole('Superadmin')) {
            abort(403, 'Hanya superadmin yang dapat mengubah data absensi.');
        }

        $request->validate([
            'check_in_time' => 'nullable|date_format:H:i:s',
            'check_out_time' => 'nullable|date_format:H:i:s',
        ]);

        $attendance->check_in_time = $request->check_in_time;
        $attendance->check_out_time = $request->check_out_time;
        $attendance->save();

        return redirect()->back()->with('success', 'Data absensi berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        
        $user = Auth::user();
        if (!$user->isAdminUser() && $attendance->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // We no longer delete files from storage because they are in ImgBB
        // If we want, we can just delete the record directly.
        
        $attendance->delete();

        return redirect()->back()->with('success', 'Data absensi berhasil dihapus.');
    }
}
