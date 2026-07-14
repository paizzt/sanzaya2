<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::all();

        return Inertia::render('Company/Index', [
            'companies' => $companies
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $company = new Company();
        $company->name = $request->name;
        $company->address = $request->address;

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('company', 'public');
            $company->logo = $path;
        }

        $company->save();

        return redirect()->back()->with('success', 'Data perusahaan berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $company = Company::findOrFail($id);
        $company->name = $request->name;
        $company->address = $request->address;

        if ($request->hasFile('logo')) {
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $path = $request->file('logo')->store('company', 'public');
            $company->logo = $path;
        }

        $company->save();

        return redirect()->back()->with('success', 'Data perusahaan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $company = Company::findOrFail($id);

        if ($company->logo && Storage::disk('public')->exists($company->logo)) {
            Storage::disk('public')->delete($company->logo);
        }

        $company->delete();

        return redirect()->back()->with('success', 'Data perusahaan berhasil dihapus.');
    }
}
