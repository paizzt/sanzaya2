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
        Schema::table('item_requirements', function (Blueprint $table) {
            $table->string('comparator_1_name')->nullable();
            $table->string('comparator_1_link')->nullable();
            $table->string('comparator_2_name')->nullable();
            $table->string('comparator_2_link')->nullable();
            $table->string('click_status')->nullable()->default('Belum');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_requirements', function (Blueprint $table) {
            $table->dropColumn([
                'comparator_1_name',
                'comparator_1_link',
                'comparator_2_name',
                'comparator_2_link',
                'click_status'
            ]);
        });
    }
};
