<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\WbsReport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

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
            'file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max, images only
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            // Upload to ImgBB
            $response = Http::attach(
                'image', 
                file_get_contents($request->file('file')->getRealPath()), 
                $request->file('file')->getClientOriginalName()
            )->post('https://api.imgbb.com/1/upload', [
                'key' => '5950b44b24860057ff810fe73f58868b'
            ]);

            if ($response->successful()) {
                $filePath = $response->json('data.url');
            }
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
        
        if (!$report->file_path) {
            return back()->with('error', 'File tidak ditemukan.');
        }

        if (str_starts_with($report->file_path, 'http')) {
            try {
                $response = Http::get($report->file_path);
                if ($response->successful()) {
                    $contentType = $response->header('Content-Type');
                    return response($response->body(), 200, [
                        'Content-Type' => $contentType ?: 'image/jpeg',
                        'Content-Disposition' => 'inline; filename="Laporan-WBS-'.$id.'.jpg"'
                    ]);
                }
            } catch (\Exception $e) {
                // Ignore and redirect
            }
            return redirect($report->file_path);
        }

        // Fallback untuk file lama yang tersimpan di lokal
        if (!Storage::disk('public')->exists($report->file_path)) {
            return back()->with('error', 'File tidak ditemukan.');
        }

        return Storage::disk('public')->download($report->file_path);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:belum proses,di proses,selesai'
        ]);

        $report = WbsReport::findOrFail($id);

        // Fallback: Ensure status column exists if migration wasn't run
        if (!\Illuminate\Support\Facades\Schema::hasColumn('wbs_reports', 'status')) {
            \Illuminate\Support\Facades\Schema::table('wbs_reports', function (\Illuminate\Database\Schema\Blueprint $table) {
                $table->string('status')->default('belum proses')->after('file_path');
            });
        }

        $report->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', 'Status laporan berhasil diperbarui.');
    }
}
