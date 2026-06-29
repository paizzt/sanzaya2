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
        Schema::table('marketing_weekly_targets', function (Blueprint $table) {
            $table->json('target_outlets')->nullable()->after('target_transactions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketing_weekly_targets', function (Blueprint $table) {
            $table->dropColumn('target_outlets');
        });
    }
};
