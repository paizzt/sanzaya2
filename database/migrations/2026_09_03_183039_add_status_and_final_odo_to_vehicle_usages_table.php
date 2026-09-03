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
        Schema::table('vehicle_usages', function (Blueprint $table) {
            if (!Schema::hasColumn('vehicle_usages', 'status')) {
                $table->string('status')->default('completed')->after('gas_expense');
            }
            if (!Schema::hasColumn('vehicle_usages', 'final_odometer')) {
                $table->integer('final_odometer')->nullable()->after('last_odometer');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_usages', function (Blueprint $table) {
            $table->dropColumn(['status', 'final_odometer']);
        });
    }
};
