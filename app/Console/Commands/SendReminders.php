<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\NotificationSetting;
use App\Models\PushSubscription;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Carbon\Carbon;

class SendReminders extends Command
{
    protected $signature = 'app:send-reminders';
    protected $description = 'Kirim Web Push Notification untuk pengingat';

    public function handle()
    {
        $setting = NotificationSetting::first();
        if (!$setting || !$setting->vapid_public_key) return;

        $now = Carbon::now();
        $currentDay = $now->dayOfWeekIso; // 1 (Mon) - 7 (Sun)
        $currentTime = $now->format('H:i');

        $activeDays = explode(',', $setting->days_active);
        if (!in_array($currentDay, $activeDays)) return;

        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@sanzaya.local',
                'publicKey' => $setting->vapid_public_key,
                'privateKey' => $setting->vapid_private_key,
            ],
        ];

        $webPush = new WebPush($auth);
        $payload = null;

        if ($currentTime === $setting->morning_reminder_time) {
            $payload = json_encode(['title' => 'Pengingat Pagi', 'body' => 'Jangan lupa untuk melakukan Absensi Hadir Pagi ini.']);
        } elseif ($currentTime === $setting->evening_reminder_time) {
            $payload = json_encode(['title' => 'Pengingat Sore', 'body' => 'Saatnya Absensi Pulang! Tetap semangat.']);
        } elseif ($currentTime === $setting->marketing_report_time) {
            $payload = json_encode(['title' => 'Laporan Marketing', 'body' => 'Bagi tim Marketing, mohon segera mengisi Laporan Harian Anda hari ini.']);
        }

        if ($payload) {
            $subs = PushSubscription::all();
            foreach ($subs as $sub) {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                ]);
                $webPush->queueNotification($subscription, $payload);
            }
            $webPush->flush();
            $this->info("Notifications sent for $currentTime");
        } else {
            $this->info("No notification needed at $currentTime");
        }
    }
}
