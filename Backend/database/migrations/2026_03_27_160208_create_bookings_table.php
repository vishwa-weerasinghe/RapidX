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
            $table->decimal('Payment', 10, 2);
            $table->time('Pickup_Time');
            $table->string('Pickup_Location', 100);

            $table->integer('No_of_adults');
            $table->integer('No_of_child');

            // CUSTOMER (custom PK)
            $table->unsignedBigInteger('Customer_ID');
            $table->foreign('Customer_ID')
                ->references('Customer_ID')
                ->on('customers')
                ->onDelete('cascade');

            // PACKAGE (standard id)
            $table->unsignedBigInteger('Package_ID');
            $table->foreign('Package_ID')
                ->references('id')
                ->on('packages')
                ->onDelete('cascade');

            // VEHICLE (custom PK)
            $table->unsignedBigInteger('Vehicle_ID');
            $table->foreign('Vehicle_ID')
                ->references('Vehicle_ID')
                ->on('vehicles')
                ->onDelete('cascade');

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
