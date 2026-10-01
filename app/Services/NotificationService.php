<?php

namespace App\Services;

use App\Models\User;
use App\Models\FeatureToggle;
use App\Notifications\GeneralAppNotification;

class NotificationService
{
    /**
     * Send a notification to all users who have a specific feature enabled.
     *
     * @param string $featureName The exact name of the feature (e.g. 'Rekap Absensi', 'Rekap Marketing')
     * @param string $title Notification title
     * @param string $message Notification body message
     * @param string|null $url Optional URL to redirect to
     */
    public static function notifyFeatureUsers($featureName, $title, $message, $url = null)
    {
        // Find the feature by name
        $feature = FeatureToggle::where('name', $featureName)->first();
        
        if (!$feature) {
            return; // Feature not found
        }
        
        $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
        
        // Find users who are NOT in the disabled list
        // Note: We only send to active users
        $users = User::where('is_active', true)
            ->whereNotIn('id', $disabledUsers)
            ->get();
            
        foreach ($users as $user) {
            $user->notify(new GeneralAppNotification($title, $message, $url));
        }
    }
}
