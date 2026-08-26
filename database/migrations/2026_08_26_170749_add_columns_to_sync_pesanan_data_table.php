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
        Schema::table('sync_pesanan_data', function (Blueprint $table) {
            $table->string('nomor_klikkan')->nullable()->after('tanggal');
            $table->string('harga_faktur')->nullable()->after('satuan');
            $table->string('nominal_sdh_kirim')->nullable()->after('belum_terkirim');
            $table->string('nominal_blm_kirim')->nullable()->after('nominal_sdh_kirim');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sync_pesanan_data', function (Blueprint $table) {
            $table->dropColumn(['nomor_klikkan', 'harga_faktur', 'nominal_sdh_kirim', 'nominal_blm_kirim']);
        });
    }
};
