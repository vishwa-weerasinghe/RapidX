<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace the package -> static blog link (blog_id) with a
     * self-referencing package -> package link (related_package_id).
     *
     * Blog pages are now associated with packages themselves, so selecting
     * a static blog from the package form no longer applies. Instead the
     * admin can relate a package to one of the existing packages.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->unsignedBigInteger('related_package_id')->nullable()->after('Image');

            $table->foreign('related_package_id')
                ->references('id')
                ->on('packages')
                ->nullOnDelete();

            $table->index('related_package_id');
        });

        if (Schema::hasColumn('packages', 'blog_id')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->dropColumn('blog_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropForeign(['related_package_id']);
            $table->dropColumn('related_package_id');
        });

        if (!Schema::hasColumn('packages', 'blog_id')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->unsignedBigInteger('blog_id')->nullable()->after('Image');
            });
        }
    }
};