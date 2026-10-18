<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Payment;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $payment;
    public $isAdminCopy;

    /**
     * Create a new message instance.
     */
    public function __construct(Payment $payment, bool $isAdminCopy = false)
    {
        $this->payment = $payment;
        $this->isAdminCopy = $isAdminCopy;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $prefix = $this->isAdminCopy ? '[ADMIN NOTIFICATION] ' : '';
        $subjectTitle = ($this->payment->payment_method === 'Pay Later')
            ? ($this->isAdminCopy ? 'New Pay Later Booking - Order #' : 'Safari Reservation (Pay Later) - Order #')
            : 'Booking Confirmation - Order #';

        return new Envelope(
            subject: $prefix . $subjectTitle . $this->payment->order_id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.booking.confirmation',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
