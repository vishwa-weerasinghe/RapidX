<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ContactMessage extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public array $contactData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $contactData)
    {
        $this->contactData = $contactData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $senderName = $this->contactData['name'] ?? 'Wild Safari Visitor';
        $senderEmail = $this->contactData['email'] ?? 'no-reply@wildsafari.com';
        
        // Most SMTP providers (Gmail, Brevo, Mailgun, etc.) reject emails if 'from' is not the authenticated sender.
        // Use system address for 'from' and set user's email as 'replyTo'.
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name', 'Wild Jeep Safari')),
            replyTo: [new Address($senderEmail, $senderName)],
            subject: 'New Safari Booking System Inquiry: ' . ($this->contactData['subject'] ?? 'General'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact',
            with: [
                'name' => $this->contactData['name'] ?? 'Anonymous',
                'email' => $this->contactData['email'] ?? 'No email provided',
                'phone' => $this->contactData['phone'] ?? 'N/A',
                'subject' => $this->contactData['subject'] ?? 'N/A',
                'bodyMessage' => $this->contactData['message'] ?? '',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
