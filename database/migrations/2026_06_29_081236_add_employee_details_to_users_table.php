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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('salary')->nullable();
            $table->integer('operational_allowance')->nullable();
            $table->string('employment_status')->nullable();
            $table->string('education')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('bpjs_kesehatan')->nullable();
            $table->string('bpjs_ketenagakerjaan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'salary',
                'operational_allowance',
                'employment_status',
                'education',
                'emergency_contact',
                'bpjs_kesehatan',
                'bpjs_ketenagakerjaan',
            ]);
        });
    }
};
