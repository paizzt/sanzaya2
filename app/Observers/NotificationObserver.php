<?php

namespace App\Observers;

use App\Models\Attendance;
use App\Models\MarketingDailyReport;
use App\Models\UcRequest;
use App\Models\BhpRequest;
use App\Models\WbsReport;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class NotificationObserver
{
    /**
     * Handle the "created" event.
     */
    public function created($model)
    {
        try {
            $userName = $model->user->name ?? 'Seseorang';
            
            if ($model instanceof Attendance) {
                // Absensi (Hadir)
                NotificationService::notifyFeatureUsers(
                    'Rekap Absensi',
                    'Absensi Masuk Baru',
                    "$userName baru saja melakukan absensi masuk.",
                    route('absensi.rekap')
                );
            } 
            elseif ($model instanceof MarketingDailyReport) {
                NotificationService::notifyFeatureUsers(
                    'Rekap Marketing',
                    'Laporan Marketing Baru',
                    "$userName baru saja mengirim laporan marketing.",
                    route('marketing.recap.index')
                );
            }
            elseif ($model instanceof UcRequest) {
                NotificationService::notifyFeatureUsers(
                    'Rekap Kasbon',
                    'Pengajuan Kasbon Baru',
                    "$userName baru saja membuat pengajuan kasbon.",
                    url('/uc-requests') // Adjust url if necessary
                );
            }
            elseif ($model instanceof BhpRequest) {
                NotificationService::notifyFeatureUsers(
                    'Rekap Pembelian',
                    'Pengajuan Pembelian Baru',
                    "$userName baru saja membuat pengajuan pembelian.",
                    url('/bhp-requests')
                );
            }
            elseif ($model instanceof WbsReport) {
                NotificationService::notifyFeatureUsers(
                    'Lapor WBS',
                    'Laporan WBS Baru',
                    "Ada laporan WBS baru yang masuk.",
                    url('/wbs-reports')
                );
            }
        } catch (\Exception $e) {
            Log::error('Error in NotificationObserver: ' . $e->getMessage());
        }
    }

    /**
     * Handle the "updated" event.
     */
    public function updated($model)
    {
        try {
            $userName = $model->user->name ?? 'Seseorang';
            
            // Special case for check-out
            if ($model instanceof Attendance && $model->wasChanged('check_out_time')) {
                NotificationService::notifyFeatureUsers(
                    'Rekap Absensi',
                    'Absensi Pulang',
                    "$userName baru saja melakukan absensi pulang.",
                    route('absensi.rekap')
                );
            }
        } catch (\Exception $e) {
            Log::error('Error in NotificationObserver updated: ' . $e->getMessage());
        }
    }
}
