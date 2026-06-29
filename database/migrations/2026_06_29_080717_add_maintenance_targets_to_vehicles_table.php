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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->integer('engine_oil_target_km')->nullable(); // Oli mesin 10.000km
            $table->integer('oil_filter_target_km')->nullable(); // Filter oli 10.000km
            $table->integer('air_filter_target_km')->nullable(); // Saringan udara 10.000km
            $table->integer('ac_filter_target_km')->nullable(); // Saringan udara ac 10.000km
            $table->integer('transmission_oil_target_km')->nullable(); // Oli transmisi matic 40.000km
            $table->integer('spark_plug_target_km')->nullable(); // Busi 40.000km
            $table->integer('brake_pad_target_km')->nullable(); // Kampas rem depan belakang 60.000km
            $table->date('battery_target_date')->nullable(); // Aki 2 tahun
            $table->date('tire_target_date')->nullable(); // Ban 2 tahun
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'engine_oil_target_km',
                'oil_filter_target_km',
                'air_filter_target_km',
                'ac_filter_target_km',
                'transmission_oil_target_km',
                'spark_plug_target_km',
                'brake_pad_target_km',
                'battery_target_date',
                'tire_target_date',
            ]);
        });
    }
};
