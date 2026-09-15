<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace the legacy two-column package pricing (Price_for_adult /
     * Price_for_child) with three separate columns:
     *   - price_one_adult  (exactly one adult)
     *   - price_more_adult (per adult when more than one)
     *   - price_child      (per child)
     *
     * Fresh installs already have the new schema from the base
     * packages migration, so every step below is guarded.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('packages', 'price_one_adult')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->decimal('price_one_adult', 10, 2)->default(0)->after('Description');
                $table->decimal('price_more_adult', 10, 2)->default(0)->after('price_one_adult');
                $table->decimal('price_child', 10, 2)->default(0)->after('price_more_adult');
            });
        }

        // Backfill from the legacy columns so no pricing data is lost.
        if (Schema::hasColumn('packages', 'Price_for_adult')) {
            DB::table('packages')->update([
                'price_one_adult'  => DB::raw('`Price_for_adult`'),
                'price_more_adult' => DB::raw('`Price_for_adult`'),
                'price_child'      => DB::raw('`Price_for_child`'),
            ]);

            Schema::table('packages', function (Blueprint $table) {
                $table->dropColumn(['Price_for_adult', 'Price_for_child']);
            });
        }
    }

    /**
     * Reverse the migration: restore the legacy columns and map the
     * "per adult when more than one" rate back into Price_for_adult.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('packages', 'Price_for_adult')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->decimal('Price_for_adult', 10, 2)->default(0)->after('Description');
                $table->decimal('Price_for_child', 10, 2)->default(0)->after('Price_for_adult');
            });
        }

        if (Schema::hasColumn('packages', 'price_one_adult')) {
            DB::table('packages')->update([
                'Price_for_adult' => DB::raw('`price_more_adult`'),
                'Price_for_child' => DB::raw('`price_child`'),
            ]);

            Schema::table('packages', function (Blueprint $table) {
                $table->dropColumn(['price_one_adult', 'price_more_adult', 'price_child']);
            });
        }
    }
};