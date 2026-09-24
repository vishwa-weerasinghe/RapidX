<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The `Photos` column was originally appended to the already-released
     * 2026_03_19_152056_create_reviews_table migration. Because that migration
     * had already been executed on existing databases, those databases never
     * received the column, so saving a review with photos failed with
     * "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'Photos'".
     *
     * This migration adds the column to databases created before the change and
     * is a no-op on databases that already have it (for example a freshly
     * migrated database, where create_reviews_table already creates it).
     */
    public function up(): void
    {
        if (!Schema::hasTable('reviews') || Schema::hasColumn('reviews', 'Photos')) {
            return;
        }

        Schema::table('reviews', function (Blueprint $table) {
            // Up to 5 review photo URLs (each photo max 10MB, enforced at validation).
            $table->json('Photos')->nullable()->after('Description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('reviews') || !Schema::hasColumn('reviews', 'Photos')) {
            return;
        }

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn('Photos');
        });
    }
};
