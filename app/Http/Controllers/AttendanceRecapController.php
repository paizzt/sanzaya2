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

        // Default filters
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $selectedUserId = $request->input('user_id', 'all');

        // Fetch all users with relations once to avoid N+1 queries
        $allUsers = \App\Models\User::with(['roles', 'division'])->get();
        $userWorkDays = [];
        $userIsSatpam = [];
        $userNameMap = [];
        foreach ($allUsers as $u) {
            $userWorkDays[$u->id] = $u->work_days_per_week ?? 6;
            $userIsSatpam[$u->id] = $u->isSatpam();
            $userNameMap[$u->id] = $u->name;
        }

        // Fetch users for dropdown filter (available to everyone)
        $users = $allUsers->where('is_active', true)->sortBy('name')->values()->map(function($u) {
            return ['id' => $u->id, 'name' => $u->name];
        });

        // Build Queries
        $attendancesQuery = Attendance::with('user')
            ->whereMonth('date', $month)
            ->whereYear('date', $year);
            
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
            'lembur' => $attendances->where('status', 'Lembur')->count(),
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
                    $summary['lembur'] += $days;
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

        // Build Lembur Map
        $lemburMap = [];
        $startLimit = Carbon::create($year, $month, 1)->subDays(7);
        
        $lemburAttendances = Attendance::where('status', 'Lembur')
            ->where('date', '>=', $startLimit->format('Y-m-d'))->get();
        foreach ($lemburAttendances as $la) {
            $lemburMap[$la->user_id][substr($la->date, 0, 10)] = true;
        }

        $lemburRequests = AttendanceRequest::where('status', '!=', 'Ditolak')
            ->whereRaw('LOWER(type) = ?', ['lembur'])
            ->where('end_date', '>=', $startLimit->format('Y-m-d'))->get();
        foreach ($lemburRequests as $lr) {
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
                
                // Calculate Shift / Terlambat (Khusus SATPAM: TIDAK berlaku jam terlambat)
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
                } else {
                    $prevDate = Carbon::parse(substr($att->date, 0, 10))->subDay()->format('Y-m-d');
                    $isLemburYesterday = !empty($lemburMap[$att->user_id][$prevDate]);
                    $threshold = $isLemburYesterday ? '09:00:00' : '08:15:00';
                    
                    $att->is_late = $att->check_in_time > $threshold;
                    if ($att->is_late) {
                        $userSummaries[$att->user_id]['terlambat']++;
                        $summary['terlambat']++;
                    }
                }

                // Calculate Lembur (Khusus SATPAM: TIDAK berlaku jam lembur)
                // Untuk karyawan yang masuk 6 hari dengan hari Sabtu: jam kerja Sabtu hanya sampai jam 14:00 WITA. Jika checkout >= 14:00:00, terhitung lembur.
                // Untuk hari biasa (Senin-Jumat): checkout >= 20:00:00 terhitung lembur.
                if (!$isUserSatpam) {
                    $attDate = Carbon::parse(substr($att->date, 0, 10));
                    $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
                    $workDays = $userWorkDays[$att->user_id] ?? 6;
                    $overtimeThreshold = ($isSaturday && $workDays == 6) ? '14:00:00' : '20:00:00';

                    if ($att->check_out_time && $att->check_out_time >= $overtimeThreshold) {
                        $userSummaries[$att->user_id]['lembur']++;
                        $summary['lembur']++;
                        $lemburMap[$att->user_id][substr($att->date, 0, 10)] = true;
                    }
                }

            } elseif ($att->status == 'Lembur') {
                if (!$isUserSatpam) {
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
                    $userSummaries[$req->user_id]['lembur'] += $days;
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

        foreach ($userSummaries as $userId => &$uSum) {
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
            } elseif (!$checkOutNotes && !empty($att->notes)) {
                $checkOutNotes = $att->notes;
            }

            $attDate = Carbon::parse(substr($att->date, 0, 10));
            $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
            $workDays = $userWorkDays[$att->user_id] ?? 6;
            $overtimeThreshold = ($isSaturday && $workDays == 6) ? '14:00:00' : '20:00:00';
            $isLembur = (!$isUserSatpam && (($att->check_out_time && $att->check_out_time >= $overtimeThreshold) || $att->status === 'Lembur'));

            $recapList[] = [
                'id' => 'att_' . $att->id,
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
                'is_late' => (!$isUserSatpam && ($att->is_late ?? false)),
                'is_lembur' => $isLembur,
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
                'is_saturday' => false,
                'overtime_threshold' => '20:00:00',
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
                            'is_saturday' => $isSaturday,
                            'overtime_threshold' => '20:00:00',
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
            'lembur' => $todayAttendances->where('status', 'Lembur')->count(),
            'terlambat' => 0,
            'satpam_hadir' => 0,
            'shift_siang' => 0,
            'shift_malam' => 0,
        ];

        foreach ($todayRequests as $req) {
            if (strtolower($req->type) === 'sakit') {
                $summary['sakit']++;
            } elseif (strtolower($req->type) === 'lembur') {
                $summary['lembur']++;
            } else {
                $summary['izin']++;
            }
        }

        foreach ($todayAttendances as $att) {
            $isUserSatpam = $userIsSatpam[$att->user_id] ?? false;

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
                    $prevDate = Carbon::parse(substr($att->date, 0, 10))->subDay();
                    $prevDateStr = $prevDate->format('Y-m-d');
                    
                    $isLemburYesterday = !empty($lemburMap[$att->user_id][$prevDateStr]);
                    $threshold = $isLemburYesterday ? '09:00:00' : '08:15:00';
                    
                    if ($att->check_in_time > $threshold) {
                        $summary['terlambat']++;
                    }

                    $attDate = Carbon::parse(substr($att->date, 0, 10));
                    $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
                    $workDays = $userWorkDays[$att->user_id] ?? 6;
                    $overtimeThreshold = ($isSaturday && $workDays == 6) ? '14:00:00' : '20:00:00';

                    if (($att->check_out_time && $att->check_out_time >= $overtimeThreshold) || $att->status === 'Lembur') {
                        $summary['lembur']++;
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
            'isAdmin' => $isAdmin
        ];
    }
}
