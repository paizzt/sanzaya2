<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompanyTarget;

class CompanyTargetController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'monthly_target' => 'nullable|numeric|min:0',
            'annual_target' => 'nullable|numeric|min:0',
            'company_ids' => 'nullable|array',
            'company_ids.*' => 'exists:companies,id'
        ]);

        $target = CompanyTarget::create([
            'name' => $request->name,
            'monthly_target' => $request->monthly_target ?? 0,
            'annual_target' => $request->annual_target ?? 0,
        ]);

        if ($request->has('company_ids') && is_array($request->company_ids)) {
            \App\Models\Company::whereIn('id', $request->company_ids)->update(['company_target_id' => $target->id]);
        }

        return redirect()->back()->with('success', 'Target Perusahaan berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'monthly_target' => 'nullable|numeric|min:0',
            'annual_target' => 'nullable|numeric|min:0',
            'company_ids' => 'nullable|array',
            'company_ids.*' => 'exists:companies,id'
        ]);

        $target = CompanyTarget::findOrFail($id);
        $target->update([
            'name' => $request->name,
            'monthly_target' => $request->monthly_target ?? 0,
            'annual_target' => $request->annual_target ?? 0,
        ]);

        // Reset existing relationships
        \App\Models\Company::where('company_target_id', $target->id)->update(['company_target_id' => null]);
        
        // Add new relationships
        if ($request->has('company_ids') && is_array($request->company_ids)) {
            \App\Models\Company::whereIn('id', $request->company_ids)->update(['company_target_id' => $target->id]);
        }

        return redirect()->back()->with('success', 'Target Perusahaan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $target = CompanyTarget::findOrFail($id);
        \App\Models\Company::where('company_target_id', $target->id)->update(['company_target_id' => null]);
        $target->delete();

        return redirect()->back()->with('success', 'Target Perusahaan berhasil dihapus.');
    }}
