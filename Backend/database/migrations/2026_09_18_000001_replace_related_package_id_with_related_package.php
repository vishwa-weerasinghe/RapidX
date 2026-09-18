<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The admin selects one of the static blog packages (15 hard-coded
     * offers inside the blog pages) from the package form, so store the
     * selected static package name instead of a self-referencing FK.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropForeign(['related_package_id']);
            $table->dropIndex(['related_package_id']);
            $table->dropColumn('related_package_id');

            $table->string('related_package')->nullable()->after('Image');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('related_package');

            $table->unsignedBigInteger('related_package_id')->nullable()->after('Image');
            $table->foreign('related_package_id')
                ->references('id')
                ->on('packages')
                ->nullOnDelete();
            $table->index('related_package_id');
        });
    }
};