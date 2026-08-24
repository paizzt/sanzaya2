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
        $messageStart = 'Memulai sinkronisasi otomatis spreadsheet...';
        $this->info($messageStart);
        \Illuminate\Support\Facades\Log::info("Cron: " . $messageStart);

        foreach ($types as $type) {
            try {
                $rowsAdded = \App\Services\SpreadsheetSyncService::syncType($type);
                $msgSuccess = "Sinkronisasi {$type} berhasil. ({$rowsAdded} baris ditarik)";
                $this->info($msgSuccess);
                \Illuminate\Support\Facades\Log::info("Cron: " . $msgSuccess);
            } catch (\Exception $e) {
                $msgError = "Sinkronisasi {$type} gagal: " . $e->getMessage();
                $this->error($msgError);
                \Illuminate\Support\Facades\Log::error("Cron: " . $msgError);
            }
        }
        
        $messageEnd = 'Sinkronisasi otomatis selesai.';
        $this->info($messageEnd);
        \Illuminate\Support\Facades\Log::info("Cron: " . $messageEnd);
    }
}
