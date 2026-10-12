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
            $feature = FeatureToggle::where('name', 'Unduh PDF')->first();
            if ($feature) {
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                if (in_array($user->id, $disabledUsers)) {
                    abort(403, 'Akses unduh PDF dinonaktifkan untuk akun Anda.');
                }
            }
        }

        return $next($request);
    }
}
