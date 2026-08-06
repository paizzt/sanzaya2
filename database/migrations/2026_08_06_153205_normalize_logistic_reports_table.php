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
        Schema::table('logistic_reports', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
        });

        // Migrate data
        $reports = DB::table('logistic_reports')->get();
        foreach ($reports as $item) {
            $outletId = null;
            if (!empty($item->pelanggan)) {
                $outlet = Outlet::firstOrCreate(['name' => trim($item->pelanggan)]);
                $outletId = $outlet->id;
            }

            $companyId = null;
            if (!empty($item->nama_pt)) {
                $company = Company::firstOrCreate(['name' => trim($item->nama_pt)]);
                $companyId = $company->id;
            }

            DB::table('logistic_reports')->where('id', $item->id)->update([
                'outlet_id' => $outletId,
                'company_id' => $companyId,
            ]);
        }

        Schema::table('logistic_reports', function (Blueprint $table) {
            $table->dropColumn('pelanggan');
            $table->dropColumn('nama_pt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logistic_reports', function (Blueprint $table) {
            $table->string('pelanggan')->nullable();
            $table->string('nama_pt')->nullable();
        });

        $reports = DB::table('logistic_reports')->get();
        foreach ($reports as $item) {
            $outlet = DB::table('outlets')->where('id', $item->outlet_id)->first();
            $company = DB::table('companies')->where('id', $item->company_id)->first();

            DB::table('logistic_reports')->where('id', $item->id)->update([
                'pelanggan' => $outlet ? $outlet->name : null,
                'nama_pt' => $company ? $company->name : null,
            ]);
        }

        Schema::table('logistic_reports', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->dropForeign(['company_id']);
            $table->dropColumn('outlet_id');
            $table->dropColumn('company_id');
        });
    }
};
