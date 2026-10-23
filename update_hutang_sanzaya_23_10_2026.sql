-- ============================================================================
-- SCRIPT UPDATE DATA HUTANG PT SANZAYA TERBARU (23 OKTOBER 2026)
-- Sumber File: vendor_balance_23-10-2026.csv
-- Total Supplier: 42
-- Total Saldo Hutang: Rp 2.894.569.919,85
-- KEAMANAN: HANYA MENIMPA DATA PT SANZAYA, DATA PT LAIN 100% AMAN
-- ============================================================================

START TRANSACTION;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Pastikan entitas PT Sanzaya terdaftar di tabel `companies`
INSERT INTO `companies` (`name`, `created_at`, `updated_at`)
SELECT 'PT Sanzaya', NOW(), NOW() FROM DUAL 
WHERE NOT EXISTS (SELECT 1 FROM `companies` WHERE `name` LIKE '%Sanzaya%');

-- Ambil ID PT SANZAYA secara dinamis agar kompatibel di semua server hosting
SET @company_id = (SELECT `id` FROM `companies` WHERE `name` LIKE '%Sanzaya%' ORDER BY (`name` = 'PT Sanzaya' OR `name` = 'PT SANZAYA') DESC LIMIT 1);

-- 2. HAPUS DATA HUTANG LAMA HANYA MILIK PT SANZAYA
-- (Data hutang PT MSI, PT Ruma, PT Harkes, PT BUMA, CV Meraki, dll TIDAK TERHAPUS)
DELETE FROM `payables` WHERE `company_id` = @company_id;

-- 3. Pastikan semua Supplier terdaftar di tabel `providers`
INSERT IGNORE INTO `providers` (`name`, `created_at`, `updated_at`) VALUES
('CV. Acropolis Ortopedi', NOW(), NOW()),
('CV. ARIEF PRATAMA', NOW(), NOW()),
('CV. JAYA UTAMA', NOW(), NOW()),
('PT. Alexa Medika', NOW(), NOW()),
('PT. ALPHA INTI MEDICALINDO', NOW(), NOW()),
('PT. Anata Watashi WHA', NOW(), NOW()),
('PT. ANUGRAH SALMAN MEDIKA', NOW(), NOW()),
('PT. BIO KARYA SEJAHTERA', NOW(), NOW()),
('PT. BUANA INTIPRIMA MEDIKA', NOW(), NOW()),
('PT. BU KWANG MEDICAL', NOW(), NOW()),
('PT. BUMI INDAH SARANA MEDIS', NOW(), NOW()),
('PT. Citra Persada', NOW(), NOW()),
('PT. Endo Indonesia', NOW(), NOW()),
('PT. ENERGI MEDISTRON', NOW(), NOW()),
('PT. ENSEVAL PUTERA MEGATRADING', NOW(), NOW()),
('PT. GLOBAL PHARMA INDONESIA', NOW(), NOW()),
('PT. HAURA ABADI JAYA', NOW(), NOW()),
('PT. Intraco Jaya', NOW(), NOW()),
('PT. KLIK BERSAMA TEKNOLOGI', NOW(), NOW()),
('PT. LABIO SISTEM MANUFAKTUR', NOW(), NOW()),
('PT. LINTANG DIAGNOSTIK SUKSES', NOW(), NOW()),
('PT. MATESU ABADI', NOW(), NOW()),
('PT. Medical Solution Indonesia', NOW(), NOW()),
('PT. MediHop', NOW(), NOW()),
('PT. MEDISON JAYA RAYA', NOW(), NOW()),
('PT. MITRA ASA PRATAMA', NOW(), NOW()),
('PT. Mukti Rejo Abadi', NOW(), NOW()),
('PT. Muzamal Ventures Indonesia', NOW(), NOW()),
('PT. OXY MEDICA INDONESIA', NOW(), NOW()),
('PT. Parit Padang Global', NOW(), NOW()),
('PT. SAFELOCK MEDICAL INDONESIA', NOW(), NOW()),
('PT. SINAR RODA UTAMA', NOW(), NOW()),
('PT. SUBUR MAKMUR LINTANG GEMILANG', NOW(), NOW()),
('PT. SURGICA ALKESINDO', NOW(), NOW()),
('PT. TRISA LIKUID FARMA', NOW(), NOW()),
('PT. United Dico Citas', NOW(), NOW()),
('PT ANUGERAH SANTOSA ABADI', NOW(), NOW()),
('PT ELVINCO MEDTECH', NOW(), NOW()),
('SHOOPE', NOW(), NOW()),
('SHOPEE', NOW(), NOW()),
('Toko MEDSO', NOW(), NOW()),
('Toko Sabaria Clothing', NOW(), NOW());

