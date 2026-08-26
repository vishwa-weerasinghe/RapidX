<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->boolean('Customer_Seen')->default(true)->after('Admin_Message');
            $table->text('Customer_Message')->nullable()->after('Customer_Seen');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['Customer_Seen', 'Customer_Message']);
        });
    }
};