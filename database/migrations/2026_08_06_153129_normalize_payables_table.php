<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Provider;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payables', function (Blueprint $table) {
            $table->foreignId('provider_id')->nullable()->constrained()->nullOnDelete();
        });

        // Migrate data
        $payables = DB::table('payables')->get();
        foreach ($payables as $item) {
            $providerId = null;
            if (!empty($item->nama_penyedia)) {
                $provider = Provider::firstOrCreate(['name' => trim($item->nama_penyedia)]);
                $providerId = $provider->id;
            }

            DB::table('payables')->where('id', $item->id)->update([
                'provider_id' => $providerId,
            ]);
        }

        Schema::table('payables', function (Blueprint $table) {
            $table->dropColumn('nama_penyedia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payables', function (Blueprint $table) {
            $table->string('nama_penyedia')->nullable();
        });

        $payables = DB::table('payables')->get();
        foreach ($payables as $item) {
            $provider = DB::table('providers')->where('id', $item->provider_id)->first();

            DB::table('payables')->where('id', $item->id)->update([
                'nama_penyedia' => $provider ? $provider->name : null,
            ]);
        }

        Schema::table('payables', function (Blueprint $table) {
            $table->dropForeign(['provider_id']);
            $table->dropColumn('provider_id');
        });
    }
};
