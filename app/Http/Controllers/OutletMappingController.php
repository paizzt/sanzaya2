<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OutletMapping;
use App\Models\Outlet;
use App\Models\SyncLogistikData;
use App\Models\SyncPesananData;
use App\Models\SyncPiutangData;
use Inertia\Inertia;

class OutletMappingController extends Controller
{
    public function index()
    {
        // Get all unique raw names from all synced sheets
        $logistikNames = SyncLogistikData::select('nama_outlet')->distinct()->whereNotNull('nama_outlet')->pluck('nama_outlet')->toArray();
        $pesananNames = SyncPesananData::select('nama_outlet')->distinct()->whereNotNull('nama_outlet')->pluck('nama_outlet')->toArray();
        $piutangNames = SyncPiutangData::select('nama_outlet')->distinct()->whereNotNull('nama_outlet')->pluck('nama_outlet')->toArray();

        $allRawNames = array_unique(array_merge($logistikNames, $pesananNames, $piutangNames));
        
        // Remove empty strings
        $allRawNames = array_filter($allRawNames, function($val) { return trim($val) !== ''; });

        $masterOutlets = Outlet::select('id', 'name')->get();
        $masterNames = $masterOutlets->pluck('name')->toArray();
        
        $mappedNames = OutletMapping::pluck('raw_name')->toArray();

        $unmapped = [];
        foreach ($allRawNames as $rawName) {
            // If it exactly matches a master outlet, we don't need to map it
            if (in_array($rawName, $masterNames)) {
                continue;
            }
            // If it is already mapped, skip
            if (in_array($rawName, $mappedNames)) {
                continue;
            }

            // Find best suggestion
            $bestMatch = null;
            $bestScore = 0;
            foreach ($masterOutlets as $outlet) {
                similar_text(strtolower($rawName), strtolower($outlet->name), $percent);
                if ($percent > $bestScore) {
                    $bestScore = $percent;
                    $bestMatch = $outlet;
                }
            }

            $unmapped[] = [
                'raw_name' => $rawName,
                'suggested_outlet_id' => $bestMatch ? $bestMatch->id : null,
                'suggested_outlet_name' => $bestMatch ? $bestMatch->name : null,
                'similarity' => round($bestScore, 1)
            ];
        }

        // Sort unmapped by similarity descending
        usort($unmapped, function($a, $b) {
            return $b['similarity'] <=> $a['similarity'];
        });

        $mappings = OutletMapping::with('outlet')->orderBy('created_at', 'desc')->get();

        return Inertia::render('OutletMapping/Index', [
            'unmapped' => $unmapped,
            'mappings' => $mappings,
            'masterOutlets' => $masterOutlets
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'raw_name' => 'required|string',
            'outlet_id' => 'required|exists:outlets,id'
        ]);

        OutletMapping::updateOrCreate(
            ['raw_name' => $request->raw_name],
            [
                'outlet_id' => $request->outlet_id,
                'is_confirmed' => true
            ]
        );

        return redirect()->back()->with('success', 'Mapping berhasil disimpan.');
    }

    public function destroy($id)
    {
        $mapping = OutletMapping::findOrFail($id);
        $mapping->delete();

        return redirect()->back()->with('success', 'Mapping berhasil dihapus.');
    }
}
