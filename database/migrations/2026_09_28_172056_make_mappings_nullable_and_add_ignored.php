<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('outlet_mappings', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->change();
            $table->boolean('is_ignored')->default(false)->after('outlet_id');
        });

        Schema::table('provider_mappings', function (Blueprint $table) {
            $table->foreignId('provider_id')->nullable()->change();
            $table->boolean('is_ignored')->default(false)->after('provider_id');
        });
    }

    public function down(): void
    {
        Schema::table('outlet_mappings', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable(false)->change();
            $table->dropColumn('is_ignored');
        });

        Schema::table('provider_mappings', function (Blueprint $table) {
            $table->foreignId('provider_id')->nullable(false)->change();
            $table->dropColumn('is_ignored');
        });
    }
};
