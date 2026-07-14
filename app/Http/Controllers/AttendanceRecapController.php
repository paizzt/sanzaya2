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
        $user = Auth::user();
        $isAdmin = $user->hasRole(['Superadmin', 'Admin', 'Manager', 'Direktur']);

        // Default filters
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $selectedUserId = $request->input('user_id');

        if (!$isAdmin) {
            $selectedUserId = $user->id; // Force self for non-admins
        } else if (!$selectedUserId) {
            $selectedUserId = 'all'; // Default to all for admins
        }

        // Fetch users for admin dropdown
        $users = $isAdmin ? User::where('is_active', true)->orderBy('name')->get(['id', 'name']) : [];

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
            'alpa' => 0 // Can be calculated if we know total working days
        ];

        // Process Attendance Requests to count days
        // We will just simplify: 1 request = 1 day for this basic recap unless we iterate dates
        foreach ($attendanceRequests as $req) {
            if ($req->status !== 'Ditolak') {
                $start = Carbon::parse($req->start_date);
                $end = Carbon::parse($req->end_date);
                $days = $start->diffInDays($end) + 1;

                if (strtolower($req->type) === 'sakit') {
                    $summary['sakit'] += $days;
                } else {
                    $summary['izin'] += $days;
                }
            }
        }

        // Prepare data table format
        $recapList = [];
        foreach ($attendances as $att) {
            $recapList[] = [
                'id' => 'att_' . $att->id,
                'user_name' => $att->user->name,
                'date' => $att->date,
                'type' => 'Hadir',
                'check_in' => $att->check_in_time,
                'check_out' => $att->check_out_time,
                'check_in_photo' => $att->check_in_photo ? asset('storage/' . $att->check_in_photo) : null,
                'check_out_photo' => $att->check_out_photo ? asset('storage/' . $att->check_out_photo) : null,
                'status' => 'Selesai'
            ];
        }

        foreach ($attendanceRequests as $req) {
            $recapList[] = [
                'id' => 'req_' . $req->id,
                'user_name' => $req->user->name,
                'date' => $req->start_date . ' s/d ' . $req->end_date,
                'type' => $req->type,
                'check_in' => '-',
                'check_out' => '-',
                'check_in_photo' => null,
                'check_out_photo' => null,
                'status' => $req->status
            ];
        }

        // Sort combined list by date descending
        usort($recapList, function($a, $b) {
            $dateA = substr($a['date'], 0, 10);
            $dateB = substr($b['date'], 0, 10);
            return strtotime($dateB) - strtotime($dateA);
        });

        return Inertia::render('Absensi/Rekap', [
            'recapList' => $recapList,
            'summary' => $summary,
            'filters' => [
                'month' => (int)$month,
                'year' => (int)$year,
                'user_id' => $selectedUserId
            ],
            'users' => $users,
            'isAdmin' => $isAdmin
        ]);
    }
}
