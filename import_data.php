<?php
use App\Models\Provider;
use App\Models\ProviderProduct;

// Import PT Karya Pratama
$providerKp = Provider::firstOrCreate(
    ['name' => 'PT Karya Pratama'],
    ['type' => 'Distributor', 'notes' => 'Imported from Excel']
);

$kpJson = file_get_contents('karya_pratama.json');
$kpData = json_decode($kpJson, true);

foreach($kpData as $item) {
    ProviderProduct::updateOrCreate(
        ['provider_id' => $providerKp->id, 'code' => $item['code']],
        [
            'name' => $item['name'],
            'price' => $item['price'] ?: 0,
            'link' => $item['link'],
            'description' => "Merk: {$item['merk']}",
            'tkdn' => is_numeric($item['tkdn']) ? $item['tkdn'] : 0,
            'is_active' => true
        ]
    );
}
echo "Imported " . count($kpData) . " products for PT Karya Pratama.\n";

// Import PT Oncoprobe Utama
$providerOnc = Provider::firstOrCreate(
    ['name' => 'PT Oncoprobe Utama'],
    ['type' => 'Distributor', 'notes' => 'Imported from PDF']
);

$oncJson = file_get_contents('oncoprobe.json');
$oncData = json_decode($oncJson, true);

$countOnc = 0;
foreach($oncData as $item) {
    // 25 test/kit
    if ($item['price_25'] > 0) {
        ProviderProduct::updateOrCreate(
            ['provider_id' => $providerOnc->id, 'code' => $item['code'] . '-25'],
            [
                'name' => $item['name'] . " (25 test/kit)",
                'unit' => $item['unit'],
                'price' => $item['price_25'] ?: 0,
                'description' => "Harga 25 test/kit",
                'is_active' => true,
                'tkdn' => 0
            ]
        );
        $countOnc++;
    }
    // 50 test/kit
    if ($item['price_50'] > 0) {
        ProviderProduct::updateOrCreate(
            ['provider_id' => $providerOnc->id, 'code' => $item['code'] . '-50'],
            [
                'name' => $item['name'] . " (50 test/kit)",
                'unit' => $item['unit'],
                'price' => $item['price_50'] ?: 0,
                'description' => "Harga 50 test/kit",
                'is_active' => true,
                'tkdn' => 0
            ]
        );
        $countOnc++;
    }
}
echo "Imported " . $countOnc . " products for PT Oncoprobe Utama.\n";
