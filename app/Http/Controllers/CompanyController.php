<?php

namespace App\Http\Controllers;


use App\Exports\GenericExport;
use App\Helpers\CompanyKopHelper;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::all();
        $companyTargets = \App\Models\CompanyTarget::with('companies')->get();
        $is_super_admin = auth()->check() && (auth()->user()->isSuperAdminUser() || auth()->user()->isAdminUser());

        return Inertia::render('Company/Index', [
            'companies' => $companies,
            'companyTargets' => $companyTargets,
            'is_super_admin' => $is_super_admin
        ]);
    }

    public function logo($id)
    {
        $company = Company::findOrFail($id);
        $path = CompanyKopHelper::resolveLocalLogoPath($company, $company->name);

        if (empty($path)) {
            abort(404);
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return redirect($path);
        }

        if (!is_file($path)) {
            abort(404);
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $mimeMap = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
        ];
        if (!isset($mimeMap[$ext])) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => $mimeMap[$ext],
            'Cache-Control' => 'public, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius' => 'nullable|integer|min:1',
        ]);

        $company = new Company();
        $company->name = $request->name;
        $company->address = $request->address;
        $company->latitude = $request->latitude;
        $company->longitude = $request->longitude;
        $company->radius = $request->radius ?? 300;

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
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius' => 'nullable|integer|min:1',
        ]);

        $company = Company::findOrFail($id);
        $company->name = $request->name;
        $company->address = $request->address;
        $company->latitude = $request->latitude;
        $company->longitude = $request->longitude;
        $company->radius = $request->radius ?? 300;

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
        $logoPath = $company->logo;

        $company->delete();

        if ($logoPath && Storage::disk('public')->exists($logoPath)) {
            Storage::disk('public')->delete($logoPath);
        }

        return redirect()->back()->with('success', 'Data perusahaan berhasil dihapus.');
    }


    public function exportPdf()
    {
        $items = \App\Models\Company::orderBy('id', 'desc')->get();
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
        
        $pdf = Pdf::loadView('pdf.generic_table', ['title' => 'Data Perusahaan', 'headings' => $headings, 'rows' => $rows])->setPaper(request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4'), request()->query('orientation', 'landscape'));
        return request()->has('preview') ? $pdf->stream(str_replace(' ', '_', 'Data Perusahaan') . '.pdf') : $pdf->download(str_replace(' ', '_', 'Data Perusahaan') . '.pdf');
    }

    public function exportExcel()
    {
        $items = \App\Models\Company::orderBy('id', 'desc')->get();
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
        
        return request()->has('preview') ? response(\App\Helpers\ExcelPreviewHelper::render(new GenericExport($rows, $headings)))->header('Content-Type', 'text/html') : Excel::download(new GenericExport($rows, $headings), str_replace(' ', '_', 'Data Perusahaan') . '.xlsx');
    }
}
