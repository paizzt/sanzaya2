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
            $table->string('activity_type')->nullable()->after('visit_time');
            $table->string('outlet_type')->nullable()->after('activity_type');
            $table->string('pic_name')->nullable()->after('outlet_id');
            $table->string('pic_position')->nullable()->after('pic_name');
            $table->string('pic_phone')->nullable()->after('pic_position');
            $table->string('outlet_status')->nullable()->after('pic_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketing_daily_reports', function (Blueprint $table) {
            $table->dropColumn([
                'activity_type',
                'outlet_type',
                'pic_name',
                'pic_position',
                'pic_phone',
                'outlet_status',
            ]);
        });
    }
};
