<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SyncSpreadsheetsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-spreadsheets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Melakukan sinkronisasi data seluruh spreadsheet secara otomatis';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $types = ['logistik', 'pesanan', 'piutang', 'hutang'];
        $this->info('Memulai sinkronisasi otomatis spreadsheet...');

        foreach ($types as $type) {
            try {
                $rowsAdded = \App\Services\SpreadsheetSyncService::syncType($type);
                $this->info("Sinkronisasi {$type} berhasil. ({$rowsAdded} baris ditarik)");
            } catch (\Exception $e) {
                $this->error("Sinkronisasi {$type} gagal: " . $e->getMessage());
            }
        }
        
        $this->info('Sinkronisasi otomatis selesai.');
    }
}
