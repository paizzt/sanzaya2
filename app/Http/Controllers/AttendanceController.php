<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class AttendanceController extends Controller
{
    public function index()
    {
        try {
            PayrollController::ensurePayrollTablesStatic();
            if (Schema::hasTable('attendances')) {
                if (!Schema::hasColumn('attendances', 'shift')) {
                    Schema::table('attendances', function ($table) {
                        $table->string('shift', 50)->nullable()->after('status');
                    });
                }
                if (!Schema::hasColumn('attendances', 'check_in_notes')) {
                    Schema::table('attendances', function ($table) {
                        $table->text('check_in_notes')->nullable()->after('notes');
                    });
                }
                if (!Schema::hasColumn('attendances', 'check_out_notes')) {
                    Schema::table('attendances', function ($table) {
                        $table->text('check_out_notes')->nullable()->after('check_in_notes');
                    });
                }
            }
        } catch (\Throwable $e) {}

        $settings = PayrollController::getPayrollSettings();
        $autoCheckoutTimeWeekday = substr($settings['jam_pulang_otomatis'] ?? '17:00', 0, 5) . ':00';
        $autoCheckoutTimeSabtu = substr($settings['jam_pulang_otomatis_sabtu'] ?? '13:00', 0, 5) . ':00';
        $jamMulaiWeekday = substr($settings['jam_mulai_lembur_weekday'] ?? '20:00', 0, 5) . ':00';
        $jamMulaiSabtu = substr($settings['jam_mulai_lembur_sabtu'] ?? '14:00', 0, 5) . ':00';

        $today = Carbon::today()->format('Y-m-d');
        $user = Auth::user();
        if (!\App\Models\FeatureToggle::userHasFeature($user, 'Ambil Absensi') && !$user->isSuperAdminUser() && !$user->isAdminUser()) {
            return redirect()->route('dashboard')->with('error', 'Akses ditolak: Fitur Ambil Absensi dinonaktifkan untuk akun Anda.');
        }
        $isSatpam = $user->isSatpam();
        $tanpaLembur = (bool)($user->tanpa_lembur ?? false);
        $tanpaKeterlambatan = (bool)($user->tanpa_keterlambatan ?? false);

        // Cek apakah ada check-in hari sebelumnya yang belum check-out
        // Untuk karyawan biasa, otomatis check-out di jam pulang otomatis (Senin-Jumat 17:00, Sabtu 13:00) pada hari tersebut agar tidak mengganggu absensi hari ini.
        // Khusus SATPAM: TIDAK auto-checkout karena jam kerjanya bisa lintas hari (misal jam 22:00 malam s/d 08:00 pagi).
        if (!$isSatpam) {
            $uncompletedPast = Attendance::where('user_id', $user->id)
                ->where('date', '<', $today)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->get();
                
            foreach ($uncompletedPast as $uncompleted) {
                $isSatDate = Carbon::parse(substr($uncompleted->date, 0, 10))->dayOfWeek === Carbon::SATURDAY;
                $uncompleted->check_out_time = $isSatDate ? $autoCheckoutTimeSabtu : $autoCheckoutTimeWeekday;
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
        $isSaturday = Carbon::now()->dayOfWeek === Carbon::SATURDAY;
        $isSunday = Carbon::now()->dayOfWeek === Carbon::SUNDAY;
        $userWorkDays = $user->work_days_per_week ?? 6;
        $isOffDay = ($isSunday || ($isSaturday && $userWorkDays <= 5));
        
        // Khusus SATPAM atau pengguna dengan saklar Tanpa Lembur: TIDAK berlaku jam lembur
        if (!$isSatpam && !$tanpaLembur) {
            if ($attendance && $attendance->check_in_time && !$attendance->check_out_time) {
                $attDate = Carbon::parse($attendance->date);
                $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
                $isSunday = $attDate->dayOfWeek === Carbon::SUNDAY;
                $isOffDay = ($isSunday || ($isSaturday && $userWorkDays <= 5));
                $overtimeThreshold = ($isSaturday && $userWorkDays >= 6) ? $jamMulaiSabtu : $jamMulaiWeekday;

                if ($isOffDay) {
                    $isOvertime = true;
                } else if ($now->isSameDay($attDate)) {
                    if ($now->format('H:i:s') >= $overtimeThreshold) {
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
            'isSaturday' => $isSaturday,
            'isSunday' => $isSunday,
            'isOffDay' => $isOffDay,
            'userWorkDays' => $user->work_days_per_week ?? 6,
            'tanpaLembur' => $tanpaLembur,
            'tanpaKeterlambatan' => $tanpaKeterlambatan,
            'overtimeWeekdayStart' => substr($jamMulaiWeekday, 0, 5),
            'overtimeSaturdayStart' => substr($jamMulaiSabtu, 0, 5),
            'history' => $history,
            'company' => $user->company,
            'isMarketing' => $user->hasRoleCaseInsensitive(['Marketing', 'Sales']),
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
        try {
            if (Schema::hasTable('attendances') && !Schema::hasColumn('attendances', 'shift')) {
                Schema::table('attendances', function ($table) {
                    $table->string('shift', 50)->nullable()->after('status');
                });
            }
        } catch (\Throwable $e) {}

        $request->validate([
            'type' => 'required|in:check_in,check_out',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'shift' => 'nullable|string|in:Shift Siang,Shift Malam',
        ]);

        $user = Auth::user();
        
        $company = $user->company;
        if (!$company || !$company->latitude || !$company->longitude) {
            return redirect()->back()->with('error', 'PT Anda belum memiliki pengaturan lokasi. Silakan hubungi admin.');
        }

        $userLat = (float)($request->latitude ?? 0);
        $userLon = (float)($request->longitude ?? 0);
        $compLat = (float)$company->latitude;
        $compLon = (float)$company->longitude;

        // Haversine formula
        $earthRadius = 6371000; // Radius bumi dalam meter
        $dLat = deg2rad($compLat - $userLat);
        $dLon = deg2rad($compLon - $userLon);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($userLat)) * cos(deg2rad($compLat)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;
        $maxRadius = $company->radius ?? 300;

        // Bypass validasi radius untuk role Marketing karena kerja di lapangan
        if (!$user->hasRoleCaseInsensitive(['Marketing', 'Sales'])) {
            if ($distance > $maxRadius || ($userLat == 0 && $userLon == 0)) {
                if (empty($request->photo_url)) {
                    $formattedDistance = number_format($distance, 0, ',', '.');
                    return redirect()->back()->with('error', "Lokasi GPS tidak terdeteksi atau berada di luar jangkauan area absen PT. Wajib sertakan foto bukti kehadiran.");
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
            $isSaturday = false;
            $isSunday = false;
            $isOffDay = false;
            $userWorkDays = $user->work_days_per_week ?? 6;
            $tanpaLembur = (bool)($user->tanpa_lembur ?? false);

            $settings = PayrollController::getPayrollSettings();
            $jamMulaiWeekday = substr($settings['jam_mulai_lembur_weekday'] ?? '20:00', 0, 5) . ':00';
            $jamMulaiSabtu = substr($settings['jam_mulai_lembur_sabtu'] ?? '14:00', 0, 5) . ':00';

            // Khusus SATPAM atau pengguna dengan saklar Tanpa Lembur: TIDAK berlaku jam lembur
            if (!$user->isSatpam() && !$tanpaLembur) {
                $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
                $isSunday = $attDate->dayOfWeek === Carbon::SUNDAY;
                $isOffDay = ($isSunday || ($isSaturday && $userWorkDays <= 5));
                $overtimeThreshold = ($isSaturday && $userWorkDays >= 6) ? $jamMulaiSabtu : $jamMulaiWeekday;

                if ($isOffDay) {
                    $isOvertime = true;
                } else if ($now->isSameDay($attDate)) {
                    if ($now->format('H:i:s') >= $overtimeThreshold) {
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
            
            $notes = trim($request->notes ?? '');
            if (!$tanpaLembur) {
                if (!empty($notes)) {
                    $attendance->notes = $notes;
                    $attendance->check_out_notes = $notes;
                    if ($isOvertime && !$user->isSatpam()) {
                        $attendance->overtime_status = 'Menunggu';
                    }
                } elseif ($isOvertime && $isOffDay && !$user->isSatpam()) {
                    // Masuk di hari libur otomatis set status lembur Menunggu
                    $defaultOffNote = $isSunday ? 'Lembur Hari Libur (Minggu)' : 'Lembur Hari Libur (Sabtu)';
                    $attendance->notes = $defaultOffNote;
                    $attendance->check_out_notes = $defaultOffNote;
                    $attendance->overtime_status = 'Menunggu';
                }
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

        if (isset($attendance) && $attendance->date) {
            $d = Carbon::parse($attendance->date);
            PayrollController::syncUserPayrollFromAttendance((int)$attendance->user_id, (int)$d->month, (int)$d->year);
        }

        $message = $request->type === 'check_in' 
            ? ($user->isSatpam() ? 'Berhasil Masuk Shift!' : 'Berhasil Absen Masuk!') 
            : ($user->isSatpam() ? 'Berhasil Keluar Shift (Pergantian Shift Selesai)!' : 'Berhasil Absen Pulang!');
        return redirect()->back()->with('success', $message);
    }

    public function update(Request $request, $id)
    {
        if ($id === 'pengajuan' || $id === 'settings' || $id === 'rekap') {
            abort(404, 'Data absensi tidak ditemukan.');
        }

        $user = Auth::user();
        $canEdit = $user && ($user->isAdminUser() || $user->isSuperAdminUser());
        if (!$canEdit) {
            abort(403, 'Hanya admin / superadmin yang dapat mengubah data absensi.');
        }

        if (is_string($id) && str_starts_with($id, 'alpa_')) {
            $parts = explode('_', $id);
            $userId = $parts[1] ?? null;
            $date = $parts[2] ?? null;
            if ($userId && $date) {
                $attendance = Attendance::firstOrNew([
                    'user_id' => $userId,
                    'date' => $date
                ]);
                if (!$attendance->exists) {
                    $attendance->status = 'Hadir';
                    $attendance->check_in_time = '08:00:00';
                    $attendance->check_out_time = '17:00:00';
                }
            } else {
                abort(404, 'Data absensi tidak ditemukan.');
            }
        } else {
            $realId = is_string($id) ? str_replace('att_', '', $id) : $id;
            $attendance = Attendance::findOrFail($realId);
        }

        $hasInCol = false;
        $hasOutCol = false;
        try {
            if (Schema::hasTable('attendances')) {
                if (!Schema::hasColumn('attendances', 'check_in_notes')) {
                    Schema::table('attendances', function ($table) {
                        $table->text('check_in_notes')->nullable()->after('notes');
                    });
                }
                if (!Schema::hasColumn('attendances', 'check_out_notes')) {
                    Schema::table('attendances', function ($table) {
                        $table->text('check_out_notes')->nullable()->after('check_in_notes');
                    });
                }
                $hasInCol = Schema::hasColumn('attendances', 'check_in_notes');
                $hasOutCol = Schema::hasColumn('attendances', 'check_out_notes');
            }
        } catch (\Throwable $e) {}

        $request->validate([
            'check_in_notes' => ['nullable', 'string', 'max:500'],
            'check_out_notes' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            'shift' => ['nullable', 'string', 'max:50'],
        ]);

        $rawIn = $request->input('check_in_notes');
        $rawOut = $request->input('check_out_notes');

        $checkInNotes = ($rawIn !== null && trim((string)$rawIn) !== '') ? trim((string)$rawIn) : null;
        $checkOutNotes = ($rawOut !== null && trim((string)$rawOut) !== '') ? trim((string)$rawOut) : null;

        if ($hasInCol) {
            $attendance->check_in_notes = $checkInNotes;
        }
        if ($hasOutCol) {
            $attendance->check_out_notes = $checkOutNotes;
        }

        // Gabungkan ke kolom notes agar rekap / export lama tetap sinkron
        $combined = [];
        if (!empty($checkInNotes)) {
            $combined[] = 'Masuk: ' . $checkInNotes;
        }
        if (!empty($checkOutNotes)) {
            $combined[] = 'Pulang: ' . $checkOutNotes;
        }
        if (!empty($combined)) {
            $attendance->notes = implode(' | ', $combined);
        } elseif ($request->filled('notes')) {
            $attendance->notes = trim((string)$request->notes);
        } else {
            $attendance->notes = null;
        }

        if ($request->has('shift')) {
            $attendance->shift = $request->shift ?: null;
        }

        // Update overtime status jika relevan
        try {
            PayrollController::ensurePayrollTablesStatic();
            $payrollSettings = PayrollController::getPayrollSettings();
            $attDate = Carbon::parse(substr($attendance->date, 0, 10));
            $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
            $isSunday = $attDate->dayOfWeek === Carbon::SUNDAY;
            $userWorkDays = $attendance->user?->work_days_per_week ?? 6;
            $isOffDay = ($isSunday || ($isSaturday && $userWorkDays <= 5));
            $jamMulaiWeekday = substr($payrollSettings['jam_mulai_lembur_weekday'] ?? '20:00', 0, 5) . ':00';
            $jamMulaiSabtu = substr($payrollSettings['jam_mulai_lembur_sabtu'] ?? '14:00', 0, 5) . ':00';
            $overtimeThreshold = ($isSaturday && $userWorkDays >= 6) ? $jamMulaiSabtu : $jamMulaiWeekday;

            if ($isOffDay) {
                if (empty($attendance->overtime_status)) {
                    $attendance->overtime_status = 'Menunggu';
                }
            } elseif ($attendance->check_out_time && $attendance->check_out_time >= $overtimeThreshold && !empty($checkOutNotes)) {
                if (empty($attendance->overtime_status)) {
                    $attendance->overtime_status = 'Menunggu';
                }
            } elseif (empty($checkOutNotes) && $attendance->status !== 'Lembur') {
                $attendance->overtime_status = null;
            }
        } catch (\Throwable $e) {}

        $attendance->save();

        try {
            $d = Carbon::parse($attendance->date);
            PayrollController::syncUserPayrollFromAttendance((int)$attendance->user_id, (int)$d->month, (int)$d->year);
        } catch (\Throwable $e) {}

        return redirect()->back()->with('success', 'Keterangan absensi berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        
        $user = Auth::user();
        if (!$user->isAdminUser() && !$user->isSuperAdminUser() && $attendance->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // We no longer delete files from storage because they are in ImgBB
        // If we want, we can just delete the record directly.
        
        $attUserId = (int)$attendance->user_id;
        $attDate = Carbon::parse($attendance->date);
        $attendance->delete();
        PayrollController::syncUserPayrollFromAttendance($attUserId, (int)$attDate->month, (int)$attDate->year);

        return redirect()->back()->with('success', 'Data absensi berhasil dihapus.');
    }

    public function updateOvertimeStatus(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user || (!$user->isAdminUser() && !$user->isSuperAdminUser())) {
            abort(403, 'Unauthorized action.');
        }

        PayrollController::ensurePayrollTablesStatic();

        $request->validate([
            'status' => ['required', 'in:Disetujui,Ditolak,Menunggu'],
        ]);

        $attendance = Attendance::findOrFail($id);
        $attendance->overtime_status = $request->status;
        $attendance->save();

        $d = Carbon::parse($attendance->date);
        PayrollController::syncUserPayrollFromAttendance((int)$attendance->user_id, (int)$d->month, (int)$d->year);

        $msg = $request->status === 'Disetujui'
            ? 'Alasan lembur berhasil diterima (Lembur Ter-ACC).'
            : ($request->status === 'Ditolak' ? 'Alasan lembur ditolak.' : 'Status lembur diubah.');

        return redirect()->back()->with('success', $msg);
    }

    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        if (!$user || (!$user->isAdminUser() && !$user->isSuperAdminUser())) {
            abort(403, 'Unauthorized action.');
        }

        PayrollController::ensurePayrollTablesStatic();

        $request->validate([
            'jam_pulang_otomatis' => ['required', 'string', 'max:10'],
            'jam_pulang_otomatis_sabtu' => ['nullable', 'string', 'max:10'],
            'jam_mulai_lembur_weekday' => ['required', 'string', 'max:10'],
            'jam_mulai_lembur_sabtu' => ['required', 'string', 'max:10'],
            'jam_batas_terlambat' => ['required', 'string', 'max:10'],
            'toleransi_terlambat_lembur_jam' => ['required', 'numeric', 'min:0', 'max:12'],
            'month' => ['nullable', 'integer'],
            'year' => ['nullable', 'integer'],
        ]);

        $jamPulang = substr(trim($request->jam_pulang_otomatis), 0, 5);
        $jamPulangSabtu = substr(trim($request->input('jam_pulang_otomatis_sabtu', '13:00') ?: '13:00'), 0, 5);
        $jamWeekday = substr(trim($request->jam_mulai_lembur_weekday), 0, 5);
        $jamSabtu = substr(trim($request->jam_mulai_lembur_sabtu), 0, 5);
        $jamTerlambat = substr(trim($request->jam_batas_terlambat), 0, 5);
        $toleransiJam = (float)$request->toleransi_terlambat_lembur_jam;

        $row = \Illuminate\Support\Facades\DB::table('payroll_settings')->first();
        if ($row) {
            \Illuminate\Support\Facades\DB::table('payroll_settings')->where('id', $row->id)->update([
                'jam_pulang_otomatis' => $jamPulang,
                'jam_pulang_otomatis_sabtu' => $jamPulangSabtu,
                'jam_mulai_lembur_weekday' => $jamWeekday,
                'jam_mulai_lembur_sabtu' => $jamSabtu,
                'jam_batas_terlambat' => $jamTerlambat,
                'toleransi_terlambat_lembur_jam' => $toleransiJam,
                'updated_at' => now(),
            ]);
        } else {
            \Illuminate\Support\Facades\DB::table('payroll_settings')->insert([
                'tarif_potongan_terlambat' => 20000,
                'tarif_lembur_weekday_pertama' => 30000,
                'tarif_lembur_weekday_berikutnya' => 20000,
                'tarif_lembur_sabtu' => 20000,
                'jam_pulang_otomatis' => $jamPulang,
                'jam_pulang_otomatis_sabtu' => $jamPulangSabtu,
                'jam_mulai_lembur_weekday' => $jamWeekday,
                'jam_mulai_lembur_sabtu' => $jamSabtu,
                'jam_batas_terlambat' => $jamTerlambat,
                'toleransi_terlambat_lembur_jam' => $toleransiJam,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $targetMonth = (int)($request->input('month') ?: date('n'));
        $targetYear = (int)($request->input('year') ?: date('Y'));

        // Perbarui jam checkout pada absensi auto-checkout di bulan terkait (Senin-Jumat vs Sabtu)
        $autoCheckouts = Attendance::whereMonth('date', $targetMonth)
            ->whereYear('date', $targetYear)
            ->where(function ($q) {
                $q->where('notes', 'Auto checkout oleh sistem (Lupa absen pulang)')
                  ->orWhere('check_out_notes', 'Otomatis keluar oleh sistem');
            })
            ->get();

        foreach ($autoCheckouts as $ac) {
            $isSatDate = Carbon::parse(substr($ac->date, 0, 10))->dayOfWeek === Carbon::SATURDAY;
            $ac->check_out_time = ($isSatDate ? $jamPulangSabtu : $jamPulang) . ':00';
            $ac->save();
        }

        // Sinkronkan ulang data gaji bulan tersebut jika ada
        try {
            $payrolls = \App\Models\Payroll::where('period_month', $targetMonth)
                ->where('period_year', $targetYear)
                ->get();
            foreach ($payrolls as $p) {
                PayrollController::syncUserPayrollFromAttendance((int)$p->user_id, $targetMonth, $targetYear);
            }
        } catch (\Throwable $e) {}

        return redirect()->back()->with('success', 'Pengaturan jam absensi, lembur, dan keterlambatan berhasil disimpan.');
    }
}
