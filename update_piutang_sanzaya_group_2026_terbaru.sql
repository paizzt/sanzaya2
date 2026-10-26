-- ============================================================================
-- SCRIPT UPDATE / TIMPA DATA PIUTANG TERBARU DARI GOOGLE SPREADSHEET 2026
-- Sumber File: RINCIAN PIUTANG SANZAYA GROUP 2026 - Google Spreadsheet.pdf
-- Target Perusahaan: PT Sanzaya, PT Ruma, PT Harkes
-- KEAMANAN: Data PT lain (seperti PT MSI, CV Meraki, PT BUMA, dll) 100% AMAN & TIDAK DIHAPUS
-- Tanggal Update: 26 Oktober 2026
-- ============================================================================

START TRANSACTION;

-- 1. Pastikan entitas 3 PT terdaftar di tabel `companies`
INSERT INTO `companies` (`name`, `created_at`, `updated_at`)
SELECT 'PT Sanzaya', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `companies` WHERE `name` = 'PT Sanzaya');
INSERT INTO `companies` (`name`, `created_at`, `updated_at`)
SELECT 'PT Ruma', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `companies` WHERE `name` = 'PT Ruma');
INSERT INTO `companies` (`name`, `created_at`, `updated_at`)
SELECT 'PT Harkes', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `companies` WHERE `name` = 'PT Harkes');

-- Ambil dynamic company_id agar kompatibel di semua server/hosting
SET @id_sanzaya = (SELECT `id` FROM `companies` WHERE `name` = 'PT Sanzaya' LIMIT 1);
SET @id_ruma    = (SELECT `id` FROM `companies` WHERE `name` = 'PT Ruma' LIMIT 1);
SET @id_harkes  = (SELECT `id` FROM `companies` WHERE `name` = 'PT Harkes' LIMIT 1);

-- 2. HAPUS DATA PIUTANG LAMA HANYA UNTUK 3 PT TERSEBUT PADA TABEL `receivables`
-- (Data PT lain seperti PT MSI, CV Meraki, PT BUMA, dll 100% AMAN dan TIDAK terhapus)
DELETE FROM `receivables` WHERE `company_id` IN (@id_sanzaya, @id_ruma, @id_harkes);

-- ============================================================================
-- 3. INSERT DATA PIUTANG KE TABEL `receivables` (DAN REGISTER `outlets`)
-- ============================================================================

-- [2] RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2024", "amount": "8200000.00"}, {"year": "2026", "amount": "2700000.03"}]', 10900000.03, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "21024000.00"}]', 21024000.00, NOW(), NOW());

-- [5] RSUD LA TEMMAMALA KAB. SOPPENG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD LA TEMMAMALA KAB. SOPPENG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LA TEMMAMALA KAB. SOPPENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LA TEMMAMALA KAB. SOPPENG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "9135002.80"}]', 9135002.80, NOW(), NOW());

-- [6] RSUD SYEKH YUSUF KAB.GOWA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD SYEKH YUSUF KAB.GOWA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD SYEKH YUSUF KAB.GOWA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD SYEKH YUSUF KAB.GOWA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2025", "amount": "273468880.71"}]', 273468880.71, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "247431000.00"}]', 247431000.00, NOW(), NOW());

-- [7] RSUD Wonomulyo Kab Polewali
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Wonomulyo Kab Polewali', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Wonomulyo Kab Polewali');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Wonomulyo Kab Polewali' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "9646780.00"}]', 9646780.00, NOW(), NOW());

-- [8] RSUD. BATARA SIANG PANGKEP
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD. BATARA SIANG PANGKEP', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD. BATARA SIANG PANGKEP');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD. BATARA SIANG PANGKEP' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "16987463.00"}]', 16987463.00, NOW(), NOW());

-- [10] RUMKIT BHAYANGKARA MAKASSAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RUMKIT BHAYANGKARA MAKASSAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RUMKIT BHAYANGKARA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RUMKIT BHAYANGKARA MAKASSAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "154281859.00"}]', 154281859.00, NOW(), NOW());

