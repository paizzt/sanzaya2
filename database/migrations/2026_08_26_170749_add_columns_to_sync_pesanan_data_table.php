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
            if (!Schema::hasColumn('sync_pesanan_data', 'nomor_klikkan')) {
                $table->string('nomor_klikkan')->nullable()->after('tanggal');
            }
            if (!Schema::hasColumn('sync_pesanan_data', 'harga_faktur')) {
                $table->string('harga_faktur')->nullable()->after('satuan');
            }
            if (!Schema::hasColumn('sync_pesanan_data', 'nominal_sdh_kirim')) {
                $table->string('nominal_sdh_kirim')->nullable()->after('belum_terkirim');
            }
            if (!Schema::hasColumn('sync_pesanan_data', 'nominal_blm_kirim')) {
                $table->string('nominal_blm_kirim')->nullable()->after('nominal_sdh_kirim');
            }
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
