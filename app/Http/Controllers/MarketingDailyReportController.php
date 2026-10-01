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
use Illuminate\Support\Facades\Http;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
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
            ->orderBy('start_date', 'desc')
            ->get();

        if ($user->isAdminUser()) {
            $realizedVisits = MarketingDailyReport::whereBetween('visit_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
                ->where('activity_type', 'Kunjungan')
                ->count();
            $realizedTransactions = MarketingDailyReport::whereBetween('visit_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])->sum('actual_value');
            $target = MarketingWeeklyTarget::where('week_number', $weekNumber)
                ->selectRaw('SUM(target_visits) as target_visits, SUM(target_new_outlets) as target_new_outlets, SUM(target_transactions) as target_transactions')
                ->first();
        } else {
            $realizedVisits = MarketingDailyReport::where('user_id', $userId)
                ->whereBetween('visit_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
                ->where('activity_type', 'Kunjungan')
                ->count();
                
            $realizedTransactions = MarketingDailyReport::where('user_id', $userId)
                ->whereBetween('visit_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
                ->sum('actual_value');
        }

        // Calculate Spreadsheet Sales for current month
        $spreadsheetSalesTotal = 0;
        $spreadsheetSalesName = $user->spreadsheet_sales_name;
        $monthlyTarget = $user->monthly_target;
        
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $monthNum = Carbon::now()->month;
        $monthNumStr = str_pad($monthNum, 2, '0', STR_PAD_LEFT);
        $monthFilter = $months[$monthNum];
        $shortMonth = substr($monthFilter, 0, 3);
        $shortMonthEng = date('M', mktime(0, 0, 0, $monthNum, 1));
        
        $query = \App\Models\SyncLogistikData::where(function($q) use ($monthFilter, $monthNumStr, $monthNum, $shortMonth, $shortMonthEng) {
            $q->where('sheet_name', 'like', "%{$monthFilter}%")
              ->orWhere('tanggal', 'like', "%{$monthFilter}%")
              ->orWhere('tanggal', 'like', "%-{$monthNumStr}-%")
              ->orWhere('tanggal', 'like', "%/{$monthNumStr}/%")
              ->orWhere('tanggal', 'like', "%-{$monthNum}-%")
              ->orWhere('tanggal', 'like', "%/{$monthNum}/%")
              ->orWhere('tanggal', 'like', "%-{$shortMonth}%")
              ->orWhere('tanggal', 'like', "% {$shortMonth}%")
              ->orWhere('tanggal', 'like', "%-{$shortMonthEng}%")
              ->orWhere('tanggal', 'like', "% {$shortMonthEng}%");
        });

        if ($spreadsheetSalesName) {
            $logistikData = (clone $query)->where('nama_sales', $spreadsheetSalesName)->get();
                
            foreach ($logistikData as $row) {
                $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->grand_total);
                $spreadsheetSalesTotal += $val;
            }
        } elseif ($user->isAdminUser()) {
            $logistikData = (clone $query)->get();
            foreach ($logistikData as $row) {
                $val = (float) str_replace(['.', ','], ['', '.'], (string)$row->grand_total);
                $spreadsheetSalesTotal += $val;
            }
            $spreadsheetSalesName = 'Semua Data (Admin View)';
            $monthlyTarget = \App\Models\User::sum('monthly_target');
        }

        $isAdminMarketing = $user->isAdminUser();
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
            'outlet_name' => 'nullable|string',
            'outlet_id' => 'nullable|exists:outlets,id',
            'pic_phone' => 'nullable|string',
            'pic_position' => 'nullable|string',
            'pic_name' => 'nullable|string',
            'outlet_status' => 'nullable|string',
            'visit_type' => 'nullable|string',
            'issue_type' => 'nullable|string',
            'competitor_notes' => 'nullable|string',
            'visit_result' => 'nullable|string',
            'signature' => 'nullable|string',
            'photos' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
        ]);

        $photoUrl = null;
        if ($request->hasFile('photos')) {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($request->file('photos'));
            $image->scaleDown(width: 800);
            $base64Photo = base64_encode($image->toJpeg(70)->toString());
            $photoUrl = $this->uploadBase64ToImgBB($base64Photo) ?? $request->file('photos')->store('marketing_reports', 'public');
        }

        $signatureUrl = $request->signature;
        if ($request->filled('signature') && str_starts_with($request->signature, 'data:image')) {
            $signatureUrl = $this->uploadBase64ToImgBB($request->signature) ?? $request->signature;
        }

        $outletId = $request->outlet_id;
        if ($request->filled('outlet_name')) {
            $outletName = $request->outlet_name;
            $mapping = \App\Models\OutletMapping::where('raw_name', $outletName)->with('outlet')->first();
            if ($mapping && $mapping->outlet) {
                $outletName = $mapping->outlet->name;
            }
            $outlet = \App\Models\Outlet::firstOrCreate(['name' => mb_strtoupper($outletName)]);
            $outletId = $outlet->id;
        }

        MarketingDailyReport::create([
            'user_id' => Auth::id(),
            'activity_type' => $request->activity_type,
            'visit_date' => $request->visit_date,
            'visit_time' => $request->visit_time,
            'outlet_type' => $request->outlet_type,
            'outlet_id' => $outletId,
            'pic_phone' => $request->pic_phone,
            'pic_position' => $request->pic_position,
            'pic_name' => $request->pic_name,
            'outlet_status' => $request->outlet_status,
            'visit_type' => $request->visit_type,
            'issue_type' => $request->issue_type,
            'competitor_notes' => $request->competitor_notes,
            'visit_result' => $request->visit_result,
            'signature' => $signatureUrl,
            'photos' => $photoUrl,
        ]);

        return redirect()->back()->with('success', 'Laporan aktivitas harian berhasil disimpan!');
    }

    private function uploadBase64ToImgBB($base64String)
    {
        $apiKey = '5950b44b24860057ff810fe73f58868b';
        $base64String = preg_replace('#^data:image/\w+;base64,#i', '', $base64String);

        $response = Http::asForm()->post('https://api.imgbb.com/1/upload', [
            'key' => $apiKey,
            'image' => $base64String,
        ]);

        if ($response->successful()) {
            return $response->json('data.url');
        }

        return null;
    }

    public function storeTarget(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'target_outlets' => 'nullable|array',
        ]);

        $outlets = [];
        if ($request->has('target_outlets') && is_array($request->target_outlets)) {
            foreach ($request->target_outlets as $item) {
                if (!is_numeric($item)) {
                    $outletName = $item;
                    $mapping = \App\Models\OutletMapping::where('raw_name', $outletName)->with('outlet')->first();
                    if ($mapping && $mapping->outlet) {
                        $outletName = $mapping->outlet->name;
                    }
                    $outlet = \App\Models\Outlet::firstOrCreate(['name' => mb_strtoupper($outletName)]);
                    $outlets[] = (string) $outlet->id;
                } else {
                    $outlets[] = (string) $item;
                }
            }
        }

        $weekNumber = Carbon::parse($request->start_date)->weekOfYear;
        $targetVisits = count($outlets);

        MarketingWeeklyTarget::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'week_number' => $weekNumber,
            ],
            [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'target_visits' => $targetVisits,
                'target_outlets' => $outlets,
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
