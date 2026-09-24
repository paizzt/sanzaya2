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
        Schema::table('warehouse_stocks', function (Blueprint $table) {
            $table->date('incoming_date')->nullable();
            $table->date('po_date')->nullable();
            $table->foreignId('provider_id')->nullable()->constrained('providers')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouse_stocks', function (Blueprint $table) {
            $table->dropForeign(['provider_id']);
            $table->dropColumn(['incoming_date', 'po_date', 'provider_id']);
        });
    }
};
