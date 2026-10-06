<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\AttendanceRequest;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AttendanceRecapController extends Controller
{
    public function index(Request $request)
    {
        $data = $this->getRecapData($request);
        return Inertia::render('Absensi/Rekap', $data);
    }

    public function exportPdf(Request $request)
    {
        $data = $this->getRecapData($request);
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.attendance_recap', $data)->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        
        $fileName = 'Rekap_Absensi_' . $data['filters']['month'] . '_' . $data['filters']['year'] . '.pdf';
        return request()->has('preview') ? $pdf->stream($fileName) : $pdf->download($fileName);
    }

    private function getRecapData(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user->isAdminUser();

        // Default filters
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $selectedUserId = $request->input('user_id', 'all');

        // Fetch users for dropdown filter (available to everyone)
        $users = User::where('is_active', true)->orderBy('name')->get(['id', 'name']);

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
        $users = \App\Models\User::all();
        $userWorkDays = [];
        foreach ($users as $user) {
            $userWorkDays[$user->id] = $user->work_days_per_week ?? 6;
            $userSummaries[$user->id] = [
                'name' => $user->name,
                'hadir' => 0,
                'sakit' => 0,
                'izin' => 0,
                'alpa' => 0,
                'lembur' => 0,
                'terlambat' => 0
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
            if (!isset($userSummaries[$att->user_id])) {
                $userSummaries[$att->user_id] = [
                    'name' => $att->user?->name ?? 'Unknown',
                    'hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpa' => 0, 'lembur' => 0, 'terlambat' => 0
                ];
            }
            if ($att->status == 'Hadir') {
                $userSummaries[$att->user_id]['hadir']++;
                
                // Calculate Terlambat
                $prevDate = Carbon::parse(substr($att->date, 0, 10))->subDay()->format('Y-m-d');
                $isLemburYesterday = isset($lemburMap[$att->user_id][$prevDate]);
                $threshold = $isLemburYesterday ? '09:00:00' : '08:15:00';
                
                $att->is_late = $att->check_in_time > $threshold;
                if ($att->is_late) {
                    $userSummaries[$att->user_id]['terlambat']++;
                    $summary['terlambat']++;
                }

                if ($att->check_out_time && $att->check_out_time >= '20:00:00') {
                    $userSummaries[$att->user_id]['lembur']++;
                    $summary['lembur']++;
                    $lemburMap[$att->user_id][substr($att->date, 0, 10)] = true;
                }

            } elseif ($att->status == 'Lembur') {
                $userSummaries[$att->user_id]['lembur']++;
            }
        }

        foreach ($attendanceRequests as $req) {
            if ($req->status !== 'Ditolak') {
                if (!isset($userSummaries[$req->user_id])) {
                    $userSummaries[$req->user_id] = [
                        'name' => $req->user?->name ?? 'Unknown',
                        'hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpa' => 0, 'lembur' => 0, 'terlambat' => 0
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
            $attended = $uSum['hadir'] + $uSum['sakit'] + $uSum['izin'];
            $expectedDays = (isset($userWorkDays[$userId]) && $userWorkDays[$userId] == 5) ? $totalWorkingDays5 : $totalWorkingDays6;
            $uSum['alpa'] = max(0, $expectedDays - $attended);
            $summary['alpa'] += $uSum['alpa']; // add to total alpa summary
        }

        $userSummaries = array_values($userSummaries);

        // Prepare data table format
        $recapList = [];
        foreach ($attendances as $att) {
            $recapList[] = [
                'id' => 'att_' . $att->id,
                'user_name' => $att->user?->name ?? 'Unknown',
                'date' => $att->date,
                'type' => 'Hadir',
                'check_in' => $att->check_in_time,
                'check_out' => $att->check_out_time,
                'check_in_photo' => $att->check_in_photo ? (str_starts_with($att->check_in_photo, 'http') ? $att->check_in_photo : asset('storage/' . $att->check_in_photo)) : null,
                'check_out_photo' => $att->check_out_photo ? (str_starts_with($att->check_out_photo, 'http') ? $att->check_out_photo : asset('storage/' . $att->check_out_photo)) : null,
                'is_late' => $att->is_late ?? false,
                'is_lembur' => ($att->check_out_time && $att->check_out_time >= '20:00:00') ? true : false,
                'status' => 'Selesai',
                'notes' => $att->notes
            ];
        }

        foreach ($attendanceRequests as $req) {
            $recapList[] = [
                'id' => 'req_' . $req->id,
                'user_name' => $req->user?->name ?? 'Unknown',
                'date' => $req->start_date . ' s/d ' . $req->end_date,
                'type' => $req->type,
                'check_in' => '-',
                'check_out' => '-',
                'check_in_photo' => null,
                'check_out_photo' => null,
                'status' => $req->status,
                'notes' => $req->reason
            ];
        }

        // Generate Alpa Records for the history list
        $today = Carbon::today();
        $endLoop = $endOfMonth->isFuture() ? $today : $endOfMonth;
        
        $activeUsers = \App\Models\User::where('is_active', true)->get();
        
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
                            'user_name' => $usr->name,
                            'date' => $dateStr,
                            'type' => 'Alpa',
                            'check_in' => '-',
                            'check_out' => '-',
                            'check_in_photo' => null,
                            'check_out_photo' => null,
                            'is_late' => false,
                            'status' => 'Selesai',
                            'notes' => null
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
