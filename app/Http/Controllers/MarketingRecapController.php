<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MarketingDailyReport;
use App\Models\MarketingWeeklyTarget;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MarketingRecapController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Access control is handled via feature toggles in the UI.
        // You could add a check for feature 10 here if strictly needed.

        $salesUserId = $request->get('user_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // Query Reports
        $reportsQuery = MarketingDailyReport::with(['outlet', 'user'])->orderBy('visit_date', 'desc')->orderBy('visit_time', 'desc');
        if ($salesUserId) {
            $reportsQuery->where('user_id', $salesUserId);
        }
        if ($startDate) {
            $reportsQuery->where('visit_date', '>=', $startDate);
        }
        if ($endDate) {
            $reportsQuery->where('visit_date', '<=', $endDate);
        }
        $reports = $reportsQuery->paginate(50)->withQueryString();

        // Query Targets
        $targetsQuery = MarketingWeeklyTarget::with('user')->orderBy('start_date', 'desc');
        if ($salesUserId) {
            $targetsQuery->where('user_id', $salesUserId);
        }
        if ($startDate) {
            $targetsQuery->where('start_date', '>=', $startDate);
        }
        if ($endDate) {
            $targetsQuery->where('end_date', '<=', $endDate);
        }
        $allTargets = $targetsQuery->paginate(50)->withQueryString();

        // Get all active sales users for the filter dropdown
        $salesUsers = User::where('is_active', true)
            ->whereHas('roles', function($q) {
                $q->whereIn('name', ['Sales', 'sales', 'Marketing', 'marketing']);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        $today = date('Y-m-d');
        $reportsTodayCount = MarketingDailyReport::where('visit_date', $today)->count();
        
        $reportedUserStats = MarketingDailyReport::where('visit_date', $today)
            ->selectRaw('user_id, count(*) as count')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');
            
        $reportedUserIds = $reportedUserStats->keys()->toArray();
        $notReportedUsers = $salesUsers->filter(fn($u) => !in_array($u->id, $reportedUserIds))->values();
        
        // Load users who reported, regardless of their role
        $reportedUsers = User::whereIn('id', $reportedUserIds)->get(['id', 'name'])->map(function($user) use ($reportedUserStats) {
            $user->report_count = $reportedUserStats[$user->id]->count ?? 0;
            return $user;
        });

        // Total Reports in Period (defaults to current month if no dates selected)
        $periodQuery = MarketingDailyReport::query();
        if ($startDate) {
            $periodQuery->where('visit_date', '>=', $startDate);
        }
        if ($endDate) {
            $periodQuery->where('visit_date', '<=', $endDate);
        }
        if (!$startDate && !$endDate) {
            $periodQuery->whereMonth('visit_date', date('m'))
                        ->whereYear('visit_date', date('Y'));
        }

        $totalReportsPeriodCount = $periodQuery->count();

        $periodUserStats = (clone $periodQuery)
            ->selectRaw('user_id, count(*) as count')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $reportsPerUserPeriod = $salesUsers->map(function($user) use ($periodUserStats) {
            // Create a new copy of the user object or just assign the property
            $newUser = (object)[
                'id' => $user->id,
                'name' => $user->name,
                'report_count' => $periodUserStats[$user->id]->count ?? 0
            ];
            return $newUser;
        })->sortByDesc('report_count')->values();

        return Inertia::render('Marketing/RecapAll', [
            'reports' => $reports,
            'summary' => [
                'reports_today_count' => $reportsTodayCount,
                'reported_users' => $reportedUsers,
                'not_reported_users' => $notReportedUsers,
                'total_reports_period_count' => $totalReportsPeriodCount,
                'reports_per_user_period' => $reportsPerUserPeriod,
            ],
            'allTargets' => $allTargets,
            'sales_users' => $salesUsers,
            'filters' => [
                'user_id' => $salesUserId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'period' => $request->get('period')
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = Auth::user();
        if (!$user->can('export marketing')) {
            return abort(403, 'Unauthorized access.');
        }

        $type = $request->get('type', 'laporan'); // 'laporan' or 'target'
        $salesUserId = $request->get('user_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $data = [];
        if ($type === 'laporan') {
            $query = MarketingDailyReport::with(['outlet', 'user'])->orderBy('visit_date', 'desc')->orderBy('visit_time', 'desc');
            if ($salesUserId) $query->where('user_id', $salesUserId);
            if ($startDate) $query->where('visit_date', '>=', $startDate);
            if ($endDate) $query->where('visit_date', '<=', $endDate);
            $data['reports'] = $query->get();
        } else {
            $query = MarketingWeeklyTarget::with('user')->orderBy('year', 'desc')->orderBy('week_number', 'desc');
            if ($salesUserId) $query->where('user_id', $salesUserId);
            if ($startDate) $query->where('start_date', '>=', $startDate);
            if ($endDate) $query->where('end_date', '<=', $endDate);
            $data['targets'] = $query->get();
        }

        $salesUser = $salesUserId ? User::find($salesUserId) : null;
        $data['type'] = $type;
        $data['filters'] = [
            'user' => $salesUser ? $salesUser->name : 'Semua Sales',
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];

        $pdf = \PDF::loadView('pdf.recap_marketing_pdf', $data)->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream('Rekap_Marketing_' . ucfirst($type) . '_' . date('YmdHis') . '.pdf') : $pdf->download('Rekap_Marketing_' . ucfirst($type) . '_' . date('YmdHis') . '.pdf');
    }
    public function exportExcel(Request $request)
    {
        $user = Auth::user();
        if (!$user->can('export marketing')) {
            return abort(403, 'Unauthorized access.');
        }

        $type = $request->get('type', 'laporan');
        $salesUserId = $request->get('user_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        if ($type === 'laporan') {
            $query = MarketingDailyReport::with(['outlet', 'user'])->orderBy('visit_date', 'desc');
            if ($salesUserId) $query->where('user_id', $salesUserId);
            if ($startDate) $query->where('visit_date', '>=', $startDate);
            if ($endDate) $query->where('visit_date', '<=', $endDate);
            $items = $query->get();
            
            $headings = ['No', 'Tanggal', 'Sales', 'Outlet', 'Keterangan'];
            $rows = $items->map(function($item, $key) {
                return [$key+1, $item->visit_date, $item->user->name ?? '-', $item->outlet->name ?? '-', $item->description];
            });
            $title = 'Rekap_Laporan_Marketing';
        } else {
            $query = MarketingWeeklyTarget::with('user')->orderBy('year', 'desc');
            if ($salesUserId) $query->where('user_id', $salesUserId);
            if ($startDate) $query->where('start_date', '>=', $startDate);
            if ($endDate) $query->where('end_date', '<=', $endDate);
            $items = $query->get();
            
            $headings = ['No', 'Sales', 'Periode', 'Target', 'Capaian'];
            $rows = $items->map(function($item, $key) {
                return [$key+1, $item->user->name ?? '-', $item->start_date . ' - ' . $item->end_date, $item->target_amount, $item->achieved_amount];
            });
            $title = 'Rekap_Target_Marketing';
        }

        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new \App\Exports\GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\GenericExport($rows, $headings), $title . '_' . date('YmdHis') . '.xlsx');
    }
}
