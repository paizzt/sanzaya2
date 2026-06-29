<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$filepath = 'app/Http/Middleware/HandleInertiaRequests.php';
$content = file_get_contents($filepath);

$new_share = <<<'EOD'
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
                'user' => $request->user(),
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
EOD;

$content = preg_replace('/public function share\(Request \$request\): array\s*\{.*?\n    \}/s', $new_share, $content);

file_put_contents($filepath, $content);
echo "HandleInertiaRequests updated.\n";
