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
use Illuminate\Support\Facades\Crypt;

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
            'password' => 'required|string|min:4',
            'role' => 'required|string',
            'division_id' => 'nullable|exists:divisions,id',
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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'division_id' => $request->division_id,
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
            'password' => 'nullable|string|min:4',
            'role' => 'required|string',
            'division_id' => 'nullable|exists:divisions,id',
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
        $user->division_id = $request->division_id;
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
        foreach ($features as $feature) {
            $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
            
            if (in_array($feature->id, $enabledFeatureIds)) {
                // Feature is ENABLED for this user -> Remove user from disabled list
                $disabledUsers = array_diff($disabledUsers, [$userId]);
            } else {
                // Feature is DISABLED for this user -> Add user to disabled list
                if (!in_array($userId, $disabledUsers)) {
                    $disabledUsers[] = $userId;
                }
            }
            
            $feature->disabled_for_users = json_encode(array_values($disabledUsers));
            $feature->save();
        }
    }

    public function exportPdf()
    {
        $items = \App\Models\User::orderBy('id', 'desc')->get();
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
                        $row[] = $val;
                    }
                }
                return $row;
            });
        }
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Pengguna', 'headings' => $headings, 'rows' => $rows])->setPaper([0, 0, 609.4488, 935.433], 'landscape');
        return $pdf->download(str_replace(' ', '_', 'Pengguna') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\User::orderBy('id', 'desc')->get();
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
                        $row[] = $val;
                    }
                }
                return $row;
            });
        }
        
        return Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Pengguna') . '.xlsx');
    }
}
