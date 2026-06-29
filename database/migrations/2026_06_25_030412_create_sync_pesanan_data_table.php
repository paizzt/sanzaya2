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
        Schema::create('sync_pesanan_data', function (Blueprint $table) {
            $table->id();
            $table->string('sheet_name')->nullable();
            $table->string('tanggal')->nullable();
            $table->string('nama_outlet')->nullable();
            $table->string('nama_produk')->nullable();
            $table->string('jumlah')->nullable();
            $table->string('satuan')->nullable();
            $table->string('total_faktur')->nullable();
            $table->string('terkirim')->nullable();
            $table->string('belum_terkirim')->nullable();
            $table->string('persen_terpenuhi')->nullable();
            $table->string('persen_belum_terpenuhi')->nullable();
            $table->string('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_pesanan_data');
    }
};
