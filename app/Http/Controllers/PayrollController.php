<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Models\Company;
use App\Models\Division;
use App\Models\Attendance;
use App\Models\FeatureToggle;
use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    /**
     * Ensure database table and feature toggles exist (self-healing for shared hosting)
     */
    protected function ensureTableAndFeatures(): void
    {
        try {
            if (!Schema::hasTable('payrolls')) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $e) {}

        try {
            FeatureToggle::firstOrCreate(['name' => 'Manajemen Gaji'], ['is_active' => true, 'disabled_for_users' => json_encode([])]);
            FeatureToggle::firstOrCreate(['name' => 'Slip Gaji'], ['is_active' => true, 'disabled_for_users' => json_encode([])]);
        } catch (\Throwable $e) {}
    }

    /**
     * List all payroll records for HR / Management
     */
    public function index(Request $request)
    {
        $this->ensureTableAndFeatures();

        $curMonth = (int)$request->input('month', date('n'));
        $curYear = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');
        $divisionId = $request->input('division_id');
        $search = $request->input('search');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        // Query payrolls
        $query = Payroll::with(['user.division', 'user.position', 'user.company', 'company'])
            ->where('period_month', $curMonth)
            ->where('period_year', $curYear);

        if ($allowedCompanyIds !== null) {
            $query->where(function ($q) use ($allowedCompanyIds) {
                $q->whereIn('company_id', $allowedCompanyIds)
                  ->orWhereHas('user', function ($uq) use ($allowedCompanyIds) {
                      $uq->whereIn('company_id', $allowedCompanyIds);
                  });
            });
        }

        if ($companyId) {
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                  ->orWhereHas('user', function ($uq) use ($companyId) {
                      $uq->where('company_id', $companyId);
                  });
            });
        }

        if ($divisionId) {
            $query->whereHas('user', function ($q) use ($divisionId) {
                $q->where('division_id', $divisionId);
            });
        }

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        $payrolls = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary
        $summary = [
            'total_karyawan' => $payrolls->count(),
            'total_penerimaan' => (float)$payrolls->sum('total_penerimaan'),
            'total_potongan' => (float)$payrolls->sum('total_potongan'),
            'total_bpjs_perusahaan' => (float)$payrolls->sum('total_bpjs_perusahaan'),
            'total_diterima' => (float)$payrolls->sum('total_diterima'),
        ];

        // Active users list for the "Add Payroll" form
        $userQuery = User::with(['division', 'position', 'company'])
            ->where('is_active', true);
        if ($allowedCompanyIds !== null) {
            $userQuery->whereIn('company_id', $allowedCompanyIds);
        }
        $users = $userQuery->orderBy('name')->get();

        $companies = Company::orderBy('name')->get();
        $divisions = Division::orderBy('name')->get();

        return Inertia::render('Salaries/Index', [
            'payrolls' => $payrolls,
            'summary' => $summary,
            'users' => $users,
            'companies' => $companies,
            'divisions' => $divisions,
            'filters' => [
                'month' => $curMonth,
                'year' => $curYear,
                'company_id' => $companyId ? (int)$companyId : null,
                'division_id' => $divisionId ? (int)$divisionId : null,
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Self-service payslips for logged-in employee
     */
    public function mySlip(Request $request)
    {
        $this->ensureTableAndFeatures();

        $user = auth()->user();
        $year = (int)$request->input('year', date('Y'));

        $slips = Payroll::with(['company', 'user.company', 'user.division', 'user.position'])
            ->where('user_id', $user->id)
            ->where('period_year', $year)
            ->orderBy('period_month', 'desc')
            ->get();

        return Inertia::render('Salaries/MySlip', [
            'slips' => $slips,
            'year' => $year,
            'user' => $user->load(['company', 'division', 'position']),
        ]);
    }

    /**
     * Get user details and attendance summary for a given month
     */
    public function userSummary(Request $request)
    {
        $userId = $request->input('user_id');
        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));

        if (!$userId) {
            return response()->json(['error' => 'User ID diperlukan'], 422);
        }

        $user = User::with(['division', 'position', 'company'])->find($userId);
        if (!$user) {
            return response()->json(['error' => 'Pengguna tidak ditemukan'], 404);
        }

        // Count attendances for that month
        $attendances = Attendance::where('user_id', $userId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        $hadir = $attendances->where('status', 'Hadir')->count();
        $terlambat = $attendances->where('status', 'Terlambat')->count();
        $izin = $attendances->where('status', 'Izin')->count();
        $sakit = $attendances->where('status', 'Sakit')->count();
        $absen = $attendances->where('status', 'Absen')->count();

        return response()->json([
            'user' => $user,
            'attendance_count' => [
                'hadir' => $hadir,
                'terlambat' => $terlambat,
                'izin' => $izin,
                'sakit' => $sakit,
                'absen' => $absen,
                'total' => $attendances->count(),
            ],
            'default_values' => [
                'gaji_pokok' => (float)($user->salary ?? 0),
                'operasional' => (float)($user->operational_allowance ?? 0),
                'bpjs_kesehatan_persen' => 1.0,
                'bpjs_ketenagakerjaan_persen' => 2.0,
                'bpjs_kesehatan_perusahaan_persen' => 4.0,
                'bpjs_ketenagakerjaan_perusahaan_persen' => 4.24,
            ]
        ]);
    }

    /**
     * Store new payroll record
     */
    public function store(Request $request)
    {
        $this->ensureTableAndFeatures();

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'period_month' => 'required|integer|between:1,12',
            'period_year' => 'required|integer|min:2020|max:2050',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|string|in:draft,published,paid',
            
            // Penerimaan
            'gaji_pokok' => 'nullable|numeric|min:0',
            'operasional' => 'nullable|numeric|min:0',
            'tunjangan_jabatan' => 'nullable|numeric|min:0',
            'thr' => 'nullable|numeric|min:0',
            'lembur' => 'nullable|numeric|min:0',

            // Potongan
            'bpjs_kesehatan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan' => 'nullable|numeric|min:0',
            'pajak' => 'nullable|numeric|min:0',
            'piutang' => 'nullable|numeric|min:0',
            'potongan_absen' => 'nullable|numeric|min:0',
            'potongan_lainnya' => 'nullable|numeric|min:0',

            // BPJS Perusahaan
            'bpjs_kesehatan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan_perusahaan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan_perusahaan' => 'nullable|numeric|min:0',

            'notes' => 'nullable|string',
        ]);

        $user = User::findOrFail($request->user_id);

        // Check if payroll already exists for this period, update it if so
        $payroll = Payroll::firstOrNew([
            'user_id' => $request->user_id,
            'period_month' => (int)$request->period_month,
            'period_year' => (int)$request->period_year,
        ]);

        $payroll->company_id = $user->company_id;
        $payroll->payment_date = $request->payment_date ?: date('Y-m-d');
        $payroll->status = $request->status ?: 'published';
        $payroll->notes = $request->notes;
        $payroll->created_by = auth()->id();

        // Penerimaan
        $payroll->gaji_pokok = (float)($request->gaji_pokok ?? $user->salary ?? 0);
        $payroll->operasional = (float)($request->operasional ?? $user->operational_allowance ?? 0);
        $payroll->tunjangan_jabatan = (float)($request->tunjangan_jabatan ?? 0);
        $payroll->thr = (float)($request->thr ?? 0);
        $payroll->lembur = (float)($request->lembur ?? 0);

        // Potongan
        $payroll->bpjs_kesehatan_persen = (float)($request->bpjs_kesehatan_persen ?? 1.0);
        $payroll->bpjs_kesehatan = (float)($request->bpjs_kesehatan ?? 0);
        $payroll->bpjs_ketenagakerjaan_persen = (float)($request->bpjs_ketenagakerjaan_persen ?? 2.0);
        $payroll->bpjs_ketenagakerjaan = (float)($request->bpjs_ketenagakerjaan ?? 0);
        $payroll->pajak = (float)($request->pajak ?? 0);
        $payroll->piutang = (float)($request->piutang ?? 0);
        $payroll->potongan_absen = (float)($request->potongan_absen ?? 0);
        $payroll->potongan_lainnya = (float)($request->potongan_lainnya ?? 0);

        // BPJS Perusahaan
        $payroll->bpjs_kesehatan_perusahaan_persen = (float)($request->bpjs_kesehatan_perusahaan_persen ?? 4.0);
        $payroll->bpjs_kesehatan_perusahaan = (float)($request->bpjs_kesehatan_perusahaan ?? 0);
        $payroll->bpjs_ketenagakerjaan_perusahaan_persen = (float)($request->bpjs_ketenagakerjaan_perusahaan_persen ?? 4.24);
        $payroll->bpjs_ketenagakerjaan_perusahaan = (float)($request->bpjs_ketenagakerjaan_perusahaan ?? 0);

        $payroll->recalculate();
        $payroll->save();

        // Two-way sync: Sync gaji_pokok and operasional to User
        $userUpdated = false;
        if ($request->has('gaji_pokok') && (int)$user->salary !== (int)$payroll->gaji_pokok) {
            $user->salary = (int)$payroll->gaji_pokok;
            $userUpdated = true;
        }
        if ($request->has('operasional') && (int)$user->operational_allowance !== (int)$payroll->operasional) {
            $user->operational_allowance = (int)$payroll->operasional;
            $userUpdated = true;
        }
        if ($userUpdated) {
            $user->save();
        }

        return redirect()->back()->with('success', 'Data gaji berhasil disimpan dan data pengguna telah disinkronkan.');
    }

    /**
     * Update existing payroll record
     */
    public function update(Request $request, Payroll $payroll)
    {
        $validated = $request->validate([
            'payment_date' => 'nullable|date',
            'status' => 'nullable|string|in:draft,published,paid',
            
            // Penerimaan
            'gaji_pokok' => 'nullable|numeric|min:0',
            'operasional' => 'nullable|numeric|min:0',
            'tunjangan_jabatan' => 'nullable|numeric|min:0',
            'thr' => 'nullable|numeric|min:0',
            'lembur' => 'nullable|numeric|min:0',

            // Potongan
            'bpjs_kesehatan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan' => 'nullable|numeric|min:0',
            'pajak' => 'nullable|numeric|min:0',
            'piutang' => 'nullable|numeric|min:0',
            'potongan_absen' => 'nullable|numeric|min:0',
            'potongan_lainnya' => 'nullable|numeric|min:0',

            // BPJS Perusahaan
            'bpjs_kesehatan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan_perusahaan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan_perusahaan' => 'nullable|numeric|min:0',

            'notes' => 'nullable|string',
        ]);

        if ($request->filled('payment_date')) $payroll->payment_date = $request->payment_date;
        if ($request->filled('status')) $payroll->status = $request->status;
        $payroll->notes = $request->notes;

        // Penerimaan
        if ($request->has('gaji_pokok')) $payroll->gaji_pokok = (float)$request->gaji_pokok;
        if ($request->has('operasional')) $payroll->operasional = (float)$request->operasional;
        if ($request->has('tunjangan_jabatan')) $payroll->tunjangan_jabatan = (float)$request->tunjangan_jabatan;
        if ($request->has('thr')) $payroll->thr = (float)$request->thr;
        if ($request->has('lembur')) $payroll->lembur = (float)$request->lembur;

        // Potongan
        if ($request->has('bpjs_kesehatan_persen')) $payroll->bpjs_kesehatan_persen = (float)$request->bpjs_kesehatan_persen;
        if ($request->has('bpjs_kesehatan')) $payroll->bpjs_kesehatan = (float)$request->bpjs_kesehatan;
        if ($request->has('bpjs_ketenagakerjaan_persen')) $payroll->bpjs_ketenagakerjaan_persen = (float)$request->bpjs_ketenagakerjaan_persen;
        if ($request->has('bpjs_ketenagakerjaan')) $payroll->bpjs_ketenagakerjaan = (float)$request->bpjs_ketenagakerjaan;
        if ($request->has('pajak')) $payroll->pajak = (float)$request->pajak;
        if ($request->has('piutang')) $payroll->piutang = (float)$request->piutang;
        if ($request->has('potongan_absen')) $payroll->potongan_absen = (float)$request->potongan_absen;
        if ($request->has('potongan_lainnya')) $payroll->potongan_lainnya = (float)$request->potongan_lainnya;

        // BPJS Perusahaan
        if ($request->has('bpjs_kesehatan_perusahaan_persen')) $payroll->bpjs_kesehatan_perusahaan_persen = (float)$request->bpjs_kesehatan_perusahaan_persen;
        if ($request->has('bpjs_kesehatan_perusahaan')) $payroll->bpjs_kesehatan_perusahaan = (float)$request->bpjs_kesehatan_perusahaan;
        if ($request->has('bpjs_ketenagakerjaan_perusahaan_persen')) $payroll->bpjs_ketenagakerjaan_perusahaan_persen = (float)$request->bpjs_ketenagakerjaan_perusahaan_persen;
        if ($request->has('bpjs_ketenagakerjaan_perusahaan')) $payroll->bpjs_ketenagakerjaan_perusahaan = (float)$request->bpjs_ketenagakerjaan_perusahaan;

        $payroll->recalculate();
        $payroll->save();

        // Two-way sync: Sync to User
        $user = $payroll->user;
        if ($user) {
            $userUpdated = false;
            if ($request->has('gaji_pokok') && (int)$user->salary !== (int)$payroll->gaji_pokok) {
                $user->salary = (int)$payroll->gaji_pokok;
                $userUpdated = true;
            }
            if ($request->has('operasional') && (int)$user->operational_allowance !== (int)$payroll->operasional) {
                $user->operational_allowance = (int)$payroll->operasional;
                $userUpdated = true;
            }
            if ($userUpdated) {
                $user->save();
            }
        }

        return redirect()->back()->with('success', 'Data gaji berhasil diperbarui dan disinkronkan.');
    }

    /**
     * Delete payroll record
     */
    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return redirect()->back()->with('success', 'Data gaji berhasil dihapus.');
    }

    /**
     * Batch generate payroll for all active employees for given month & year
     */
    public function generate(Request $request)
    {
        $this->ensureTableAndFeatures();

        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        $userQuery = User::where('is_active', true);
        if ($allowedCompanyIds !== null) {
            $userQuery->whereIn('company_id', $allowedCompanyIds);
        }
        if ($companyId) {
            $userQuery->where('company_id', $companyId);
        }

        $users = $userQuery->get();
        $countCreated = 0;
        $countUpdated = 0;

        foreach ($users as $user) {
            $payroll = Payroll::firstOrNew([
                'user_id' => $user->id,
                'period_month' => $month,
                'period_year' => $year,
            ]);

            $isNew = !$payroll->exists;

            $payroll->company_id = $user->company_id;
            $payroll->payment_date = date('Y-m-d');
            $payroll->status = 'published';
            $payroll->created_by = auth()->id();

            // Default salary components from user
            $payroll->gaji_pokok = (float)($user->salary ?? 0);
            $payroll->operasional = (float)($user->operational_allowance ?? 0);

            // Default percentages
            $payroll->bpjs_kesehatan_persen = 1.0;
            $payroll->bpjs_ketenagakerjaan_persen = 2.0;
            $payroll->bpjs_kesehatan_perusahaan_persen = 4.0;
            $payroll->bpjs_ketenagakerjaan_perusahaan_persen = 4.24;

            // Compute BPJS amounts from base salary
            $bpjsBase = (float)$payroll->gaji_pokok;
            $payroll->bpjs_kesehatan = round(($bpjsBase * 1.0) / 100);
            $payroll->bpjs_ketenagakerjaan = round(($bpjsBase * 2.0) / 100);
            $payroll->bpjs_kesehatan_perusahaan = round(($bpjsBase * 4.0) / 100);
            $payroll->bpjs_ketenagakerjaan_perusahaan = round(($bpjsBase * 4.24) / 100);

            $payroll->recalculate();
            $payroll->save();

            if ($isNew) {
                $countCreated++;
            } else {
                $countUpdated++;
            }
        }

        return redirect()->back()->with('success', "Generate gaji berhasil: {$countCreated} data baru dibuat, {$countUpdated} data diperbarui.");
    }

    /**
     * Download individual Slip Gaji PDF
     */
    public function slipPdf(Payroll $payroll)
    {
        // Authorization check: User can download their own slip, or user with view permission
        $currentUser = auth()->user();
        if ($payroll->user_id !== $currentUser->id && !$currentUser->hasAnyRole(['Super Admin', 'super_admin', 'super-admin', 'Superadmin', 'superadmin', 'SUPERADMIN', 'SUPER ADMIN']) && !$currentUser->can('view users') && !$currentUser->can('view salaries')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengunduh slip gaji ini.');
        }

        $payroll->load(['user.division', 'user.position', 'user.company', 'company']);
        $company = $payroll->company ?? $payroll->user->company ?? Company::first();

        // Convert company logo to base64 if present for clean DomPDF rendering
        $logoBase64 = null;
        if ($company && $company->logo) {
            $logoPath = storage_path('app/public/' . $company->logo);
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $pdf = Pdf::loadView('pdf.slip_gaji', [
            'payroll' => $payroll,
            'company' => $company,
            'logoBase64' => $logoBase64,
            'terbilang' => $payroll->terbilang,
        ])->setPaper('a4', 'portrait');

        $filename = 'Slip_Gaji_' . str_replace(' ', '_', $payroll->user->name) . '_' . $payroll->month_name . '_' . $payroll->period_year . '.pdf';
        return $pdf->download($filename);
    }

    /**
     * Export recap PDF for a month
     */
    public function exportPdf(Request $request)
    {
        $this->ensureTableAndFeatures();

        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        $query = Payroll::with(['user.division', 'user.position', 'user.company', 'company'])
            ->where('period_month', $month)
            ->where('period_year', $year);

        if ($allowedCompanyIds !== null) {
            $query->where(function ($q) use ($allowedCompanyIds) {
                $q->whereIn('company_id', $allowedCompanyIds)
                  ->orWhereHas('user', function ($uq) use ($allowedCompanyIds) {
                      $uq->whereIn('company_id', $allowedCompanyIds);
                  });
            });
        }

        if ($companyId) {
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                  ->orWhereHas('user', function ($uq) use ($companyId) {
                      $uq->where('company_id', $companyId);
                  });
            });
        }

        $payrolls = $query->orderBy('created_at', 'asc')->get();

        $company = $companyId ? Company::find($companyId) : (auth()->user()?->company ?? Company::first());

        $logoBase64 = null;
        if ($company && $company->logo) {
            $logoPath = storage_path('app/public/' . $company->logo);
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $monthName = $months[$month] ?? (string)$month;

        $pdf = Pdf::loadView('pdf.payroll_recap', [
            'payrolls' => $payrolls,
            'monthName' => $monthName,
            'year' => $year,
            'company' => $company,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'landscape');

        return $pdf->download("Rekap_Gaji_{$monthName}_{$year}.pdf");
    }

    /**
     * Export recap Excel for a month
     */
    public function exportExcel(Request $request)
    {
        $this->ensureTableAndFeatures();

        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        $query = Payroll::with(['user.division', 'user.position', 'user.company', 'company'])
            ->where('period_month', $month)
            ->where('period_year', $year);

        if ($allowedCompanyIds !== null) {
            $query->where(function ($q) use ($allowedCompanyIds) {
                $q->whereIn('company_id', $allowedCompanyIds)
                  ->orWhereHas('user', function ($uq) use ($allowedCompanyIds) {
                      $uq->whereIn('company_id', $allowedCompanyIds);
                  });
            });
        }

        if ($companyId) {
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                  ->orWhereHas('user', function ($uq) use ($companyId) {
                      $uq->where('company_id', $companyId);
                  });
            });
        }

        $payrolls = $query->orderBy('created_at', 'asc')->get();

        $headings = [
            'No',
            'Nama Karyawan',
            'NIK / ID',
            'Perusahaan',
            'Divisi',
            'Jabatan',
            'Gaji Pokok',
            'Operasional',
            'Tunjangan Jabatan',
            'THR',
            'Lembur',
            'Total Penerimaan',
            'BPJS Kesehatan (Karyawan)',
            'BPJS TK (Karyawan)',
            'Pajak (PPh 21)',
            'Piutang',
            'Potongan Absen',
            'Potongan Lainnya',
            'Total Potongan',
            'BPJS Kes (Perusahaan)',
            'BPJS TK (Perusahaan)',
            'Total BPJS Perusahaan',
            'Total Diterima (THP)',
            'Status',
        ];

        $rows = [];
        $no = 1;
        foreach ($payrolls as $p) {
            $rows[] = [
                $no++,
                $p->user->name ?? '-',
                $p->user->employee_id ?? $p->user->nik ?? '-',
                $p->company->name ?? $p->user->company->name ?? '-',
                $p->user->division->name ?? '-',
                $p->user->position->name ?? '-',
                $p->gaji_pokok,
                $p->operasional,
                $p->tunjangan_jabatan,
                $p->thr,
                $p->lembur,
                $p->total_penerimaan,
                $p->bpjs_kesehatan,
                $p->bpjs_ketenagakerjaan,
                $p->pajak,
                $p->piutang,
                $p->potongan_absen,
                $p->potongan_lainnya,
                $p->total_potongan,
                $p->bpjs_kesehatan_perusahaan,
                $p->bpjs_ketenagakerjaan_perusahaan,
                $p->total_bpjs_perusahaan,
                $p->total_diterima,
                ucfirst($p->status),
            ];
        }

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $monthName = $months[$month] ?? (string)$month;

        return Excel::download(new GenericExport(collect($rows), $headings), "Rekap_Gaji_{$monthName}_{$year}.xlsx");
    }
}
