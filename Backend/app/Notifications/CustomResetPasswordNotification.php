<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class CustomResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * The password reset token.
     *
     * @var string
     */
    public $token;

    /**
     * Create a notification instance.
     *
     * @param  string  $token
     * @return void
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's channels.
     *
     * @param  mixed  $notifiable
     * @return array|string
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $email = $notifiable->getEmailForPasswordReset();

        // Determine frontend SPA URL
        $frontendUrl = config('app.frontend_url') ?: env('FRONTEND_URL');

        if (empty($frontendUrl)) {
            $origin = request()->header('Origin') ?: request()->header('Referer');
            if ($origin) {
                $parsed = parse_url($origin);
                if (isset($parsed['scheme']) && isset($parsed['host'])) {
                    $frontendUrl = $parsed['scheme'] . '://' . $parsed['host'] . (isset($parsed['port']) ? ':' . $parsed['port'] : '');
                }
            }
        }

        if (empty($frontendUrl)) {
            $frontendUrl = 'http://localhost:5173';
        }

        $frontendUrl = rtrim($frontendUrl, '/');
        $resetUrl = $frontendUrl . '/password-reset/' . $this->token . '?email=' . urlencode($email);

        $expireMinutes = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);

        return (new MailMessage)
            ->subject('Reset Your Password - Minneriya Wild Jeep Safari')
            ->view('emails.reset_password', [
                'resetUrl' => $resetUrl,
                'user' => $notifiable,
                'email' => $email,
                'expireMinutes' => $expireMinutes,
            ]);
    }
}
