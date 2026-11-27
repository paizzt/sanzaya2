<?php

namespace App\Http\Controllers;

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
        if ($user && !$user->isAdminUser() && !\App\Models\FeatureToggle::userHasFeature($user, 'Dashboard')) {
            return redirect()->route('profile.edit');
        }

        $today = Carbon::today();
        
        $isAdmin = $user->isAdminUser();

        // Base Queries
        $attendanceQuery = Attendance::whereDate('date', $today);
        $marketingQuery = MarketingDailyReport::whereDate('visit_date', $today);
        $ucQuery = UcRequest::whereIn('status', ['Menunggu', 'Pending']);
        $bhpQuery = BhpRequest::whereIn('status', ['Menunggu', 'Pending']);
        
        if (!$isAdmin) {
            $marketingQuery->where('user_id', $user->id);
            $ucQuery->where('user_id', $user->id);
            $bhpQuery->where('user_id', $user->id);
            $attendanceQuery->where('user_id', $user->id);
        }

        $scopeTag = $isAdmin ? 'admin' : 'user';
        $cacheKey = "dashboard_stats_{$scopeTag}_{$user->id}_" . $today->format('Y_m_d');
        
        $stats = \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($attendanceQuery, $marketingQuery, $ucQuery, $bhpQuery, $isAdmin) {
            $attendanceList = $attendanceQuery->with('user:id,name')->get();
            $marketingList = $marketingQuery->with('user:id,name')->get();
            $ucList = $ucQuery->with(['user:id,name', 'items'])->get();
            $bhpList = $bhpQuery->with('user:id,name')->get();

            $data = [
                'attendance_today' => $attendanceList->count(),
                'marketing_visits_today' => $marketingList->count(),
                'uc_pending' => $ucList->count(),
                'bhp_pending' => $bhpList->count(),
                'attendance_list' => $attendanceList,
                'marketing_list' => $marketingList,
                'uc_list' => $ucList,
                'bhp_list' => $bhpList,
            ];

            if ($isAdmin) {
                $data['total_surat_pesanan'] = SyncPesananData::count();
                $data['total_piutang'] = SyncPiutangData::count();
                $data['total_logistik'] = SyncLogistikData::count();
                $data['total_hutang'] = \App\Models\SyncHutangData::count();
            } else {
                $data['total_surat_pesanan'] = 0;
                $data['total_piutang'] = 0;
                $data['total_logistik'] = 0;
                $data['total_hutang'] = 0;
            }
            
            return $data;
        });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'isAdmin' => $isAdmin
        ]);
    }
}
