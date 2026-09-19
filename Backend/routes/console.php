<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {email?}', function ($email = null) {
    $recipient = $email ?? config('mail.from.address');
    $this->info("==========================================");
    $this->info(" Safari Booking System - Mail Diagnostics");
    $this->info("==========================================");
    $this->line("• Mail Driver   : " . config('mail.default'));
    $this->line("• Host          : " . config('mail.mailers.smtp.host', 'N/A'));
    $this->line("• Port          : " . config('mail.mailers.smtp.port', 'N/A'));
    $this->line("• From Address  : " . config('mail.from.address', 'N/A'));
    $this->line("• From Name     : " . config('mail.from.name', 'N/A'));
    $this->line("• Target Recipient: " . $recipient);
    $this->info("------------------------------------------");

    if (config('mail.default') === 'log') {
        $this->warn("⚠️ Warning: MAIL_MAILER is set to 'log'. The email will be saved in storage/logs/laravel.log instead of actually sending over SMTP.");
    }

    $this->line("Attempting to send test email...");

    try {
        \Illuminate\Support\Facades\Mail::raw("Hello! This is a test email from your Safari Booking System application.\n\nSent at: " . now()->toDateTimeString(), function ($message) use ($recipient) {
            $message->to($recipient)
                    ->subject("Safari Booking System - Test Email (" . now()->format('Y-m-d H:i') . ")");
        });

        $this->info("✅ SUCCESS: Email sent without errors!");
        if (config('mail.default') === 'log') {
            $this->comment("Check storage/logs/laravel.log to see the logged email content.");
        } else {
            $this->comment("Check the inbox and spam folder of: {$recipient}");
        }
    } catch (\Throwable $e) {
        $this->error("❌ FAILED: Could not send email.");
        $this->error("Error message: " . $e->getMessage());
    }
})->purpose('Send a test email to verify mail delivery settings');

