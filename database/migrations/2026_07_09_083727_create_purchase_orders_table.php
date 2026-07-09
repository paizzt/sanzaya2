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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->nullable();
            $table->string('nama_outlet')->nullable();
            $table->string('nama_produk')->nullable();
            $table->integer('jumlah')->nullable();
            $table->string('satuan')->nullable();
            $table->decimal('total_faktur', 15, 2)->nullable();
            $table->integer('terkirim')->nullable();
            $table->integer('belum_terkirim')->nullable();
            $table->decimal('persen_terpenuhi', 5, 2)->nullable();
            $table->decimal('persen_belum_terpenuhi', 5, 2)->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
