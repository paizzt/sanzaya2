-- SQL Script for PT Sinar Roda Utama Products
-- Berdasarkan file: 031 Penawaran Harga ecat PT Sanzaya 31 maret 2026.pdf

-- 1. Pastikan Provider "PT Sinar Roda Utama" sudah ada di database
SET @provider_id = (SELECT id FROM providers WHERE name LIKE '%Sinar Roda Utama%' LIMIT 1);

INSERT INTO providers (name, type, created_at, updated_at)
SELECT 'PT Sinar Roda Utama', 'Distributor', NOW(), NOW()
WHERE @provider_id IS NULL;

-- Ambil ulang ID provider setelah di-insert
SET @provider_id = (SELECT id FROM providers WHERE name LIKE '%Sinar Roda Utama%' LIMIT 1);

-- 2. Insert data produk penyedia (provider_products)
-- Asumsi: 
-- `price` = Harga beli setelah diskon (Price Setelah Diskon)
-- `hna` = Harga normal sebelum diskon (Pricelist)
-- `unit` = 'PCS' atau 'STRIP' berdasarkan satuan harga
-- `description` = Digunakan untuk menyimpan informasi kemasan
INSERT INTO provider_products (provider_id, code, name, hna, price, unit, description, is_active, created_at, updated_at) VALUES 
(@provider_id, 'DS01T2613 - N', 'Syringe 1ML TB. W/26G X 1/2"', 2997, 1110, 'PCS', 'Kemasan: 100 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'DS03L2332 - N', 'Syringe 3ML W/23G X 1 1/4"', 1998, 999, 'PCS', 'Kemasan: 100 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'DS05L2138 - N', 'Syringe 5ML W/22G X 1 1/2"', 2664, 1110, 'PCS', 'Kemasan: 100 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'DS10L2238 - N', 'Syringe 10ML W/21G X 1 1/2"', 2775, 1443, 'PCS', 'Kemasan: 100 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'DS20LS - N', 'Syringe 20 ML', 7326, 2109, 'PCS', 'Kemasan: 50 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'DS50LS - N', 'Syringe 50 ML', 16650, 4552, 'PCS', 'Kemasan: 50 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'DS50CT - N', 'Syringe 50 ML Cathetertip', 26640, 5107, 'PCS', 'Kemasan: 40 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'NIC (All Size)', 'IV. Catheter ( All Size)', 18426, 5550, 'PCS', 'Kemasan: 50 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'IS01A (21 G - N)', 'Infusion Set With Y - Injection Set', 16095, 7549, 'PCS', 'Kemasan: 50 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'W-CATH (All Size)', 'Wing Catheter ( All Size )', 25086, 6660, 'PCS', 'Kemasan: 50 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'TF4D2', 'Blood Transfusion Set', 26973, 9103, 'PCS', 'Kemasan: 50 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'JM-ACSWAB-ETH70', 'JAYAMEKSI Alcohol Swab - Ethyl 70%', 20757, 9990, 'PCS', 'Kemasan: 100 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'BL28G-NPR', 'Blood Lancets 28G Nipro', 31635, 21537, 'PCS', 'Kemasan: 100 PCS/Box', 1, NOW(), NOW()),
(@provider_id, 'PR-325104-50ST', 'NIPRO Premier Blood Glucose Test Strip - 50T', 245300, 196240, 'STRIP', 'Kemasan: 50 STRIP/Box', 1, NOW(), NOW());
