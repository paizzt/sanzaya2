<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Receivable;

class ImportPiutangData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:piutang-data {file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import data piutang dari file CSV (Rincian Piutang Sanzaya Group 2026)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->argument('file');
        
        if (!file_exists($file)) {
            $this->error("File tidak ditemukan: {$file}");
            return;
        }

        $this->info("Memulai import data piutang dari {$file}...");

        $handle = fopen($file, "r");
        if ($handle !== FALSE) {
            // Read header
            $header = fgetcsv($handle, 1000, ",");

            $imported = 0;
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                // Skip empty lines, invalid lines, or GRAND TOTAL row
                if (count($data) < 11 || empty($data[1]) || trim($data[1]) === 'GRAND TOTAL') {
                    continue;
                }

                $namaOutlet = trim($data[1]);

                // 1. PT Sanzaya
                $sanzaya2024 = (float) str_replace(',', '', $data[2]);
                $sanzaya2025 = (float) str_replace(',', '', $data[3]);
                $sanzaya2026 = (float) str_replace(',', '', $data[4]);
                $totalSanzaya = (float) str_replace(',', '', $data[5]);

                if ($totalSanzaya > 0 || $sanzaya2024 > 0 || $sanzaya2025 > 0 || $sanzaya2026 > 0) {
                    $details = [];
                    if ($sanzaya2024 > 0) $details[] = ['year' => '2024', 'amount' => $sanzaya2024];
                    if ($sanzaya2025 > 0) $details[] = ['year' => '2025', 'amount' => $sanzaya2025];
                    if ($sanzaya2026 > 0) $details[] = ['year' => '2026', 'amount' => $sanzaya2026];

                    Receivable::updateOrCreate(
                        ['nama_outlet' => $namaOutlet, 'nama_pt' => 'PT Sanzaya'],
                        ['details' => $details, 'total' => $totalSanzaya]
                    );
                    $imported++;
                }

                // 2. PT Ruma
                $ruma2025 = (float) str_replace(',', '', $data[6]);
                $ruma2026 = (float) str_replace(',', '', $data[7]);
                $totalRuma = (float) str_replace(',', '', $data[8]);

                if ($totalRuma > 0 || $ruma2025 > 0 || $ruma2026 > 0) {
                    $details = [];
                    if ($ruma2025 > 0) $details[] = ['year' => '2025', 'amount' => $ruma2025];
                    if ($ruma2026 > 0) $details[] = ['year' => '2026', 'amount' => $ruma2026];

                    Receivable::updateOrCreate(
                        ['nama_outlet' => $namaOutlet, 'nama_pt' => 'PT Ruma'],
                        ['details' => $details, 'total' => $totalRuma]
                    );
                    $imported++;
                }

                // 3. PT Harkes
                $harkes = (float) str_replace(',', '', $data[9]);

                if ($harkes > 0) {
                    Receivable::updateOrCreate(
                        ['nama_outlet' => $namaOutlet, 'nama_pt' => 'PT Harkes'],
                        ['details' => [['year' => 'Total', 'amount' => $harkes]], 'total' => $harkes]
                    );
                    $imported++;
                }
            }
            fclose($handle);
            $this->info("Import berhasil. Total {$imported} record piutang diproses/diperbarui.");
        } else {
            $this->error("Gagal membuka file.");
        }
    }
}
