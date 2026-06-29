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
        Schema::create('sync_piutang_data', function (Blueprint $table) {
            $table->id();
            $table->string('sheet_name')->nullable();
            $table->string('nama_outlet')->nullable();
            $table->string('tahun_1')->nullable();
            $table->string('tahun_2')->nullable();
            $table->string('tahun_3')->nullable();
            $table->string('tahun_4')->nullable();
            $table->string('total_sanzaya')->nullable();
            $table->string('ruma_1')->nullable();
            $table->string('ruma_2')->nullable();
            $table->string('ruma_3')->nullable();
            $table->string('total_ruma')->nullable();
            $table->string('total_gabungan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_piutang_data');
    }
};
