<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\MarketingArea;
use App\Models\FeatureToggle;
use App\Models\Position;
use App\Models\Division;
use Spatie\Permission\Models\Role;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Companies
        $companies = ['PT Ruma', 'PT Sanzaya', 'PT MSI'];
        foreach ($companies as $name) {
            Company::firstOrCreate(['name' => $name]);
        }

        // 2. Roles
        $roles = ['Superadmin', 'Admin', 'Karyawan', 'Sales', 'Finance', 'Logistik', 'HR'];
        foreach ($roles as $name) {
            Role::firstOrCreate(['name' => $name]);
        }
        
        // 3. Positions
        $positions = ['Manager', 'Staff'];
        foreach ($positions as $name) {
            Position::firstOrCreate(['name' => $name]);
        }
        
        // 4. Divisions
        $divisions = ['Finance', 'Logistik', 'Management'];
        foreach ($divisions as $name) {
            Division::firstOrCreate(['name' => $name]);
        }

        // 5. Feature Toggles
        $features = [
            'Menu Spreadsheet',
            'Menu Absensi',
            'Menu Marketing',
            'Menu Pengajuan UC',
            'Menu Pengajuan BHP'
        ];
        foreach ($features as $name) {
            FeatureToggle::firstOrCreate(['name' => $name]);
        }

        // 6. Marketing Areas (Sulawesi)
        $areas = [
            // Sulawesi Selatan
            'Makassar', 'Gowa', 'Takalar', 'Jeneponto', 'Bantaeng', 'Bulukumba', 'Kepulauan Selayar', 'Sinjai', 'Bone', 'Maros', 'Pangkajene dan Kepulauan', 'Barru', 'Parepare', 'Soppeng', 'Wajo', 'Sidenreng Rappang', 'Pinrang', 'Enrekang', 'Luwu', 'Palopo', 'Luwu Utara', 'Luwu Timur', 'Tana Toraja', 'Toraja Utara',
            // Sulawesi Barat
            'Mamuju', 'Majene', 'Polewali Mandar', 'Mamasa', 'Pasangkayu', 'Mamuju Tengah',
            // Sulawesi Tengah
            'Palu', 'Donggala', 'Sigi', 'Parigi Moutong', 'Poso', 'Tojo Una-Una', 'Morowali', 'Morowali Utara', 'Banggai', 'Banggai Kepulauan', 'Banggai Laut', 'Tolitoli', 'Buol',
            // Sulawesi Tenggara
            'Kendari', 'Baubau', 'Kolaka', 'Kolaka Utara', 'Kolaka Timur', 'Konawe', 'Konawe Selatan', 'Konawe Utara', 'Konawe Kepulauan', 'Bombana', 'Muna', 'Muna Barat', 'Buton', 'Buton Utara', 'Buton Tengah', 'Buton Selatan', 'Wakatobi',
            // Sulawesi Utara
            'Manado', 'Bitung', 'Tomohon', 'Kotamobagu', 'Minahasa', 'Minahasa Utara', 'Minahasa Selatan', 'Minahasa Tenggara', 'Bolaang Mongondow', 'Bolaang Mongondow Utara', 'Bolaang Mongondow Timur', 'Bolaang Mongondow Selatan', 'Kepulauan Sangihe', 'Kepulauan Talaud', 'Kepulauan Siau Tagulandang Biaro',
            // Gorontalo
            'Gorontalo', 'Bone Bolango', 'Gorontalo Utara', 'Pohuwato', 'Boalemo'
        ];

        foreach ($areas as $name) {
            MarketingArea::firstOrCreate(['name' => $name]);
        }
    }
}
