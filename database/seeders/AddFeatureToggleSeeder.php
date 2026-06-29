<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FeatureToggle;

class AddFeatureToggleSeeder extends Seeder
{
    public function run(): void
    {
        FeatureToggle::firstOrCreate(['name' => 'Menu Persetujuan UC']);
    }
}
