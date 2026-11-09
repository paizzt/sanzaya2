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
        if (Schema::hasTable('uc_requests')) {
            Schema::table('uc_requests', function (Blueprint $table) {
                if (!Schema::hasColumn('uc_requests', 'total_nota')) {
                    $table->decimal('total_nota', 15, 2)->nullable()->default(0)->after('result_receipts');
                }
                if (!Schema::hasColumn('uc_requests', 'dibayarkan')) {
                    $table->decimal('dibayarkan', 15, 2)->nullable()->default(0)->after('total_nota');
                }
                if (!Schema::hasColumn('uc_requests', 'reimburse_sisa_dana')) {
                    $table->decimal('reimburse_sisa_dana', 15, 2)->nullable()->default(0)->after('dibayarkan');
                }
                if (!Schema::hasColumn('uc_requests', 'pengembalian_dana')) {
                    $table->decimal('pengembalian_dana', 15, 2)->nullable()->default(0)->after('reimburse_sisa_dana');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('uc_requests')) {
            Schema::table('uc_requests', function (Blueprint $table) {
                $columns = ['total_nota', 'dibayarkan', 'reimburse_sisa_dana', 'pengembalian_dana'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('uc_requests', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};

