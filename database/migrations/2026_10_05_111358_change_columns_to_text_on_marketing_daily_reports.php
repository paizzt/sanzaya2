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
        Schema::table('marketing_daily_reports', function (Blueprint $table) {
            $table->text('visit_result')->nullable()->change();
            $table->text('competitor_notes')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketing_daily_reports', function (Blueprint $table) {
            $table->string('visit_result')->nullable()->change();
            $table->string('competitor_notes')->nullable()->change();
        });
    }
};
