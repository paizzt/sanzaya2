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
        \Illuminate\Support\Facades\DB::table('feature_toggles')->updateOrInsert(
            ['name' => 'Unduh PDF'],
            [
                'is_active' => true,
                'disabled_for_users' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::table('feature_toggles')->where('name', 'Unduh PDF')->delete();
    }
};
