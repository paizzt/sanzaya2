<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Payable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayableController extends Controller
{
    public function index(Request $request)
    {
        $query = Payable::with(['provider', 'company'])->orderBy('id', 'desc');

        if ($request->search) {
            $query->whereHas('provider', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->pt) {
            $pts = is_array($request->pt) ? $request->pt : explode(',', $request->pt);
            $query->whereIn('company_id', $pts);
        }

        if ($request->year) {
            $years = is_array($request->year) ? $request->year : explode(',', $request->year);
            $query->where(function ($q) use ($years) {
                foreach ($years as $year) {
                    $q->orWhereJsonContains('details', ['year' => $year])
                      ->orWhereJsonContains('details', ['year' => (int) $year]);
                }
            });
        }

        $items = $query->get();
        
        $providers = \App\Models\Provider::orderBy('name')->get();
        $companies = \App\Models\Company::orderBy('name')->get();
        
        $users = \App\Models\User::orderBy('name')->get();

        $totalAll = $items->sum('total');
        $lastUpdated = \App\Models\Payable::max('updated_at');

        return Inertia::render('Payables/Index', [
            'items' => $items,
            'providers' => $providers,
            'companies' => $companies,
            'users' => $users,
            'filters' => $request->only(['search', 'pt', 'year']),
            'totalAll' => $totalAll,
            'lastUpdated' => $lastUpdated,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'provider_id' => 'nullable|exists:providers,id',
            'details' => 'nullable|array',
            'details.*.year' => 'nullable|string',
            'details.*.amount' => 'nullable|numeric'
        ]);

        // Calculate total
        $total = 0;
        if (!empty($validated['details'])) {
            foreach ($validated['details'] as $detail) {
                if (!empty($detail['amount'])) {
                    $total += (float) $detail['amount'];
                }
            }
        }
        
        $dataToSave = [
            'company_id' => $validated['company_id'] ?? null,
            'provider_id' => $validated['provider_id'] ?? null,
            'details' => $validated['details'] ?? [],
            'total' => $total,
        ];
        
        if ($request->id) {
            Payable::findOrFail($request->id)->update($dataToSave);
        } else {
            Payable::create($dataToSave);
        }
        
        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function destroy($id)
    {
        Payable::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    private function getFilteredData(Request $request) {
        $query = \App\Models\Payable::with(['provider', 'company'])->orderBy('id', 'desc');
        
        if ($request->search) {
            $query->whereHas('provider', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }
        
        if ($request->pt) {
            $pts = is_array($request->pt) ? $request->pt : explode(',', $request->pt);
            $query->whereIn('company_id', $pts);
        }
        
        $years = [];
        if ($request->year) {
            $years = is_array($request->year) ? $request->year : explode(',', $request->year);
            $query->where(function ($q) use ($years) {
                foreach ($years as $year) {
                    $q->orWhereJsonContains('details', ['year' => $year])
                      ->orWhereJsonContains('details', ['year' => (int) $year]);
                }
            });
        }
        
        return [$query->get(), $years];
    }

    public function exportPdf(Request $request)
    {
        list($items, $filteredYears) = $this->getFilteredData($request);
        $revenuePerPt = [];
        $revenuePerYear = [];
        $totalAll = 0;
        $uniqueProviders = [];

        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['nama_penyedia', 'nama_pt', 'total'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $mappedItems = $items->map(function($item) use ($filteredYears, &$revenuePerPt, &$revenuePerYear, &$totalAll, &$uniqueProviders) {
                $ptName = $item->company ? $item->company->name : '-';
                
                $itemTotal = 0;
                $details = is_string($item->details) ? json_decode($item->details, true) : $item->details;
                if ($details) {
                    foreach ($details as $d) {
                        if (isset($d['year']) && $d['year'] !== 'Total') {
                            $yearStr = (string)$d['year'];
                            if (empty($filteredYears) || in_array($yearStr, $filteredYears)) {
                                $amt = floatval($d['amount'] ?? 0);
                                $itemTotal += $amt;
                                
                                if (!isset($revenuePerYear[$yearStr])) $revenuePerYear[$yearStr] = 0;
                                $revenuePerYear[$yearStr] += $amt;
                            }
                        }
                    }
                }
                
                if (!isset($revenuePerPt[$ptName])) $revenuePerPt[$ptName] = 0;
                $revenuePerPt[$ptName] += $itemTotal;
                $totalAll += $itemTotal;
                
                $providerName = $item->provider ? $item->provider->name : '';
                if (!empty($providerName)) {
                    $uniqueProviders[$providerName] = true;
                }

                return [
                    'provider' => $item->provider ? $item->provider->name : '-',
                    'company' => $ptName,
                    'total' => $itemTotal
                ];
            });

            if ($request->sort === 'terbesar') {
                $mappedItems = $mappedItems->sortByDesc('total')->values();
            } else if ($request->sort === 'terkecil') {
                $mappedItems = $mappedItems->sortBy('total')->values();
            }

            $rows = $mappedItems->map(function($item, $key) {
                return [
                    $key + 1,
                    $item['provider'],
                    $item['company'],
                    'Rp ' . number_format($item['total'], 0, ',', '.')
                ];
            });
        }
        
        $summaryCards = [
            'total_title' => 'Total Semua Hutang',
            'total_amount' => $totalAll,
            'year_title' => 'Hutang Berdasarkan Tahun',
            'year_data' => $revenuePerYear,
            'pt_title' => 'Hutang Berdasarkan PT',
            'pt_data' => $revenuePerPt,
            'count_title' => 'Total Penyedia yang Punya Hutang',
            'count_value' => count($uniqueProviders),
            'count_label' => 'Penyedia'
        ];
        
        $pdf = Pdf::loadView('pdf.generic_table', [
            'title' => 'Data Hutang', 
            'headings' => $headings, 
            'rows' => $rows,
            'summaryCards' => $summaryCards
        ])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Hutang') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Hutang') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        list($items, $filteredYears) = $this->getFilteredData($request);
        if ($items->isEmpty()) {
            $headings = [];
            $rows = collect([]);
        } else {
            $allowed = ['nama_penyedia', 'nama_pt', 'total'];
            $headings = array_map(function($h) { return ucwords(str_replace('_', ' ', $h)); }, $allowed);
            array_unshift($headings, 'No');

            $mappedItems = $items->map(function($item) use ($filteredYears) {
                $ptName = $item->company ? $item->company->name : '-';
                $itemTotal = 0;
                $details = is_string($item->details) ? json_decode($item->details, true) : $item->details;
                if ($details) {
                    foreach ($details as $d) {
                        if (isset($d['year']) && $d['year'] !== 'Total') {
                            $yearStr = (string)$d['year'];
                            if (empty($filteredYears) || in_array($yearStr, $filteredYears)) {
                                $itemTotal += floatval($d['amount'] ?? 0);
                            }
                        }
                    }
                }
                
                return [
                    'provider' => $item->provider ? $item->provider->name : '-',
                    'company' => $ptName,
                    'total' => $itemTotal
                ];
            });

            if ($request->sort === 'terbesar') {
                $mappedItems = $mappedItems->sortByDesc('total')->values();
            } else if ($request->sort === 'terkecil') {
                $mappedItems = $mappedItems->sortBy('total')->values();
            }

            $rows = $mappedItems->map(function($item, $key) {
                return [
                    $key + 1,
                    $item['provider'],
                    $item['company'],
                    'Rp ' . number_format($item['total'], 0, ',', '.')
                ];
            });
        }
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : \Maatwebsite\Excel\Facades\Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Hutang') . '.xlsx');
    }
}
