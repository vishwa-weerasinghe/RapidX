<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('Member_ID');
            $table->string('User_Name',50);
            $table->string('Password',100);
            $table->string('Role',30);
            $table->string('Email',100);
            $table->string('Status',20);

            $table->unsignedBigInteger('Customer_ID'); // <- match BIGINT UNSIGNED

            $table->timestamps();

            $table->foreign('Customer_ID')
                  ->references('Customer_ID')
                  ->on('customers')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};