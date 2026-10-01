<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MarketingArea;
use Illuminate\Support\Facades\DB;

class KotaKabupatenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $areas = [
            "BOLAANG MONGONDOW",
            "BOLAANG MONGONDOW SELATAN",
            "BOLAANG MONGONDOW TIMUR",
            "BOLAANG MONGONDOW UTARA",
            "KEPULAUAN SANGIHE",
            "KEPULAUAN SIAU TAGULANDANG BIARO",
            "KEPULAUAN TALAUD",
            "MINAHASA",
            "MINAHASA SELATAN",
            "MINAHASA TENGGARA",
            "MINAHASA UTARA",
            "BITUNG",
            "KOTAMOBAGU",
            "MANADO",
            "TOMOHON",
            "BOALEMO",
            "BONE BOLANGO",
            "GORONTALO",
            "GORONTALO UTARA",
            "POHUWATO",
            "BANGGAI",
            "BANGGAI KEPULAUAN",
            "BANGGAI LAUT",
            "BUOL",
            "DONGGALA",
            "MOROWALI",
            "MOROWALI UTARA",
            "PARIGI MOUTONG",
            "POSO",
            "SIGI",
            "TOJO UNA-UNA",
            "TOLITOLI",
            "PALU",
            "MAJENE",
            "MAMASA",
            "MAMUJU",
            "MAMUJU TENGAH",
            "PASANGKAYU",
            "POLEWALI MANDAR",
            "BANTAENG",
            "BARRU",
            "BONE",
            "BULUKUMBA",
            "ENREKANG",
            "GOWA",
            "JENEPONTO",
            "KEPULAUAN SELAYAR",
            "LUWU",
            "LUWU TIMUR",
            "LUWU UTARA",
            "MAROS",
            "PANGKAJENE DAN KEPULAUAN",
            "PINRANG",
            "SIDENRENG RAPPANG",
            "SINJAI",
            "SOPPENG",
            "TAKALAR",
            "TANA TORAJA",
            "TORAJA UTARA",
            "WAJO",
            "MAKASSAR",
            "PALOPO",
            "PAREPARE",
            "BOMBANA",
            "BUTON",
            "BUTON SELATAN",
            "BUTON TENGAH",
            "BUTON UTARA",
            "KOLAKA",
            "KOLAKA TIMUR",
            "KOLAKA UTARA",
            "KONAWE",
            "KONAWE KEPULAUAN",
            "KONAWE SELATAN",
            "KONAWE UTARA",
            "MUNA",
            "MUNA BARAT",
            "WAKATOBI",
            "BAUBAU",
            "KENDARI"
        ];

        // Ensure unique entries
        $areas = array_unique($areas);

        foreach ($areas as $areaName) {
            MarketingArea::firstOrCreate(['name' => $areaName]);
        }

        $this->command->info('81 Kota/Kabupaten telah berhasil ditambahkan ke Marketing Areas.');
    }
}
