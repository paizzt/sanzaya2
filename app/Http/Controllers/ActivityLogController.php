<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->orderBy('created_at', 'desc');
        
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                })->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        if ($request->has('module') && $request->module != '') {
            $query->where('module', $request->module);
        }

        $logs = $query->paginate(20)->withQueryString();
        
        $modules = ActivityLog::select('module')->distinct()->whereNotNull('module')->orderBy('module')->pluck('module');

        return Inertia::render('System/ActivityLog', [
            'logs' => $logs,
            'modules' => $modules,
            'filters' => $request->only(['search', 'module'])
        ]);
    }

    public function restore($id)
    {
        $log = ActivityLog::findOrFail($id);
        
        if ($log->action !== 'Deleted') {
            return redirect()->back()->with('error', 'Hanya data yang dihapus yang dapat dipulihkan.');
        }

        $modelClass = 'App\\Models\\' . $log->module;
        if (!class_exists($modelClass)) {
            return redirect()->back()->with('error', 'Model tidak ditemukan: ' . $log->module);
        }

        $oldValues = json_decode($log->old_values, true);
        if (!$oldValues) {
            return redirect()->back()->with('error', 'Data lama tidak valid atau kosong.');
        }

        try {
            // Unset ID so that it gets a new one (avoiding conflicts if ID was reused)
            unset($oldValues['id']);
            
            // Create a new record with the old values
            $modelClass::create($oldValues);
            
            return redirect()->back()->with('success', 'Data berhasil dipulihkan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memulihkan data: ' . $e->getMessage());
        }
    }
}
