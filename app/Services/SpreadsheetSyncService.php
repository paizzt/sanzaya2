<?php

namespace App\Services;

use App\Models\SpreadsheetConfiguration;
use Carbon\Carbon;

class SpreadsheetSyncService
{
    private static array $lastErrors = [];

    public static function getLastErrors(): array
    {
        return self::$lastErrors;
    }

    public static function syncType($type)
    {
        self::$lastErrors = [];
        $config = SpreadsheetConfiguration::where('type', $type)->first();
        if (!$config) {
            throw new \Exception('Konfigurasi untuk tipe ' . $type . ' tidak ditemukan.');
        }

        $credentialsPath = storage_path('app/credentials.json');
        if (!file_exists($credentialsPath)) {
            throw new \Exception('File credentials.json Google API tidak ditemukan di folder storage/app/. Pastikan file Service Account JSON sudah diletakkan di server.');
        }

        $client = new \Google_Client();
        $client->setApplicationName('Sanzaya Sync');
        $client->setScopes([\Google_Service_Sheets::SPREADSHEETS_READONLY]);
        $client->setAuthConfig($credentialsPath);
        $client->setAccessType('offline');

        $service = new \Google_Service_Sheets($client);
        $spreadsheetId = $config->spreadsheet_id;
        if (empty($spreadsheetId)) {
            throw new \Exception('Spreadsheet ID belum diatur pada konfigurasi ' . $type . '.');
        }

        if (!is_array($config->sheets_config) || empty($config->sheets_config)) {
            throw new \Exception('Daftar sheet pada konfigurasi ' . $type . ' masih kosong.');
        }

        $collectedRows = [];
        $errors = [];

        foreach ($config->sheets_config as $sheet) {
            $sheetName = $sheet['sheet_name'] ?? null;
            if (!$sheetName) continue;

            // Quote sheet name to handle spaces & special characters, and fetch columns without A:Z limit
            $quotedSheetName = "'" . str_replace("'", "''", $sheetName) . "'";
            $range = $quotedSheetName . '!A:ZZ';

            try {
                $response = $service->spreadsheets_values->get($spreadsheetId, $range);
                $values = $response->getValues();

                if (empty($values)) continue;

                array_shift($values); // Skip header row

                foreach ($values as $row) {
                    $rowItem = null;
                    if ($type == 'logistik') {
                        $rowItem = self::buildLogistikData($row, $sheetName, $sheet);
                    } elseif ($type == 'pesanan') {
                        $rowItem = self::buildPesananData($row, $sheetName, $sheet);
                    } elseif ($type == 'piutang') {
                        $rowItem = self::buildPiutangData($row, $sheetName, $sheet);
                    } elseif ($type == 'hutang') {
                        $rowItem = self::buildHutangData($row, $sheetName, $sheet);
                    }

                    if ($rowItem && !self::isRowEmptyOrInvalid($rowItem)) {
                        $collectedRows[] = $rowItem;
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Spreadsheet sync error [{$type}] sheet [{$sheetName}]: " . $e->getMessage());
                $errors[] = "Sheet '{$sheetName}': " . $e->getMessage();
            }
        }

        self::$lastErrors = $errors;

        // GUARD: If no rows extracted, DO NOT delete existing database table!
        if (empty($collectedRows)) {
            $errMsg = !empty($errors)
                ? implode('; ', $errors)
                : 'Tidak ada baris data valid yang terbaca dari Google Spreadsheet. Periksa nama sheet dan mapping kolom.';
            throw new \Exception('Gagal sinkronisasi data: ' . $errMsg);
        }

        $now = Carbon::now();
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            if ($type == 'logistik') {
                \App\Models\SyncLogistikData::query()->delete();
                foreach (array_chunk($collectedRows, 300) as $chunk) {
                    foreach ($chunk as &$item) { $item['created_at'] = $now; $item['updated_at'] = $now; }
                    \App\Models\SyncLogistikData::insert($chunk);
                }
            } elseif ($type == 'pesanan') {
                \App\Models\SyncPesananData::query()->delete();
                foreach (array_chunk($collectedRows, 300) as $chunk) {
                    foreach ($chunk as &$item) { $item['created_at'] = $now; $item['updated_at'] = $now; }
                    \App\Models\SyncPesananData::insert($chunk);
                }
            } elseif ($type == 'piutang') {
                \App\Models\SyncPiutangData::query()->delete();
                foreach (array_chunk($collectedRows, 300) as $chunk) {
                    foreach ($chunk as &$item) { $item['created_at'] = $now; $item['updated_at'] = $now; }
                    \App\Models\SyncPiutangData::insert($chunk);
                }
            } elseif ($type == 'hutang') {
                \App\Models\SyncHutangData::query()->delete();
                foreach (array_chunk($collectedRows, 300) as $chunk) {
                    foreach ($chunk as &$item) { $item['created_at'] = $now; $item['updated_at'] = $now; }
                    \App\Models\SyncHutangData::insert($chunk);
                }
            }

            $config->update(['last_synced_at' => $now]);
            \Illuminate\Support\Facades\DB::commit();

            return count($collectedRows);
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

    private static function isInvalidValue($val) {
        if ($val === null || trim($val) === '') return true;
        $val = trim($val);
        $invalidStrings = ['#N/A', '#REF!', 'SELECT * WHERE Col3 IS NOT NULL', '-', '0'];
        return in_array($val, $invalidStrings);
    }

    private static function isRowEmptyOrInvalid($data) {
        $ignoreKeys = ['sheet_name', 'nama_pt', 'created_at', 'updated_at'];
        foreach ($data as $key => $value) {
            if (!in_array($key, $ignoreKeys) && !self::isInvalidValue($value)) {
                return false; // Found at least one valid value from spreadsheet
            }
        }
        return true;
    }

    public static function buildLogistikData($row, $sheetName, $config) {
        $pelanggan = self::getColValue($row, $config['col_pelanggan'] ?? null);
        $pelanggan = self::getMappedOutletName($pelanggan);

        return [
            'sheet_name' => $sheetName,
            'nama_pt' => !empty($config['col_nama_pt']) ? trim($config['col_nama_pt']) : trim($sheetName),
            'pelanggan' => $pelanggan,
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
        ];
    }

    public static function buildPesananData($row, $sheetName, $config) {
        $namaOutlet = self::getColValue($row, $config['col_nama_outlet'] ?? null);
        $namaOutlet = self::getMappedOutletName($namaOutlet);

        return [
            'sheet_name' => $sheetName,
            'tanggal' => self::getColValue($row, $config['col_tanggal'] ?? null),
            'nomor_klikkan' => self::getColValue($row, $config['col_nomor_klikkan'] ?? null),
            'nama_outlet' => $namaOutlet,
            'nama_produk' => self::getColValue($row, $config['col_nama_produk'] ?? null),
            'jumlah' => self::getColValue($row, $config['col_jumlah'] ?? null),
            'satuan' => self::getColValue($row, $config['col_satuan'] ?? null),
            'harga_faktur' => self::getColValue($row, $config['col_harga_faktur'] ?? null),
            'total_faktur' => self::getColValue($row, $config['col_total_faktur'] ?? null),
            'terkirim' => self::getColValue($row, $config['col_terkirim'] ?? null),
            'belum_terkirim' => self::getColValue($row, $config['col_belum_terkirim'] ?? null),
            'nominal_sdh_kirim' => self::getColValue($row, $config['col_nominal_sdh_kirim'] ?? null),
            'nominal_blm_kirim' => self::getColValue($row, $config['col_nominal_blm_kirim'] ?? null),
            'persen_terpenuhi' => self::getColValue($row, $config['col_persen_terpenuhi'] ?? null),
            'persen_belum_terpenuhi' => self::getColValue($row, $config['col_persen_belum_terpenuhi'] ?? null),
            'keterangan' => self::getColValue($row, $config['col_keterangan'] ?? null),
        ];
    }

    public static function buildPiutangData($row, $sheetName, $config) {
        $namaOutlet = self::getColValue($row, $config['col_nama_outlet'] ?? null);
        $namaOutlet = self::getMappedOutletName($namaOutlet);

        return [
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
        ];
    }

    public static function buildHutangData($row, $sheetName, $config) {
        $namaPenyedia = self::getColValue($row, $config['col_nama_penyedia'] ?? null);
        $namaPenyedia = self::getMappedProviderName($namaPenyedia);

        return [
            'sheet_name' => $sheetName,
            'no' => self::getColValue($row, $config['col_no'] ?? null),
            'nama_penyedia' => $namaPenyedia,
            'nominal' => self::getColValue($row, $config['col_nominal'] ?? null),
        ];
    }

    private static function getMappedOutletName($rawName) {
        if (!$rawName) return $rawName;
        $mapping = \App\Models\OutletMapping::where('raw_name', $rawName)->with('outlet')->first();
        if ($mapping && $mapping->outlet) {
            return $mapping->outlet->name;
        }
        return $rawName;
    }

    private static function getMappedProviderName($rawName) {
        if (!$rawName) return $rawName;
        $mapping = \App\Models\ProviderMapping::where('raw_name', $rawName)->with('provider')->first();
        if ($mapping && $mapping->provider) {
            return $mapping->provider->name;
        }
        return $rawName;
    }
}
