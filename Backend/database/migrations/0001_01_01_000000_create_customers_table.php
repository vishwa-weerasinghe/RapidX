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
        Schema::create('customers', function (Blueprint $table) {
            $table->id('Customer_ID');   
            $table->string('First_Name',50);
            $table->string('Last_Name',50);
            $table->string('Customer_Type',30)->default('Member');
            $table->string('Email',100);
            $table->string('Phone_No',20);
            $table->string('NIC',20);
            $table->string('Country',50);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
