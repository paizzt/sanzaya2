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
        Schema::table('receivables', function (Blueprint $table) {
            $table->dropColumn([
                'tahun_1', 'tahun_2', 'tahun_3', 'tahun_4',
                'total_sanzaya', 'ruma_1', 'ruma_2', 'ruma_3', 'total_ruma', 'total_gabungan'
            ]);
            $table->json('details')->nullable()->after('nama_outlet');
            $table->bigInteger('total')->default(0)->after('details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receivables', function (Blueprint $table) {
            $table->dropColumn(['details', 'total']);
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
        });
    }
};
