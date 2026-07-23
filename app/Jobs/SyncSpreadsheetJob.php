<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Notifications\SpreadsheetSyncCompleted;

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
                $user = User::find($this->userId);
                if ($user) {
                    $user->notify(new SpreadsheetSyncCompleted(
                        'Sinkronisasi Spreadsheet Selesai',
                        'Sinkronisasi ' . $this->type . ' berhasil. ' . $rowsAdded . ' baris data diperbarui.',
                        'success'
                    ));
                }
            }
        } catch (\Exception $e) {
            if ($this->userId) {
                $user = User::find($this->userId);
                if ($user) {
                    $user->notify(new SpreadsheetSyncCompleted(
                        'Sinkronisasi Spreadsheet Gagal',
                        'Gagal sinkronisasi ' . $this->type . ': ' . $e->getMessage(),
                        'error'
                    ));
                }
            }
            throw $e;
        }
    }
}