-- [12] Rumah Sakit Umum Daerah I Lagaligo
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'Rumah Sakit Umum Daerah I Lagaligo', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'Rumah Sakit Umum Daerah I Lagaligo');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'Rumah Sakit Umum Daerah I Lagaligo' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "941685534.13"}]', 941685534.13, NOW(), NOW());

-- [13] RSUD Arifin NU'mang
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Arifin NU''mang', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Arifin NU''mang');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Arifin NU''mang' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2920000.01"}]', 2920000.01, NOW(), NOW());

-- [14] RSUD LASINRANG KAB. PINRANG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD LASINRANG KAB. PINRANG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LASINRANG KAB. PINRANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LASINRANG KAB. PINRANG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "324195105.93"}]', 324195105.93, NOW(), NOW());

-- [16] RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "96725400.00"}]', 96725400.00, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2026", "amount": "125306679.00"}]', 125306679.00, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_harkes, '[{"year": "2026", "amount": "794535876.27"}]', 794535876.27, NOW(), NOW());

-- [17] RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2025", "amount": "27305728.05"}, {"year": "2026", "amount": "160502309.12"}]', 187808037.17, NOW(), NOW());

-- [19] KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2024", "amount": "23388441.14"}]', 23388441.14, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "9080944.00"}]', 9080944.00, NOW(), NOW());

-- [20] Apotek Al Mujarab
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'Apotek Al Mujarab', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'Apotek Al Mujarab');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'Apotek Al Mujarab' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "159960.00"}]', 159960.00, NOW(), NOW());

-- [21] RSU WISATA UIT
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSU WISATA UIT', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSU WISATA UIT');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSU WISATA UIT' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "31985375.12"}]', 31985375.12, NOW(), NOW());

-- [22] RSIA ANANDA MAKASSAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSIA ANANDA MAKASSAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSIA ANANDA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSIA ANANDA MAKASSAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "229510832.95"}]', 229510832.95, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "34845350.00"}, {"year": "2026", "amount": "31085106.00"}]', 65930456.00, NOW(), NOW());

-- [23] RSIA Kartini
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSIA Kartini', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSIA Kartini');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSIA Kartini' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2620360.13"}]', 2620360.13, NOW(), NOW());

-- [24] RSU BAHAGIA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSU BAHAGIA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSU BAHAGIA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSU BAHAGIA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "3605075.00"}]', 3605075.00, NOW(), NOW());

-- [25] YAYASAN MUJAISYAH SEJAHTERA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'YAYASAN MUJAISYAH SEJAHTERA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'YAYASAN MUJAISYAH SEJAHTERA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'YAYASAN MUJAISYAH SEJAHTERA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "53642628.04"}]', 53642628.04, NOW(), NOW());

-- [27] PT. Medical Solution Indonesia
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PT. Medical Solution Indonesia', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT. Medical Solution Indonesia');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT. Medical Solution Indonesia' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "853226164.42"}]', 853226164.42, NOW(), NOW());

-- [28] PT.Haura Abadi Jaya
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PT.Haura Abadi Jaya', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT.Haura Abadi Jaya');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT.Haura Abadi Jaya' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2025", "amount": "6358900.00"}]', 6358900.00, NOW(), NOW());

-- [29] RS MEGA BUANA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS MEGA BUANA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS MEGA BUANA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS MEGA BUANA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "1877455.61"}]', 1877455.61, NOW(), NOW());

-- [30] APOTEK YUNI FARMA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'APOTEK YUNI FARMA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK YUNI FARMA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK YUNI FARMA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "4260448.31"}]', 4260448.31, NOW(), NOW());

-- [31] DINAS KESEHATAN KAB. TAKALAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB. TAKALAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. TAKALAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. TAKALAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2024", "amount": "659866800.00"}, {"year": "2026", "amount": "128538000.00"}]', 788404800.00, NOW(), NOW());

-- [33] SPPG TAMALATE BAROMBONG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG TAMALATE BAROMBONG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG TAMALATE BAROMBONG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG TAMALATE BAROMBONG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "870000.00"}]', 870000.00, NOW(), NOW());

-- [35] RSUD AMPANA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD AMPANA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD AMPANA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD AMPANA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "154311011.71"}]', 154311011.71, NOW(), NOW());

