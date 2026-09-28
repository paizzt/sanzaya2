<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProviderMapping;
use App\Models\Provider;
use App\Models\Payable;
use Inertia\Inertia;

class ProviderMappingController extends Controller
{
    public function index()
    {
        // Get all unique raw provider names from where they are imported
        $payableNames = \App\Models\Payable::select('provider_id')->distinct()->pluck('provider_id')->toArray();
        // Actually, payables usually link directly to providers. Wait.
        // What data sources have raw provider names?
        // Let's assume there's a SyncData table or we just look for something similar.
        // If there's no raw data, we just return empty unmapped for now.
        $unmapped = [];
        $mappings = ProviderMapping::with('provider')->orderBy('created_at', 'desc')->get();
        $masterProviders = Provider::select('id', 'name')->get();

        return Inertia::render('ProviderMapping/Index', [
            'unmapped' => $unmapped,
            'mappings' => $mappings,
            'masterProviders' => $masterProviders
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'raw_name' => 'required|string',
            'provider_id' => 'required|exists:providers,id'
        ]);

        ProviderMapping::updateOrCreate(
            ['raw_name' => $request->raw_name],
            [
                'provider_id' => $request->provider_id,
                'is_confirmed' => true
            ]
        );

        return redirect()->back()->with('success', 'Mapping penyedia berhasil disimpan.');
    }

    public function destroy($id)
    {
        $mapping = ProviderMapping::findOrFail($id);
        $mapping->delete();

        return redirect()->back()->with('success', 'Mapping penyedia berhasil dihapus.');
    }
}
