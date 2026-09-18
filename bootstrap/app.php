<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->header('X-Inertia')) {
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface && $e->getStatusCode() === 403) {
                    $fallback = $request->header('referer') ? redirect()->back() : redirect()->route('dashboard');
                    return $fallback->with('error', '403 - Akses ditolak. Anda tidak memiliki izin untuk halaman ini.');
                }
                if ($e instanceof \Illuminate\Session\TokenMismatchException || (method_exists($e, 'getStatusCode') && $e->getStatusCode() === 419)) {
                    return \Inertia\Inertia::location(route('login'));
                }
            }
        });
    })->create();
