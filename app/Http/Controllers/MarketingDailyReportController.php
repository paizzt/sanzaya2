<?php

namespace App\Http\Controllers;

use App\Models\MarketingDailyReport;
use App\Models\MarketingWeeklyTarget;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class MarketingDailyReportController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $userId = $user->id;
        $outlets = Outlet::orderBy('name')->get();
        
        $reports = MarketingDailyReport::with('outlet')
            ->where('user_id', $userId)
            ->orderBy('visit_date', 'desc')
            ->orderBy('visit_time', 'desc')
            ->get();

        $weekNumber = Carbon::now()->weekOfYear;
        $target = MarketingWeeklyTarget::where('user_id', $userId)
            ->where('week_number', $weekNumber)
            ->first();
            
        $allTargets = MarketingWeeklyTarget::where('user_id', $userId)
            ->orderBy('year', 'desc')
            ->orderBy('week_number', 'desc')
            ->get();

        // Calculate Realization
        $realizedVisits = MarketingDailyReport::where('user_id', $userId)
            ->whereBetween('visit_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->count();
            
        $realizedTransactions = MarketingDailyReport::where('user_id', $userId)
            ->whereBetween('visit_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('actual_value');

        $isAdminMarketing = $user->hasRole(['Superadmin', 'Admin', 'Manager', 'Direktur']);
        $salesUsers = $isAdminMarketing ? \App\Models\User::where('is_active', true)->orderBy('name')->get(['id', 'name']) : [];

        return Inertia::render('Marketing/Index', [
            'outlets' => $outlets,
            'reports' => $reports,
            'target' => $target,
            'allTargets' => $allTargets,
            'realization' => [
                'visits' => $realizedVisits,
                'transactions' => $realizedTransactions
            ],
            'isAdminMarketing' => $isAdminMarketing,
            'sales_users' => $salesUsers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'activity_type' => 'required|string',
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'outlet_type' => 'nullable|string',
            'outlet_id' => 'nullable|exists:outlets,id',
            'pic_phone' => 'nullable|string',
            'pic_position' => 'nullable|string',
            'pic_name' => 'nullable|string',
            'outlet_status' => 'nullable|string',
            'visit_type' => 'nullable|string',
            'issue_type' => 'nullable|string',
            'competitor_notes' => 'nullable|string',
            'visit_result' => 'nullable|string',
            'photos' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
        ]);

        $photoPath = null;
        if ($request->hasFile('photos')) {
            $photoPath = $request->file('photos')->store('marketing_reports', 'public');
        }

        MarketingDailyReport::create([
            'user_id' => Auth::id(),
            'activity_type' => $request->activity_type,
            'visit_date' => $request->visit_date,
            'visit_time' => $request->visit_time,
            'outlet_type' => $request->outlet_type,
            'outlet_id' => $request->outlet_id,
            'pic_phone' => $request->pic_phone,
            'pic_position' => $request->pic_position,
            'pic_name' => $request->pic_name,
            'outlet_status' => $request->outlet_status,
            'visit_type' => $request->visit_type,
            'issue_type' => $request->issue_type,
            'competitor_notes' => $request->competitor_notes,
            'visit_result' => $request->visit_result,
            'photos' => $photoPath,
        ]);

        return redirect()->back()->with('success', 'Laporan aktivitas harian berhasil disimpan!');
    }

    public function storeTarget(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'target_outlets' => 'nullable|array',
            'target_outlets.*' => 'exists:outlets,id'
        ]);

        $weekNumber = Carbon::parse($request->start_date)->weekOfYear;
        $targetVisits = count($request->target_outlets ?? []);

        MarketingWeeklyTarget::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'week_number' => $weekNumber,
            ],
            [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'target_visits' => $targetVisits,
                'target_outlets' => $request->target_outlets ?? [],
            ]
        );

        return redirect()->back()->with('success', 'Target mingguan berhasil ditetapkan!');
    }
}
