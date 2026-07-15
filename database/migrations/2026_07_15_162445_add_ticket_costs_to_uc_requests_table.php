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
            $table->decimal('flight_ticket_cost', 15, 2)->nullable();
            $table->decimal('ship_ticket_cost', 15, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uc_requests', function (Blueprint $table) {
            $table->dropColumn(['flight_ticket_cost', 'ship_ticket_cost']);
        });
    }
};
