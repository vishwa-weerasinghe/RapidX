<?php

namespace Tests\Feature;

use App\Mail\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name'    => 'John Doe',
            'email'   => 'john@example.com',
            'phone'   => '0771234567',
            'subject' => 'Safari Inquiry',
            'message' => 'I would like to book a safari for next month.',
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // Happy path
    // -------------------------------------------------------------------------

    public function test_contact_form_sends_email_and_returns_success(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload());

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Your message has been sent successfully!',
            ]);

        Mail::assertQueued(ContactMessage::class, function (ContactMessage $mail) {
            return $mail->contactData['email']   === 'john@example.com'
                && $mail->contactData['name']    === 'John Doe'
                && $mail->contactData['subject'] === 'Safari Inquiry';
        });
    }

    public function test_contact_form_succeeds_without_optional_phone_field(): void
    {
        Mail::fake();

        $payload = $this->validPayload();
        unset($payload['phone']);

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        Mail::assertQueued(ContactMessage::class);
    }

    public function test_contact_form_sends_exactly_one_email_per_submission(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', $this->validPayload())->assertStatus(200);

        Mail::assertQueuedCount(1);
    }

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    public function test_contact_form_returns_422_when_required_fields_are_missing(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);

        Mail::assertNothingSent();
    }

    public function test_contact_form_returns_validation_error_for_invalid_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload([
            'email' => 'not-an-email',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        Mail::assertNothingSent();
    }

    public function test_contact_form_returns_validation_error_when_name_is_too_long(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload([
            'name' => str_repeat('A', 101),
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);

        Mail::assertNothingSent();
    }

    public function test_contact_form_returns_validation_error_when_subject_is_too_long(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload([
            'subject' => str_repeat('S', 101),
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject']);

        Mail::assertNothingSent();
    }

    public function test_contact_form_returns_validation_error_when_message_is_too_long(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload([
            'message' => str_repeat('M', 5001),
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);

        Mail::assertNothingSent();
    }

    public function test_contact_form_accepts_boundary_length_message(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/contact', $this->validPayload([
            'message' => str_repeat('M', 5000),
        ]));

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        Mail::assertQueued(ContactMessage::class);
    }

    public function test_contact_form_does_not_queue_email_when_validation_fails(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', ['name' => '', 'email' => '', 'subject' => '', 'message' => '']);

        Mail::assertNothingQueued();
    }
}
