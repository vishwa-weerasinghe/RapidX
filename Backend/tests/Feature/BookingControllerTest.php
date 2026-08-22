<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (!Schema::hasColumn('packages', 'Package_ID')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->unsignedBigInteger('Package_ID')->nullable()->after('id');
            });
        }

        DB::table('packages')->update(['Package_ID' => DB::raw('id')]);
    }

    protected function createCustomer(array $overrides = []): Customer
    {
        return Customer::create(array_merge([
            'First_Name' => 'Test',
            'Last_Name' => 'Customer',
            'Email' => fake()->unique()->safeEmail(),
            'Phone_No' => '0771234567',
            'NIC' => '123456789V',
            'Country' => 'Sri Lanka',
        ], $overrides));
    }

    protected function createPackage(): Package
    {
        $package = Package::create([
            'Package_Name' => 'City Tour',
            'Description' => 'A sample package',
            'Price_for_adult' => 1000,
            'Price_for_child' => 500,
        ]);

        DB::table('packages')->where('id', $package->id)->update(['Package_ID' => $package->id]);

        return $package;
    }

    protected function createBooking(?int $customerId = null, ?int $packageId = null): Booking
    {
        return Booking::create([
            'Booking_Date' => '2026-07-10',
            'Pickup_Time' => '10:00:00',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Payment' => 1500,
            'Status' => 'Pending',
            'Customer_ID' => $customerId ?? $this->createCustomer()->Customer_ID,
            'Package_ID' => $packageId ?? $this->createPackage()->id,
            'Vehicle_ID' => null,
        ]);
    }

    public function test_index_returns_bookings_successfully(): void
    {
        $customer = $this->createCustomer();
        $package = $this->createPackage();

        Booking::create([
            'Booking_Date' => '2026-07-11',
            'Pickup_Time' => '09:30:00',
            'Pickup_Location' => 'Kandy',
            'No_of_adults' => 1,
            'No_of_child' => 0,
            'Payment' => 1000,
            'Status' => 'Pending',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
        ]);

        $response = $this->getJson('/api/bookings');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Pickup_Location' => 'Kandy']);

        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_user_bookings_returns_only_the_requested_customers_bookings(): void
    {
        $firstCustomer = $this->createCustomer(['Email' => 'first@example.com']);
        $secondCustomer = $this->createCustomer(['Email' => 'second@example.com']);
        $package = $this->createPackage();

        Booking::create([
            'Booking_Date' => '2026-07-12',
            'Pickup_Time' => '11:00:00',
            'Pickup_Location' => 'Galle',
            'No_of_adults' => 2,
            'No_of_child' => 0,
            'Payment' => 2000,
            'Status' => 'Pending',
            'Customer_ID' => $firstCustomer->Customer_ID,
            'Package_ID' => $package->id,
        ]);

        Booking::create([
            'Booking_Date' => '2026-07-13',
            'Pickup_Time' => '12:00:00',
            'Pickup_Location' => 'Jaffna',
            'No_of_adults' => 1,
            'No_of_child' => 1,
            'Payment' => 1500,
            'Status' => 'Confirmed',
            'Customer_ID' => $secondCustomer->Customer_ID,
            'Package_ID' => $package->id,
        ]);

        $response = $this->getJson('/api/user-bookings/' . $firstCustomer->Customer_ID);

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['Pickup_Location' => 'Galle']);
    }

    public function test_booking_can_be_created_and_persisted_in_database(): void
    {
        $customer = $this->createCustomer();
        $package = $this->createPackage();

        $response = $this->postJson('/api/bookings', [
            'Booking_Date' => '2026-07-14',
            'Pickup_Time' => '13:00:00',
            'Area' => 'Habarana',
            'Pickup_Location' => 'Negombo',
            'No_of_adults' => 3,
            'No_of_child' => 2,
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Booking created successfully')
            ->assertJsonPath('booking.Pickup_Location', 'Negombo');

        $this->assertDatabaseHas('bookings', [
            'Pickup_Location' => 'Negombo',
            'Customer_ID' => $customer->Customer_ID,
            'Package_ID' => $package->id,
            'Status' => 'pending',
            'Vehicle_ID' => null,
        ]);
    }

    public function test_guest_booking_can_be_created_without_existing_customer_id(): void
    {
        $package = $this->createPackage();

        $response = $this->postJson('/api/bookings', [
            'Booking_Date' => '2026-07-15',
            'Pickup_Time' => '14:00:00',
            'Area' => 'Sigiriya',
            'Pickup_Location' => 'Ella',
            'No_of_adults' => 2,
            'No_of_child' => 1,
            'Package_ID' => $package->id,
            'First_Name' => 'Guest',
            'Last_Name' => 'User',
            'Email' => 'guest@example.com',
            'Phone_No' => '0712345678',
            'NIC' => '987654321V',
            'Country' => 'Sri Lanka',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Booking created successfully');

        $this->assertDatabaseHas('customers', [
            'Email' => 'guest@example.com',
            'Phone_No' => '0712345678',
        ]);

        $this->assertDatabaseHas('bookings', [
            'Pickup_Location' => 'Ella',
            'Package_ID' => $package->id,
            'Status' => 'Confirmed',
        ]);
    }

    public function test_store_returns_validation_errors_for_missing_required_fields(): void
    {
        $response = $this->postJson('/api/bookings', [
            'Booking_Date' => '',
            'Pickup_Time' => '',
            'Area' => '',
            'Pickup_Location' => '',
            'No_of_adults' => '',
            'No_of_child' => '',
            'Customer_ID' => '',
            'Package_ID' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Booking_Date', 'Pickup_Time', 'Area', 'Pickup_Location', 'No_of_adults', 'No_of_child', 'Package_ID']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_store_returns_validation_errors_for_invalid_input(): void
    {
        $response = $this->postJson('/api/bookings', [
            'Booking_Date' => 'not-a-date',
            'Pickup_Time' => '10:00:00',
            'Area' => 'Dambulla',
            'Pickup_Location' => 'Colombo',
            'No_of_adults' => 'three',
            'No_of_child' => 1,
            'Customer_ID' => 1,
            'Package_ID' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['Booking_Date', 'No_of_adults']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_show_returns_a_single_booking(): void
    {
        $booking = $this->createBooking();

        $response = $this->getJson('/api/bookings/' . $booking->Booking_ID);

        $response->assertStatus(200)
            ->assertJsonPath('Booking_ID', $booking->Booking_ID)
            ->assertJsonPath('Pickup_Location', 'Colombo');
    }

    public function test_update_booking_changes_existing_values_and_persists_them(): void
    {
        $booking = $this->createBooking();

        $response = $this->putJson('/api/bookings/' . $booking->Booking_ID, [
            'Pickup_Location' => 'Matara',
            'Payment' => 2500,
            'Status' => 'Confirmed',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Booking updated successfully')
            ->assertJsonPath('booking.Pickup_Location', 'Matara');

        $this->assertDatabaseHas('bookings', [
            'Booking_ID' => $booking->Booking_ID,
            'Pickup_Location' => 'Matara',
            'Payment' => '2500.00',
            'Status' => 'Confirmed',
        ]);
    }

    public function test_destroy_deletes_the_booking_from_the_database(): void
    {
        $booking = $this->createBooking();

        $response = $this->deleteJson('/api/bookings/' . $booking->Booking_ID);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Booking deleted successfully']);

        $this->assertDatabaseMissing('bookings', ['Booking_ID' => $booking->Booking_ID]);
    }
}