-- [36] PT ANUGRAH SALMAN MEDIKA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PT ANUGRAH SALMAN MEDIKA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT ANUGRAH SALMAN MEDIKA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT ANUGRAH SALMAN MEDIKA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "20000000.00"}]', 20000000.00, NOW(), NOW());

-- [38] RSUD PENDAU TAMBU
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD PENDAU TAMBU', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD PENDAU TAMBU');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD PENDAU TAMBU' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "52896520.02"}]', 52896520.02, NOW(), NOW());

-- [44] RSUD Kab Poso
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Kab Poso', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Kab Poso');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Kab Poso' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "10820842.55"}]', 10820842.55, NOW(), NOW());

-- [48] RSUD LANTO DG. PASEWANG KAB. JENEPONTO
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "62140122.70"}]', 62140122.70, NOW(), NOW());

-- [51] PT RUMA UTAMA MEGATRADING
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PT RUMA UTAMA MEGATRADING', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT RUMA UTAMA MEGATRADING');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT RUMA UTAMA MEGATRADING' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "136678185.00"}]', 136678185.00, NOW(), NOW());

-- [54] RS TK III DR Sindhu Trisno
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS TK III DR Sindhu Trisno', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS TK III DR Sindhu Trisno');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS TK III DR Sindhu Trisno' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "54844419.85"}]', 54844419.85, NOW(), NOW());

-- [56] APOTEK A3 MEDIKA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'APOTEK A3 MEDIKA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK A3 MEDIKA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK A3 MEDIKA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "3273372.43"}]', 3273372.43, NOW(), NOW());

-- [57] RS MITRA HUSADA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS MITRA HUSADA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS MITRA HUSADA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS MITRA HUSADA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "586799.28"}]', 586799.28, NOW(), NOW());

-- [60] SPPG Salohe Sinaji Timur
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG Salohe Sinaji Timur', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG Salohe Sinaji Timur');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG Salohe Sinaji Timur' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "6150000.06"}]', 6150000.06, NOW(), NOW());

-- [67] PUSKESMAS EMBO
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PUSKESMAS EMBO', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PUSKESMAS EMBO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PUSKESMAS EMBO' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2053500.00"}]', 2053500.00, NOW(), NOW());

-- [68] RSUD Lakipadada
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Lakipadada', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Lakipadada');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Lakipadada' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "1998000.00"}]', 1998000.00, NOW(), NOW());

-- [70] PT HARTA TAHTA KESEHATAN
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PT HARTA TAHTA KESEHATAN', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT HARTA TAHTA KESEHATAN');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT HARTA TAHTA KESEHATAN' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "1459983867.82"}]', 1459983867.82, NOW(), NOW());

-- [72] RSUD SIWA, KABUPATEN WAJO
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD SIWA, KABUPATEN WAJO', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD SIWA, KABUPATEN WAJO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD SIWA, KABUPATEN WAJO' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "10172040.00"}]', 10172040.00, NOW(), NOW());

-- [73] RS HASRI AINUN HABIBIE
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS HASRI AINUN HABIBIE', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS HASRI AINUN HABIBIE');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS HASRI AINUN HABIBIE' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "56170085.00"}]', 56170085.00, NOW(), NOW());

-- [74] DINAS KESEHATAN KAB PINRANG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB PINRANG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB PINRANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB PINRANG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "358747338.00"}]', 358747338.00, NOW(), NOW());

-- [75] RSUD Hayyung Selayar
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Hayyung Selayar', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Hayyung Selayar');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Hayyung Selayar' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "243289800.00"}]', 243289800.00, NOW(), NOW());

-- [76] SPPG BARA BALANDAI 03
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG BARA BALANDAI 03', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG BARA BALANDAI 03');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG BARA BALANDAI 03' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "3193890.25"}]', 3193890.25, NOW(), NOW());

-- [78] RSUD LUWUK
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD LUWUK', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LUWUK');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LUWUK' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "355686709.84"}]', 355686709.84, NOW(), NOW());

-- [79] DINAS KESEHATAN KOTA MAKASSAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KOTA MAKASSAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KOTA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KOTA MAKASSAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "38739000.00"}]', 38739000.00, NOW(), NOW());

