<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceRecapController;
use App\Http\Controllers\AttendanceRequestController;
use App\Http\Controllers\MarketingDailyReportController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UcRequestController;
use App\Http\Controllers\BhpRequestController;
use App\Http\Controllers\SpreadsheetSyncController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\BhpRecapController;
use App\Http\Controllers\CompanyController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

// Public Share Routes
Route::get('/shared/kebutuhan-barang', [\App\Http\Controllers\ItemRequirementController::class, 'publicIndex'])->name('item-requirements.public');

Route::middleware(['auth', 'verified'])->group(function () {

    // Added Export Routes
    Route::get('/logistic-reports-export-pdf', [\App\Http\Controllers\LogisticReportController::class, 'exportPdf'])->name('logistic-reports.export.pdf');
    Route::get('/logistic-reports-export-excel', [\App\Http\Controllers\LogisticReportController::class, 'exportExcel'])->name('logistic-reports.export.excel');
    Route::get('/purchase-orders-export-pdf', [\App\Http\Controllers\PurchaseOrderController::class, 'exportPdf'])->name('purchase-orders.export.pdf');
    Route::get('/purchase-orders-export-excel', [\App\Http\Controllers\PurchaseOrderController::class, 'exportExcel'])->name('purchase-orders.export.excel');
    Route::get('/receivables-export-pdf', [\App\Http\Controllers\ReceivableController::class, 'exportPdf'])->name('receivables.export.pdf');
    Route::get('/receivables-export-excel', [\App\Http\Controllers\ReceivableController::class, 'exportExcel'])->name('receivables.export.excel');
    Route::get('/payables-export-pdf', [\App\Http\Controllers\PayableController::class, 'exportPdf'])->name('payables.export.pdf');
    Route::get('/payables-export-excel', [\App\Http\Controllers\PayableController::class, 'exportExcel'])->name('payables.export.excel');
    Route::get('/company-export-pdf', [\App\Http\Controllers\CompanyController::class, 'exportPdf'])->name('company.export.pdf');
    Route::get('/company-export-excel', [\App\Http\Controllers\CompanyController::class, 'exportExcel'])->name('company.export.excel');
    Route::get('/outlets-export-pdf', [\App\Http\Controllers\OutletController::class, 'exportPdf'])->name('outlets.export.pdf');
    Route::get('/outlets-export-excel', [\App\Http\Controllers\OutletController::class, 'exportExcel'])->name('outlets.export.excel');
    Route::get('/vehicles-export-pdf', [\App\Http\Controllers\VehicleController::class, 'exportPdf'])->name('vehicles.export.pdf');
    Route::get('/vehicles-export-excel', [\App\Http\Controllers\VehicleController::class, 'exportExcel'])->name('vehicles.export.excel');
    Route::get('/providers-export-pdf', [\App\Http\Controllers\ProviderController::class, 'exportPdf'])->name('providers.export.pdf');
    Route::get('/providers-export-excel', [\App\Http\Controllers\ProviderController::class, 'exportExcel'])->name('providers.export.excel');
    Route::get('/provider-products-export-pdf/{provider}', [\App\Http\Controllers\ProviderProductController::class, 'exportPdf'])->name('provider-products.export.pdf');
    Route::get('/provider-products-export-excel/{provider}', [\App\Http\Controllers\ProviderProductController::class, 'exportExcel'])->name('provider-products.export.excel');
    Route::get('/products-export-pdf', [\App\Http\Controllers\ProductController::class, 'exportPdf'])->name('products.export.pdf');
    Route::get('/products-export-excel', [\App\Http\Controllers\ProductController::class, 'exportExcel'])->name('products.export.excel');
    Route::get('/users-export-pdf', [\App\Http\Controllers\UserController::class, 'exportPdf'])->name('users.export.pdf');
    Route::get('/users-export-excel', [\App\Http\Controllers\UserController::class, 'exportExcel'])->name('users.export.excel');
    Route::get('/marketing-export-pdf', [\App\Http\Controllers\MarketingDailyReportController::class, 'exportPdf'])->name('marketing.export.pdf');
    Route::get('/marketing-export-excel', [\App\Http\Controllers\MarketingDailyReportController::class, 'exportExcel'])->name('marketing.export.excel');
    Route::get('/marketing-export-target-pdf', [\App\Http\Controllers\MarketingDailyReportController::class, 'exportTargetPdf'])->name('marketing.export_target.pdf');
    Route::get('/uc-export-pdf', [\App\Http\Controllers\UcRequestController::class, 'exportPdf'])->name('requests.uc.export.pdf');
    Route::get('/uc-export-excel', [\App\Http\Controllers\UcRequestController::class, 'exportExcel'])->name('requests.uc.export.excel');
    Route::get('/uc-approval-export-pdf', [\App\Http\Controllers\UcApprovalController::class, 'exportPdf'])->name('requests.uc.approval.export.pdf');
    Route::get('/uc-approval-export-excel', [\App\Http\Controllers\UcApprovalController::class, 'exportExcel'])->name('requests.uc.approval.export.excel');


    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['can:view absensi'])->group(function() {
        // Absensi
        Route::get('/absensi', [AttendanceController::class, 'index'])->name('absensi.index');
        Route::get('/absensi/rekap', [AttendanceRecapController::class, 'index'])->name('absensi.rekap');
        Route::get('/absensi/rekap/export-pdf', [AttendanceRecapController::class, 'exportPdf'])->name('absensi.rekap.export-pdf');
        Route::post('/absensi', [AttendanceController::class, 'store'])->name('absensi.store');
        Route::delete('/absensi/{id}', [AttendanceController::class, 'destroy'])->name('absensi.destroy');

        // Pengajuan Izin/Sakit
        Route::get('/absensi/pengajuan', [AttendanceRequestController::class, 'index'])->name('absensi.pengajuan');
        Route::post('/absensi/pengajuan', [AttendanceRequestController::class, 'store'])->name('absensi.pengajuan.store');
        Route::put('/absensi/pengajuan/{id}/status', [AttendanceRequestController::class, 'updateStatus'])->name('absensi.pengajuan.status');
        Route::delete('/absensi/pengajuan/{id}', [AttendanceRequestController::class, 'destroy'])->name('absensi.pengajuan.destroy');
    });

    // Modul Marketing
    Route::middleware(['can:view marketing'])->group(function() {
        Route::get('/marketing', [MarketingDailyReportController::class, 'index'])->name('marketing.index');
        Route::get('/marketing/recap-all', [\App\Http\Controllers\MarketingRecapController::class, 'index'])->name('marketing.recap.index');
        Route::get('/marketing/recap-all/pdf', [\App\Http\Controllers\MarketingRecapController::class, 'exportPdf'])->name('marketing.recap.pdf');
        Route::get('/marketing/recap-all/excel', [\App\Http\Controllers\MarketingRecapController::class, 'exportExcel'])->name('marketing.recap.excel');
        Route::post('/marketing/report', [MarketingDailyReportController::class, 'store'])->name('marketing.report.store');
        Route::post('/marketing/target', [MarketingDailyReportController::class, 'storeTarget'])->name('marketing.target.store');
        Route::get('/marketing-export-pdf', [MarketingDailyReportController::class, 'exportPdf'])->name('marketing.export.pdf');
        Route::get('/marketing-export-excel', [MarketingDailyReportController::class, 'exportExcel'])->name('marketing.export.excel');
        Route::get('/marketing-export-target-pdf', [MarketingDailyReportController::class, 'exportTargetPdf'])->name('marketing.export_target.pdf');
        
        // Fitur Pencarian Produk
        Route::get('/marketing/products', [\App\Http\Controllers\MarketingProductController::class, 'index'])->name('marketing.products.index');
    });

    Route::middleware(['can:view uc requests'])->group(function() {
        Route::get('/requests/uc', [UcRequestController::class, 'index'])->name('requests.uc.index');
        Route::get('/requests/uc-history', [UcRequestController::class, 'history'])->name('requests.uc.history');
        Route::post('/requests/uc', [UcRequestController::class, 'store'])->name('requests.uc.store');
        Route::post('/requests/uc/{id}/result', [UcRequestController::class, 'storeResult'])->name('requests.uc.storeResult');
        Route::get('/requests/uc/{id}/pdf', [UcRequestController::class, 'generatePdf'])->name('requests.uc.pdf');
        Route::resource('uc-requests', UcRequestController::class);
    });

    Route::middleware(['can:approve uc requests'])->group(function() {
        // Persetujuan UC
        Route::get('/requests/uc-approval', [\App\Http\Controllers\UcApprovalController::class, 'index'])->name('requests.uc.approval.index');
        Route::post('/requests/uc-approval/{id}', [\App\Http\Controllers\UcApprovalController::class, 'update'])->name('requests.uc.approval.update');
    });

    Route::middleware(['can:view bhp requests'])->group(function() {
        Route::get('/requests/bhp', [BhpRequestController::class, 'index'])->name('requests.bhp.index');
        Route::post('/requests/bhp', [BhpRequestController::class, 'store'])->name('requests.bhp.store');
        Route::get('/requests/bhp/{id}/pdf', [BhpRequestController::class, 'generatePdf'])->name('requests.bhp.pdf');
        Route::resource('bhp-requests', BhpRequestController::class);
    });

    Route::middleware(['can:approve bhp requests'])->group(function() {
        // Rekap BHP
        Route::get('/requests/bhp-recap', [BhpRecapController::class, 'index'])->name('requests.bhp.recap.index');
        Route::put('/requests/bhp-recap/{id}/status', [BhpRecapController::class, 'updateStatus'])->name('requests.bhp.recap.status');
        Route::get('/requests/bhp-recap/export', [BhpRecapController::class, 'exportPdf'])->name('requests.bhp.recap.export');
    });

    Route::middleware(['can:manage spreadsheet sync'])->group(function() {
        // Spreadsheet Sync Config
        Route::get('/spreadsheet', [SpreadsheetSyncController::class, 'index'])->name('spreadsheet.index');
        Route::post('/spreadsheet', [SpreadsheetSyncController::class, 'store'])->name('spreadsheet.store');
        Route::post('/spreadsheet/sync', [SpreadsheetSyncController::class, 'sync'])->name('spreadsheet.sync');
    });

    Route::middleware(['can:view laporan finansial'])->group(function() {
        // Reports (Spreadsheet Data Dashboard)
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
    });

    // Notifications (Open to all auth)
    Route::get('/settings/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/settings/notifications/vapid', [NotificationController::class, 'generateVapid'])->name('notifications.vapid');
    Route::post('/settings/notifications/store', [NotificationController::class, 'storeSettings'])->name('notifications.store');
    Route::get('/settings/vapid-public-key', [NotificationController::class, 'getVapidPublicKey'])->name('notifications.vapidPublicKey');
    Route::post('/settings/push-subscription', [NotificationController::class, 'subscribe'])->name('push.subscribe');

    // DB Notifications
    Route::post('/notifications/mark-read/{id}', [NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    
    Route::middleware(['can:view users'])->group(function() {
        // Kelola Pengguna
        Route::resource('users', UserController::class);
    });

    Route::middleware(['can:manage company'])->group(function() {
        // Data Perusahaan
        Route::get('/company', [CompanyController::class, 'index'])->name('company.index');
        Route::post('/company', [CompanyController::class, 'store'])->name('company.store');
        Route::post('/company/{id}', [CompanyController::class, 'update'])->name('company.update');
        Route::delete('/company/{id}', [CompanyController::class, 'destroy'])->name('company.destroy');
    });
    
    Route::middleware(['can:manage master data'])->group(function() {
        // Data Outlet
        Route::post('outlets/bulk-delete', [OutletController::class, 'bulkDestroy'])->name('outlets.bulkDestroy');
        Route::resource('outlets', OutletController::class);

        // Item Requirements
        Route::post('item-requirements/toggle-share', [\App\Http\Controllers\ItemRequirementController::class, 'toggleShare'])->name('item-requirements.toggleShare');
        Route::get('item-requirements/export/pdf', [\App\Http\Controllers\ItemRequirementController::class, 'exportPdf'])->name('item-requirements.export.pdf');
        Route::get('item-requirements/export/excel', [\App\Http\Controllers\ItemRequirementController::class, 'exportExcel'])->name('item-requirements.export.excel');
        Route::resource('item-requirements', \App\Http\Controllers\ItemRequirementController::class);

        // Pemetaan Outlet
        Route::get('/outlet-mappings', [\App\Http\Controllers\OutletMappingController::class, 'index'])->name('outlet-mappings.index');
        Route::post('/outlet-mappings', [\App\Http\Controllers\OutletMappingController::class, 'store'])->name('outlet-mappings.store');
        Route::delete('/outlet-mappings/{id}', [\App\Http\Controllers\OutletMappingController::class, 'destroy'])->name('outlet-mappings.destroy');

        // Master Data
        Route::resource('outlets', OutletController::class)->except(['show', 'create', 'edit']);
        Route::resource('item-requirements', \App\Http\Controllers\ItemRequirementController::class)->except(['show', 'create', 'edit']);
        Route::resource('vehicles', \App\Http\Controllers\VehicleController::class)->except(['show']);
        Route::resource('providers', ProviderController::class)->except(['create', 'edit']);
        Route::resource('provider-products', \App\Http\Controllers\ProviderProductController::class)->except(['index', 'create', 'edit', 'show']);
        Route::resource('products', ProductController::class)->except(['show', 'create', 'edit']);
    });

    Route::middleware(['can:view purchase orders'])->group(function() {
        // Modul Logistik & Keuangan
        Route::resource('logistic-reports', \App\Http\Controllers\LogisticReportController::class);
        Route::resource('purchase-orders', \App\Http\Controllers\PurchaseOrderController::class);
    });

    // Vehicle Usages (Open to all authenticated users)
    Route::get('vehicle-usages', [\App\Http\Controllers\VehicleUsageController::class, 'index'])->name('vehicle-usages.index');
    Route::post('vehicle-usages', [\App\Http\Controllers\VehicleUsageController::class, 'store'])->name('vehicle-usages.store');
    Route::delete('vehicle-usages/{id}', [\App\Http\Controllers\VehicleUsageController::class, 'destroy'])->name('vehicle-usages.destroy');

    Route::middleware(['can:view receivables'])->group(function() {
        Route::post('receivables/daily-report', [\App\Http\Controllers\ReceivableController::class, 'storeDailyReport'])->name('receivables.dailyReport.store');
        Route::resource('receivables', \App\Http\Controllers\ReceivableController::class);
    });

    Route::middleware(['can:view payables'])->group(function() {
        Route::resource('payables', \App\Http\Controllers\PayableController::class);
    });

    // SOP Read-Only Access for all authenticated users
    Route::get('/sops', [\App\Http\Controllers\SopController::class, 'index'])->name('sops.index');
    Route::get('/sops/{sop_division}', [\App\Http\Controllers\SopController::class, 'show'])->name('sops.show');

    Route::middleware(['can:manage master data'])->group(function() { // Or create manage sops permission
        // SOP Management (Write Operations)
        Route::post('/sops/divisions', [\App\Http\Controllers\SopController::class, 'storeDivision'])->name('sops.divisions.store');
        Route::delete('/sops/divisions/{sop_division}', [\App\Http\Controllers\SopController::class, 'destroyDivision'])->name('sops.divisions.destroy');
        Route::post('/sops/{sop_division}/jobs', [\App\Http\Controllers\SopController::class, 'store'])->name('sops.store');
        Route::put('/sops/jobs/{sop}', [\App\Http\Controllers\SopController::class, 'update'])->name('sops.update');
        Route::delete('/sops/jobs/{sop}', [\App\Http\Controllers\SopController::class, 'destroy'])->name('sops.destroy');
    });

    // Payment Requests
    Route::middleware(['can:payment-request.view-own'])->group(function() {
        Route::post('payment-requests/{payment_request}/submit', [\App\Http\Controllers\PaymentRequestController::class, 'submit'])->name('payment-requests.submit');
        Route::resource('payment-requests', \App\Http\Controllers\PaymentRequestController::class);
    });

    // Payment Request PDF (Can be downloaded by both requester and approver)
    Route::middleware('auth')->group(function() {
        Route::get('payment-requests/{payment_request}/pdf', [\App\Http\Controllers\PaymentRequestController::class, 'downloadPdf'])->name('payment-requests.pdf');
    });

    // Payment Approvals
    Route::middleware(['can:payment-request.review'])->group(function() {
        Route::get('payment-approvals', [\App\Http\Controllers\PaymentRequestController::class, 'approvals'])->name('payment-approvals.index');
        Route::post('payment-requests/{payment_request}/approve', [\App\Http\Controllers\PaymentRequestController::class, 'approve'])->name('payment-requests.approve');
        Route::post('payment-requests/{payment_request}/reject', [\App\Http\Controllers\PaymentRequestController::class, 'reject'])->name('payment-requests.reject');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // System Activity Logs
    Route::middleware(['can:view activity log'])->group(function() {
        Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('system.activity-logs');
    });
});

require __DIR__.'/auth.php';

// Route sementara untuk import data penyedia ke database cPanel
Route::get('/import-providers', function () {
    try {
        $providers = [
            ['name' => 'PT Indowell Medtech Indonesia', 'type' => 'Distributor', 'address' => 'RUKO Apartment city Home, Jalan Raya Boulevard Block M56, RT.006/RW.019, Kelapa Gading', 'phone' => '+622121698396'],
            ['name' => 'PT SNA Medika', 'type' => 'Non distributor'],
            ['name' => 'PT. STANDARD BIOSENSOR HEALTHCARE', 'type' => 'Non distributor'],
            ['name' => 'PT. YUWELL MEDICA INDONESIA', 'type' => 'Distributor'],
            ['name' => 'PT. GOLDEN GLOBE MEDICA', 'type' => 'Distributor']
        ];

        foreach ($providers as $data) {
            \App\Models\Provider::updateOrCreate(['name' => $data['name']], $data);
        }
        return 'Data 5 Penyedia berhasil ditambahkan ke database hosting!';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});
