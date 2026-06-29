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
            $table->string('department')->nullable()->after('entity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uc_requests', function (Blueprint $table) {
            $table->dropColumn('department');
        });
    }
};
