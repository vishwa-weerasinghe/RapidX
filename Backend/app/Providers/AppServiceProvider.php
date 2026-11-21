<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function ($user, string $token) {
            $origin = request()->input('origin') ?: request()->header('Origin') ?: request()->header('Referer');
            $frontendUrl = null;
            if ($origin) {
                if (!preg_match('~^https?://~i', $origin)) {
                    $origin = 'http://' . $origin;
                }
                $parsed = parse_url($origin);
                if (!empty($parsed['host'])) {
                    $scheme = !empty($parsed['scheme']) ? $parsed['scheme'] : 'http';
                    $port = !empty($parsed['port']) ? ':' . $parsed['port'] : '';
                    $frontendUrl = $scheme . '://' . $parsed['host'] . $port;
                }
            }
            if (empty($frontendUrl)) {
                $frontendUrl = env('FRONTEND_URL') ?: config('app.frontend_url');
            }
            if (empty($frontendUrl)) {
                $frontendUrl = app()->environment('production')
                    ? 'https://www.minneriyawildjeepsafari.com'
                    : 'http://localhost:5173';
            }
            $frontendUrl = rtrim($frontendUrl, '/');
            return $frontendUrl . '/password-reset/' . $token . '?email=' . urlencode($user->getEmailForPasswordReset());
        });
    }
}
