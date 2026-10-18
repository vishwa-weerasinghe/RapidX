<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedTinyInteger('Refund_Percentage')->nullable()->after('Payment');
            $table->timestamp('Cancelled_At')->nullable()->after('Refund_Percentage');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['Refund_Percentage', 'Cancelled_At']);
        });
    }
};
