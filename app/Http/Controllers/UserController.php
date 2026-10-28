<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\User;
use App\Models\Division;
use App\Models\Position;
use App\Models\MarketingArea;
use App\Models\Company;
use App\Models\FeatureToggle;
use App\Models\SyncLogistikData;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('users') && !\Illuminate\Support\Facades\Schema::hasColumn('users', 'allowed_companies')) {
                \Illuminate\Support\Facades\Schema::table('users', function ($table) {
                    $table->json('allowed_companies')->nullable()->after('company_id');
                });
            }
        } catch (\Throwable $e) {}

        // Ensure SATPAM role, permissions, and division exist in the database
        try {
            $satpamRole = Role::firstOrCreate(['name' => 'SATPAM', 'guard_name' => 'web']);
            $satpamPermissions = ['view absensi', 'create absensi', 'view rekap absensi', 'view pengajuan absensi', 'create pengajuan absensi'];
            foreach ($satpamPermissions as $perm) {
                $permissionModel = \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
                if (!$satpamRole->hasPermissionTo($perm)) {
                    $satpamRole->givePermissionTo($permissionModel);
                }
            }
            Division::firstOrCreate(['name' => 'SATPAM']);
        } catch (\Throwable $e) {}

        $users = User::with(['division', 'position', 'marketingAreas', 'roles', 'company'])->get();
        $divisions = Division::all();
        $positions = Position::all();
        $areas = MarketingArea::orderBy('name')->get();
        $roles = Role::all();
        $companies = Company::orderBy('name')->get();

        // Ensure new WBS features and Unduh PDF exist in the database so they appear in the UI toggle
        FeatureToggle::firstOrCreate(['name' => 'Lapor WBS']);
        FeatureToggle::firstOrCreate(['name' => 'Riwayat Laporan Saya']);
        
        $pdfToggle = FeatureToggle::firstOrCreate(
            ['name' => 'Unduh PDF'],
            [
                'is_active' => true,
                'disabled_for_users' => json_encode([]),
            ]
        );
        if ($pdfToggle && is_null($pdfToggle->disabled_for_users)) {
            $pdfToggle->disabled_for_users = json_encode([]);
            $pdfToggle->is_active = true;
            $pdfToggle->save();
        }
        
        $featureToggles = FeatureToggle::all();
        $spreadsheetSalesNames = SyncLogistikData::select('nama_sales')->distinct()->whereNotNull('nama_sales')->pluck('nama_sales');

        // Transform disabled_for_users into a more usable format for the frontend
        $userFeatures = [];
        foreach ($users as $user) {
            $userFeatures[$user->id] = [];
            foreach ($featureToggles as $feature) {
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                $disabledUserIds = array_map('strval', (array)$disabledUsers);
                // If the user's ID is NOT in the disabled list, it means the feature is ENABLED for them
                $userFeatures[$user->id][$feature->id] = !in_array((string)$user->id, $disabledUserIds, true);
            }
        }

        return Inertia::render('Users/Index', [
            'users' => $users,
            'divisions' => $divisions,
            'positions' => $positions,
            'areas' => $areas,
            'roles' => $roles,
            'companies' => $companies,
            'featureToggles' => $featureToggles,
            'userFeatures' => $userFeatures,
            'pdfFeatureId' => $pdfToggle ? $pdfToggle->id : null,
            'spreadsheetSalesNames' => $spreadsheetSalesNames,
        ]);
    }

    public function togglePdf(User $user)
    {
        $feature = FeatureToggle::whereRaw('LOWER(TRIM(name)) = ?', ['unduh pdf'])->first();
        if (!$feature) {
            $feature = FeatureToggle::create([
                'name' => 'Unduh PDF',
                'is_active' => true,
                'disabled_for_users' => json_encode([]),
            ]);
        }

        $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
        $userIdStr = (string)$user->id;
        $disabledUserIds = array_map('strval', (array)$disabledUsers);

        if (in_array($userIdStr, $disabledUserIds, true)) {
            // Currently disabled -> enable it (remove user from disabled array)
            $disabledUserIds = array_values(array_diff($disabledUserIds, [$userIdStr]));
            $status = 'diaktifkan';
        } else {
            // Currently enabled -> disable it (add user to disabled array)
            $disabledUserIds[] = $userIdStr;
            $status = 'dinonaktifkan';
        }

        $feature->disabled_for_users = json_encode(array_values(array_unique($disabledUserIds)));
        $feature->save();

        return redirect()->back()->with('success', "Saklar Unduh PDF untuk {$user->name} berhasil {$status}.");
    }

    public function store(Request $request)
    {
        $nullableFields = [
            'password',
            'position_id',
            'company_id',
            'monthly_target',
            'salary',
            'operational_allowance',
            'nik',
            'employee_id',
            'start_date',
            'address',
            'phone',
            'employment_status',
            'education',
            'emergency_contact',
            'bpjs_kesehatan',
            'bpjs_ketenagakerjaan',
            'spreadsheet_sales_name',
            'division_name',
        ];

        foreach ($nullableFields as $field) {
            if ($request->has($field) && trim((string)$request->$field) === '') {
                $request->merge([$field => null]);
            }
        }

        if ($request->has('allowed_companies') && is_array($request->allowed_companies)) {
            $request->merge([
                'allowed_companies' => array_values(array_map('intval', array_filter($request->allowed_companies)))
            ]);
        }

        if ($request->has('marketing_areas') && is_array($request->marketing_areas)) {
            $request->merge([
                'marketing_areas' => array_values(array_map('intval', array_filter($request->marketing_areas)))
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string',
            'division_name' => 'nullable|string|max:255',
            'position_id' => 'nullable|exists:positions,id',
            'marketing_areas' => 'nullable|array',
            'marketing_areas.*' => 'exists:marketing_areas,id',
            'company_id' => 'nullable|exists:companies,id',
            'allowed_companies' => 'nullable|array',
            'allowed_companies.*' => 'exists:companies,id',
            'feature_toggles' => 'nullable|array',
            'spreadsheet_sales_name' => 'nullable|string|max:255',
            'monthly_target' => 'nullable|numeric',
            
            // New Employee Details
            'nik' => 'nullable|string|max:255|unique:users',
            'start_date' => 'nullable|date',
            'address' => 'nullable|string',
            'employee_id' => 'nullable|string|max:255|unique:users',
            'phone' => 'nullable|string|max:255',
            'salary' => 'nullable|integer',
            'operational_allowance' => 'nullable|integer',
            'employment_status' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'bpjs_kesehatan' => 'nullable|string|max:255',
            'bpjs_ketenagakerjaan' => 'nullable|string|max:255',
            'preferences' => 'nullable|array',
            'work_days_per_week' => 'nullable|integer|in:5,6',
        ]);

        $division = null;
        if ($request->filled('division_name')) {
            $division = Division::firstOrCreate(['name' => $request->division_name]);
        }

        $allowedCompanies = $request->has('allowed_companies') && is_array($request->allowed_companies)
            ? array_values(array_map('intval', array_filter($request->allowed_companies)))
            : null;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'division_id' => $division ? $division->id : null,
            'position_id' => $request->position_id ?: null,
            'company_id' => $request->company_id ?: null,
            'allowed_companies' => $allowedCompanies,
            'spreadsheet_sales_name' => $request->spreadsheet_sales_name ?: null,
            'monthly_target' => $request->monthly_target !== null && $request->monthly_target !== '' ? $request->monthly_target : null,
            'work_days_per_week' => $request->work_days_per_week ?? 6,
            
            'nik' => $request->nik ?: null,
            'start_date' => $request->start_date ?: null,
            'address' => $request->address ?: null,
            'employee_id' => $request->employee_id ?: null,
            'phone' => $request->phone ?: null,
            'salary' => $request->salary !== null && $request->salary !== '' ? $request->salary : null,
            'operational_allowance' => $request->operational_allowance !== null && $request->operational_allowance !== '' ? $request->operational_allowance : null,
            'employment_status' => $request->employment_status ?: null,
            'education' => $request->education ?: null,
            'emergency_contact' => $request->emergency_contact ?: null,
            'bpjs_kesehatan' => $request->bpjs_kesehatan ?: null,
            'bpjs_ketenagakerjaan' => $request->bpjs_ketenagakerjaan ?: null,
            'preferences' => $request->preferences,
        ]);

        $user->assignRole($request->role);
        
        if ($request->has('marketing_areas')) {
            $user->marketingAreas()->sync($request->marketing_areas);
        }

        $this->syncFeatureToggles($user->id, $request->feature_toggles ?? []);

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $nullableFields = [
            'password',
            'position_id',
            'company_id',
            'monthly_target',
            'salary',
            'operational_allowance',
            'nik',
            'employee_id',
            'start_date',
            'address',
            'phone',
            'employment_status',
            'education',
            'emergency_contact',
            'bpjs_kesehatan',
            'bpjs_ketenagakerjaan',
            'spreadsheet_sales_name',
            'division_name',
        ];

        foreach ($nullableFields as $field) {
            if ($request->has($field) && trim((string)$request->$field) === '') {
                $request->merge([$field => null]);
            }
        }

        if ($request->has('allowed_companies') && is_array($request->allowed_companies)) {
            $request->merge([
                'allowed_companies' => array_values(array_map('intval', array_filter($request->allowed_companies)))
            ]);
        }

        if ($request->has('marketing_areas') && is_array($request->marketing_areas)) {
            $request->merge([
                'marketing_areas' => array_values(array_map('intval', array_filter($request->marketing_areas)))
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string',
            'division_name' => 'nullable|string|max:255',
            'position_id' => 'nullable|exists:positions,id',
            'marketing_areas' => 'nullable|array',
            'marketing_areas.*' => 'exists:marketing_areas,id',
            'company_id' => 'nullable|exists:companies,id',
            'allowed_companies' => 'nullable|array',
            'allowed_companies.*' => 'exists:companies,id',
            'feature_toggles' => 'nullable|array',
            'spreadsheet_sales_name' => 'nullable|string|max:255',
            'monthly_target' => 'nullable|numeric',
            
            // New Employee Details
            'nik' => 'nullable|string|max:255|unique:users,nik,' . $user->id,
            'start_date' => 'nullable|date',
            'address' => 'nullable|string',
            'employee_id' => 'nullable|string|max:255|unique:users,employee_id,' . $user->id,
            'phone' => 'nullable|string|max:255',
            'salary' => 'nullable|integer',
            'operational_allowance' => 'nullable|integer',
            'employment_status' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'bpjs_kesehatan' => 'nullable|string|max:255',
            'bpjs_ketenagakerjaan' => 'nullable|string|max:255',
            'preferences' => 'nullable|array',
            'work_days_per_week' => 'nullable|integer|in:5,6',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        
        if ($request->has('preferences')) {
            $user->preferences = $request->preferences;
        }
        
        if ($request->has('work_days_per_week')) {
            $user->work_days_per_week = $request->work_days_per_week ?: 6;
        }

        if ($request->has('allowed_companies')) {
            $user->allowed_companies = is_array($request->allowed_companies)
                ? array_values(array_map('intval', array_filter($request->allowed_companies)))
                : null;
        }

        if ($request->filled('division_name')) {
            $division = \App\Models\Division::firstOrCreate(['name' => $request->division_name]);
            $user->division_id = $division->id;
        } else {
            $user->division_id = null;
        }

        $user->position_id = $request->position_id ?: null;
        $user->company_id = $request->company_id ?: null;
        $user->spreadsheet_sales_name = $request->spreadsheet_sales_name ?: null;
        $user->monthly_target = $request->monthly_target !== null && $request->monthly_target !== '' ? $request->monthly_target : null;
        
        $user->nik = $request->nik ?: null;
        $user->start_date = $request->start_date ?: null;
        $user->address = $request->address ?: null;
        $user->employee_id = $request->employee_id ?: null;
        $user->phone = $request->phone ?: null;
        $user->salary = $request->salary !== null && $request->salary !== '' ? $request->salary : null;
        $user->operational_allowance = $request->operational_allowance !== null && $request->operational_allowance !== '' ? $request->operational_allowance : null;
        $user->employment_status = $request->employment_status ?: null;
        $user->education = $request->education ?: null;
        $user->emergency_contact = $request->emergency_contact ?: null;
        $user->bpjs_kesehatan = $request->bpjs_kesehatan ?: null;
        $user->bpjs_ketenagakerjaan = $request->bpjs_ketenagakerjaan ?: null;
        
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        // Two-way sync: Sync gaji pokok and operasional to current month payroll if exists
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('payrolls')) {
                $curMonth = (int)date('n');
                $curYear = (int)date('Y');
                $payroll = \App\Models\Payroll::where('user_id', $user->id)
                    ->where('period_month', $curMonth)
                    ->where('period_year', $curYear)
                    ->first();
                if ($payroll) {
                    $payroll->gaji_pokok = (float)($user->salary ?? 0);
                    $payroll->operasional = (float)($user->operational_allowance ?? 0);
                    $payroll->recalculate();
                    $payroll->save();
                }
            }
        } catch (\Throwable $e) {}

        $user->syncRoles([$request->role]);
        
        if ($request->has('marketing_areas')) {
            $user->marketingAreas()->sync($request->marketing_areas);
        } else {
            $user->marketingAreas()->sync([]);
        }

        $this->syncFeatureToggles($user->id, $request->feature_toggles ?? []);

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        // Optionally remove user from all feature toggles
        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }

    private function syncFeatureToggles($userId, $enabledFeatureIds)
    {
        $features = FeatureToggle::all();
        $user = \App\Models\User::find($userId);
        
        // Map feature IDs to their required Spatie permissions
        $featurePermissions = [
            1 => ['manage spreadsheet sync'],
            2 => ['view absensi'],
            3 => ['view marketing', 'export marketing'],
            4 => ['view uc requests'],
            5 => ['view bhp requests'],
            6 => ['view users'],
            7 => ['view laporan finansial'],
            8 => ['approve uc requests'],
            9 => ['manage master data'],
            10 => ['view marketing', 'export marketing'],
            11 => ['manage master data'],
            12 => ['manage master data'],
            16 => ['manage master data'],
            17 => ['view purchase orders'],
            18 => ['view purchase orders'],
            19 => ['view receivables'],
            20 => ['view payables'],
            21 => ['manage company'],
            22 => ['manage master data'],
            23 => ['manage master data'],
            24 => ['approve bhp requests'],
            25 => ['payment-request.view-own', 'payment-request.create', 'payment-request.update-own', 'payment-request.submit', 'payment-request.delete-draft'],
            26 => ['payment-request.view-all', 'payment-request.review'],
            27 => ['view activity log'],
            28 => ['manage master data'],
            29 => ['view marketing', 'export marketing'],
            30 => ['view absensi'],
            31 => ['view absensi'],
            33 => ['view uc requests'],
            34 => ['view absensi'],
        ];

        // We will collect all permissions that should be granted directly to the user via features
        $permissionsToGrant = [];

        foreach ($features as $feature) {
            $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
            $disabledUserIds = array_map('strval', (array)$disabledUsers);
            $userIdStr = (string)$userId;
            
            if (in_array($feature->id, $enabledFeatureIds)) {
                // Feature is ENABLED for this user -> Remove user from disabled list
                $disabledUserIds = array_values(array_diff($disabledUserIds, [$userIdStr]));
                
                // Collect permissions to grant
                if (isset($featurePermissions[$feature->id])) {
                    $permissionsToGrant = array_merge($permissionsToGrant, $featurePermissions[$feature->id]);
                }
            } else {
                // Feature is DISABLED for this user -> Add user to disabled list
                if (!in_array($userIdStr, $disabledUserIds, true)) {
                    $disabledUserIds[] = $userIdStr;
                }
            }
            
            $feature->disabled_for_users = json_encode(array_values(array_unique($disabledUserIds)));
            $feature->save();
        }

        // Sync the direct permissions to the user based on the features they have enabled
        if ($user) {
            // First get all unique permissions to grant
            $permissionsToGrant = array_unique($permissionsToGrant);
            
            // We use syncPermissions to replace the user's direct permissions
            // Note: This does NOT remove permissions granted via Roles, which is perfect.
            // But wait! syncPermissions replaces all direct permissions. If they had other direct permissions, they'd be lost.
            // Since this app relies purely on Roles and Feature Toggles, it's safe to sync.
            $user->syncPermissions($permissionsToGrant);
        }
    }

    public function exportPdf()
    {
        $items = \App\Models\User::with(['company', 'division'])->orderBy('name', 'asc')->get();
        $headings = ['No', 'Nama', 'Nama PT', 'Email', 'Masa Kerja', 'Divisi'];
        
        $companies = \App\Models\Company::all()->keyBy('id');

        $rows = $items->map(function($item, $key) use ($companies) {
            $companyName = '-';
            if ($item->company) {
                $companyName = $item->company->name;
            } elseif (!empty($item->allowed_companies) && is_array($item->allowed_companies)) {
                $names = [];
                foreach ($item->allowed_companies as $cId) {
                    if (isset($companies[$cId])) {
                        $names[] = $companies[$cId]->name;
                    }
                }
                if (!empty($names)) {
                    $companyName = implode(', ', $names);
                }
            }

            $masaKerja = '-';
            if ($item->start_date) {
                try {
                    $start = \Carbon\Carbon::parse($item->start_date)->startOfDay();
                    $now = \Carbon\Carbon::now()->startOfDay();

                    if ($start->isFuture()) {
                        $masaKerja = '0 bulan';
                    } else {
                        $diff = $start->diff($now);
                        $years = $diff->y;
                        $months = $diff->m;
                        $days = $diff->d;

                        $parts = [];
                        if ($years > 0) {
                            $parts[] = $years . ' tahun';
                        }
                        if ($months > 0) {
                            $parts[] = $months . ' bulan';
                        }

                        if (empty($parts)) {
                            $masaKerja = $days > 0 ? ($days . ' hari') : '0 bulan';
                        } else {
                            $masaKerja = implode(' ', $parts);
                        }
                    }
                } catch (\Throwable $e) {
                    $masaKerja = '-';
                }
            }

            $divisionName = $item->division ? $item->division->name : ($item->division_name ?: '-');

            return [
                $key + 1,
                $item->name ?: '-',
                $companyName,
                $item->email ?: '-',
                $masaKerja,
                $divisionName,
            ];
        });
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Pengguna', 'headings' => $headings, 'rows' => $rows])
            ->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'portrait'));
            
        return request()->has('preview') ? $pdf->stream('Data_Pengguna.pdf') : $pdf->download('Data_Pengguna.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\User::with(['company', 'division'])->orderBy('name', 'asc')->get();
        $headings = ['No', 'Nama', 'Nama PT', 'Email', 'Masa Kerja', 'Divisi'];
        
        $companies = \App\Models\Company::all()->keyBy('id');

        $rows = $items->map(function($item, $key) use ($companies) {
            $companyName = '-';
            if ($item->company) {
                $companyName = $item->company->name;
            } elseif (!empty($item->allowed_companies) && is_array($item->allowed_companies)) {
                $names = [];
                foreach ($item->allowed_companies as $cId) {
                    if (isset($companies[$cId])) {
                        $names[] = $companies[$cId]->name;
                    }
                }
                if (!empty($names)) {
                    $companyName = implode(', ', $names);
                }
            }

            $masaKerja = '-';
            if ($item->start_date) {
                try {
                    $start = \Carbon\Carbon::parse($item->start_date)->startOfDay();
                    $now = \Carbon\Carbon::now()->startOfDay();

                    if ($start->isFuture()) {
                        $masaKerja = '0 bulan';
                    } else {
                        $diff = $start->diff($now);
                        $years = $diff->y;
                        $months = $diff->m;
                        $days = $diff->d;

                        $parts = [];
                        if ($years > 0) {
                            $parts[] = $years . ' tahun';
                        }
                        if ($months > 0) {
                            $parts[] = $months . ' bulan';
                        }

                        if (empty($parts)) {
                            $masaKerja = $days > 0 ? ($days . ' hari') : '0 bulan';
                        } else {
                            $masaKerja = implode(' ', $parts);
                        }
                    }
                } catch (\Throwable $e) {
                    $masaKerja = '-';
                }
            }

            $divisionName = $item->division ? $item->division->name : ($item->division_name ?: '-');

            return [
                $key + 1,
                $item->name ?: '-',
                $companyName,
                $item->email ?: '-',
                $masaKerja,
                $divisionName,
            ];
        });
        
        return request()->has('preview') 
            ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') 
            : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), 'Data_Pengguna.xlsx');
    }

    public function downloadBarcode(Request $request, User $user)
    {
        $hash = substr(md5($user->id . $user->created_at), 0, 10);
        $url = route('verify.signature', ['id' => $user->id, 'hash' => $hash]);
        
        $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
            ->size(300)
            ->margin(1)
            ->errorCorrection('H') // H = 30% error correction, required when using logo
            ->generate($url);
        
        $logoPath = public_path('img/logo.png');
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $logoSize = 70; 
            $x = (300 - $logoSize) / 2;
            $y = (300 - $logoSize) / 2;
            
            // Tambahkan background putih dengan rounded corner agar QR Code tidak menumpuk dengan logo
            $bgTag = '<rect x="'.($x-4).'" y="'.($y-4).'" width="'.($logoSize+8).'" height="'.($logoSize+8).'" fill="#ffffff" rx="10" ry="10" />';
            $imageTag = '<image x="'.$x.'" y="'.$y.'" width="'.$logoSize.'" height="'.$logoSize.'" href="data:image/png;base64,'.$logoData.'" preserveAspectRatio="xMidYMid meet" />';
            
            $qrCode = str_replace('</svg>', $bgTag . $imageTag . '</svg>', $qrCode);
        }

        return response($qrCode)
               ->header('Content-Type', 'image/svg+xml')
               ->header('Content-Disposition', 'attachment; filename="barcode-'.$user->name.'.svg"');
    }

    public function verifySignature($id, $hash)
    {
        $user = User::findOrFail($id);
        $expectedHash = substr(md5($user->id . $user->created_at), 0, 10);
        
        if ($hash !== $expectedHash) {
            abort(404, 'Tanda tangan digital tidak valid atau tidak ditemukan.');
        }
        
        return view('verify-signature', compact('user'));
    }
}
