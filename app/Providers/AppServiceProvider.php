<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (request()->server('HTTP_X_FORWARDED_PROTO') === 'https') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Register Observers for Notifications
        \App\Models\Attendance::observe(\App\Observers\NotificationObserver::class);
        \App\Models\MarketingDailyReport::observe(\App\Observers\NotificationObserver::class);
        \App\Models\UcRequest::observe(\App\Observers\NotificationObserver::class);
        \App\Models\BhpRequest::observe(\App\Observers\NotificationObserver::class);
        \App\Models\WbsReport::observe(\App\Observers\NotificationObserver::class);

        // Authorization Gate for Dashboard Laporan
        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            if ($user->hasAnyRole(['Super Admin', 'super_admin', 'super-admin', 'Superadmin', 'superadmin', 'SUPERADMIN', 'SUPER ADMIN'])) {
                return true;
            }
        });

        \Illuminate\Support\Facades\Gate::define('view laporan finansial', function ($user) {
            if ($user->hasAnyRole(['Super Admin', 'super_admin', 'super-admin', 'Superadmin', 'superadmin', 'SUPERADMIN', 'SUPER ADMIN'])) {
                return true;
            }
            if ($user->hasPermissionTo('view laporan finansial')) {
                return true;
            }
            $feature = \App\Models\FeatureToggle::where('name', 'Dashboard Laporan')->first();
            if ($feature) {
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                return !in_array((string)$user->id, array_map('strval', (array)$disabledUsers), true);
            }
            return false;
        });
    }
}
