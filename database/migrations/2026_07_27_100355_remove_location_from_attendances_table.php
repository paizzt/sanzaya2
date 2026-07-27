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
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'check_in_location',
                'check_in_coordinates',
                'check_out_location',
                'check_out_coordinates'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->string('check_in_location')->nullable();
            $table->string('check_in_coordinates')->nullable();
            $table->string('check_out_location')->nullable();
            $table->string('check_out_coordinates')->nullable();
        });
    }
};