-- [80] RSUD DR. MUHAMMAD ZEIN PAINAN
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD DR. MUHAMMAD ZEIN PAINAN', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD DR. MUHAMMAD ZEIN PAINAN');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD DR. MUHAMMAD ZEIN PAINAN' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "76265281.00"}]', 76265281.00, NOW(), NOW());

-- [81] RSUD MOHAMMAD NATSIR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD MOHAMMAD NATSIR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD MOHAMMAD NATSIR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD MOHAMMAD NATSIR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "821400.00"}]', 821400.00, NOW(), NOW());

-- [82] NDF PRINTING
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'NDF PRINTING', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'NDF PRINTING');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'NDF PRINTING' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "516000.02"}]', 516000.02, NOW(), NOW());

-- [83] APOTEK MAWAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'APOTEK MAWAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK MAWAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK MAWAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "4574039.93"}]', 4574039.93, NOW(), NOW());

-- [86] SPPG SELAYAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG SELAYAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG SELAYAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG SELAYAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "1159999.95"}]', 1159999.95, NOW(), NOW());

-- [87] DINAS KESEHATAN LUWU UTARA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN LUWU UTARA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN LUWU UTARA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN LUWU UTARA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "137640000.00"}]', 137640000.00, NOW(), NOW());

-- [88] BALAI BESAR VETERINER MAROS
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'BALAI BESAR VETERINER MAROS', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'BALAI BESAR VETERINER MAROS');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'BALAI BESAR VETERINER MAROS' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "160167.00"}]', 160167.00, NOW(), NOW());

-- [90] SPPG To'bulung 01
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG To''bulung 01', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG To''bulung 01');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG To''bulung 01' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2516400.25"}]', 2516400.25, NOW(), NOW());

-- [91] SPPG Wara Utara Pattene
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG Wara Utara Pattene', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG Wara Utara Pattene');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG Wara Utara Pattene' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2865364.23"}]', 2865364.23, NOW(), NOW());

-- [92] SPPG Polres Palopo
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG Polres Palopo', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG Polres Palopo');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG Polres Palopo' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2129260.16"}]', 2129260.16, NOW(), NOW());

-- [93] SPPG BAROMBONG 05
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG BAROMBONG 05', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG BAROMBONG 05');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG BAROMBONG 05' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "1160000.00"}]', 1160000.00, NOW(), NOW());

-- ============================================================================
-- 4. REFRESH TABEL `sync_piutang_data` UNTUK MENU LAPORAN / DASHBOARD
-- ============================================================================
DELETE FROM `sync_piutang_data` WHERE `sheet_name` = 'piutang' OR `sheet_name` IS NULL;

