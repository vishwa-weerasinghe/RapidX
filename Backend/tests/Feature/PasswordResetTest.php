<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_send_reset_link_email()
    {
        // First we need a customer to satisfy the foreign key constraint
        $customer = Customer::create([
            'First_Name' => 'Test',
            'Last_Name' => 'User',
            'Email' => 'reset@example.com',
            'Phone_No' => '1234567890',
            'NIC' => '123456789V',
            'Country' => 'USA',
        ]);

        $user = User::create([
            'Email' => 'reset@example.com',
            'User_Name' => 'Test User',
            'Password' => bcrypt('oldpassword'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'Email' => 'reset@example.com',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Reset link sent to your email.']);
                 
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'reset@example.com',
        ]);
    }

    public function test_can_reset_password_with_valid_token()
    {
        $customer = Customer::create([
            'First_Name' => 'Test',
            'Last_Name' => 'User',
            'Email' => 'reset2@example.com',
            'Phone_No' => '1234567890',
            'NIC' => '123456789V',
            'Country' => 'USA',
        ]);

        $user = User::create([
            'Email' => 'reset2@example.com',
            'User_Name' => 'Test User',
            'Password' => bcrypt('oldpassword'),
            'Customer_ID' => $customer->Customer_ID,
        ]);

        // Generate a valid token
        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'Email' => 'reset2@example.com',
            'Password' => 'NewPassword@123',
            'Password_confirmation' => 'NewPassword@123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Password has been successfully reset.']);

        // Verify the password was actually changed in the database
        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword@123', $user->Password));
    }

    public function test_cannot_reset_password_with_invalid_token()
    {
        $response = $this->postJson('/api/reset-password', [
            'token' => 'invalid-token-string',
            'Email' => 'doesnotexist@example.com',
            'Password' => 'NewPassword@123',
            'Password_confirmation' => 'NewPassword@123',
        ]);

        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'Invalid token or email.']);
    }

    public function test_forgot_password_with_unregistered_email_returns_error()
    {
        $response = $this->postJson('/api/forgot-password', [
            'Email' => 'unregistered-person@example.com',
        ]);

        $response->assertStatus(404)
                 ->assertJson(['message' => 'We could not find a user with that email address.']);
    }

    public function test_reset_password_fails_validation_when_password_lacks_complexity()
    {
        // AUTH-11: Password must satisfy registration complexity rules
        $response = $this->postJson('/api/reset-password', [
            'token' => 'valid-or-dummy-token',
            'Email' => 'user@example.com',
            'Password' => 'password',
            'Password_confirmation' => 'password',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['Password']);
    }

    public function test_reset_password_fails_validation_when_confirmation_does_not_match()
    {
        $response = $this->postJson('/api/reset-password', [
            'token' => 'some-token',
            'Email' => 'user@example.com',
            'Password' => 'newpassword123',
            'Password_confirmation' => 'mismatchedpassword',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['Password']);
    }

    public function test_reset_password_fails_validation_when_password_too_short()
    {
        $response = $this->postJson('/api/reset-password', [
            'token' => 'some-token',
            'Email' => 'user@example.com',
            'Password' => 'short',
            'Password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['Password']);
    }
}
