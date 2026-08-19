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
        $features = [
            'Ambil Absensi',
            'Izin / Sakit',
            'Cari Produk',
            'Riwayat UC',
            'Rekap Absensi',
            'Data Laporan Tersinkronisasi'
        ];

        foreach ($features as $feature) {
            \App\Models\FeatureToggle::firstOrCreate(
                ['name' => $feature],
                ['is_active' => true, 'disabled_for_users' => '[]']
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $features = [
            'Ambil Absensi',
            'Izin / Sakit',
            'Cari Produk',
            'Riwayat UC',
            'Rekap Absensi',
            'Data Laporan Tersinkronisasi'
        ];

        \App\Models\FeatureToggle::whereIn('name', $features)->delete();
    }
};
