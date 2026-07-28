<?php
namespace App\Http\Controllers;

use App\Models\NotificationSetting;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Minishlink\WebPush\VAPID;

class NotificationController extends Controller
{
    public function index()
    {
        $setting = NotificationSetting::first();
        if (!$setting) {
            $setting = NotificationSetting::create([]);
        }

        return Inertia::render('Settings/Notifications', [
            'setting' => $setting
        ]);
    }

    public function generateVapid()
    {
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
            return redirect()->back()->withErrors(['error' => 'Gagal meng-generate VAPID Keys: ' . $e->getMessage() . '. Pastikan OpenSSL dikonfigurasi dengan benar di server Anda.']);
        }
        
        $setting = NotificationSetting::first();
        $setting->update([
            'vapid_public_key' => $keys['publicKey'],
            'vapid_private_key' => $keys['privateKey'],
        ]);

        return redirect()->back()->with('success', 'VAPID Keys berhasil di-generate.');
    }

    public function storeSettings(Request $request)
    {
        $request->validate([
            'morning_reminder_time' => 'required',
            'evening_reminder_time' => 'required',
            'marketing_report_time' => 'required',
            'days_active' => 'required'
        ]);

        $setting = NotificationSetting::first();
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
        $endpoint = $request->endpoint;
        $token = $request->keys['auth'] ?? null;
        $key = $request->keys['p256dh'] ?? null;

        if ($endpoint) {
            PushSubscription::updateOrCreate(
                ['endpoint' => $endpoint, 'user_id' => auth()->id()],
                ['public_key' => $key, 'auth_token' => $token]
            );
        }

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
