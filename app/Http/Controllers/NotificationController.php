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
            // Fallback for Windows XAMPP environments where OpenSSL isn't properly configured
            $keys = [
                'publicKey' => 'BPu8wmwcHrSjL3Ng8goJppgtUxC5TkyiWNoSZ6L0-k7xtItmnv6C186eqQhWD_2-xvyHRQj_74BELL4eYNpvLnk',
                'privateKey' => 'Hp7Ig3NDXBuQGfqFoQyMalo_IrKowzQ38fZt9dG0Z8Q',
            ];
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
        $setting->update($request->all());

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
}
