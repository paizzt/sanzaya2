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
        
        // Ensure only users with certain roles or features can access (e.g. Admin/Direktur)
        if (!$user->hasRole(['Superadmin', 'Admin', 'Manager', 'Direktur'])) {
            return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki akses ke halaman ini.');
        }

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
        $reports = $reportsQuery->get();

        // Query Targets
        $targetsQuery = MarketingWeeklyTarget::with('user')->orderBy('year', 'desc')->orderBy('week_number', 'desc');
        if ($salesUserId) {
            $targetsQuery->where('user_id', $salesUserId);
        }
        if ($startDate) {
            $targetsQuery->where('start_date', '>=', $startDate);
        }
        if ($endDate) {
            $targetsQuery->where('end_date', '<=', $endDate);
        }
        $allTargets = $targetsQuery->get();

        // Get all active sales users for the filter dropdown
        $salesUsers = User::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Marketing/RecapAll', [
            'reports' => $reports,
            'allTargets' => $allTargets,
            'sales_users' => $salesUsers,
            'filters' => [
                'user_id' => $salesUserId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasRole(['Superadmin', 'Admin', 'Manager', 'Direktur'])) {
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

        $pdf = \PDF::loadView('pdf.recap_marketing_pdf', $data);
        return $pdf->download('Rekap_Marketing_' . ucfirst($type) . '_' . date('YmdHis') . '.pdf');
    }
}
