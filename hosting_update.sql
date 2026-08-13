/* 1. Tambah Kolom Manufacturer di Tabel Products */
ALTER TABLE `products` ADD `manufacturer` VARCHAR(255) NULL AFTER `name`;

/* 2. Tambah 3 Saklar Fitur Baru */
INSERT IGNORE INTO `feature_toggles` (`id`, `name`, `is_active`, `disabled_for_users`, `created_at`, `updated_at`) VALUES 
(26, 'Persetujuan Pembayaran', 1, '[]', NOW(), NOW()),
(27, 'Riwayat Perubahan', 1, '[]', NOW(), NOW()),
(28, 'Manajemen SOP', 1, '[]', NOW(), NOW());

/* 3. Tambah Data Penyedia PT Surya Mega Perkasa */
INSERT INTO `providers` (`name`, `type`, `business_type`, `created_at`, `updated_at`) VALUES ('PT Surya Mega Perkasa', 'Distributor', 'Alat Kesehatan', NOW(), NOW());
SET @provider_id = LAST_INSERT_ID();

/* 4. Tambah 47 Barang ke Penyedia PT Surya Mega Perkasa */
INSERT INTO `provider_products` (`provider_id`, `name`, `price`, `is_active`, `jenis`, `qty`, `created_at`, `updated_at`) VALUES 
(@provider_id, 'OTO Underpad +/- 60x90 Cm', 41360.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'HEALER Underpad +/- 60x90 Cm', 43671.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Open 2M', 14136.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Open 2L', 16940.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Open 2XL', 19800.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Pants 8M', 88385.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Pants 8L', 94655.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Pants 8XL', 99359.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Pants 8XXL', 109286.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Pants 1M', 12046.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Pants 1L', 13366.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Pants 1XL', 14686.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'Uni Pet Underpad +/- 60x90', 40699.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'Uni Pet Underpad +/- 60x45', 29372.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO NURSE 100\'s', 33500.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'Florence Pembalut Pants', 22221.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Fresh 20 CM', 108608.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Fresh 25 CM', 146215.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Fresh 30 CM', 161172.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Fresh 45 CM', 240080.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Fresh 35 CM', 182845.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Fresh 40 CM', 221612.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Fresh 30x30 Alat Potong', 19471.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'PURE Fresh 30 Cm', 143345.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'PURE Fresh 45 Cm', 221612.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Diapers M 10', 60500.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Diapers L 8', 60500.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Diapers XL 6', 60500.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Diapers L 14', 105875.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Diapers M 14', 84700.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Adult Diapers XL 12', 121001.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Premium Adult L 7', 52473.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Premium Adult M 8', 52473.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'OTO Premium Adult XL 6', 52473.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult 7 L', 57035.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Pants 20 M', 201465.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Pants 16 L', 170608.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Pants 12 XL', 135032.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers XL 6', 57035.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers M 8', 57035.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers M 14', 79806.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers L 14', 99770.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers XL 12', 113959.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers Pants M 8', 80586.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers Pants L 8', 85304.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers Pants XL 8', 90021.00, 1, 'BMHP', 0, NOW(), NOW()),
(@provider_id, 'BP Adult Diapers Pants XXL 8', 99012.00, 1, 'BMHP', 0, NOW(), NOW());