-- 4. Masukkan Data Hutang Terbaru PT Sanzaya
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'CV. Acropolis Ortopedi' LIMIT 1), '[{"year":"2026","amount":10388000.000028}]', 10388000.000028, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'CV. ARIEF PRATAMA' LIMIT 1), '[{"year":"2026","amount":17009255.93778}]', 17009255.93778, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'CV. JAYA UTAMA' LIMIT 1), '[{"year":"2024","amount":18155385}]', 18155385, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Alexa Medika' LIMIT 1), '[{"year":"2025","amount":23993838}]', 23993838, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. ALPHA INTI MEDICALINDO' LIMIT 1), '[{"year":"2025","amount":56758600.3},{"year":"2026","amount":253481749.998878}]', 310240350.29888, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Anata Watashi WHA' LIMIT 1), '[{"year":"2026","amount":175291200}]', 175291200, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. ANUGRAH SALMAN MEDIKA' LIMIT 1), '[{"year":"2026","amount":159933467.34798}]', 159933467.34798, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. BIO KARYA SEJAHTERA' LIMIT 1), '[{"year":"2026","amount":2408100}]', 2408100, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. BUANA INTIPRIMA MEDIKA' LIMIT 1), '[{"year":"2025","amount":58717073}]', 58717073, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. BU KWANG MEDICAL' LIMIT 1), '[{"year":"2026","amount":98249760}]', 98249760, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. BUMI INDAH SARANA MEDIS' LIMIT 1), '[{"year":"2026","amount":150117299.9826}]', 150117299.9826, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Citra Persada' LIMIT 1), '[{"year":"2026","amount":54199999.99993}]', 54199999.99993, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Endo Indonesia' LIMIT 1), '[{"year":"2025","amount":38690387.15},{"year":"2026","amount":2225550}]', 40915937.15, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. ENERGI MEDISTRON' LIMIT 1), '[{"year":"2026","amount":9776325}]', 9776325, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. ENSEVAL PUTERA MEGATRADING' LIMIT 1), '[{"year":"2026","amount":125638746.0006}]', 125638746.0006, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. GLOBAL PHARMA INDONESIA' LIMIT 1), '[{"year":"2025","amount":99808275.49}]', 99808275.49, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. HAURA ABADI JAYA' LIMIT 1), '[{"year":"2025","amount":1298700}]', 1298700, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Intraco Jaya' LIMIT 1), '[{"year":"2026","amount":999000}]', 999000, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. KLIK BERSAMA TEKNOLOGI' LIMIT 1), '[{"year":"2026","amount":5115000.000013}]', 5115000.000013, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. LABIO SISTEM MANUFAKTUR' LIMIT 1), '[{"year":"2024","amount":17002764.32}]', 17002764.32, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. LINTANG DIAGNOSTIK SUKSES' LIMIT 1), '[{"year":"2024","amount":9893738}]', 9893738, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. MATESU ABADI' LIMIT 1), '[{"year":"2025","amount":31557300}]', 31557300, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Medical Solution Indonesia' LIMIT 1), '[{"year":"2024","amount":13336125},{"year":"2026","amount":19290062.0286}]', 32626187.0286, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. MediHop' LIMIT 1), '[{"year":"2024","amount":48209389}]', 48209389, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. MEDISON JAYA RAYA' LIMIT 1), '[{"year":"2026","amount":1450000}]', 1450000, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. MITRA ASA PRATAMA' LIMIT 1), '[{"year":"2024","amount":23625000}]', 23625000, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Mukti Rejo Abadi' LIMIT 1), '[{"year":"2024","amount":104462826.2}]', 104462826.2, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Muzamal Ventures Indonesia' LIMIT 1), '[{"year":"2026","amount":62912358}]', 62912358, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. OXY MEDICA INDONESIA' LIMIT 1), '[{"year":"2026","amount":31782630}]', 31782630, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. Parit Padang Global' LIMIT 1), '[{"year":"2026","amount":25551922.9995}]', 25551922.9995, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. SAFELOCK MEDICAL INDONESIA' LIMIT 1), '[{"year":"2026","amount":334344700.012608}]', 334344700.01261, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. SINAR RODA UTAMA' LIMIT 1), '[{"year":"2026","amount":68820000}]', 68820000, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. SUBUR MAKMUR LINTANG GEMILANG' LIMIT 1), '[{"year":"2026","amount":36720000}]', 36720000, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. SURGICA ALKESINDO' LIMIT 1), '[{"year":"2025","amount":1653000},{"year":"2026","amount":64130472}]', 65783472, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. TRISA LIKUID FARMA' LIMIT 1), '[{"year":"2026","amount":55695260.008758}]', 55695260.008758, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT. United Dico Citas' LIMIT 1), '[{"year":"2024","amount":266022000}]', 266022000, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT ANUGERAH SANTOSA ABADI' LIMIT 1), '[{"year":"2026","amount":17911515}]', 17911515, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'PT ELVINCO MEDTECH' LIMIT 1), '[{"year":"2025","amount":238350000}]', 238350000, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'SHOOPE' LIMIT 1), '[{"year":"2026","amount":64500}]', 64500, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'SHOPEE' LIMIT 1), '[{"year":"2026","amount":61500}]', 61500, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'Toko MEDSO' LIMIT 1), '[{"year":"2025","amount":22934769.74},{"year":"2026","amount":34957374.3333}]', 57892144.0733, NOW(), NOW());
INSERT INTO `payables` (`company_id`, `provider_id`, `details`, `total`, `created_at`, `updated_at`)
VALUES (@company_id, (SELECT `id` FROM `providers` WHERE `name` = 'Toko Sabaria Clothing' LIMIT 1), '[{"year":"2026","amount":1574999.999973}]', 1574999.999973, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
