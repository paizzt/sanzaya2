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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            
            // Data Kendaraan
            $table->string('license_plate')->unique(); // Nomor Polisi (Plat Nomor)
            $table->string('chassis_number')->nullable(); // Nomor Rangka / Nomor Mesin
            $table->string('brand_type')->nullable(); // Merk & Tipe Kendaraan
            $table->integer('manufacture_year')->nullable(); // Tahun Pembuatan
            $table->string('color')->nullable(); // Warna Kendaraan
            $table->string('capacity')->nullable(); // Kapasitas
            $table->string('photo')->nullable(); // foto kendaraan
            
            // Administrasi & Legalitas
            $table->date('annual_tax_date')->nullable(); // Tanggal Bayar Pajak Tahunan
            $table->date('five_year_tax_date')->nullable(); // Tanggal Bayar Pajak Lima Tahunan
            $table->date('plate_replacement_date')->nullable(); // Tanggal Ganti Plat Nomor
            $table->date('stnk_expiry_date')->nullable(); // Tanggal STNK Berakhir
            $table->date('kir_expiry_date')->nullable(); // Tanggal KIR/Uji Berkala (untuk kendaraan angkutan)
            $table->string('insurance_policy')->nullable(); // Asuransi (nomor polis)
            $table->date('insurance_expiry_date')->nullable(); // Asuransi (masa berlaku)
            
            // Perawatan & Operasional
            $table->date('scheduled_service_date')->nullable(); // Jadwal Service Berkala
            $table->text('repair_history')->nullable(); // Riwayat Perbaikan
            $table->integer('last_odometer')->nullable(); // Kilometer terakhir (odometer)
            $table->date('oil_change_schedule')->nullable(); // Jadwal Ganti Oli / Sparepart
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
