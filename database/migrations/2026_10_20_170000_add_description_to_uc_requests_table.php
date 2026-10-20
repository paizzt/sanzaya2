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
        Schema::table('uc_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('uc_requests', 'description')) {
                $table->text('description')->nullable()->after('destination_city');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uc_requests', function (Blueprint $table) {
            if (Schema::hasColumn('uc_requests', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};
