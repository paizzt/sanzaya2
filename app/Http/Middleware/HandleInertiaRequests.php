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
        $active_feature_names = [];
        $canDownloadPdf = true;

        if ($request->user()) {
            $userIdStr = (string)$request->user()->id;

            // Check if Unduh PDF is disabled for this user
            $pdfFeatures = \App\Models\FeatureToggle::whereRaw('LOWER(TRIM(name)) = ?', ['unduh pdf'])->get();
            if ($pdfFeatures->isNotEmpty()) {
                foreach ($pdfFeatures as $pf) {
                    $disabledUsers = json_decode($pf->disabled_for_users, true) ?? [];
                    $disabledUserIds = array_map('strval', (array)$disabledUsers);
                    if (in_array($userIdStr, $disabledUserIds, true)) {
                        $canDownloadPdf = false;
                        break;
                    }
                }
            }

            $features = \App\Models\FeatureToggle::all();
            foreach ($features as $feature) {
                $featureNameLower = strtolower(trim($feature->name));
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                $disabledUserIds = array_map('strval', (array)$disabledUsers);
                $isDisabled = in_array($userIdStr, $disabledUserIds, true);

                if ($featureNameLower === 'unduh pdf') {
                    if ($canDownloadPdf) {
                        $active_features[] = $feature->id;
                        $active_feature_names[] = 'Unduh PDF';
                    }
                } else {
                    if (!$isDisabled) {
                        $active_features[] = $feature->id;
                        $active_feature_names[] = $feature->name;
                    }
                }
            }

            if ($canDownloadPdf && !in_array('Unduh PDF', $active_feature_names, true)) {
                $active_feature_names[] = 'Unduh PDF';
            }

            // Strictly remove any variation of 'unduh pdf' if disabled
            if (!$canDownloadPdf) {
                $active_feature_names = array_values(array_filter($active_feature_names, function ($name) {
                    return strtolower(trim($name)) !== 'unduh pdf';
                }));
            }
        }

        return [
            'vapid_public_key' => $setting ? $setting->vapid_public_key : null,
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load(['company', 'roles']) : null,
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
                'notifications' => $request->user() ? $request->user()->unreadNotifications()->take(5)->get() : [],
                'unread_count' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
                'active_features' => $active_features,
                'active_feature_names' => $active_feature_names,
                'can_download_pdf' => $canDownloadPdf,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
