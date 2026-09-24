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
            $columnsToDrop = [];
            foreach (['tanggal_terima_invoice', 'nomor_transaksi', 'jatuh_tempo_hari', 'nominal'] as $col) {
                if (Schema::hasColumn('payables', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
            
            if (!Schema::hasColumn('payables', 'company_id')) {
                $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete()->after('id');
            }
            if (!Schema::hasColumn('payables', 'details')) {
                $table->json('details')->nullable()->after('provider_id');
            }
            if (!Schema::hasColumn('payables', 'total')) {
                $table->bigInteger('total')->default(0)->after('details');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payables', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn(['company_id', 'details', 'total']);
            
            $table->date('tanggal_terima_invoice')->nullable();
            $table->string('nomor_transaksi')->nullable();
            $table->integer('jatuh_tempo_hari')->nullable();
            $table->decimal('nominal', 15, 2)->nullable();
        });
    }
};
