<?php
namespace App\Http\Controllers;

use App\Models\NotificationSetting;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Minishlink\WebPush\VAPID;

class NotificationController extends Controller
{
    private function ensureCanManageNotifications(): void
    {
        $user = auth()->user();
        if (!$user || !$user->isAdminUser()) {
            abort(403, 'Hanya Admin yang dapat mengubah pengaturan notifikasi.');
        }
    }

    public function index()
    {
        $user = auth()->user();
        if ($user && !$user->isAdminUser() && !\App\Models\FeatureToggle::userHasFeature($user, 'Notifikasi')) {
            return redirect()->route('dashboard')->with('error', 'Akses ditolak: Fitur Notifikasi dinonaktifkan untuk akun Anda.');
        }

        $setting = NotificationSetting::firstOrCreate([]);

        return Inertia::render('Settings/Notifications', [
            'setting' => $setting
        ]);
    }

    public function generateVapid()
    {
        $this->ensureCanManageNotifications();

        // Fix for Windows XAMPP OpenSSL issue
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $paths = [
                'C:\xampp\php\extras\ssl\openssl.cnf',
                'C:\xampp\apache\conf\openssl.cnf'
            ];
            foreach ($paths as $path) {
                if (file_exists($path)) {
                    putenv("OPENSSL_CONF={$path}");
                    break;
                }
            }
        }

        try {
            $keys = VAPID::createVapidKeys();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal meng-generate VAPID Keys: ' . $e->getMessage() . '. Pastikan OpenSSL dikonfigurasi dengan benar di server Anda.');
        }
        
        $setting = NotificationSetting::firstOrCreate([]);
        $setting->update([
            'vapid_public_key' => $keys['publicKey'],
            'vapid_private_key' => $keys['privateKey'],
        ]);

        return redirect()->back()->with('success', 'VAPID Keys berhasil di-generate.');
    }

    public function storeSettings(Request $request)
    {
        $this->ensureCanManageNotifications();

        $request->validate([
            'morning_reminder_time' => 'required|string|max:10',
            'evening_reminder_time' => 'required|string|max:10',
            'marketing_report_time' => 'required|string|max:10',
            'days_active' => 'required|string|max:50'
        ]);

        $setting = NotificationSetting::firstOrCreate([]);
        $setting->update($request->only([
            'morning_reminder_time',
            'evening_reminder_time',
            'marketing_report_time',
            'days_active',
        ]));

        return redirect()->back()->with('success', 'Pengaturan notifikasi berhasil disimpan.');
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:2000',
            'keys' => 'nullable|array',
            'keys.auth' => 'nullable|string',
            'keys.p256dh' => 'nullable|string',
        ]);

        $endpoint = $validated['endpoint'];
        $token = $validated['keys']['auth'] ?? null;
        $key = $validated['keys']['p256dh'] ?? null;

        PushSubscription::updateOrCreate(
            ['endpoint' => $endpoint],
            ['user_id' => auth()->id(), 'public_key' => $key, 'auth_token' => $token]
        );

        return response()->json(['success' => true]);
    }

    public function markRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }
        return back();
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }

    public function getVapidPublicKey()
    {
        $setting = NotificationSetting::first();
        if ($setting && $setting->vapid_public_key) {
            return response()->json(['publicKey' => $setting->vapid_public_key]);
        }
        return response()->json(['publicKey' => null], 404);
    }
}
