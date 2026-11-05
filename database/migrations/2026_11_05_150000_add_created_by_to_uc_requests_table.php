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
        if (Schema::hasTable('uc_requests') && !Schema::hasColumn('uc_requests', 'created_by')) {
            Schema::table('uc_requests', function (Blueprint $table) {
                $table->unsignedBigInteger('created_by')->nullable()->after('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('uc_requests') && Schema::hasColumn('uc_requests', 'created_by')) {
            Schema::table('uc_requests', function (Blueprint $table) {
                $table->dropColumn('created_by');
            });
        }
    }
};

