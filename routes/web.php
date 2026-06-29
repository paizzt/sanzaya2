<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceRequestController;
use App\Http\Controllers\MarketingDailyReportController;
use App\Http\Controllers\UcRequestController;
use App\Http\Controllers\BhpRequestController;
use App\Http\Controllers\SpreadsheetSyncController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProviderController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Absensi
    Route::get('/absensi', [AttendanceController::class, 'index'])->name('absensi.index');
    Route::get('/absensi/rekap', [\App\Http\Controllers\AttendanceRecapController::class, 'index'])->name('absensi.rekap');
    Route::post('/absensi', [AttendanceController::class, 'store'])->name('absensi.store');

    // Pengajuan Izin/Sakit
    Route::get('/absensi/pengajuan', [AttendanceRequestController::class, 'index'])->name('absensi.pengajuan');
    Route::post('/absensi/pengajuan', [AttendanceRequestController::class, 'store'])->name('absensi.pengajuan.store');

    // Marketing
    Route::get('/marketing', [MarketingDailyReportController::class, 'index'])->name('marketing.index');
    Route::get('/marketing/recap-all', [\App\Http\Controllers\MarketingRecapController::class, 'index'])->name('marketing.recap.index');
    Route::get('/marketing/recap-all/pdf', [\App\Http\Controllers\MarketingRecapController::class, 'exportPdf'])->name('marketing.recap.pdf');
    Route::post('/marketing/report', [MarketingDailyReportController::class, 'store'])->name('marketing.report.store');
    Route::post('/marketing/target', [MarketingDailyReportController::class, 'storeTarget'])->name('marketing.target.store');
    Route::get('/requests/uc', [UcRequestController::class, 'index'])->name('requests.uc.index');
    Route::get('/requests/uc-history', [UcRequestController::class, 'history'])->name('requests.uc.history');
    Route::post('/requests/uc', [UcRequestController::class, 'store'])->name('requests.uc.store');
    Route::post('/requests/uc/{id}/result', [UcRequestController::class, 'storeResult'])->name('requests.uc.storeResult');
    Route::get('/requests/uc/{id}/pdf', [UcRequestController::class, 'generatePdf'])->name('requests.uc.pdf');

    // Persetujuan UC
    Route::get('/requests/uc-approval', [\App\Http\Controllers\UcApprovalController::class, 'index'])->name('requests.uc.approval.index');
    Route::post('/requests/uc-approval/{id}', [\App\Http\Controllers\UcApprovalController::class, 'update'])->name('requests.uc.approval.update');

    Route::get('/requests/bhp', [BhpRequestController::class, 'index'])->name('requests.bhp.index');
    Route::post('/requests/bhp', [BhpRequestController::class, 'store'])->name('requests.bhp.store');
    Route::get('/requests/bhp/{id}/pdf', [BhpRequestController::class, 'generatePdf'])->name('requests.bhp.pdf');

    // Spreadsheet Sync Config
    Route::get('/spreadsheet', [SpreadsheetSyncController::class, 'index'])->name('spreadsheet.index');
    Route::post('/spreadsheet', [SpreadsheetSyncController::class, 'store'])->name('spreadsheet.store');
    Route::post('/spreadsheet/sync', [SpreadsheetSyncController::class, 'sync'])->name('spreadsheet.sync');

    // Reports (Spreadsheet Data Dashboard)
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Notifications
    Route::get('/settings/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/settings/notifications/vapid', [NotificationController::class, 'generateVapid'])->name('notifications.vapid');
    Route::post('/settings/notifications/store', [NotificationController::class, 'storeSettings'])->name('notifications.store');
    Route::post('/push-subscribe', [NotificationController::class, 'subscribe'])->name('push.subscribe');
    
    // DB Notifications
    Route::post('/notifications/mark-read/{id}', [NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    
    // Kelola Pengguna
    Route::resource('users', UserController::class);
    
    // Data Outlet
    Route::post('outlets/bulk-delete', [OutletController::class, 'bulkDestroy'])->name('outlets.bulkDestroy');
    Route::resource('outlets', OutletController::class);

    // Pengajuan
    Route::resource('bhp-requests', BhpRequestController::class);
    Route::resource('uc-requests', UcRequestController::class);

    // Laporan
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Pemetaan Outlet
    Route::get('/outlet-mappings', [\App\Http\Controllers\OutletMappingController::class, 'index'])->name('outlet-mappings.index');
    Route::post('/outlet-mappings', [\App\Http\Controllers\OutletMappingController::class, 'store'])->name('outlet-mappings.store');
    Route::delete('/outlet-mappings/{id}', [\App\Http\Controllers\OutletMappingController::class, 'destroy'])->name('outlet-mappings.destroy');

    // Kendaraan / Armada
    Route::resource('vehicles', \App\Http\Controllers\VehicleController::class);

    // Data Penyedia
    Route::resource('providers', ProviderController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
