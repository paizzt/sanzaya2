<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\WbsReport;
use Illuminate\Support\Facades\Storage;

class WbsReportController extends Controller
{
    public function index()
    {
        $reports = WbsReport::orderBy('created_at', 'desc')->paginate(20);
        return Inertia::render('Wbs/Index', [
            'reports' => $reports
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'required|string',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('wbs_reports', 'public');
        }

        WbsReport::create([
            'description' => $request->description,
            'file_path' => $filePath,
        ]);

        return redirect()->back()->with('success', 'Laporan WBS berhasil dikirim.');
    }

    public function download($id)
    {
        $report = WbsReport::findOrFail($id);
        
        if (!$report->file_path || !Storage::disk('public')->exists($report->file_path)) {
            return back()->with('error', 'File tidak ditemukan.');
        }

        return Storage::disk('public')->download($report->file_path);
    }
}
