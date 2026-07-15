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
        Schema::table('users', function (Blueprint $table) {
            $table->index('division_id');
            $table->index('position_id');
            $table->index('company_id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('created_at');
        });

        Schema::table('marketing_daily_reports', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('outlet_id');
            $table->index('visit_date');
        });

        Schema::table('uc_requests', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
        });

        Schema::table('bhp_requests', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
        });

        Schema::table('sync_logistik_data', function (Blueprint $table) {
            $table->index('nama_sales');
            $table->index('nama_outlet');
            $table->index('tanggal');
        });

        Schema::table('sync_pesanan_data', function (Blueprint $table) {
            $table->index('nama_outlet');
            $table->index('tanggal');
        });

        Schema::table('sync_piutang_data', function (Blueprint $table) {
            $table->index('nama_outlet');
            $table->index('created_at');
        });

        Schema::table('sync_hutang_data', function (Blueprint $table) {
            $table->index('nama_penyedia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['division_id']);
            $table->dropIndex(['position_id']);
            $table->dropIndex(['company_id']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('marketing_daily_reports', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['outlet_id']);
            $table->dropIndex(['visit_date']);
        });

        Schema::table('uc_requests', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('bhp_requests', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('sync_logistik_data', function (Blueprint $table) {
            $table->dropIndex(['nama_sales']);
            $table->dropIndex(['nama_outlet']);
            $table->dropIndex(['tanggal']);
        });

        Schema::table('sync_pesanan_data', function (Blueprint $table) {
            $table->dropIndex(['nama_outlet']);
            $table->dropIndex(['tanggal']);
        });

        Schema::table('sync_piutang_data', function (Blueprint $table) {
            $table->dropIndex(['nama_outlet']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('sync_hutang_data', function (Blueprint $table) {
            $table->dropIndex(['nama_penyedia']);
        });
    }
};
