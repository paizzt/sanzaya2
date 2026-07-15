<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;

class SyncSpreadsheetJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $type;
    public $userId;

    public function __construct($type, $userId)
    {
        $this->type = $type;
        $this->userId = $userId;
    }

    public function handle(): void
    {
        try {
            $rowsAdded = \App\Services\SpreadsheetSyncService::syncType($this->type);
            
            if ($this->userId) {
                Notification::create([
                    'user_id' => $this->userId,
                    'title' => 'Sinkronisasi Spreadsheet Selesai',
                    'message' => 'Sinkronisasi ' . $this->type . ' berhasil. ' . $rowsAdded . ' baris data diperbarui.',
                    'type' => 'success',
                    'is_read' => false,
                ]);
            }
        } catch (\Exception $e) {
            if ($this->userId) {
                Notification::create([
                    'user_id' => $this->userId,
                    'title' => 'Sinkronisasi Spreadsheet Gagal',
                    'message' => 'Gagal sinkronisasi ' . $this->type . ': ' . $e->getMessage(),
                    'type' => 'error',
                    'is_read' => false,
                ]);
            }
            throw $e;
        }
    }
}
