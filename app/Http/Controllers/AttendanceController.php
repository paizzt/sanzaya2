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
        $user = Auth::user();
        $isSatpam = $user->isSatpam();

        // Cek apakah ada check-in hari sebelumnya yang belum check-out
        // Untuk karyawan biasa, otomatis check-out di jam 17:00:00 pada hari tersebut agar tidak mengganggu absensi hari ini.
        // Khusus SATPAM: TIDAK auto-checkout karena jam kerjanya bisa lintas hari (misal jam 22:00 malam s/d 08:00 pagi).
        if (!$isSatpam) {
            $uncompletedPast = Attendance::where('user_id', $user->id)
                ->where('date', '<', $today)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->get();
                
            foreach ($uncompletedPast as $uncompleted) {
                $uncompleted->check_out_time = '17:00:00';
                $uncompleted->notes = 'Auto checkout oleh sistem (Lupa absen pulang)';
                $uncompleted->save();
            }
        }

        // Ambil data absensi aktif
        if ($isSatpam) {
            // Untuk Satpam: cari absensi aktif yang sedang berjalan (sudah check-in tapi belum check-out),
            // meskipun tanggal check-in adalah hari kemarin (lintas hari).
            $attendance = Attendance::where('user_id', $user->id)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->orderBy('date', 'desc')
                ->first();

            // Jika tidak ada shift aktif yang berjalan, ambil absensi hari ini
            if (!$attendance) {
                $attendance = Attendance::where('user_id', $user->id)
                    ->where('date', $today)
                    ->first();
            }
        } else {
            $attendance = Attendance::where('user_id', $user->id)
                ->where('date', $today)
                ->first();
        }

        $now = Carbon::now();
        $isOvertime = false;
        
        // Khusus SATPAM: TIDAK berlaku jam lembur
        if (!$isSatpam) {
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
        }

        $startOfMonth = Carbon::now()->startOfMonth()->format('Y-m-d');
        $endOfMonth = Carbon::now()->endOfMonth()->format('Y-m-d');
        
        $history = Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->orderBy('date', 'desc')
            ->get();

        $activeDutySatpam = null;
        if ($isSatpam) {
            $activeDutySatpam = Attendance::with('user')
                ->whereHas('user', function($q) use ($user) {
                    $q->where('id', '!=', $user->id);
                })
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->orderBy('date', 'desc')
                ->first();
        }

        return Inertia::render('Absensi/Index', [
            'attendance' => $attendance,
            'today' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
            'currentTime' => Carbon::now()->format('H:i'),
            'isOvertime' => $isOvertime,
            'history' => $history,
            'company' => $user->company,
            'isMarketing' => $user->hasRole(['Marketing', 'marketing']),
            'isSatpam' => $isSatpam,
            'activeDutySatpam' => $activeDutySatpam ? [
                'name' => $activeDutySatpam->user?->name ?? 'Petugas Satpam',
                'shift' => $activeDutySatpam->shift ?? 'Shift Siang',
                'check_in_time' => $activeDutySatpam->check_in_time,
                'date' => $activeDutySatpam->date,
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:check_in,check_out',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'shift' => 'nullable|string|in:Shift Siang,Shift Malam',
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
            // Untuk Satpam: pastikan tidak ada shift aktif sebelumnya yang belum checkout
            if ($user->isSatpam()) {
                $activeShift = Attendance::where('user_id', $user->id)
                    ->whereNotNull('check_in_time')
                    ->whereNull('check_out_time')
                    ->first();
                if ($activeShift) {
                    $shiftDateStr = Carbon::parse($activeShift->date)->isoFormat('D MMMM Y');
                    $shiftName = $activeShift->shift ? "({$activeShift->shift}) " : "";
                    return redirect()->back()->with('error', "Anda masih memiliki shift aktif {$shiftName}tanggal {$shiftDateStr} (Jam Masuk: {$activeShift->check_in_time}) yang belum Keluar Shift. Silakan lakukan Keluar Shift terlebih dahulu.");
                }
            }

            $attendance = Attendance::firstOrCreate(
                ['user_id' => $user->id, 'date' => $today],
                ['status' => 'Hadir']
            );

            if ($attendance->check_in_time) {
                return redirect()->back()->with('error', $user->isSatpam() ? 'Anda sudah melakukan Masuk Shift hari ini.' : 'Anda sudah melakukan absensi masuk hari ini.');
            }
            $attendance->check_in_time = $currentTime;
            $attendance->latitude = $userLat;
            $attendance->longitude = $userLon;
            if ($user->isSatpam()) {
                $defaultShift = (Carbon::now()->hour >= 7 && Carbon::now()->hour < 19) ? 'Shift Siang' : 'Shift Malam';
                $attendance->shift = $request->shift ?: $defaultShift;
            }
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
                return redirect()->back()->with('error', $user->isSatpam() ? 'Tidak ada shift aktif yang bisa di-checkout.' : 'Tidak ada absensi masuk yang bisa di-checkout.');
            }

            $now = Carbon::now();
            $attDate = Carbon::parse($attendance->date);
            $isCrossDay = $now->isAfter($attDate) && !$now->isSameDay($attDate);
            
            $isOvertime = false;
            // Khusus SATPAM: TIDAK berlaku jam lembur
            if (!$user->isSatpam()) {
                if ($now->isSameDay($attDate)) {
                    if ($now->hour >= 20) {
                        $isOvertime = true;
                    }
                } else if ($now->isAfter($attDate)) {
                    $isOvertime = true;
                }
            }

            // Atur jam check out
            if (!$user->isSatpam() && $isCrossDay) {
                // Untuk karyawan biasa jika checkout di hari berikutnya, dicap 23:59:59
                $attendance->check_out_time = '23:59:59';
            } else {
                // Untuk SATPAM (atau checkout hari yang sama), simpan jam checkout aktual (misal 08:00:00)
                $attendance->check_out_time = $now->format('H:i:s');
            }
            
            $attendance->latitude = $userLat;
            $attendance->longitude = $userLon;
            
            if ($isOvertime) {
                $attendance->notes = $request->notes;
            } elseif ($user->isSatpam() && $isCrossDay) {
                if (empty($attendance->notes)) {
                    $attendance->notes = ($attendance->shift ?? 'Shift Malam') . ' (Lintas hari: selesai ' . $now->isoFormat('D MMM Y') . ' ' . $now->format('H:i') . ')';
                }
            }

            if (!empty($request->photo_url)) {
                $attendance->check_out_photo = $request->photo_url;
            }
            
            $attendance->save();
        }

        $message = $request->type === 'check_in' 
            ? ($user->isSatpam() ? 'Berhasil Masuk Shift!' : 'Berhasil Absen Masuk!') 
            : ($user->isSatpam() ? 'Berhasil Keluar Shift (Pergantian Shift Selesai)!' : 'Berhasil Absen Pulang!');
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
            'check_in_time' => ['nullable', 'regex:/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'check_out_time' => ['nullable', 'regex:/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'notes' => ['nullable', 'string', 'max:255'],
            'shift' => ['nullable', 'in:Shift Siang,Shift Malam'],
        ]);

        $checkIn = $request->check_in_time;
        if ($checkIn) {
            // Pad left with 0 if it's 4 chars (e.g., 8:00 -> 08:00)
            if (strlen($checkIn) === 4 && strpos($checkIn, ':') === 1) {
                $checkIn = '0' . $checkIn;
            }
            if (strlen($checkIn) === 5) {
                $checkIn .= ':00';
            }
        }
        
        $checkOut = $request->check_out_time;
        if ($checkOut) {
            // Pad left with 0 if it's 4 chars (e.g., 8:00 -> 08:00)
            if (strlen($checkOut) === 4 && strpos($checkOut, ':') === 1) {
                $checkOut = '0' . $checkOut;
            }
            if (strlen($checkOut) === 5) {
                $checkOut .= ':00';
            }
        }

        \Illuminate\Support\Facades\Log::info('Updating Attendance ID ' . $id, [
            'original_check_in' => $attendance->check_in_time,
            'original_check_out' => $attendance->check_out_time,
            'new_check_in' => $checkIn,
            'new_check_out' => $checkOut,
            'request_check_in' => $request->check_in_time,
            'request_check_out' => $request->check_out_time,
            'notes' => $request->notes,
            'shift' => $request->shift,
        ]);

        $attendance->check_in_time = $checkIn;
        $attendance->check_out_time = $checkOut;
        if ($request->has('notes')) {
            $attendance->notes = $request->notes;
        }
        if ($request->has('shift')) {
            $attendance->shift = $request->shift;
        }
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
