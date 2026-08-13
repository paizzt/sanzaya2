<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sql = "/* 1. Tambah Kolom Manufacturer di Tabel Products */\n";
$sql .= "ALTER TABLE `products` ADD `manufacturer` VARCHAR(255) NULL AFTER `name`;\n\n";

$sql .= "/* 2. Tambah 3 Saklar Fitur Baru */\n";
$sql .= "INSERT IGNORE INTO `feature_toggles` (`id`, `name`, `is_active`, `disabled_for_users`, `created_at`, `updated_at`) VALUES \n";
$sql .= "(26, 'Persetujuan Pembayaran', 1, '[]', NOW(), NOW()),\n";
$sql .= "(27, 'Riwayat Perubahan', 1, '[]', NOW(), NOW()),\n";
$sql .= "(28, 'Manajemen SOP', 1, '[]', NOW(), NOW());\n\n";

$sql .= "/* 3. Tambah Data Penyedia PT Surya Mega Perkasa */\n";
$sql .= "INSERT INTO `providers` (`name`, `type`, `business_type`, `created_at`, `updated_at`) VALUES ('PT Surya Mega Perkasa', 'Distributor', 'Alat Kesehatan', NOW(), NOW());\n";
$sql .= "SET @provider_id = LAST_INSERT_ID();\n\n";

$sql .= "/* 4. Tambah 47 Barang ke Penyedia PT Surya Mega Perkasa */\n";
$sql .= "INSERT INTO `provider_products` (`provider_id`, `name`, `price`, `is_active`, `jenis`, `qty`, `created_at`, `updated_at`) VALUES \n";

$products = App\Models\ProviderProduct::where('provider_id', 49)->get();
$values = [];
foreach ($products as $p) {
    $name = addslashes($p->name);
    $values[] = "(@provider_id, '{$name}', {$p->price}, 1, 'BMHP', 0, NOW(), NOW())";
}

$sql .= implode(",\n", $values) . ";\n";

file_put_contents('hosting_update.sql', $sql);
echo "SQL File Generated!\n";
