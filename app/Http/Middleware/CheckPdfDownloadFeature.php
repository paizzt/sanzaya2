<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\FeatureToggle;

class CheckPdfDownloadFeature
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user) {
            $userIdStr = (string)$user->id;
            $features = FeatureToggle::whereRaw('LOWER(TRIM(name)) = ?', ['unduh pdf'])->get();
            foreach ($features as $feature) {
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                $disabledUserIds = array_map('strval', (array)$disabledUsers);
                if (in_array($userIdStr, $disabledUserIds, true)) {
                    abort(403, 'Akses unduh PDF dinonaktifkan untuk akun Anda.');
                }
            }
        }

        return $next($request);
    }
}
