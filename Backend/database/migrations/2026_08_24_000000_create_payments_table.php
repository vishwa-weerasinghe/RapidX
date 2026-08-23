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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('Payment_ID');
            $table->string('order_id', 100)->unique();
            $table->unsignedBigInteger('Customer_ID');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('payment_method', 50)->nullable();
            $table->string('status', 30)->default('Pending');
            $table->string('payhere_payment_id', 100)->nullable();
            $table->integer('status_code')->nullable();
            $table->text('status_message')->nullable();
            $table->string('card_holder_name', 100)->nullable();
            $table->string('card_no', 30)->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();

            $table->foreign('Customer_ID')->references('Customer_ID')->on('customers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
