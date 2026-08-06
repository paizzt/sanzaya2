<?php

namespace App\Services;

use App\Models\SpreadsheetConfiguration;
use Carbon\Carbon;

class SpreadsheetSyncService
{
    public static function syncType($type)
    {
        $config = SpreadsheetConfiguration::where('type', $type)->first();
        if (!$config) {
            throw new \Exception('Konfigurasi untuk tipe ' . $type . ' tidak ditemukan.');
        }

        $hasCredentials = file_exists(storage_path('app/credentials.json'));
        if (!$hasCredentials) {
            throw new \Exception('File credentials.json Google API tidak ditemukan di folder storage/app/.');
        }

        $client = new \Google_Client();
        $client->setApplicationName('Sanzaya Sync');
        $client->setScopes([\Google_Service_Sheets::SPREADSHEETS_READONLY]);
        $client->setAuthConfig(storage_path('app/credentials.json'));
        $client->setAccessType('offline');

        $service = new \Google_Service_Sheets($client);
        $spreadsheetId = $config->spreadsheet_id;
        
        $rowsAdded = 0;

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            if ($type == 'logistik') \App\Models\SyncLogistikData::query()->delete();
            if ($type == 'pesanan') \App\Models\SyncPesananData::query()->delete();
            if ($type == 'piutang') \App\Models\SyncPiutangData::query()->delete();
            if ($type == 'hutang') \App\Models\SyncHutangData::query()->delete();

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
                            self::insertLogistik($row, $sheetName, $sheet);
                            $rowsAdded++;
                        } elseif ($type == 'pesanan') {
                            self::insertPesanan($row, $sheetName, $sheet);
                            $rowsAdded++;
                        } elseif ($type == 'piutang') {
                            self::insertPiutang($row, $sheetName, $sheet);
                            $rowsAdded++;
                        } elseif ($type == 'hutang') {
                            self::insertHutang($row, $sheetName, $sheet);
                            $rowsAdded++;
                        }
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }
        }

            $config->update(['last_synced_at' => Carbon::now()]);
            \Illuminate\Support\Facades\DB::commit();
            return $rowsAdded;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            throw $e;
        }
    }

    private static function getColValue($row, $colLetter) {
        if (!$colLetter) return null;
        $colIndex = 0;
        $letters = str_split(strtoupper($colLetter));
        foreach ($letters as $char) {
            $colIndex = $colIndex * 26 + (ord($char) - 64);
        }
        $colIndex -= 1;
        return isset($row[$colIndex]) ? trim($row[$colIndex]) : null;
    }

    private static function insertLogistik($row, $sheetName, $config) {
        \App\Models\SyncLogistikData::create([
            'sheet_name' => $sheetName,
            'nama_pt' => self::getColValue($row, $config['col_nama_pt'] ?? null),
            'pelanggan' => self::getColValue($row, $config['col_pelanggan'] ?? null),
            'jenis_pelanggan' => self::getColValue($row, $config['col_jenis_pelanggan'] ?? null),
            'tanggal' => self::getColValue($row, $config['col_tanggal'] ?? null),
            'nama_sales' => self::getColValue($row, $config['col_nama_sales'] ?? null),
            'no_faktur' => self::getColValue($row, $config['col_no_faktur'] ?? null),
            'id_paket' => self::getColValue($row, $config['col_id_paket'] ?? null),
            'brand' => self::getColValue($row, $config['col_brand'] ?? null),
            'nama_produk' => self::getColValue($row, $config['col_nama_produk'] ?? null),
            'qty' => self::getColValue($row, $config['col_qty'] ?? null),
            'satuan' => self::getColValue($row, $config['col_satuan'] ?? null),
            'hna' => self::getColValue($row, $config['col_hna'] ?? null),
            'subtotal' => self::getColValue($row, $config['col_subtotal'] ?? null),
            'ppn' => self::getColValue($row, $config['col_ppn'] ?? null),
            'total' => self::getColValue($row, $config['col_total'] ?? null),
            'grand_total' => self::getColValue($row, $config['col_grand_total'] ?? null),
            'jenis_barang' => self::getColValue($row, $config['col_jenis_barang'] ?? null),
        ]);
    }

    private static function insertPesanan($row, $sheetName, $config) {
        $namaOutlet = self::getColValue($row, $config['col_nama_outlet'] ?? null);

        \App\Models\SyncPesananData::create([
            'sheet_name' => $sheetName,
            'tanggal' => self::getColValue($row, $config['col_tanggal'] ?? null),
            'nama_outlet' => $namaOutlet,
            'nama_produk' => self::getColValue($row, $config['col_nama_produk'] ?? null),
            'jumlah' => self::getColValue($row, $config['col_jumlah'] ?? null),
            'satuan' => self::getColValue($row, $config['col_satuan'] ?? null),
            'total_faktur' => self::getColValue($row, $config['col_total_faktur'] ?? null),
            'terkirim' => self::getColValue($row, $config['col_terkirim'] ?? null),
            'belum_terkirim' => self::getColValue($row, $config['col_belum_terkirim'] ?? null),
            'persen_terpenuhi' => self::getColValue($row, $config['col_persen_terpenuhi'] ?? null),
            'persen_belum_terpenuhi' => self::getColValue($row, $config['col_persen_belum_terpenuhi'] ?? null),
            'keterangan' => self::getColValue($row, $config['col_keterangan'] ?? null),
        ]);
    }

    private static function insertPiutang($row, $sheetName, $config) {
        $namaOutlet = self::getColValue($row, $config['col_nama_outlet'] ?? null);

        \App\Models\SyncPiutangData::create([
            'sheet_name' => $sheetName,
            'nama_outlet' => $namaOutlet,
            'tahun_1' => self::getColValue($row, $config['col_tahun_1'] ?? null),
            'tahun_2' => self::getColValue($row, $config['col_tahun_2'] ?? null),
            'tahun_3' => self::getColValue($row, $config['col_tahun_3'] ?? null),
            'tahun_4' => self::getColValue($row, $config['col_tahun_4'] ?? null),
            'total_sanzaya' => self::getColValue($row, $config['col_total_sanzaya'] ?? null),
            'ruma_1' => self::getColValue($row, $config['col_ruma_1'] ?? null),
            'ruma_2' => self::getColValue($row, $config['col_ruma_2'] ?? null),
            'ruma_3' => self::getColValue($row, $config['col_ruma_3'] ?? null),
            'total_ruma' => self::getColValue($row, $config['col_total_ruma'] ?? null),
            'total_gabungan' => self::getColValue($row, $config['col_total_gabungan'] ?? null),
        ]);
    }

    private static function insertHutang($row, $sheetName, $config) {
        \App\Models\SyncHutangData::create([
            'sheet_name' => $sheetName,
            'no' => self::getColValue($row, $config['col_no'] ?? null),
            'nama_penyedia' => self::getColValue($row, $config['col_nama_penyedia'] ?? null),
            'nominal' => self::getColValue($row, $config['col_nominal'] ?? null),
        ]);
    }
}
