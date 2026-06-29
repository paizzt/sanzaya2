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
            $table->decimal('approved_gas_cost', 15, 2)->nullable()->after('estimated_gas_cost');
            $table->text('finance_note')->nullable()->after('approved_gas_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uc_requests', function (Blueprint $table) {
            $table->dropColumn(['approved_gas_cost', 'finance_note']);
        });
    }
};
