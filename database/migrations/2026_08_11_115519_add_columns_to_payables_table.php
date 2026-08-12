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
        Schema::table('payables', function (Blueprint $table) {
            $table->date('tanggal_terima_invoice')->nullable();
            $table->string('nomor_transaksi')->nullable();
            $table->text('memo')->nullable();
            $table->integer('jatuh_tempo_hari')->nullable(); // 14 or 30
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payables', function (Blueprint $table) {
            $table->dropColumn([
                'tanggal_terima_invoice',
                'nomor_transaksi',
                'memo',
                'jatuh_tempo_hari'
            ]);
        });
    }
};
