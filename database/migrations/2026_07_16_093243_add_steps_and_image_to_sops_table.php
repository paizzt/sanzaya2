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
        Schema::table('sops', function (Blueprint $table) {
            $table->json('steps')->nullable()->after('description');
            $table->string('image')->nullable()->after('steps');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sops', function (Blueprint $table) {
            $table->dropColumn(['steps', 'image']);
        });
    }
};
