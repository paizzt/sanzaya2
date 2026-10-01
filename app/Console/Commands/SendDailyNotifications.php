<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Attendance;
use App\Models\MarketingDailyReport;
use App\Services\NotificationService;
use Carbon\Carbon;

class SendDailyNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sanzaya:daily-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily notification summaries for Attendance and Marketing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->format('Y-m-d');
        
        // 1. Absensi (Check who has not clocked in today)
        // Only active users who are not superadmin maybe? Or just all active users
        $allActiveUsers = User::where('is_active', true)->get();
        $usersClockedIn = Attendance::where('date', $today)->pluck('user_id')->toArray();
        
        $notClockedInNames = [];
        foreach ($allActiveUsers as $user) {
            // Optional: You could filter out Superadmins or specific roles here
            if (!in_array($user->id, $usersClockedIn)) {
                $notClockedInNames[] = $user->name;
            }
        }
        
        if (count($notClockedInNames) > 0) {
            $msg = "Ada " . count($notClockedInNames) . " pegawai yang belum absen masuk hari ini:\n" . implode(', ', array_slice($notClockedInNames, 0, 5));
            if (count($notClockedInNames) > 5) {
                $msg .= " dan lainnya.";
            }
            
            NotificationService::notifyFeatureUsers(
                'Rekap Absensi', 
                'Laporan Absensi Pagi', 
                $msg,
                route('absensi.rekap') // Ensure this route name is correct, usually they are defined in web.php
            );
            $this->info("Attendance notifications sent.");
        }

        // 2. Marketing (Summary of reports today)
        // Usually, marketing summary at 9 AM might be empty for today, but maybe they mean for yesterday?
        // Or if this runs at 9 PM? The user didn't specify. Let's summarize today's reports so far.
        $reportsToday = MarketingDailyReport::where('visit_date', $today)->count();
        $reportersToday = MarketingDailyReport::where('visit_date', $today)->distinct('user_id')->count('user_id');
        
        if ($reportsToday > 0) {
            $msg = "Total $reportsToday laporan marketing telah masuk dari $reportersToday sales hari ini.";
        } else {
            $msg = "Belum ada laporan marketing yang masuk hari ini.";
        }
        
        NotificationService::notifyFeatureUsers(
            'Rekap Marketing', 
            'Ringkasan Laporan Marketing', 
            $msg,
            route('marketing.recap.index')
        );
        $this->info("Marketing notifications sent.");
        
        return Command::SUCCESS;
    }
}
