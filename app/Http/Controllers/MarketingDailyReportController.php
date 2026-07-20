<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
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

        // Calculate Spreadsheet Sales for current month
        $spreadsheetSalesTotal = 0;
        $spreadsheetSalesName = $user->spreadsheet_sales_name;
        $monthlyTarget = $user->monthly_target;
        
        if ($spreadsheetSalesName) {
            $months = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];
            $monthIndo = $months[Carbon::now()->month] . ' ' . Carbon::now()->year;
            
            $logistikData = \App\Models\SyncLogistikData::where('nama_sales', $spreadsheetSalesName)
                ->where('tanggal', 'LIKE', '%' . $monthIndo . '%')
                ->get();
                
            foreach ($logistikData as $row) {
                $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->total_sales);
                $spreadsheetSalesTotal += $val;
            }
        }

        $isAdminMarketing = $user->hasRole(['Superadmin', 'Admin', 'Manager', 'Direktur']);
        $salesUsers = $isAdminMarketing ? \App\Models\User::where('is_active', true)
            ->whereHas('roles', function($q) {
                $q->where('name', 'Sales');
            })
            ->orderBy('name')
            ->get(['id', 'name']) : [];

        return Inertia::render('Marketing/Index', [
            'outlets' => $outlets,
            'reports' => $reports,
            'target' => $target,
            'allTargets' => $allTargets,
            'realization' => [
                'visits' => $realizedVisits,
                'transactions' => $realizedTransactions
            ],
            'spreadsheet' => [
                'sales_name' => $spreadsheetSalesName,
                'total_monthly' => $spreadsheetSalesTotal,
                'monthly_target' => $monthlyTarget
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

    public function exportPdf()
    {
        $user = Auth::user();
        $items = \App\Models\MarketingDailyReport::where('user_id', $user->id)->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['visit_date', 'visit_type', 'activity_type', 'visit_result'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');
            
            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $val = $item->$col;
                    $row[] = is_array($val) ? json_encode($val) : $val;
                }
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Laporan Marketing', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Laporan Marketing') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Laporan Marketing') . '.pdf');
    }

    public function exportTargetPdf()
    {
        $user = Auth::user();
        $items = \App\Models\MarketingWeeklyTarget::where('user_id', $user->id)->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $hidden = ['id', 'created_at', 'updated_at', 'deleted_at', 'user_id', 'target_outlets'];
            $headings = ['No', 'Tahun', 'Minggu', 'Mulai', 'Selesai', 'Target Kunjungan', 'Target Transaksi'];
            
            $rows = $items->map(function($item, $key) {
                return [
                    $key + 1,
                    $item->year,
                    $item->week_number,
                    $item->start_date,
                    $item->end_date,
                    $item->target_visits,
                    $item->target_transactions
                ];
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Target Mingguan Marketing', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Target Mingguan Marketing') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Target Mingguan Marketing') . '.pdf');
    }

    public function exportExcel()
    {
        $user = Auth::user();
        $items = \App\Models\MarketingDailyReport::where('user_id', $user->id)->orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $hidden = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'];
            $headings = array_diff(array_keys($items->first()->getAttributes()), $hidden);
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $headings);
            array_unshift($headings, 'No');
            
            $rows = $items->map(function($item, $key) use ($hidden) {
                $row = [$key + 1];
                foreach ($item->getAttributes() as $col => $val) {
                    if (!in_array($col, $hidden)) {
                        $row[] = is_array($val) ? json_encode($val) : $val;
                    }
                }
                return $row;
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Laporan Marketing') . '.xlsx');
    }
}
