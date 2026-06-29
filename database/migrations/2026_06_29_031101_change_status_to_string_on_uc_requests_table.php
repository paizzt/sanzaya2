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
        Schema::table('uc_requests', function (Blueprint $table) {
            $table->string('status')->default('Menunggu')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uc_requests', function (Blueprint $table) {
            // Can't cleanly revert to enum in SQLite without potential data loss or constraint issues,
            // so we'll just leave it as string in down() or you can attempt reverting.
        });
    }
};
