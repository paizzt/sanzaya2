<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OutletMapping;
use App\Models\ProviderMapping;
use App\Models\Outlet;
use App\Models\Provider;
use App\Models\SyncLogistikData;
use App\Models\SyncPesananData;
use App\Models\SyncPiutangData;
use Inertia\Inertia;

class MappingController extends Controller
{
    public function index()
    {
        // 1. OUTLET MAPPINGS
        $logistikNames = SyncLogistikData::select('pelanggan')->distinct()->whereNotNull('pelanggan')->pluck('pelanggan')->toArray();
        $pesananNames = SyncPesananData::select('nama_outlet')->distinct()->whereNotNull('nama_outlet')->pluck('nama_outlet')->toArray();
        $piutangNames = SyncPiutangData::select('nama_outlet')->distinct()->whereNotNull('nama_outlet')->pluck('nama_outlet')->toArray();
        $itemRequirementNames = \App\Models\ItemRequirement::select('outlet_name')->distinct()->whereNotNull('outlet_name')->pluck('outlet_name')->toArray();
        $paymentRequestNames = \App\Models\PaymentRequest::select('project_or_outlet')->distinct()->whereNotNull('project_or_outlet')->pluck('project_or_outlet')->toArray();

        $pendingOutlets = Outlet::where('is_pending', true)->pluck('name')->toArray();
        
        $allRawOutletNames = array_unique(array_merge($logistikNames, $pesananNames, $piutangNames, $itemRequirementNames, $paymentRequestNames, $pendingOutlets));
        $allRawOutletNames = array_filter($allRawOutletNames, function($val) { return trim($val) !== ''; });

        $masterOutlets = Outlet::select('id', 'name')->where(function($q) {
            $q->whereNull('is_pending')->orWhere('is_pending', false);
        })->get();
        $masterOutletNames = $masterOutlets->pluck('name')->toArray();
        
        $mappedOutletNames = OutletMapping::pluck('raw_name')->toArray();

        $unmappedOutlets = [];
        foreach ($allRawOutletNames as $rawName) {
            if (in_array($rawName, $masterOutletNames)) continue;
            if (in_array($rawName, $mappedOutletNames)) continue;

            $bestMatch = null;
            $bestScore = 0;
            foreach ($masterOutlets as $outlet) {
                similar_text(strtolower($rawName), strtolower($outlet->name), $percent);
                if ($percent > $bestScore) {
                    $bestScore = $percent;
                    $bestMatch = $outlet;
                }
            }

            $sources = [];
            if (in_array($rawName, $logistikNames)) $sources[] = 'Logistik';
            if (in_array($rawName, $pesananNames)) $sources[] = 'Pesanan';
            if (in_array($rawName, $piutangNames)) $sources[] = 'Sync Piutang';
            if (in_array($rawName, $itemRequirementNames)) $sources[] = 'Kebutuhan Barang';
            if (in_array($rawName, $paymentRequestNames)) $sources[] = 'Payment Request';
            if (in_array($rawName, $pendingOutlets)) $sources[] = 'Input Manual Piutang';
            $sourceStr = count($sources) > 0 ? implode(', ', $sources) : 'Lainnya';

            $unmappedOutlets[] = [
                'raw_name' => $rawName,
                'source' => $sourceStr,
                'suggested_outlet_id' => $bestMatch ? $bestMatch->id : null,
                'suggested_outlet_name' => $bestMatch ? $bestMatch->name : null,
                'similarity' => round($bestScore, 1)
            ];
        }
        usort($unmappedOutlets, function($a, $b) {
            return $b['similarity'] <=> $a['similarity'];
        });

        $outletMappings = OutletMapping::with('outlet')->orderBy('created_at', 'desc')->get();

        // 2. PROVIDER MAPPINGS
        $payableProviders = \App\Models\Payable::select('provider_id')->distinct()->whereNotNull('provider_id')->pluck('provider_id')->toArray();
        
        $masterProviders = Provider::select('id', 'name')->where(function($q) {
            $q->whereNull('is_pending')->orWhere('is_pending', false);
        })->get();
        $masterProviderNames = $masterProviders->pluck('name')->toArray();
        
        $mappedProviderNames = ProviderMapping::pluck('raw_name')->toArray();

        // Currently, what data holds raw provider names? 
        // For now, if we don't have a direct raw table for providers (like SyncData for outlets), 
        // we can just use the ones stored in ProviderMapping or we check another source.
        // We can use pending providers!
        $pendingProviderNames = \App\Models\Provider::where('is_pending', true)->pluck('name')->toArray(); 
        
        $unmappedProviders = [];
        foreach ($pendingProviderNames as $rawName) {
            $unmappedProviders[] = [
                'raw_name' => $rawName,
                'source' => 'Input Manual Hutang',
                'suggested_provider_id' => null,
                'suggested_provider_name' => null,
                'similarity' => 0
            ];
        }
        $providerMappings = ProviderMapping::with('provider')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Mappings/Index', [
            'unmappedOutlets' => $unmappedOutlets,
            'outletMappings' => $outletMappings,
            'masterOutlets' => $masterOutlets,

            'unmappedProviders' => $unmappedProviders,
            'providerMappings' => $providerMappings,
            'masterProviders' => $masterProviders,
        ]);
    }

    public function storeOutlet(Request $request)
    {
        $request->validate([
            'raw_name' => 'required|string',
            'outlet_id' => 'nullable|exists:outlets,id',
            'is_ignored' => 'boolean'
        ]);

        OutletMapping::updateOrCreate(
            ['raw_name' => $request->raw_name],
            [
                'outlet_id' => $request->outlet_id,
                'is_ignored' => $request->is_ignored ?? false,
                'is_confirmed' => true
            ]
        );

        if ($request->outlet_id) {
            $pendingOutlet = \App\Models\Outlet::where('name', $request->raw_name)->where('is_pending', true)->first();
            if ($pendingOutlet) {
                \App\Models\Receivable::where('outlet_id', $pendingOutlet->id)->update(['outlet_id' => $request->outlet_id]);
                \App\Models\ReceivableDailyReport::where('outlet_id', $pendingOutlet->id)->update(['outlet_id' => $request->outlet_id]);
                // Delete pending
                $pendingOutlet->delete();
            }
        }

        if ($request->is_ignored) {
            return redirect()->back()->with('success', 'Nama berhasil diabaikan.');
        }
        
        return redirect()->back()->with('success', 'Mapping Outlet berhasil disimpan.');
    }

    public function destroyOutlet($id)
    {
        $mapping = OutletMapping::findOrFail($id);
        $mapping->delete();

        return redirect()->back()->with('success', 'Mapping Outlet berhasil dihapus.');
    }

    public function storeProvider(Request $request)
    {
        $request->validate([
            'raw_name' => 'required|string',
            'provider_id' => 'nullable|exists:providers,id',
            'is_ignored' => 'boolean'
        ]);

        ProviderMapping::updateOrCreate(
            ['raw_name' => $request->raw_name],
            [
                'provider_id' => $request->provider_id,
                'is_ignored' => $request->is_ignored ?? false,
                'is_confirmed' => true
            ]
        );

        if ($request->provider_id) {
            $pendingProvider = \App\Models\Provider::where('name', $request->raw_name)->where('is_pending', true)->first();
            if ($pendingProvider) {
                \App\Models\Payable::where('provider_id', $pendingProvider->id)->update(['provider_id' => $request->provider_id]);
                // Any other tables? Maybe ProviderProduct?
                \App\Models\ProviderProduct::where('provider_id', $pendingProvider->id)->update(['provider_id' => $request->provider_id]);
                $pendingProvider->delete();
            }
        }

        if ($request->is_ignored) {
            return redirect()->back()->with('success', 'Nama penyedia berhasil diabaikan.');
        }

        return redirect()->back()->with('success', 'Mapping Penyedia berhasil disimpan.');
    }

    public function destroyProvider($id)
    {
        $mapping = ProviderMapping::findOrFail($id);
        $mapping->delete();

        return redirect()->back()->with('success', 'Mapping Penyedia berhasil dihapus.');
    }
}
