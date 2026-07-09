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
        Schema::create('receivables', function (Blueprint $table) {
            $table->id();
            $table->string('nama_outlet')->nullable();
            $table->decimal('tahun_1', 15, 2)->nullable();
            $table->decimal('tahun_2', 15, 2)->nullable();
            $table->decimal('tahun_3', 15, 2)->nullable();
            $table->decimal('tahun_4', 15, 2)->nullable();
            $table->decimal('total_sanzaya', 15, 2)->nullable();
            $table->decimal('ruma_1', 15, 2)->nullable();
            $table->decimal('ruma_2', 15, 2)->nullable();
            $table->decimal('ruma_3', 15, 2)->nullable();
            $table->decimal('total_ruma', 15, 2)->nullable();
            $table->decimal('total_gabungan', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receivables');
    }
};
