<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Outlet;
use App\Models\Company;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('receivables', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
        });

        // Migrate data
        $receivables = DB::table('receivables')->get();
        foreach ($receivables as $item) {
            $outletId = null;
            if (!empty($item->nama_outlet)) {
                $outlet = Outlet::firstOrCreate(['name' => trim($item->nama_outlet)]);
                $outletId = $outlet->id;
            }

            $companyId = null;
            if (!empty($item->nama_pt)) {
                $company = Company::firstOrCreate(['name' => trim($item->nama_pt)]);
                $companyId = $company->id;
            }

            DB::table('receivables')->where('id', $item->id)->update([
                'outlet_id' => $outletId,
                'company_id' => $companyId,
            ]);
        }

        Schema::table('receivables', function (Blueprint $table) {
            $table->dropColumn('nama_outlet');
            $table->dropColumn('nama_pt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receivables', function (Blueprint $table) {
            $table->string('nama_outlet')->nullable();
            $table->string('nama_pt')->nullable();
        });

        $receivables = DB::table('receivables')->get();
        foreach ($receivables as $item) {
            $outlet = DB::table('outlets')->where('id', $item->outlet_id)->first();
            $company = DB::table('companies')->where('id', $item->company_id)->first();

            DB::table('receivables')->where('id', $item->id)->update([
                'nama_outlet' => $outlet ? $outlet->name : null,
                'nama_pt' => $company ? $company->name : null,
            ]);
        }

        Schema::table('receivables', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->dropForeign(['company_id']);
            $table->dropColumn('outlet_id');
            $table->dropColumn('company_id');
        });
    }
};
