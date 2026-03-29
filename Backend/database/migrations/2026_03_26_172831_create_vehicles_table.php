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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id('Vehicle_ID');
            $table->string('Vehicle_No',20);
            $table->string('Vehicle_Type',50);
            $table->unsignedBigInteger('No_of_Seats');
            $table->unsignedBigInteger('Driver_ID');

            $table->foreign('Driver_ID')
                  ->references('Driver_ID')
                  ->on('drivers')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
