<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\AttendanceRequest;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class AttendanceRecapController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!\App\Models\FeatureToggle::userHasFeature($user, 'Rekap Absensi') && !$user->isSuperAdminUser() && !$user->isAdminUser()) {
            return redirect()->route('dashboard')->with('error', 'Akses ditolak: Fitur Rekap Absensi dinonaktifkan untuk akun Anda.');
        }

        $data = $this->getRecapData($request);
        return Inertia::render('Absensi/Rekap', $data);
    }

    public function exportPdf(Request $request)
    {
        @ini_set('memory_limit', '-1');
        @ini_set('max_execution_time', 300);

        try {
            $data = $this->getRecapData($request);
            
            $paper = $request->query('paper', 'a4');
            $paperSize = ($paper === 'f4') ? [0, 0, 609.4488, 935.433] : $paper;
            $orientation = $request->query('orientation', 'landscape');
            
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.attendance_recap', $data)
                ->setPaper($paperSize, $orientation);
            
            $fileName = 'Rekap_Absensi_' . ($data['filters']['month'] ?? date('m')) . '_' . ($data['filters']['year'] ?? date('Y')) . '.pdf';
            return $request->has('preview') ? $pdf->stream($fileName) : $pdf->download($fileName);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Attendance Recap PDF Export Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'error' => 'Gagal menghasilkan PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getRecapData(Request $request)
    {
        @ini_set('memory_limit', '-1');
        @ini_set('max_execution_time', 300);

        try {
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

        $user = Auth::user();
        $isAdmin = $user ? $user->isAdminUser() : false;

        PayrollController::ensurePayrollTablesStatic();
        $payrollSettings = PayrollController::getPayrollSettings();

        $jamPulangOtomatisWeekday = substr($payrollSettings['jam_pulang_otomatis'] ?? '17:00', 0, 5) . ':00';
        $jamPulangOtomatisSabtu = substr($payrollSettings['jam_pulang_otomatis_sabtu'] ?? '13:00', 0, 5) . ':00';
        $jamMulaiWeekday = substr($payrollSettings['jam_mulai_lembur_weekday'] ?? '20:00', 0, 5) . ':00';
        $jamMulaiSabtu = substr($payrollSettings['jam_mulai_lembur_sabtu'] ?? '14:00', 0, 5) . ':00';
        $jamBatasTerlambat = substr($payrollSettings['jam_batas_terlambat'] ?? '08:15', 0, 5);
        $toleransiLemburJam = (int)($payrollSettings['toleransi_terlambat_lembur_jam'] ?? 1);
        $normalLateThreshold = $jamBatasTerlambat . ':00';
        $overtimeLateThreshold = Carbon::createFromFormat('H:i', $jamBatasTerlambat)
            ->addHours($toleransiLemburJam)
            ->format('H:i:s');
        $startWeekdayHour = (int)substr($jamMulaiWeekday, 0, 2);
        $startSabtuHour = (int)substr($jamMulaiSabtu, 0, 2);

        // Default filters
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $selectedUserId = $request->input('user_id', 'all');

        // Fetch all users with relations once to avoid N+1 queries
        $allUsers = \App\Models\User::with(['roles', 'division'])->get();
        $userWorkDays = [];
        $userIsSatpam = [];
        $userNameMap = [];
        $userTanpaKeterlambatan = [];
        $userTanpaLembur = [];
        foreach ($allUsers as $u) {
            $userWorkDays[$u->id] = $u->work_days_per_week ?? 6;
            $userIsSatpam[$u->id] = $u->isSatpam();
            $userNameMap[$u->id] = $u->name;
            $userTanpaKeterlambatan[$u->id] = (bool)($u->tanpa_keterlambatan ?? false);
            $userTanpaLembur[$u->id] = (bool)($u->tanpa_lembur ?? false);
        }

        // Auto-checkout past uncompleted non-Satpam attendances using configurable jam_pulang_otomatis (Senin-Jumat 17:00, Sabtu 13:00)
        try {
            $pastUnchecked = Attendance::where('date', '<', Carbon::today()->format('Y-m-d'))
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->get();
            foreach ($pastUnchecked as $pu) {
                if (empty($userIsSatpam[$pu->user_id])) {
                    $isSatDate = Carbon::parse(substr($pu->date, 0, 10))->dayOfWeek === Carbon::SATURDAY;
                    $pu->check_out_time = $isSatDate ? $jamPulangOtomatisSabtu : $jamPulangOtomatisWeekday;
                    if (empty($pu->check_out_notes)) {
                        $pu->check_out_notes = 'Otomatis keluar oleh sistem';
                    }
                    $pu->save();
                }
            }

            // Sinkronkan juga absensi auto-checkout hari Sabtu di bulan ini yang sebelumnya tercatat 17:00:00
            $monthAutoCheckouts = Attendance::whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where(function ($q) {
                    $q->where('notes', 'Auto checkout oleh sistem (Lupa absen pulang)')
                      ->orWhere('check_out_notes', 'Otomatis keluar oleh sistem');
                })
                ->get();
            foreach ($monthAutoCheckouts as $mac) {
                if (empty($userIsSatpam[$mac->user_id])) {
                    $isSatDate = Carbon::parse(substr($mac->date, 0, 10))->dayOfWeek === Carbon::SATURDAY;
                    $expectedAutoTime = $isSatDate ? $jamPulangOtomatisSabtu : $jamPulangOtomatisWeekday;
                    if ($mac->check_out_time !== $expectedAutoTime) {
                        $mac->check_out_time = $expectedAutoTime;
                        $mac->save();
                    }
                }
            }
        } catch (\Throwable $e) {}

        // Fetch users for dropdown filter (available to everyone)
        $users = $allUsers->where('is_active', true)->sortBy('name')->values()->map(function($u) {
            return ['id' => $u->id, 'name' => $u->name];
        });

        // Build Queries
        $attendancesQuery = Attendance::with('user')
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc');
            
        $requestsQuery = AttendanceRequest::with('user')
            ->where(function ($q) use ($month, $year) {
                $q->whereMonth('start_date', $month)
                  ->whereYear('start_date', $year)
                  ->orWhereMonth('end_date', $month)
                  ->whereYear('end_date', $year);
            });

        if ($selectedUserId !== 'all') {
            $attendancesQuery->where('user_id', $selectedUserId);
            $requestsQuery->where('user_id', $selectedUserId);
        }

        $attendances = $attendancesQuery->get();
        $attendanceRequests = $requestsQuery->get();

        // Calculate Summaries
        $summary = [
            'hadir' => $attendances->where('status', 'Hadir')->count(),
            'sakit' => 0,
            'izin' => 0,
            'alpa' => 0,
            'lembur' => $attendances->filter(function ($a) use ($userTanpaLembur) {
                return $a->status === 'Lembur' && empty($userTanpaLembur[$a->user_id]) && $a->overtime_status !== 'Ditolak';
            })->count(),
            'terlambat' => 0
        ];

        // Process Attendance Requests to count days
        foreach ($attendanceRequests as $req) {
            if ($req->status !== 'Ditolak') {
                $start = Carbon::parse($req->start_date);
                $end = Carbon::parse($req->end_date);
                $days = $start->diffInDays($end) + 1;

                if (strtolower($req->type) === 'sakit') {
                    $summary['sakit'] += $days;
                } elseif (strtolower($req->type) === 'lembur') {
                    if (empty($userTanpaLembur[$req->user_id])) {
                        $summary['lembur'] += $days;
                    }
                } else {
                    $summary['izin'] += $days;
                }
            }
        }

        // Calculate User Summaries
        $userSummaries = [];
        $usersToSummarize = ($selectedUserId !== 'all') 
            ? $allUsers->where('id', $selectedUserId) 
            : $allUsers;
        
        foreach ($usersToSummarize as $u) {
            $userSummaries[$u->id] = [
                'id' => $u->id,
                'name' => $u->name,
                'is_satpam' => $userIsSatpam[$u->id] ?? false,
                'hadir' => 0,
                'sakit' => 0,
                'izin' => 0,
                'alpa' => 0,
                'lembur' => 0,
                'terlambat' => 0,
                'shift_siang' => 0,
                'shift_malam' => 0,
            ];
        }

        // Build Lembur Map (Hanya lembur yang sudah Disetujui / Ter-ACC)
        $lemburMap = [];
        $startLimit = Carbon::create($year, $month, 1)->subDays(7);
        
        $lemburAttendances = Attendance::where(function ($q) {
                $q->where('status', 'Lembur')
                  ->orWhere('overtime_status', 'Disetujui');
            })
            ->where('date', '>=', $startLimit->format('Y-m-d'))->get();
        foreach ($lemburAttendances as $la) {
            if (empty($userTanpaLembur[$la->user_id]) && $la->overtime_status !== 'Ditolak') {
                $lemburMap[$la->user_id][substr($la->date, 0, 10)] = true;
            }
        }

        $lemburRequests = AttendanceRequest::where('status', '!=', 'Ditolak')
            ->whereRaw('LOWER(type) = ?', ['lembur'])
            ->where('end_date', '>=', $startLimit->format('Y-m-d'))->get();
        foreach ($lemburRequests as $lr) {
            if (!empty($userTanpaLembur[$lr->user_id])) {
                continue;
            }
            $st = Carbon::parse($lr->start_date);
            $en = Carbon::parse($lr->end_date);
            while ($st->lte($en)) {
                $lemburMap[$lr->user_id][$st->format('Y-m-d')] = true;
                $st->addDay();
            }
        }

        foreach ($attendances as $att) {
            $attUser = $att->user;
            $isUserSatpam = $userIsSatpam[$att->user_id] ?? ($attUser ? $attUser->isSatpam() : false);
            $isUserTanpaTerlambat = $userTanpaKeterlambatan[$att->user_id] ?? false;
            $isUserTanpaLembur = $userTanpaLembur[$att->user_id] ?? false;
            $userName = $userNameMap[$att->user_id] ?? ($attUser?->name ?? 'Unknown');

            if (!isset($userSummaries[$att->user_id])) {
                $userSummaries[$att->user_id] = [
                    'id' => $att->user_id,
                    'name' => $userName,
                    'is_satpam' => $isUserSatpam,
                    'hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpa' => 0, 'lembur' => 0, 'terlambat' => 0,
                    'shift_siang' => 0, 'shift_malam' => 0,
                ];
            }
            if ($att->status == 'Hadir') {
                $userSummaries[$att->user_id]['hadir']++;
                
                // Calculate Shift / Terlambat (Khusus SATPAM atau saklar Tanpa Keterlambatan: TIDAK berlaku jam terlambat)
                if ($isUserSatpam) {
                    $att->is_late = false;
                    $shiftName = $att->shift;
                    if (!$shiftName) {
                        $hour = $att->check_in_time ? (int)substr($att->check_in_time, 0, 2) : 8;
                        $shiftName = ($hour >= 7 && $hour < 19) ? 'Shift Siang' : 'Shift Malam';
                    }
                    if ($shiftName === 'Shift Siang') {
                        $userSummaries[$att->user_id]['shift_siang']++;
                    } else {
                        $userSummaries[$att->user_id]['shift_malam']++;
                    }
                } elseif ($isUserTanpaTerlambat) {
                    $att->is_late = false;
                } else {
                    $prevDate = Carbon::parse(substr($att->date, 0, 10))->subDay()->format('Y-m-d');
                    $isLemburYesterday = !empty($lemburMap[$att->user_id][$prevDate]);
                    $threshold = $isLemburYesterday ? $overtimeLateThreshold : $normalLateThreshold;
                    
                    $att->is_late = $att->check_in_time > $threshold;
                    if ($att->is_late) {
                        $userSummaries[$att->user_id]['terlambat']++;
                        $summary['terlambat']++;
                    }
                }

                // Calculate Lembur (Hanya dihitung jika tidak saklar tanpa_lembur & status lembur Disetujui / Ter-ACC)
                if (!$isUserSatpam && !$isUserTanpaLembur) {
                    $attDate = Carbon::parse(substr($att->date, 0, 10));
                    $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
                    $workDays = $userWorkDays[$att->user_id] ?? 6;
                    $overtimeThreshold = ($isSaturday && $workDays == 6) ? $jamMulaiSabtu : $jamMulaiWeekday;

                    $hasOvertimeNotes = !empty(trim($att->check_out_notes ?? '')) || (!empty(trim($att->notes ?? '')) && !str_starts_with($att->notes, 'Masuk:'));
                    if ($att->check_out_time && $att->check_out_time >= $overtimeThreshold && $hasOvertimeNotes && $att->overtime_status === 'Disetujui') {
                        $userSummaries[$att->user_id]['lembur']++;
                        $summary['lembur']++;
                        $lemburMap[$att->user_id][substr($att->date, 0, 10)] = true;
                        $isCross = ($att->check_in_time && $att->check_out_time && $att->check_out_time < $att->check_in_time);
                        $coHour = ($isCross || $att->check_out_time >= '23:55:00') ? 24 : (int)substr($att->check_out_time, 0, 2);
                        if ($isSaturday) {
                            $userSummaries[$att->user_id]['lembur_sabtu'] = ($userSummaries[$att->user_id]['lembur_sabtu'] ?? 0) + max(1, min(24 - $startSabtuHour, $coHour - $startSabtuHour));
                        } else {
                            $userSummaries[$att->user_id]['lembur_weekday_pertama'] = ($userSummaries[$att->user_id]['lembur_weekday_pertama'] ?? 0) + 1;
                            $userSummaries[$att->user_id]['lembur_weekday_berikutnya'] = ($userSummaries[$att->user_id]['lembur_weekday_berikutnya'] ?? 0) + max(0, min(24 - $startWeekdayHour, $coHour - $startWeekdayHour));
                        }
                    }
                }

            } elseif ($att->status == 'Lembur') {
                if (!$isUserSatpam && !$isUserTanpaLembur && $att->overtime_status !== 'Ditolak') {
                    $userSummaries[$att->user_id]['lembur']++;
                    $lemburMap[$att->user_id][substr($att->date, 0, 10)] = true;
                }
            }
        }

        foreach ($attendanceRequests as $req) {
            if ($req->status !== 'Ditolak') {
                if (!isset($userSummaries[$req->user_id])) {
                    $userSummaries[$req->user_id] = [
                        'id' => $req->user_id,
                        'name' => $userNameMap[$req->user_id] ?? ($req->user?->name ?? 'Unknown'),
                        'is_satpam' => $userIsSatpam[$req->user_id] ?? false,
                        'hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpa' => 0, 'lembur' => 0, 'terlambat' => 0,
                        'shift_siang' => 0, 'shift_malam' => 0,
                    ];
                }
                $start = Carbon::parse($req->start_date);
                $end = Carbon::parse($req->end_date);
                $days = $start->diffInDays($end) + 1;
                
                if (strtolower($req->type) === 'sakit') {
                    $userSummaries[$req->user_id]['sakit'] += $days;
                } elseif (strtolower($req->type) === 'lembur') {
                    if (empty($userTanpaLembur[$req->user_id])) {
                        $userSummaries[$req->user_id]['lembur'] += $days;
                    }
                } else {
                    $userSummaries[$req->user_id]['izin'] += $days;
                }
            }
        }
        // Calculate working days in month
        $startOfMonth = Carbon::create($year, $month, 1);
        $endOfMonth = $startOfMonth->copy()->endOfMonth();
        $totalWorkingDays5 = 0;
        $totalWorkingDays6 = 0;
        $tempDate = $startOfMonth->copy();
        
        while ($tempDate->lte($endOfMonth)) {
            if ($tempDate->isWeekday()) {
                $totalWorkingDays5++;
                $totalWorkingDays6++;
            }
            if ($tempDate->dayOfWeek === Carbon::SATURDAY) {
                $totalWorkingDays6++;
            }
            $tempDate->addDay();
        }

        $payrollSettings = PayrollController::getPayrollSettings();
        foreach ($userSummaries as $userId => &$uSum) {
            $uSum['lembur_weekday_pertama'] = $uSum['lembur_weekday_pertama'] ?? 0;
            $uSum['lembur_weekday_berikutnya'] = $uSum['lembur_weekday_berikutnya'] ?? 0;
            $uSum['lembur_sabtu'] = $uSum['lembur_sabtu'] ?? 0;
            $uSum['nominal_potongan_terlambat'] = ($uSum['terlambat'] ?? 0) * $payrollSettings['tarif_potongan_terlambat'];
            $uSum['nominal_lembur'] = ($uSum['lembur_weekday_pertama'] * $payrollSettings['tarif_lembur_weekday_pertama'])
                + ($uSum['lembur_weekday_berikutnya'] * $payrollSettings['tarif_lembur_weekday_berikutnya'])
                + ($uSum['lembur_sabtu'] * $payrollSettings['tarif_lembur_sabtu']);
            if (!empty($uSum['is_satpam'])) {
                // Khusus SATPAM: Tidak ada istilah alpa
                $uSum['alpa'] = 0;
            } else {
                $attended = $uSum['hadir'] + $uSum['sakit'] + $uSum['izin'];
                $expectedDays = (isset($userWorkDays[$userId]) && $userWorkDays[$userId] == 5) ? $totalWorkingDays5 : $totalWorkingDays6;
                $uSum['alpa'] = max(0, $expectedDays - $attended);
                $summary['alpa'] += $uSum['alpa']; // add to total alpa summary
            }
        }

        $userSummaries = array_values($userSummaries);

        // Prepare data table format
        $recapList = [];
        foreach ($attendances as $att) {
            $attUser = $att->user;
            $isUserSatpam = $userIsSatpam[$att->user_id] ?? ($attUser ? $attUser->isSatpam() : false);
            $userName = $userNameMap[$att->user_id] ?? ($attUser?->name ?? 'Unknown');
            $isCrossDay = ($att->check_in_time && $att->check_out_time && $att->check_out_time < $att->check_in_time);

            $attShift = $att->shift;
            if ($isUserSatpam && !$attShift) {
                $hour = $att->check_in_time ? (int)substr($att->check_in_time, 0, 2) : 8;
                $attShift = ($hour >= 7 && $hour < 19) ? 'Shift Siang' : 'Shift Malam';
            }

            $checkInNotes = $att->check_in_notes ?? null;
            $checkOutNotes = $att->check_out_notes ?? null;

            // Fallback parsing jika sebelumnya disimpan dalam string notes
            if (!$checkInNotes && !$checkOutNotes && !empty($att->notes)) {
                if (str_contains($att->notes, 'Masuk:') || str_contains($att->notes, 'Pulang:')) {
                    if (preg_match('/Masuk:\s*([^|]+)/', $att->notes, $mIn)) {
                        $checkInNotes = trim($mIn[1]);
                    }
                    if (preg_match('/Pulang:\s*(.+)$/', $att->notes, $mOut)) {
                        $checkOutNotes = trim($mOut[1]);
                    }
                } else {
                    $checkOutNotes = $att->notes;
                }
            } else {
                if (!$checkInNotes && !empty($att->notes) && str_contains($att->notes, 'Masuk:')) {
                    if (preg_match('/Masuk:\s*([^|]+)/', $att->notes, $mIn)) {
                        $checkInNotes = trim($mIn[1]);
                    }
                }
                if (!$checkOutNotes && !empty($att->notes)) {
                    if (str_contains($att->notes, 'Pulang:')) {
                        if (preg_match('/Pulang:\s*(.+)$/', $att->notes, $mOut)) {
                            $checkOutNotes = trim($mOut[1]);
                        }
                    } elseif (!str_starts_with($att->notes, 'Masuk:')) {
                        $checkOutNotes = $att->notes;
                    }
                }
            }

            $isUserTanpaTerlambat = $userTanpaKeterlambatan[$att->user_id] ?? false;
            $isUserTanpaLembur = $userTanpaLembur[$att->user_id] ?? false;

            $attDate = Carbon::parse(substr($att->date, 0, 10));
            $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
            $workDays = $userWorkDays[$att->user_id] ?? 6;
            $overtimeThreshold = ($isSaturday && $workDays == 6) ? $jamMulaiSabtu : $jamMulaiWeekday;
            $hasOvertimeNotes = !empty(trim($checkOutNotes ?? '')) || (!empty(trim($att->notes ?? '')) && !str_starts_with($att->notes, 'Masuk:'));
            $isLembur = (!$isUserSatpam && !$isUserTanpaLembur && ((($att->check_out_time && $att->check_out_time >= $overtimeThreshold && $hasOvertimeNotes)) || $att->status === 'Lembur'));
            $overtimeStatus = $isLembur ? ($att->overtime_status ?: ($att->status === 'Lembur' ? 'Disetujui' : 'Menunggu')) : null;

            $recapList[] = [
                'id' => 'att_' . $att->id,
                'raw_id' => $att->id,
                'user_id' => $att->user_id,
                'user_name' => $userName,
                'is_satpam' => $isUserSatpam,
                'shift' => $attShift,
                'date' => $att->date,
                'type' => $att->status,
                'check_in' => $att->check_in_time,
                'check_out' => $att->check_out_time,
                'check_in_photo' => $att->check_in_photo ? (str_starts_with($att->check_in_photo, 'http') ? $att->check_in_photo : asset('storage/' . $att->check_in_photo)) : null,
                'check_out_photo' => $att->check_out_photo ? (str_starts_with($att->check_out_photo, 'http') ? $att->check_out_photo : asset('storage/' . $att->check_out_photo)) : null,
                'is_late' => (!$isUserSatpam && !$isUserTanpaTerlambat && ($att->is_late ?? false)),
                'is_lembur' => $isLembur,
                'overtime_status' => $overtimeStatus,
                'is_saturday' => $isSaturday,
                'overtime_threshold' => $overtimeThreshold,
                'is_cross_day' => $isCrossDay,
                'status' => 'Selesai',
                'notes' => $att->notes,
                'check_in_notes' => $checkInNotes,
                'check_out_notes' => $checkOutNotes,
            ];
        }

        foreach ($attendanceRequests as $req) {
            $isReqUserSatpam = $userIsSatpam[$req->user_id] ?? false;
            $userName = $userNameMap[$req->user_id] ?? ($req->user?->name ?? 'Unknown');

            $recapList[] = [
                'id' => 'req_' . $req->id,
                'raw_id' => $req->id,
                'user_id' => $req->user_id,
                'user_name' => $userName,
                'is_satpam' => $isReqUserSatpam,
                'shift' => null,
                'date' => $req->start_date . ' s/d ' . $req->end_date,
                'type' => $req->type,
                'check_in' => '-',
                'check_out' => '-',
                'check_in_photo' => null,
                'check_out_photo' => null,
                'attachment' => $req->attachment ? (str_starts_with($req->attachment, 'http') ? $req->attachment : asset('storage/' . $req->attachment)) : null,
                'is_late' => false,
                'is_lembur' => false,
                'overtime_status' => null,
                'is_saturday' => false,
                'overtime_threshold' => $jamMulaiWeekday,
                'is_cross_day' => false,
                'status' => $req->status,
                'notes' => $req->reason,
                'check_in_notes' => null,
                'check_out_notes' => null,
            ];
        }

        // Generate Alpa Records for the history list
        $today = Carbon::today();
        $endLoop = $endOfMonth->isFuture() ? $today : $endOfMonth;
        
        $activeUsers = $allUsers->where('is_active', true);
        
        $attendanceMap = [];
        foreach ($attendances as $att) {
            $date = substr($att->date, 0, 10);
            $attendanceMap[$att->user_id][$date] = true;
        }

        $requestMap = [];
        foreach ($attendanceRequests as $req) {
            if ($req->status !== 'Ditolak') {
                $st = Carbon::parse($req->start_date);
                $en = Carbon::parse($req->end_date);
                while ($st->lte($en)) {
                    $requestMap[$req->user_id][$st->format('Y-m-d')] = true;
                    $st->addDay();
                }
            }
        }

        $currentDate = $startOfMonth->copy();
        while ($currentDate->lte($endLoop)) {
            $dateStr = $currentDate->format('Y-m-d');
            $isWeekday = $currentDate->isWeekday();
            $isSaturday = $currentDate->dayOfWeek === Carbon::SATURDAY;
            
            foreach ($activeUsers as $usr) {
                if ($selectedUserId !== 'all' && $usr->id != $selectedUserId) {
                    continue;
                }
                
                // Khusus Satpam: tidak ada istilah alpa
                if (!empty($userIsSatpam[$usr->id])) {
                    continue;
                }
                
                $workDays = $userWorkDays[$usr->id] ?? 6;
                $isWorkingDayForUser = false;
                
                if ($workDays == 5 && $isWeekday) {
                    $isWorkingDayForUser = true;
                } elseif ($workDays == 6 && ($isWeekday || $isSaturday)) {
                    $isWorkingDayForUser = true;
                }
                
                if ($isWorkingDayForUser) {
                    if (!isset($attendanceMap[$usr->id][$dateStr]) && !isset($requestMap[$usr->id][$dateStr])) {
                        $recapList[] = [
                            'id' => 'alpa_' . $usr->id . '_' . $dateStr,
                            'raw_id' => null,
                            'user_id' => $usr->id,
                            'user_name' => $usr->name,
                            'is_satpam' => false,
                            'shift' => null,
                            'date' => $dateStr,
                            'type' => 'Alpa',
                            'check_in' => '-',
                            'check_out' => '-',
                            'check_in_photo' => null,
                            'check_out_photo' => null,
                            'is_late' => false,
                            'is_lembur' => false,
                            'overtime_status' => null,
                            'is_saturday' => $isSaturday,
                            'overtime_threshold' => $jamMulaiWeekday,
                            'is_cross_day' => false,
                            'status' => 'Selesai',
                            'notes' => null,
                            'check_in_notes' => null,
                            'check_out_notes' => null,
                        ];
                    }
                }
            }
            $currentDate->addDay();
        }

        // Sort combined list by date descending
        usort($recapList, function($a, $b) {
            $dateA = substr($a['date'], 0, 10);
            $dateB = substr($b['date'], 0, 10);
            return strtotime($dateB) - strtotime($dateA);
        });

        // OVERRIDE SUMMARY UNTUK HARI INI SAJA
        $todayStr = Carbon::today()->format('Y-m-d');
        
        $todayAttendancesQuery = \App\Models\Attendance::where('date', $todayStr);
        if ($selectedUserId !== 'all') {
            $todayAttendancesQuery->where('user_id', $selectedUserId);
        }
        $todayAttendances = $todayAttendancesQuery->get();

        $todayRequestsQuery = \App\Models\AttendanceRequest::where('status', '!=', 'Ditolak')
            ->where('start_date', '<=', $todayStr)
            ->where('end_date', '>=', $todayStr);
        if ($selectedUserId !== 'all') {
            $todayRequestsQuery->where('user_id', $selectedUserId);
        }
        $todayRequests = $todayRequestsQuery->get();

        $summary = [
            'hadir' => $todayAttendances->where('status', 'Hadir')->count(),
            'sakit' => 0,
            'izin' => 0,
            'alpa' => 0,
            'lembur' => $todayAttendances->filter(function ($a) use ($userTanpaLembur) {
                return $a->status === 'Lembur' && empty($userTanpaLembur[$a->user_id]) && $a->overtime_status !== 'Ditolak';
            })->count(),
            'terlambat' => 0,
            'satpam_hadir' => 0,
            'shift_siang' => 0,
            'shift_malam' => 0,
        ];

        foreach ($todayRequests as $req) {
            if (strtolower($req->type) === 'sakit') {
                $summary['sakit']++;
            } elseif (strtolower($req->type) === 'lembur') {
                if (empty($userTanpaLembur[$req->user_id])) {
                    $summary['lembur']++;
                }
            } else {
                $summary['izin']++;
            }
        }

        foreach ($todayAttendances as $att) {
            $isUserSatpam = $userIsSatpam[$att->user_id] ?? false;
            $isUserTanpaTerlambat = $userTanpaKeterlambatan[$att->user_id] ?? false;
            $isUserTanpaLembur = $userTanpaLembur[$att->user_id] ?? false;

            if ($att->status == 'Hadir') {
                if ($isUserSatpam) {
                    $summary['satpam_hadir']++;
                    $shiftName = $att->shift;
                    if (!$shiftName) {
                        $hour = $att->check_in_time ? (int)substr($att->check_in_time, 0, 2) : 8;
                        $shiftName = ($hour >= 7 && $hour < 19) ? 'Shift Siang' : 'Shift Malam';
                    }
                    if ($shiftName === 'Shift Siang') {
                        $summary['shift_siang']++;
                    } else {
                        $summary['shift_malam']++;
                    }
                } else {
                    if (!$isUserTanpaTerlambat) {
                        $prevDate = Carbon::parse(substr($att->date, 0, 10))->subDay();
                        $prevDateStr = $prevDate->format('Y-m-d');
                        
                        $isLemburYesterday = !empty($lemburMap[$att->user_id][$prevDateStr]);
                        $threshold = $isLemburYesterday ? $overtimeLateThreshold : $normalLateThreshold;
                        
                        if ($att->check_in_time > $threshold) {
                            $summary['terlambat']++;
                        }
                    }

                    if (!$isUserTanpaLembur) {
                        $attDate = Carbon::parse(substr($att->date, 0, 10));
                        $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
                        $workDays = $userWorkDays[$att->user_id] ?? 6;
                        $overtimeThreshold = ($isSaturday && $workDays == 6) ? $jamMulaiSabtu : $jamMulaiWeekday;

                        $hasOvertimeNotes = !empty(trim($att->check_out_notes ?? '')) || !empty(trim($att->notes ?? ''));
                        if ($att->check_out_time && $att->check_out_time >= $overtimeThreshold && $hasOvertimeNotes && $att->overtime_status === 'Disetujui') {
                            $summary['lembur']++;
                        }
                    }
                }
            }
        }

        $todayDate = Carbon::today();
        $isWeekday = $todayDate->isWeekday();
        $isSaturday = $todayDate->dayOfWeek === Carbon::SATURDAY;

        if ($isWeekday || $isSaturday) {
            $expectedUsers = 0;
            foreach ($activeUsers as $usr) {
                if ($selectedUserId !== 'all' && $usr->id != $selectedUserId) {
                    continue;
                }
                
                // Khusus Satpam: tidak ada istilah alpa
                if (!empty($userIsSatpam[$usr->id])) {
                    continue;
                }
                
                $workDays = $userWorkDays[$usr->id] ?? 6;
                $isWorkingDayForUser = false;
                
                if ($workDays == 5 && $isWeekday) {
                    $isWorkingDayForUser = true;
                } elseif ($workDays == 6 && ($isWeekday || $isSaturday)) {
                    $isWorkingDayForUser = true;
                }

                if ($isWorkingDayForUser) {
                    $expectedUsers++;
                }
            }

            $regularHadirCount = $todayAttendances->filter(function($att) use ($userIsSatpam) {
                return $att->status === 'Hadir' && empty($userIsSatpam[$att->user_id]);
            })->count();
            $regularSakitCount = $todayRequests->filter(function($req) use ($userIsSatpam) {
                return strtolower($req->type) === 'sakit' && empty($userIsSatpam[$req->user_id]);
            })->count();
            $regularIzinCount = $todayRequests->filter(function($req) use ($userIsSatpam) {
                return strtolower($req->type) !== 'sakit' && strtolower($req->type) !== 'lembur' && empty($userIsSatpam[$req->user_id]);
            })->count();

            $attendedTodayCount = $regularHadirCount + $regularSakitCount + $regularIzinCount;
            $summary['alpa'] = max(0, $expectedUsers - $attendedTodayCount);
        } else {
            $summary['alpa'] = 0;
        }

        return [
            'recapList' => $recapList,
            'summary' => $summary,
            'userSummaries' => $userSummaries,
            'filters' => [
                'month' => (int)$month,
                'year' => (int)$year,
                'user_id' => $selectedUserId
            ],
            'users' => $users,
            'isAdmin' => $isAdmin,
            'payrollSettings' => $payrollSettings,
        ];
    }
}
