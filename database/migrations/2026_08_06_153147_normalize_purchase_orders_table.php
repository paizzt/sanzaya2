<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Outlet;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
        });

        // Migrate data
        $pos = DB::table('purchase_orders')->get();
        foreach ($pos as $item) {
            $outletId = null;
            if (!empty($item->nama_outlet)) {
                $outlet = Outlet::firstOrCreate(['name' => trim($item->nama_outlet)]);
                $outletId = $outlet->id;
            }

            DB::table('purchase_orders')->where('id', $item->id)->update([
                'outlet_id' => $outletId,
            ]);
        }

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn('nama_outlet');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('nama_outlet')->nullable();
        });

        $pos = DB::table('purchase_orders')->get();
        foreach ($pos as $item) {
            $outlet = DB::table('outlets')->where('id', $item->outlet_id)->first();

            DB::table('purchase_orders')->where('id', $item->id)->update([
                'nama_outlet' => $outlet ? $outlet->name : null,
            ]);
        }

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->dropColumn('outlet_id');
        });
    }
};
