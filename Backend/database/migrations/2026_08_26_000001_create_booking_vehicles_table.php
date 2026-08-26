<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_vehicles', function (Blueprint $table) {
            $table->unsignedBigInteger('Booking_ID');
            $table->unsignedBigInteger('Vehicle_ID');

            $table->primary(['Booking_ID', 'Vehicle_ID']);

            $table->foreign('Booking_ID')
                ->references('Booking_ID')
                ->on('bookings')
                ->onDelete('cascade');

            $table->foreign('Vehicle_ID')
                ->references('Vehicle_ID')
                ->on('vehicles')
                ->onDelete('cascade');
        });

        // Carry over any previously assigned single vehicle into the new pivot
        // table so existing assignments remain visible after the upgrade.
        $legacyAssignments = DB::table('bookings')
            ->whereNotNull('Vehicle_ID')
            ->pluck('Vehicle_ID', 'Booking_ID');

        foreach ($legacyAssignments as $bookingId => $vehicleId) {
            DB::table('booking_vehicles')->insert([
                'Booking_ID' => $bookingId,
                'Vehicle_ID' => $vehicleId,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_vehicles');
    }
};