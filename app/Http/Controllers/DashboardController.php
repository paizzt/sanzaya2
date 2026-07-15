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

        $cacheKey = "dashboard_stats_user_{$user->id}_" . $today->format('Y_m_d');
        
        $stats = \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($attendanceQuery, $marketingQuery, $ucQuery, $bhpQuery, $isAdmin) {
            $data = [
                'attendance_today' => $attendanceQuery->count(),
                'marketing_visits_today' => $marketingQuery->count(),
                'uc_pending' => $ucQuery->count(),
                'bhp_pending' => $bhpQuery->count(),
            ];

            if ($isAdmin) {
                $data['total_surat_pesanan'] = SyncPesananData::count();
                $data['total_piutang'] = SyncPiutangData::count();
                $data['total_logistik'] = SyncLogistikData::count();
            } else {
                $data['total_surat_pesanan'] = 0;
                $data['total_piutang'] = 0;
                $data['total_logistik'] = 0;
            }
            
            return $data;
        });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'isAdmin' => $isAdmin
        ]);
    }
}
