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

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['division', 'position', 'marketingAreas', 'roles', 'company'])->get();
        $divisions = Division::all();
        $positions = Position::all();
        $areas = MarketingArea::orderBy('name')->get();
        $roles = Role::all();
        $companies = Company::all();
        $featureToggles = FeatureToggle::all();
        $spreadsheetSalesNames = SyncLogistikData::select('nama_sales')->distinct()->whereNotNull('nama_sales')->pluck('nama_sales');

        // Transform disabled_for_users into a more usable format for the frontend
        $userFeatures = [];
        foreach ($users as $user) {
            $userFeatures[$user->id] = [];
            foreach ($featureToggles as $feature) {
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                // If the user's ID is NOT in the disabled list, it means the feature is ENABLED for them
                $userFeatures[$user->id][$feature->id] = !in_array($user->id, $disabledUsers);
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
            'spreadsheetSalesNames' => $spreadsheetSalesNames,
        ]);
    }

    public function store(Request $request)
    {
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
        ]);

        $division = null;
        if ($request->filled('division_name')) {
            $division = Division::firstOrCreate(['name' => $request->division_name]);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'division_id' => $division ? $division->id : null,
            'position_id' => $request->position_id,
            'company_id' => $request->company_id,
            'spreadsheet_sales_name' => $request->spreadsheet_sales_name,
            'monthly_target' => $request->monthly_target,
            
            'nik' => $request->nik,
            'start_date' => $request->start_date,
            'address' => $request->address,
            'employee_id' => $request->employee_id,
            'phone' => $request->phone,
            'salary' => $request->salary,
            'operational_allowance' => $request->operational_allowance,
            'employment_status' => $request->employment_status,
            'education' => $request->education,
            'emergency_contact' => $request->emergency_contact,
            'bpjs_kesehatan' => $request->bpjs_kesehatan,
            'bpjs_ketenagakerjaan' => $request->bpjs_ketenagakerjaan,
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
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        
        if ($request->filled('division_name')) {
            $division = \App\Models\Division::firstOrCreate(['name' => $request->division_name]);
            $user->division_id = $division->id;
        } else {
            $user->division_id = null;
        }

        $user->position_id = $request->position_id;
        $user->company_id = $request->company_id;
        $user->spreadsheet_sales_name = $request->spreadsheet_sales_name;
        $user->monthly_target = $request->monthly_target;
        
        $user->nik = $request->nik;
        $user->start_date = $request->start_date;
        $user->address = $request->address;
        $user->employee_id = $request->employee_id;
        $user->phone = $request->phone;
        $user->salary = $request->salary;
        $user->operational_allowance = $request->operational_allowance;
        $user->employment_status = $request->employment_status;
        $user->education = $request->education;
        $user->emergency_contact = $request->emergency_contact;
        $user->bpjs_kesehatan = $request->bpjs_kesehatan;
        $user->bpjs_ketenagakerjaan = $request->bpjs_ketenagakerjaan;
        
        if ($request->filled('password')) {
            $user->password = $request->password;
        }
        
        $user->save();

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
            3 => ['view marketing'],
            4 => ['view uc requests'],
            5 => ['view bhp requests'],
            6 => ['view users'],
            7 => ['view laporan finansial'],
            8 => ['approve uc requests'],
            9 => ['manage master data'],
            10 => ['view marketing'],
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
            29 => ['view marketing'],
            30 => ['view absensi'],
            31 => ['view absensi'],
            33 => ['view uc requests'],
            34 => ['view absensi'],
        ];

        // We will collect all permissions that should be granted directly to the user via features
        $permissionsToGrant = [];

        foreach ($features as $feature) {
            $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
            
            if (in_array($feature->id, $enabledFeatureIds)) {
                // Feature is ENABLED for this user -> Remove user from disabled list
                $disabledUsers = array_diff($disabledUsers, [$userId]);
                
                // Collect permissions to grant
                if (isset($featurePermissions[$feature->id])) {
                    $permissionsToGrant = array_merge($permissionsToGrant, $featurePermissions[$feature->id]);
                }
            } else {
                // Feature is DISABLED for this user -> Add user to disabled list
                if (!in_array($userId, $disabledUsers)) {
                    $disabledUsers[] = $userId;
                }
            }
            
            $feature->disabled_for_users = json_encode(array_values($disabledUsers));
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
        $items = \App\Models\User::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'email', 'phone', 'level_id', 'status_employee', 'is_active'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $row[] = $item->$col;
                }
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Pengguna', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Pengguna') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Pengguna') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\User::orderBy('id', 'desc')->get();
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['name', 'email', 'phone', 'level_id', 'status_employee', 'is_active'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $rows = $items->map(function($item, $key) use ($allowed) {
                $row = [$key + 1];
                foreach ($allowed as $col) {
                    $row[] = $item->$col;
                }
                return $row;
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Pengguna') . '.xlsx');
    }

    public function downloadBarcode(Request $request, User $user)
    {
        $hash = substr(md5($user->id . $user->created_at), 0, 10);
        $url = route('verify.signature', ['id' => $user->id, 'hash' => $hash]);
        
        $format = $request->query('format', 'svg'); // svg, png

        if ($format === 'png') {
            $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png')->size(300)->generate($url);
            return response($qrCode)
                   ->header('Content-Type', 'image/png')
                   ->header('Content-Disposition', 'attachment; filename="barcode-'.$user->name.'.png"');
        } elseif ($format === 'jpg') {
            // Since jpg isn't directly supported by default without imagick, we generate PNG and convert to JPG if needed,
            // or we just fallback to png but name it png. Wait, QrCode might support jpg if imagick is present.
            // Let's try to just output png as jpg if requested, or convert using GD.
            $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png')->size(300)->margin(2)->generate($url);
            $image = imagecreatefromstring($qrCode);
            $bg = imagecreatetruecolor(imagesx($image), imagesy($image));
            imagefill($bg, 0, 0, imagecolorallocate($bg, 255, 255, 255));
            imagealphablending($bg, TRUE);
            imagecopy($bg, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
            ob_start();
            imagejpeg($bg, null, 100);
            $jpgCode = ob_get_clean();
            imagedestroy($image);
            imagedestroy($bg);

            return response($jpgCode)
                   ->header('Content-Type', 'image/jpeg')
                   ->header('Content-Disposition', 'attachment; filename="barcode-'.$user->name.'.jpg"');
        } else {
            $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(300)->generate($url);
            return response($qrCode)
                   ->header('Content-Type', 'image/svg+xml')
                   ->header('Content-Disposition', 'attachment; filename="barcode-'.$user->name.'.svg"');
        }
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
