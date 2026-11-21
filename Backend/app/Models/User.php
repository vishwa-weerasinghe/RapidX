<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Auth\Passwords\CanResetPassword;

class User extends Authenticatable implements CanResetPasswordContract
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $primaryKey = 'Member_ID';

    public $incrementing = true;

    protected $fillable = [
        'User_Name',
        'Email',
        'Password',
        'role',
        'Status',
        'Customer_ID',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'Password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */

    public function getAuthPassword()
    {
        return $this->Password;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    public function getEmailForPasswordReset()
    {
        return $this->Email;
    }

    /**
     * Send the password reset notification using BrevoMailService and ResetPasswordMail.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        try {
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
            $resetUrl = $frontendUrl . '/password-reset/' . $token . '?email=' . urlencode($this->Email);
            $expireMinutes = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);

            $htmlContent = (new \App\Mail\ResetPasswordMail($this, $resetUrl, $expireMinutes))->render();

            try {
                \App\Services\BrevoMailService::send(
                    $this->Email,
                    'Reset Your Password - Minneriya Wild Jeep Safari',
                    $htmlContent,
                    $this->User_Name ?? 'Valued Customer'
                );
            } catch (\Exception $be) {
                \Illuminate\Support\Facades\Log::warning('Brevo send failed in sendPasswordResetNotification, falling back to Mail: ' . $be->getMessage());
                \Illuminate\Support\Facades\Mail::to($this->Email)->send(
                    new \App\Mail\ResetPasswordMail($this, $resetUrl, $expireMinutes)
                );
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('sendPasswordResetNotification failed: ' . $e->getMessage());
        }
    }
}
