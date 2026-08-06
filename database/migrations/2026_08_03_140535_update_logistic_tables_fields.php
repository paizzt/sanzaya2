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
        Schema::table('sync_logistik_data', function (Blueprint $table) {
            $sm = Schema::getConnection()->getSchemaBuilder();
            if ($sm->hasIndex('sync_logistik_data', 'sync_logistik_data_nama_outlet_index')) {
                $table->dropIndex('sync_logistik_data_nama_outlet_index');
            }
            if ($sm->hasIndex('sync_logistik_data', 'sync_logistik_data_tanggal_index')) {
                $table->dropIndex('sync_logistik_data_tanggal_index');
            }
            if ($sm->hasIndex('sync_logistik_data', 'sync_logistik_data_nama_sales_index')) {
                $table->dropIndex('sync_logistik_data_nama_sales_index');
            }
        });

        Schema::table('logistic_reports', function (Blueprint $table) {
            if (Schema::hasColumn('logistic_reports', 'nama_outlet')) {
                $table->dropColumn(['nama_outlet', 'total_sales']);
            }
            if (!Schema::hasColumn('logistic_reports', 'nama_pt')) {
                $table->string('nama_pt')->nullable();
                $table->string('pelanggan')->nullable();
                $table->string('jenis_pelanggan')->nullable();
                $table->string('no_faktur')->nullable();
                $table->string('id_paket')->nullable();
                $table->string('brand')->nullable();
                $table->string('qty')->nullable();
                $table->string('satuan')->nullable();
                $table->decimal('hna', 15, 2)->nullable();
                $table->decimal('subtotal', 15, 2)->nullable();
                $table->decimal('ppn', 15, 2)->nullable();
                $table->decimal('total', 15, 2)->nullable();
                $table->decimal('grand_total', 15, 2)->nullable();
                $table->string('jenis_barang')->nullable();
            }
        });

        Schema::table('sync_logistik_data', function (Blueprint $table) {
            if (Schema::hasColumn('sync_logistik_data', 'nama_outlet')) {
                $table->dropColumn(['nama_outlet', 'total_sales']);
            }
            if (!Schema::hasColumn('sync_logistik_data', 'nama_pt')) {
                $table->string('nama_pt')->nullable();
                $table->string('pelanggan')->nullable();
                $table->string('jenis_pelanggan')->nullable();
                $table->string('no_faktur')->nullable();
                $table->string('id_paket')->nullable();
                $table->string('brand')->nullable();
                $table->string('qty')->nullable();
                $table->string('satuan')->nullable();
                $table->string('hna')->nullable();
                $table->string('subtotal')->nullable();
                $table->string('ppn')->nullable();
                $table->string('total')->nullable();
                $table->string('grand_total')->nullable();
                $table->string('jenis_barang')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logistic_reports', function (Blueprint $table) {
            $table->dropColumn([
                'nama_pt', 'pelanggan', 'jenis_pelanggan', 'no_faktur', 
                'id_paket', 'brand', 'qty', 'satuan', 'hna', 'subtotal', 
                'ppn', 'total', 'grand_total', 'jenis_barang'
            ]);
            $table->string('nama_outlet')->nullable();
            $table->decimal('total_sales', 15, 2)->nullable();
        });

        Schema::table('sync_logistik_data', function (Blueprint $table) {
            $table->dropColumn([
                'nama_pt', 'pelanggan', 'jenis_pelanggan', 'no_faktur', 
                'id_paket', 'brand', 'qty', 'satuan', 'hna', 'subtotal', 
                'ppn', 'total', 'grand_total', 'jenis_barang'
            ]);
            $table->string('nama_outlet')->nullable();
            $table->string('total_sales')->nullable();
        });
    }
};
