<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {

            $table->id('Booking_ID');

            $table->date('Booking_Date');
            $table->time('Pickup_Time');
            $table->string('Pickup_Location', 100);

            $table->integer('No_of_adults');
            $table->integer('No_of_child');

            $table->decimal('Payment', 10, 2)->default(0);

            // NEW: booking status (IMPORTANT)
            $table->string('Status')->default('Pending');

            // CUSTOMER
            $table->unsignedBigInteger('Customer_ID');
            $table->foreign('Customer_ID')->references('Customer_ID')->on('customers')->onDelete('cascade');

            // PACKAGE
            $table->unsignedBigInteger('Package_ID');
            $table->foreign('Package_ID')->references('id')->on('packages')->onDelete('cascade');

            // VEHICLE (nullable → assigned later by admin)
            $table->unsignedBigInteger('Vehicle_ID')->nullable();
            $table->foreign('Vehicle_ID')->references('Vehicle_ID')->on('vehicles')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
