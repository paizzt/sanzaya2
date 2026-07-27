<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $duplicates = DB::table('attendances')
            ->select('user_id', 'date', DB::raw('MAX(id) as max_id'))
            ->groupBy('user_id', 'date')
            ->get();

        $maxIds = $duplicates->pluck('max_id')->toArray();
        if (!empty($maxIds)) {
            DB::table('attendances')->whereNotIn('id', $maxIds)->delete();
        }

        Schema::table('attendances', function (Blueprint $table) {
            $table->unique(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            //
        });
    }
};
