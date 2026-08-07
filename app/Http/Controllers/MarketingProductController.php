<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProviderProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MarketingProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $filterType = $request->input('type'); // 'BMHP', 'Alat', or empty for all
        $filterSource = $request->input('source'); // 'Internal', 'Distributor', or empty for all

        $internalProducts = collect([]);
        $distributorProducts = collect([]);

        // Get Internal Products
        if (empty($filterSource) || $filterSource === 'Internal') {
            $internalQuery = Product::query();
            
            if ($search) {
                $internalQuery->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('registration_no', 'like', "%{$search}%");
                });
            }

            if ($filterType) {
                // For internal products, 'jenis' is usually 'BMHP' or 'Alat Kesehatan'
                $internalType = $filterType === 'Alat' ? 'Alat Kesehatan' : $filterType;
                $internalQuery->where('jenis', $internalType);
            }

            $internalProducts = $internalQuery->get()->map(function($item) {
                return [
                    'id' => 'internal_'.$item->id,
                    'real_id' => $item->id,
                    'name' => $item->name,
                    'source_type' => 'Internal',
                    'provider_name' => 'Produk Sendiri',
                    'jenis' => str_replace('Alat Kesehatan', 'Alat', $item->jenis),
                    'price' => $item->price,
                    'unit' => $item->unit,
                    'registration_no' => $item->registration_no,
                    'tkdn' => $item->tkdn,
                    'link' => $item->link,
                ];
            });
        }

        // Get Distributor Products
        if (empty($filterSource) || $filterSource === 'Distributor') {
            $distributorQuery = ProviderProduct::with('provider')
                ->whereHas('provider', function($q) use ($filterType) {
                    $q->where('business_type', 'Distributor');
                    if ($filterType) {
                        $q->where('type', $filterType);
                    }
                });

            if ($search) {
                $distributorQuery->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('registration_no', 'like', "%{$search}%");
                });
            }

            $distributorProducts = $distributorQuery->get()->map(function($item) {
                return [
                    'id' => 'distributor_'.$item->id,
                    'real_id' => $item->id,
                    'name' => $item->name,
                    'source_type' => 'Distributor',
                    'provider_name' => $item->provider ? $item->provider->name : '-',
                    'jenis' => $item->provider ? $item->provider->type : '-',
                    'price' => $item->price,
                    'unit' => $item->unit,
                    'registration_no' => $item->registration_no,
                    'tkdn' => $item->tkdn,
                    'link' => $item->link,
                ];
            });
        }

        // Merge and Sort
        $allProducts = $internalProducts->merge($distributorProducts)->sortBy('name')->values();

        return Inertia::render('Marketing/Products', [
            'products' => $allProducts,
            'filters' => $request->only('search', 'type', 'source'),
        ]);
    }
}
