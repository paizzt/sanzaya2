<?php

namespace App\Http\Controllers;

use App\Models\UcRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class UcApprovalController extends Controller
{
    public function index()
    {
        // Temukan ID toggle fitur Menu Persetujuan UC secara otomatis untuk ditambahkan jika belum ada
        if (!\App\Models\FeatureToggle::where('name', 'Menu Persetujuan UC')->exists()) {
            \Illuminate\Support\Facades\DB::table('feature_toggles')->insert([
                'name' => 'Menu Persetujuan UC',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Get all UC requests with user relationship
        $requests = UcRequest::with('user')->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Requests/UcApproval', [
            'requests' => $requests
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'approved_gas_cost' => 'nullable|numeric',
            'approved_meals_cost' => 'nullable|numeric',
            'approved_accommodation_cost' => 'nullable|numeric',
            'finance_note' => 'nullable|string',
        ]);

        $uc = UcRequest::findOrFail($id);

        $uc->update([
            'status' => $request->status,
            'approved_gas_cost' => $request->approved_gas_cost,
            'approved_meals_cost' => $request->approved_meals_cost,
            'approved_accommodation_cost' => $request->approved_accommodation_cost,
            'finance_note' => $request->finance_note,
            'approved_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Status pengajuan UC berhasil diperbarui!');
    }
}
