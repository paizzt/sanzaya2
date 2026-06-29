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
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:logistik,pesanan,piutang',
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
        if (!in_array($type, ['logistik', 'pesanan', 'piutang'])) {
            return redirect()->back()->with('error', 'Tipe sinkronisasi tidak valid.');
        }

        $config = SpreadsheetConfiguration::where('type', $type)->first();
        if (!$config) {
            return redirect()->back()->with('error', 'Silakan simpan konfigurasi terlebih dahulu.');
        }

        $hasCredentials = file_exists(storage_path('app/credentials.json'));
        if (!$hasCredentials) {
            return redirect()->back()->with('warning', 'Harap masukkan file credentials.json Google API ke dalam folder storage/app/ terlebih dahulu agar sinkronisasi dapat berjalan.');
        }

        try {
            $client = new \Google_Client();
            $client->setApplicationName('Sanzaya Sync');
            $client->setScopes([\Google_Service_Sheets::SPREADSHEETS_READONLY]);
            $client->setAuthConfig(storage_path('app/credentials.json'));
            $client->setAccessType('offline');

            $service = new \Google_Service_Sheets($client);
            $spreadsheetId = $config->spreadsheet_id;
            
            $rowsAdded = 0;

            if ($type == 'logistik') \App\Models\SyncLogistikData::truncate();
            if ($type == 'pesanan') \App\Models\SyncPesananData::truncate();
            if ($type == 'piutang') \App\Models\SyncPiutangData::truncate();

            if (is_array($config->sheets_config)) {
                foreach ($config->sheets_config as $sheet) {
                    $sheetName = $sheet['sheet_name'] ?? null;
                    if (!$sheetName) continue;

                    $range = $sheetName . '!A:Z';
                    try {
                        $response = $service->spreadsheets_values->get($spreadsheetId, $range);
                        $values = $response->getValues();

                        if (empty($values)) continue;

                        array_shift($values);

                        foreach ($values as $row) {
                            if ($type == 'logistik') {
                                $this->insertLogistik($row, $sheetName, $sheet);
                                $rowsAdded++;
                            } elseif ($type == 'pesanan') {
                                $this->insertPesanan($row, $sheetName, $sheet);
                                $rowsAdded++;
                            } elseif ($type == 'piutang') {
                                $this->insertPiutang($row, $sheetName, $sheet);
                                $rowsAdded++;
                            }
                        }
                    } catch (\Exception $e) {
                        continue;
                    }
                }
            }

            $config->update(['last_synced_at' => Carbon::now()]);
            return redirect()->back()->with('success', 'Sinkronisasi berhasil! ' . $rowsAdded . ' baris data ditarik dan diperbarui.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Sinkronisasi gagal: ' . $e->getMessage());
        }
    }

    private function getColValue($row, $colLetter) {
        if (!$colLetter) return null;
        $colIndex = 0;
        $letters = str_split(strtoupper($colLetter));
        foreach ($letters as $char) {
            $colIndex = $colIndex * 26 + (ord($char) - 64);
        }
        $colIndex -= 1;
        return isset($row[$colIndex]) ? trim($row[$colIndex]) : null;
    }

    private function insertLogistik($row, $sheetName, $config) {
        $namaOutlet = $this->getColValue($row, $config['col_outlet_name'] ?? null);

        \App\Models\SyncLogistikData::create([
            'sheet_name' => $sheetName,
            'tanggal' => $this->getColValue($row, $config['col_date'] ?? null),
            'nama_sales' => $this->getColValue($row, $config['col_sales_name'] ?? null),
            'nama_outlet' => $namaOutlet,
            'nama_produk' => $this->getColValue($row, $config['col_product_name'] ?? null),
            'total_sales' => $this->getColValue($row, $config['col_total_sales'] ?? null),
        ]);
    }

    private function insertPesanan($row, $sheetName, $config) {
        $namaOutlet = $this->getColValue($row, $config['col_nama_outlet'] ?? null);

        \App\Models\SyncPesananData::create([
            'sheet_name' => $sheetName,
            'tanggal' => $this->getColValue($row, $config['col_tanggal'] ?? null),
            'nama_outlet' => $namaOutlet,
            'nama_produk' => $this->getColValue($row, $config['col_nama_produk'] ?? null),
            'jumlah' => $this->getColValue($row, $config['col_jumlah'] ?? null),
            'satuan' => $this->getColValue($row, $config['col_satuan'] ?? null),
            'total_faktur' => $this->getColValue($row, $config['col_total_faktur'] ?? null),
            'terkirim' => $this->getColValue($row, $config['col_terkirim'] ?? null),
            'belum_terkirim' => $this->getColValue($row, $config['col_belum_terkirim'] ?? null),
            'persen_terpenuhi' => $this->getColValue($row, $config['col_persen_terpenuhi'] ?? null),
            'persen_belum_terpenuhi' => $this->getColValue($row, $config['col_persen_belum_terpenuhi'] ?? null),
            'keterangan' => $this->getColValue($row, $config['col_keterangan'] ?? null),
        ]);
    }

    private function insertPiutang($row, $sheetName, $config) {
        $namaOutlet = $this->getColValue($row, $config['col_nama_outlet'] ?? null);

        \App\Models\SyncPiutangData::create([
            'sheet_name' => $sheetName,
            'nama_outlet' => $namaOutlet,
            'tahun_1' => $this->getColValue($row, $config['col_tahun_1'] ?? null),
            'tahun_2' => $this->getColValue($row, $config['col_tahun_2'] ?? null),
            'tahun_3' => $this->getColValue($row, $config['col_tahun_3'] ?? null),
            'tahun_4' => $this->getColValue($row, $config['col_tahun_4'] ?? null),
            'total_sanzaya' => $this->getColValue($row, $config['col_total_sanzaya'] ?? null),
            'ruma_1' => $this->getColValue($row, $config['col_ruma_1'] ?? null),
            'ruma_2' => $this->getColValue($row, $config['col_ruma_2'] ?? null),
            'ruma_3' => $this->getColValue($row, $config['col_ruma_3'] ?? null),
            'total_ruma' => $this->getColValue($row, $config['col_total_ruma'] ?? null),
            'total_gabungan' => $this->getColValue($row, $config['col_total_gabungan'] ?? null),
        ]);
    }
}