INSERT INTO `sync_piutang_data` (`sheet_name`, `nama_outlet`, `tahun_1`, `tahun_2`, `tahun_3`, `tahun_4`, `total_sanzaya`, `ruma_1`, `ruma_2`, `ruma_3`, `total_ruma`, `total_gabungan`, `created_at`, `updated_at`) VALUES
('piutang', 'RS TK IV DR. SUMANTRI PARE-PARE', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU', '8.200.000,00', '-', '2.700.000,03', '-', '10.900.000,03', '21.024.000,00', '-', '-', '21.024.000,00', '31.924.000,03', NOW(), NOW()),
('piutang', 'RSUD Anuntaloko Parigi', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LA TEMMAMALA KAB. SOPPENG', '-', '-', '9.135.002,80', '-', '9.135.002,80', '-', '-', '-', '-', '9.135.002,80', NOW(), NOW()),
('piutang', 'RSUD SYEKH YUSUF KAB.GOWA', '-', '273.468.880,71', '-', '-', '273.468.880,71', '247.431.000,00', '-', '-', '247.431.000,00', '520.899.880,71', NOW(), NOW()),
('piutang', 'RSUD Wonomulyo Kab Polewali', '-', '-', '-', '-', '-', '9.646.780,00', '-', '-', '9.646.780,00', '9.646.780,00', NOW(), NOW()),
('piutang', 'RSUD. BATARA SIANG PANGKEP', '-', '-', '16.987.463,00', '-', '16.987.463,00', '-', '-', '-', '-', '16.987.463,00', NOW(), NOW()),
('piutang', 'RSUD BANYORANG KAB. BANTAENG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RUMKIT BHAYANGKARA MAKASSAR', '-', '-', '154.281.859,00', '-', '154.281.859,00', '-', '-', '-', '-', '154.281.859,00', NOW(), NOW()),
('piutang', 'RS PALEMMAI TANDI', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'Rumah Sakit Umum Daerah I Lagaligo', '-', '-', '941.685.534,13', '-', '941.685.534,13', '-', '-', '-', '-', '941.685.534,13', NOW(), NOW()),
('piutang', 'RSUD Arifin NU''mang', '-', '-', '2.920.000,01', '-', '2.920.000,01', '-', '-', '-', '-', '2.920.000,01', NOW(), NOW()),
('piutang', 'RSUD LASINRANG KAB. PINRANG', '-', '-', '324.195.105,93', '-', '324.195.105,93', '-', '-', '-', '-', '324.195.105,93', NOW(), NOW()),
('piutang', 'RSUD NENE MALLOMO KAB.SIDRAP', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG', '-', '-', '96.725.400,00', '-', '96.725.400,00', '-', '125.306.679,00', '-', '125.306.679,00', '1.016.567.955,27', NOW(), NOW()),
('piutang', 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR', '-', '27.305.728,05', '160.502.309,12', '-', '187.808.037,17', '-', '-', '-', '-', '187.808.037,17', NOW(), NOW()),
('piutang', 'RSUD BATARA GURU BELOPA', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG', '23.388.441,14', '-', '-', '-', '23.388.441,14', '9.080.944,00', '-', '-', '9.080.944,00', '32.469.385,14', NOW(), NOW()),
('piutang', 'Apotek Al Mujarab', '-', '-', '-', '-', '-', '159.960,00', '-', '-', '159.960,00', '159.960,00', NOW(), NOW()),
('piutang', 'RSU WISATA UIT', '-', '-', '31.985.375,12', '-', '31.985.375,12', '-', '-', '-', '-', '31.985.375,12', NOW(), NOW()),
('piutang', 'RSIA ANANDA MAKASSAR', '-', '-', '229.510.832,95', '-', '229.510.832,95', '34.845.350,00', '31.085.106,00', '-', '65.930.456,00', '295.441.288,95', NOW(), NOW()),
('piutang', 'RSIA Kartini', '-', '-', '2.620.360,13', '-', '2.620.360,13', '-', '-', '-', '-', '2.620.360,13', NOW(), NOW()),
('piutang', 'RSU BAHAGIA', '-', '-', '-', '-', '-', '3.605.075,00', '-', '-', '3.605.075,00', '3.605.075,00', NOW(), NOW()),
('piutang', 'YAYASAN MUJAISYAH SEJAHTERA', '-', '-', '53.642.628,04', '-', '53.642.628,04', '-', '-', '-', '-', '53.642.628,04', NOW(), NOW()),
('piutang', 'RUMAH SAKIT HAPSAH', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'PT. Medical Solution Indonesia', '-', '-', '853.226.164,42', '-', '853.226.164,42', '-', '-', '-', '-', '853.226.164,42', NOW(), NOW()),
('piutang', 'PT.Haura Abadi Jaya', '-', '6.358.900,00', '-', '-', '6.358.900,00', '-', '-', '-', '-', '6.358.900,00', NOW(), NOW()),
('piutang', 'RS MEGA BUANA', '-', '-', '1.877.455,61', '-', '1.877.455,61', '-', '-', '-', '-', '1.877.455,61', NOW(), NOW()),
('piutang', 'APOTEK YUNI FARMA', '-', '-', '4.260.448,31', '-', '4.260.448,31', '-', '-', '-', '-', '4.260.448,31', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB. TAKALAR', '659.866.800,00', '-', '128.538.000,00', '-', '788.404.800,00', '-', '-', '-', '-', '788.404.800,00', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB. BANTAENG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG TAMALATE BAROMBONG', '-', '-', '870.000,00', '-', '870.000,00', '-', '-', '-', '-', '870.000,00', NOW(), NOW()),
('piutang', 'SPPG HAJI BAU', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD AMPANA', '-', '-', '154.311.011,71', '-', '154.311.011,71', '-', '-', '-', '-', '154.311.011,71', NOW(), NOW()),
('piutang', 'PT ANUGRAH SALMAN MEDIKA', '-', '-', '20.000.000,00', '-', '20.000.000,00', '-', '-', '-', '-', '20.000.000,00', NOW(), NOW()),
('piutang', 'RSUD MASSENREMPULU Enrekang', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD PENDAU TAMBU', '-', '-', '52.896.520,02', '-', '52.896.520,02', '-', '-', '-', '-', '52.896.520,02', NOW(), NOW()),
('piutang', 'RS. UNIVERSITAS HASANUDDIN MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'KLINIK AZKA NADHIFA', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'KLINIK GRIYA AFIAT', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RS HIKMAH MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LAMADDUKELLENG KAB WAJO', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD Kab Poso', '-', '-', '10.820.842,55', '-', '10.820.842,55', '-', '-', '-', '-', '10.820.842,55', NOW(), NOW()),
('piutang', 'RSUD DAYA KOTA MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'Dinas Kesehatan Kabupaten Pasangkayu', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RUMKIT TK. IV DR.M. YASIN BONE', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO', '-', '-', '62.140.122,70', '-', '62.140.122,70', '-', '-', '-', '-', '62.140.122,70', NOW(), NOW()),
('piutang', 'RSIA PERTIWI MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'ANDI AIDA BONE', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'PT RUMA UTAMA MEGATRADING', '-', '-', '136.678.185,00', '-', '136.678.185,00', '-', '-', '-', '-', '136.678.185,00', NOW(), NOW()),
('piutang', 'RSUD MOKOPIDO KAB TOLI-TOLI', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD RUMBIA JENEPONTO', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RS TK III DR Sindhu Trisno', '-', '-', '54.844.419,85', '-', '54.844.419,85', '-', '-', '-', '-', '54.844.419,85', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB SIGI', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'APOTEK A3 MEDIKA', '-', '-', '3.273.372,43', '-', '3.273.372,43', '-', '-', '-', '-', '3.273.372,43', NOW(), NOW()),
('piutang', 'RS MITRA HUSADA', '-', '-', '586.799,28', '-', '586.799,28', '-', '-', '-', '-', '586.799,28', NOW(), NOW()),
('piutang', 'RS PKU Muhammadiyah Unismuh Makassar', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Bara Rampoang', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Salohe Sinaji Timur', '-', '-', '6.150.000,06', '-', '6.150.000,06', '-', '-', '-', '-', '6.150.000,06', NOW(), NOW()),
('piutang', 'RS.Dr. TADJUDDIN CHALID MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG To''bulung 02', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Bangkala 3', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'Rs siti fatimah makassar', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'Ibu Habiba', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB SOPPENG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'PUSKESMAS EMBO', '-', '-', '2.053.500,00', '-', '2.053.500,00', '-', '-', '-', '-', '2.053.500,00', NOW(), NOW()),
('piutang', 'RSUD Lakipadada', '-', '-', '1.998.000,00', '-', '1.998.000,00', '-', '-', '-', '-', '1.998.000,00', NOW(), NOW()),
('piutang', 'BBKK MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'PT HARTA TAHTA KESEHATAN', '-', '-', '1.459.983.867,82', '-', '1.459.983.867,82', '-', '-', '-', '-', '1.459.983.867,82', NOW(), NOW()),
('piutang', 'DR. Ayudini', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD SIWA, KABUPATEN WAJO', '-', '-', '10.172.040,00', '-', '10.172.040,00', '-', '-', '-', '-', '10.172.040,00', NOW(), NOW()),
('piutang', 'RS HASRI AINUN HABIBIE', '-', '-', '56.170.085,00', '-', '56.170.085,00', '-', '-', '-', '-', '56.170.085,00', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB PINRANG', '-', '-', '358.747.338,00', '-', '358.747.338,00', '-', '-', '-', '-', '358.747.338,00', NOW(), NOW()),
('piutang', 'RSUD Hayyung Selayar', '-', '-', '243.289.800,00', '-', '243.289.800,00', '-', '-', '-', '-', '243.289.800,00', NOW(), NOW()),
('piutang', 'SPPG BARA BALANDAI 03', '-', '-', '3.193.890,25', '-', '3.193.890,25', '-', '-', '-', '-', '3.193.890,25', NOW(), NOW()),
('piutang', 'SPPG BAROMBONG 03', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LUWUK', '-', '-', '355.686.709,84', '-', '355.686.709,84', '-', '-', '-', '-', '355.686.709,84', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KOTA MAKASSAR', '-', '-', '38.739.000,00', '-', '38.739.000,00', '-', '-', '-', '-', '38.739.000,00', NOW(), NOW()),
('piutang', 'RSUD DR. MUHAMMAD ZEIN PAINAN', '-', '-', '76.265.281,00', '-', '76.265.281,00', '-', '-', '-', '-', '76.265.281,00', NOW(), NOW()),
('piutang', 'RSUD MOHAMMAD NATSIR', '-', '-', '821.400,00', '-', '821.400,00', '-', '-', '-', '-', '821.400,00', NOW(), NOW()),
('piutang', 'NDF PRINTING', '-', '-', '516.000,02', '-', '516.000,02', '-', '-', '-', '-', '516.000,02', NOW(), NOW()),
('piutang', 'APOTEK MAWAR', '-', '-', '4.574.039,93', '-', '4.574.039,93', '-', '-', '-', '-', '4.574.039,93', NOW(), NOW()),
('piutang', 'SPPG PATTENE PALOPO', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG ANGGERAJA ENREKANG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG SELAYAR', '-', '-', '1.159.999,95', '-', '1.159.999,95', '-', '-', '-', '-', '1.159.999,95', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN LUWU UTARA', '-', '-', '137.640.000,00', '-', '137.640.000,00', '-', '-', '-', '-', '137.640.000,00', NOW(), NOW()),
('piutang', 'BALAI BESAR VETERINER MAROS', '-', '-', '160.167,00', '-', '160.167,00', '-', '-', '-', '-', '160.167,00', NOW(), NOW()),
('piutang', 'Sppg Wara Utara Luminda', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG To''bulung 01', '-', '-', '2.516.400,25', '-', '2.516.400,25', '-', '-', '-', '-', '2.516.400,25', NOW(), NOW()),
('piutang', 'SPPG Wara Utara Pattene', '-', '-', '2.865.364,23', '-', '2.865.364,23', '-', '-', '-', '-', '2.865.364,23', NOW(), NOW()),
('piutang', 'SPPG Polres Palopo', '-', '-', '2.129.260,16', '-', '2.129.260,16', '-', '-', '-', '-', '2.129.260,16', NOW(), NOW()),
('piutang', 'SPPG BAROMBONG 05', '-', '-', '1.160.000,00', '-', '1.160.000,00', '-', '-', '-', '-', '1.160.000,00', NOW(), NOW());

COMMIT;

-- ============================================================================
-- QUERY VERIFIKASI HASIL UPDATE:
-- ============================================================================
-- SELECT c.name AS PT, COUNT(r.id) AS Jumlah_Outlet, SUM(r.total) AS Total_Piutang
-- FROM receivables r JOIN companies c ON r.company_id = c.id
-- WHERE c.id IN (@id_sanzaya, @id_ruma, @id_harkes)
-- GROUP BY c.id, c.name;

-- Ringkasan Total Sesuai File PDF:
-- PT Sanzaya: Rp 7.275.796.105,55
--   * 2024:   Rp 691.455.241,14
--   * 2025:   Rp 307.133.508,76
--   * 2026:   Rp 6.277.207.355,65
-- PT Ruma:    Rp 482.184.894,00
--   * 2025:   Rp 325.793.109,00
--   * 2026:   Rp 156.391.785,00
-- PT Harkes:  Rp 794.535.876,27
-- GRAND TOTAL GABUNGAN: Rp 8.552.516.875,82
-- ============================================================================