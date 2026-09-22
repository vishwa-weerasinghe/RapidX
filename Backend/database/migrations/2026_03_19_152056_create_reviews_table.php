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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id('Review_ID');   
            $table->unsignedInteger('Rate');
            $table->text('Description');
            // Stores up to 5 review photo URLs (each photo max 10MB, enforced at validation).
            $table->json('Photos')->nullable();
            $table->unsignedBigInteger('Customer_ID');

            $table->foreign('Customer_ID')
                  ->references('Customer_ID')
                  ->on('customers')
                  ->onDelete('cascade');
        });;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
