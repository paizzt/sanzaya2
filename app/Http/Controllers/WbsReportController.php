<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\WbsReport;
use App\Models\WbsMessage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class WbsReportController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('wbs_messages') || !\Illuminate\Support\Facades\Schema::hasColumn('wbs_reports', 'user_id')) {
            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            } catch (\Exception $e) {
                // Ignore error if it fails
            }
        }

        $reports = WbsReport::with(['messages' => function ($query) {
            $query->orderBy('created_at', 'asc');
        }])->orderBy('created_at', 'desc')->paginate(20);
        
        $reports->getCollection()->transform(function ($report) {
            if (!array_key_exists('is_anonymous', $report->getAttributes())) {
                $report->is_anonymous = true;
            }
            return $report;
        });

        return Inertia::render('Wbs/Index', [
            'reports' => $reports
        ]);
    }

    public function create()
    {
        return Inertia::render('Wbs/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'required|string',
            'file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max, images only
            'is_anonymous' => 'nullable|boolean'
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

        // Fallback schema for is_anonymous and reporter_name
        if (!\Illuminate\Support\Facades\Schema::hasColumn('wbs_reports', 'is_anonymous')) {
            \Illuminate\Support\Facades\Schema::table('wbs_reports', function (\Illuminate\Database\Schema\Blueprint $table) {
                $table->boolean('is_anonymous')->default(true)->after('status');
                $table->string('reporter_name')->nullable()->after('is_anonymous');
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            });
        } elseif (!\Illuminate\Support\Facades\Schema::hasColumn('wbs_reports', 'user_id')) {
            \Illuminate\Support\Facades\Schema::table('wbs_reports', function (\Illuminate\Database\Schema\Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            });
        }

        $isAnonymous = $request->boolean('is_anonymous', true);
        
        WbsReport::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'description' => $request->description,
            'file_path' => $filePath,
            'is_anonymous' => $isAnonymous,
            'reporter_name' => $isAnonymous ? null : ($request->user() ? $request->user()->name : null)
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

    public function myReports(Request $request)
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('wbs_messages') || !\Illuminate\Support\Facades\Schema::hasColumn('wbs_reports', 'user_id')) {
            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            } catch (\Exception $e) {
                // Ignore error if it fails
            }
        }

        $userId = $request->user()->id;
        $reports = WbsReport::with(['messages' => function ($query) {
            $query->orderBy('created_at', 'asc');
        }])->where('user_id', $userId)
          ->orderBy('created_at', 'desc')
          ->get();
          
        return Inertia::render('Wbs/MyReports', [
            'reports' => $reports
        ]);
    }

    public function storeMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $report = WbsReport::findOrFail($id);
        
        $isAdmin = false;
        // Check if user has WBS admin privileges based on feature name logic in the app
        $activeFeatures = $request->user()->roles->flatMap->features->pluck('name')->unique();
        if ($activeFeatures->contains('Laporan WBS') || $request->user()->roles->contains('name', 'Superadmin')) {
            $isAdmin = true;
        }

        // If not admin, verify ownership
        if (!$isAdmin && $report->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        WbsMessage::create([
            'wbs_report_id' => $report->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_admin' => $isAdmin
        ]);

        return back()->with('success', 'Pesan terkirim.');
    }
}
