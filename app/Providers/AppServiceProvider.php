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
    }
}
