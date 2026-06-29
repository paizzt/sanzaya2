<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\MarketingDailyReport;
use App\Models\UcRequest;
use App\Models\BhpRequest;
use App\Models\SyncPesananData;
use App\Models\SyncPiutangData;
use App\Models\SyncLogistikData;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $today = Carbon::today();
        
        $isAdmin = $user->hasRole(['Superadmin', 'Admin', 'Manager', 'Direktur']);

        // Base Queries
        $attendanceQuery = Attendance::whereDate('created_at', $today);
        $marketingQuery = MarketingDailyReport::whereDate('visit_date', $today);
        $ucQuery = UcRequest::where('status', 'Pending');
        $bhpQuery = BhpRequest::where('status', 'Pending');
        
        // If not admin, maybe scope some queries
        if (!$isAdmin) {
            $marketingQuery->where('user_id', $user->id);
            $ucQuery->where('user_id', $user->id);
            $bhpQuery->where('user_id', $user->id);
            // Absensi is company wide? Let's just keep it company wide for the dashboard or just their own.
            $attendanceQuery->where('user_id', $user->id);
        }

        $stats = [
            'attendance_today' => $attendanceQuery->count(),
            'marketing_visits_today' => $marketingQuery->count(),
            'uc_pending' => $ucQuery->count(),
            'bhp_pending' => $bhpQuery->count(),
        ];

        // Only admins or specific roles care about high-level spreadsheet totals
        if ($isAdmin) {
            $stats['total_surat_pesanan'] = SyncPesananData::count();
            $stats['total_piutang'] = SyncPiutangData::count();
            $stats['total_logistik'] = SyncLogistikData::count();
        } else {
            $stats['total_surat_pesanan'] = 0;
            $stats['total_piutang'] = 0;
            $stats['total_logistik'] = 0;
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'isAdmin' => $isAdmin
        ]);
    }
}
