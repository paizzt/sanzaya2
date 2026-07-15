<?php

namespace App\Http\Controllers;

use App\Models\SpreadsheetConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SpreadsheetSyncController extends Controller
{
    public function index()
    {
        $configs = SpreadsheetConfiguration::all()->keyBy('type');
        
        return Inertia::render('Spreadsheet/Index', [
            'config_logistik' => $configs['logistik'] ?? null,
            'config_pesanan' => $configs['pesanan'] ?? null,
            'config_piutang' => $configs['piutang'] ?? null,
            'config_hutang' => $configs['hutang'] ?? null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:logistik,pesanan,piutang,hutang',
            'spreadsheet_id' => 'required|string',
            'sheets_config' => 'required|array',
            'sheets_config.*.sheet_name' => 'required|string',
        ]);

        $config = SpreadsheetConfiguration::firstOrNew(['type' => $request->type]);
        $config->spreadsheet_id = $request->spreadsheet_id;
        $config->sheets_config = $request->sheets_config;
        $config->save();

        return redirect()->back()->with('success', 'Konfigurasi Spreadsheet ' . ucfirst($request->type) . ' berhasil disimpan!');
    }

    public function sync(Request $request)
    {
        $type = $request->input('type');
        if (!in_array($type, ['logistik', 'pesanan', 'piutang', 'hutang'])) {
            return redirect()->back()->with('error', 'Tipe sinkronisasi tidak valid.');
        }

        try {
            \App\Jobs\SyncSpreadsheetJob::dispatch($type, auth()->id());
            return redirect()->back()->with('success', 'Proses sinkronisasi data ' . $type . ' telah dimasukkan ke dalam antrean. Anda akan menerima notifikasi apabila proses telah selesai.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memasukkan ke antrean: ' . $e->getMessage());
        }
    }
}
