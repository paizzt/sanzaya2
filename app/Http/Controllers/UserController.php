<?php

namespace App\Http\Controllers;

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
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->division_id = $request->division_id;
        $user->position_id = $request->position_id;
        $user->company_id = $request->company_id;
        $user->spreadsheet_sales_name = $request->spreadsheet_sales_name;
        $user->monthly_target = $request->monthly_target;
        
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
}
