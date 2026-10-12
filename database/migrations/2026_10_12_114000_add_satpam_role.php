<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use App\Models\Division;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            Role::firstOrCreate(['name' => 'SATPAM', 'guard_name' => 'web']);
        } catch (\Throwable $e) {}

        try {
            Division::firstOrCreate(['name' => 'SATPAM']);
        } catch (\Throwable $e) {}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Role is preserved
    }
};
