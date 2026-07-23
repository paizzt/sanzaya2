<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
        public function share(Request $request): array
    {
        $setting = \App\Models\NotificationSetting::first();
        
        $active_features = [];
        if ($request->user()) {
            $features = \App\Models\FeatureToggle::all();
            foreach ($features as $feature) {
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                if (!in_array($request->user()->id, $disabledUsers)) {
                    $active_features[] = $feature->id;
                }
            }
        }

        return [
            'vapid_public_key' => $setting ? $setting->vapid_public_key : null,
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load(['company', 'roles']) : null,
                'notifications' => $request->user() ? $request->user()->unreadNotifications()->take(5)->get() : [],
                'unread_count' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
                'active_features' => $active_features,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
