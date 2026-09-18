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
        Schema::create('company_targets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('monthly_target', 15, 2)->default(0);
            $table->decimal('annual_target', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('company_target_id')->nullable()->constrained('company_targets')->nullOnDelete();
        });

        // Migrate existing targets
        $companiesWithTarget = \Illuminate\Support\Facades\DB::table('companies')
            ->where('monthly_target', '>', 0)
            ->orWhere('annual_target', '>', 0)
            ->get();
            
        foreach ($companiesWithTarget as $company) {
            $targetId = \Illuminate\Support\Facades\DB::table('company_targets')->insertGetId([
                'name' => $company->name,
                'monthly_target' => $company->monthly_target ?? 0,
                'annual_target' => $company->annual_target ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            \Illuminate\Support\Facades\DB::table('companies')->where('id', $company->id)->update(['company_target_id' => $targetId]);
        }

        // Now drop the columns
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['monthly_target', 'annual_target']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->decimal('monthly_target', 15, 2)->nullable();
            $table->decimal('annual_target', 15, 2)->nullable();
            $table->dropForeign(['company_target_id']);
            $table->dropColumn('company_target_id');
        });
        
        Schema::dropIfExists('company_targets');
    }
};
