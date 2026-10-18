<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->unsignedBigInteger('Driver_ID')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::table('vehicles')->whereNull('Driver_ID')->exists()) {
            throw new RuntimeException('Cannot make vehicles.Driver_ID required while unassigned vehicles exist.');
        }

        Schema::table('vehicles', function (Blueprint $table) {
            $table->unsignedBigInteger('Driver_ID')->nullable(false)->change();
        });
    }
};
