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
            $table->decimal('estimated_meals_cost', 15, 2)->nullable()->after('estimated_gas_cost');
            $table->decimal('estimated_accommodation_cost', 15, 2)->nullable()->after('estimated_meals_cost');
            $table->decimal('approved_meals_cost', 15, 2)->nullable()->after('approved_gas_cost');
            $table->decimal('approved_accommodation_cost', 15, 2)->nullable()->after('approved_meals_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uc_requests', function (Blueprint $table) {
            $table->dropColumn([
                'estimated_meals_cost',
                'estimated_accommodation_cost',
                'approved_meals_cost',
                'approved_accommodation_cost',
            ]);
        });
    }
};
