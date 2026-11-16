-- ============================================================================
-- SCRIPT UPDATE / TIMPA DATA PIUTANG TERBARU DARI GOOGLE SPREADSHEET 2026
-- Sumber File: RINCIAN PIUTANG SANZAYA GROUP 2026 - Google Spreadsheet.pdf
-- Target Perusahaan: PT Sanzaya Medika Pratama, PT Ruma, PT Harkes
-- KEAMANAN: Data PT lain (seperti PT MSI, CV Meraki, PT BUMA, dll) 100% AMAN & TIDAK DIHAPUS
-- Tanggal Update: 16 November 2026
-- ============================================================================

START TRANSACTION;

-- 1. Pastikan entitas 3 PT terdaftar di tabel `companies`
--    Update nama 'PT Sanzaya' menjadi 'PT Sanzaya Medika Pratama' jika sebelumnya memakai nama singkat
UPDATE `companies` SET `name` = 'PT Sanzaya Medika Pratama' WHERE `name` = 'PT Sanzaya';
INSERT INTO `companies` (`name`, `created_at`, `updated_at`)
SELECT 'PT Sanzaya Medika Pratama', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `companies` WHERE `name` = 'PT Sanzaya Medika Pratama');
INSERT INTO `companies` (`name`, `created_at`, `updated_at`)
SELECT 'PT Ruma', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `companies` WHERE `name` = 'PT Ruma');
INSERT INTO `companies` (`name`, `created_at`, `updated_at`)
SELECT 'PT Harkes', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `companies` WHERE `name` = 'PT Harkes');

-- Ambil dynamic company_id agar kompatibel di semua server/hosting
SET @id_sanzaya = (SELECT `id` FROM `companies` WHERE `name` IN ('PT Sanzaya Medika Pratama', 'PT Sanzaya') ORDER BY (`name` = 'PT Sanzaya Medika Pratama') DESC LIMIT 1);
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

-- [5] RSUD SYEKH YUSUF KAB.GOWA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD SYEKH YUSUF KAB.GOWA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD SYEKH YUSUF KAB.GOWA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD SYEKH YUSUF KAB.GOWA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2025", "amount": "273468880.71"}]', 273468880.71, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "247431000.00"}]', 247431000.00, NOW(), NOW());

-- [6] RSUD Wonomulyo Kab Polewali
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Wonomulyo Kab Polewali', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Wonomulyo Kab Polewali');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Wonomulyo Kab Polewali' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "4896300.00"}]', 4896300.00, NOW(), NOW());

-- [7] RSUD. BATARA SIANG PANGKEP
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD. BATARA SIANG PANGKEP', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD. BATARA SIANG PANGKEP');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD. BATARA SIANG PANGKEP' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "16987463.00"}]', 16987463.00, NOW(), NOW());

-- [9] RUMKIT BHAYANGKARA MAKASSAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RUMKIT BHAYANGKARA MAKASSAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RUMKIT BHAYANGKARA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RUMKIT BHAYANGKARA MAKASSAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "199318444.00"}]', 199318444.00, NOW(), NOW());

-- [11] Rumah Sakit Umum Daerah I Lagaligo
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'Rumah Sakit Umum Daerah I Lagaligo', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'Rumah Sakit Umum Daerah I Lagaligo');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'Rumah Sakit Umum Daerah I Lagaligo' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "142032963.22"}]', 142032963.22, NOW(), NOW());

-- [12] RSUD Arifin NU'mang
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Arifin NU''mang', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Arifin NU''mang');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Arifin NU''mang' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2920000.01"}]', 2920000.01, NOW(), NOW());

-- [13] RSUD LASINRANG KAB. PINRANG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD LASINRANG KAB. PINRANG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LASINRANG KAB. PINRANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LASINRANG KAB. PINRANG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "324195105.93"}]', 324195105.93, NOW(), NOW());

-- [14] RSUD NENE MALLOMO KAB.SIDRAP
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD NENE MALLOMO KAB.SIDRAP', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD NENE MALLOMO KAB.SIDRAP');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD NENE MALLOMO KAB.SIDRAP' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "40556503.00"}]', 40556503.00, NOW(), NOW());

-- [15] RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_harkes, '[{"year": "2026", "amount": "254445537.51"}]', 254445537.51, NOW(), NOW());

-- [16] RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "128416943.60"}]', 128416943.60, NOW(), NOW());

-- [18] KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2024", "amount": "23388441.14"}]', 23388441.14, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "9080944.00"}]', 9080944.00, NOW(), NOW());

-- [19] Apotek Al Mujarab
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'Apotek Al Mujarab', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'Apotek Al Mujarab');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'Apotek Al Mujarab' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "159960.00"}]', 159960.00, NOW(), NOW());

-- [20] RSU WISATA UIT
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSU WISATA UIT', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSU WISATA UIT');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSU WISATA UIT' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "33296314.75"}]', 33296314.75, NOW(), NOW());

-- [21] RSIA ANANDA MAKASSAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSIA ANANDA MAKASSAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSIA ANANDA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSIA ANANDA MAKASSAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "231201183.13"}]', 231201183.13, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "34845350.00"}, {"year": "2026", "amount": "31085106.00"}]', 65930456.00, NOW(), NOW());

-- [22] RSIA Kartini
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSIA Kartini', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSIA Kartini');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSIA Kartini' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "7609960.13"}]', 7609960.13, NOW(), NOW());

-- [23] RSU BAHAGIA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSU BAHAGIA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSU BAHAGIA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSU BAHAGIA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2025", "amount": "3605075.00"}]', 3605075.00, NOW(), NOW());

-- [24] YAYASAN MUJAISYAH SEJAHTERA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'YAYASAN MUJAISYAH SEJAHTERA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'YAYASAN MUJAISYAH SEJAHTERA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'YAYASAN MUJAISYAH SEJAHTERA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "53107870.74"}]', 53107870.74, NOW(), NOW());

-- [26] PT.Haura Abadi Jaya
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PT.Haura Abadi Jaya', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT.Haura Abadi Jaya');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT.Haura Abadi Jaya' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2025", "amount": "6358900.00"}]', 6358900.00, NOW(), NOW());

-- [28] APOTEK YUNI FARMA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'APOTEK YUNI FARMA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK YUNI FARMA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK YUNI FARMA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2278820.34"}]', 2278820.34, NOW(), NOW());

-- [29] DINAS KESEHATAN KAB. TAKALAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB. TAKALAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. TAKALAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. TAKALAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2024", "amount": "659866800.00"}, {"year": "2026", "amount": "128538000.00"}]', 788404800.00, NOW(), NOW());

-- [30] DINAS KESEHATAN KAB. BANTAENG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB. BANTAENG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. BANTAENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. BANTAENG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "480852000.00"}]', 480852000.00, NOW(), NOW());

-- [33] RSUD AMPANA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD AMPANA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD AMPANA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD AMPANA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "141271010.99"}]', 141271010.99, NOW(), NOW());

-- [34] PT ANUGRAH SALMAN MEDIKA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PT ANUGRAH SALMAN MEDIKA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT ANUGRAH SALMAN MEDIKA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT ANUGRAH SALMAN MEDIKA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "32000000.00"}]', 32000000.00, NOW(), NOW());

-- [36] RSUD PENDAU TAMBU
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD PENDAU TAMBU', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD PENDAU TAMBU');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD PENDAU TAMBU' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "52896520.02"}]', 52896520.02, NOW(), NOW());

-- [39] KLINIK GRIYA AFIAT
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'KLINIK GRIYA AFIAT', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'KLINIK GRIYA AFIAT');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'KLINIK GRIYA AFIAT' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "675000.00"}]', 675000.00, NOW(), NOW());

-- [42] RSUD Kab Poso
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Kab Poso', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Kab Poso');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Kab Poso' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "10820842.55"}]', 10820842.55, NOW(), NOW());

-- [43] RSUD DAYA KOTA MAKASSAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD DAYA KOTA MAKASSAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD DAYA KOTA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD DAYA KOTA MAKASSAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "5577600.02"}]', 5577600.02, NOW(), NOW());

-- [46] RSUD LANTO DG. PASEWANG KAB. JENEPONTO
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "62140122.70"}]', 62140122.70, NOW(), NOW());

-- [50] RSUD RUMBIA JENEPONTO
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD RUMBIA JENEPONTO', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD RUMBIA JENEPONTO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD RUMBIA JENEPONTO' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "769896.00"}]', 769896.00, NOW(), NOW());

-- [51] RS TK III DR Sindhu Trisno
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS TK III DR Sindhu Trisno', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS TK III DR Sindhu Trisno');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS TK III DR Sindhu Trisno' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "54844419.85"}]', 54844419.85, NOW(), NOW());

-- [53] APOTEK A3 MEDIKA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'APOTEK A3 MEDIKA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK A3 MEDIKA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK A3 MEDIKA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2767472.48"}]', 2767472.48, NOW(), NOW());

-- [54] RS MITRA HUSADA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS MITRA HUSADA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS MITRA HUSADA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS MITRA HUSADA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "586799.28"}]', 586799.28, NOW(), NOW());

-- [57] SPPG Salohe Sinaji Timur
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG Salohe Sinaji Timur', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG Salohe Sinaji Timur');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG Salohe Sinaji Timur' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "7900000.04"}]', 7900000.04, NOW(), NOW());

-- [64] PUSKESMAS EMBO
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'PUSKESMAS EMBO', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PUSKESMAS EMBO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PUSKESMAS EMBO' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "2053500.00"}]', 2053500.00, NOW(), NOW());

-- [68] RSUD SIWA, KABUPATEN WAJO
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD SIWA, KABUPATEN WAJO', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD SIWA, KABUPATEN WAJO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD SIWA, KABUPATEN WAJO' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "155400.00"}]', 155400.00, NOW(), NOW());

-- [69] RS HASRI AINUN HABIBIE
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS HASRI AINUN HABIBIE', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS HASRI AINUN HABIBIE');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS HASRI AINUN HABIBIE' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "15606245.00"}]', 15606245.00, NOW(), NOW());

-- [70] DINAS KESEHATAN KAB PINRANG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB PINRANG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB PINRANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB PINRANG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "358747338.00"}]', 358747338.00, NOW(), NOW());

-- [71] RSUD Hayyung Selayar
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD Hayyung Selayar', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Hayyung Selayar');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Hayyung Selayar' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "67436940.00"}]', 67436940.00, NOW(), NOW());

-- [74] RSUD LUWUK
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD LUWUK', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LUWUK');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LUWUK' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "445090128.78"}]', 445090128.78, NOW(), NOW());

-- [75] DINAS KESEHATAN KOTA MAKASSAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KOTA MAKASSAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KOTA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KOTA MAKASSAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "77478000.00"}]', 77478000.00, NOW(), NOW());

-- [76] RSUD DR. MUHAMMAD ZEIN PAINAN
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD DR. MUHAMMAD ZEIN PAINAN', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD DR. MUHAMMAD ZEIN PAINAN');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD DR. MUHAMMAD ZEIN PAINAN' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "76265281.00"}]', 76265281.00, NOW(), NOW());

-- [77] RSUD MOHAMMAD NATSIR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RSUD MOHAMMAD NATSIR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD MOHAMMAD NATSIR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD MOHAMMAD NATSIR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "821400.00"}]', 821400.00, NOW(), NOW());

-- [78] NDF PRINTING
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'NDF PRINTING', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'NDF PRINTING');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'NDF PRINTING' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "516000.02"}]', 516000.02, NOW(), NOW());

-- [79] APOTEK MAWAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'APOTEK MAWAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK MAWAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK MAWAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "4574039.93"}]', 4574039.93, NOW(), NOW());

-- [82] SPPG SELAYAR
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG SELAYAR', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG SELAYAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG SELAYAR' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "1159999.95"}]', 1159999.95, NOW(), NOW());

-- [83] DINAS KESEHATAN LUWU UTARA
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN LUWU UTARA', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN LUWU UTARA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN LUWU UTARA' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "137640000.00"}]', 137640000.00, NOW(), NOW());

-- [84] BALAI BESAR VETERINER MAROS
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'BALAI BESAR VETERINER MAROS', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'BALAI BESAR VETERINER MAROS');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'BALAI BESAR VETERINER MAROS' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "160167.00"}]', 160167.00, NOW(), NOW());

-- [89] SPPG BAROMBONG 05
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'SPPG BAROMBONG 05', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG BAROMBONG 05');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG BAROMBONG 05' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "1160000.00"}]', 1160000.00, NOW(), NOW());

-- [91] DINAS KESEHATAN KAB SIDENRENG RAPPANG
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB SIDENRENG RAPPANG', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB SIDENRENG RAPPANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB SIDENRENG RAPPANG' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_sanzaya, '[{"year": "2026", "amount": "21756000.00"}]', 21756000.00, NOW(), NOW());

-- [92] RS UIN Alauddin Makassar
INSERT INTO `outlets` (`name`, `is_pending`, `created_at`, `updated_at`) SELECT 'RS UIN Alauddin Makassar', 0, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS UIN Alauddin Makassar');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS UIN Alauddin Makassar' LIMIT 1);
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, @id_ruma, '[{"year": "2026", "amount": "987500.00"}]', 987500.00, NOW(), NOW());

-- ============================================================================
-- 4. REFRESH TABEL `sync_piutang_data` UNTUK MENU LAPORAN / DASHBOARD REKAP
-- ============================================================================
DELETE FROM `sync_piutang_data` WHERE `sheet_name` = 'piutang' OR `sheet_name` IS NULL;

INSERT INTO `sync_piutang_data` (`sheet_name`, `nama_outlet`, `tahun_1`, `tahun_2`, `tahun_3`, `tahun_4`, `total_sanzaya`, `ruma_1`, `ruma_2`, `ruma_3`, `total_ruma`, `total_gabungan`, `created_at`, `updated_at`) VALUES
('piutang', 'RS TK IV DR. SUMANTRI PARE-PARE', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU', '8.200.000,00', '-', '2.700.000,03', '-', '10.900.000,03', '21.024.000,00', '-', '-', '21.024.000,00', '31.924.000,03', NOW(), NOW()),
('piutang', 'RSUD Anuntaloko Parigi', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LA TEMMAMALA KAB. SOPPENG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD SYEKH YUSUF KAB.GOWA', '-', '273.468.880,71', '-', '-', '273.468.880,71', '247.431.000,00', '-', '-', '247.431.000,00', '520.899.880,71', NOW(), NOW()),
('piutang', 'RSUD Wonomulyo Kab Polewali', '-', '-', '-', '-', '-', '4.896.300,00', '-', '-', '4.896.300,00', '4.896.300,00', NOW(), NOW()),
('piutang', 'RSUD. BATARA SIANG PANGKEP', '-', '-', '16.987.463,00', '-', '16.987.463,00', '-', '-', '-', '-', '16.987.463,00', NOW(), NOW()),
('piutang', 'RSUD BANYORANG KAB. BANTAENG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RUMKIT BHAYANGKARA MAKASSAR', '-', '-', '199.318.444,00', '-', '199.318.444,00', '-', '-', '-', '-', '199.318.444,00', NOW(), NOW()),
('piutang', 'RS PALEMMAI TANDI', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'Rumah Sakit Umum Daerah I Lagaligo', '-', '-', '142.032.963,22', '-', '142.032.963,22', '-', '-', '-', '-', '142.032.963,22', NOW(), NOW()),
('piutang', 'RSUD Arifin NU''mang', '-', '-', '2.920.000,01', '-', '2.920.000,01', '-', '-', '-', '-', '2.920.000,01', NOW(), NOW()),
('piutang', 'RSUD LASINRANG KAB. PINRANG', '-', '-', '324.195.105,93', '-', '324.195.105,93', '-', '-', '-', '-', '324.195.105,93', NOW(), NOW()),
('piutang', 'RSUD NENE MALLOMO KAB.SIDRAP', '-', '-', '40.556.503,00', '-', '40.556.503,00', '-', '-', '-', '-', '40.556.503,00', NOW(), NOW()),
('piutang', 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '254.445.537,51', NOW(), NOW()),
('piutang', 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR', '-', '-', '128.416.943,60', '-', '128.416.943,60', '-', '-', '-', '-', '128.416.943,60', NOW(), NOW()),
('piutang', 'RSUD BATARA GURU BELOPA', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG', '23.388.441,14', '-', '-', '-', '23.388.441,14', '9.080.944,00', '-', '-', '9.080.944,00', '32.469.385,14', NOW(), NOW()),
('piutang', 'Apotek Al Mujarab', '-', '-', '-', '-', '-', '159.960,00', '-', '-', '159.960,00', '159.960,00', NOW(), NOW()),
('piutang', 'RSU WISATA UIT', '-', '-', '33.296.314,75', '-', '33.296.314,75', '-', '-', '-', '-', '33.296.314,75', NOW(), NOW()),
('piutang', 'RSIA ANANDA MAKASSAR', '-', '-', '231.201.183,13', '-', '231.201.183,13', '34.845.350,00', '31.085.106,00', '-', '65.930.456,00', '297.131.639,13', NOW(), NOW()),
('piutang', 'RSIA Kartini', '-', '-', '7.609.960,13', '-', '7.609.960,13', '-', '-', '-', '-', '7.609.960,13', NOW(), NOW()),
('piutang', 'RSU BAHAGIA', '-', '-', '-', '-', '-', '3.605.075,00', '-', '-', '3.605.075,00', '3.605.075,00', NOW(), NOW()),
('piutang', 'YAYASAN MUJAISYAH SEJAHTERA', '-', '-', '53.107.870,74', '-', '53.107.870,74', '-', '-', '-', '-', '53.107.870,74', NOW(), NOW()),
('piutang', 'RUMAH SAKIT HAPSAH', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'PT.Haura Abadi Jaya', '-', '6.358.900,00', '-', '-', '6.358.900,00', '-', '-', '-', '-', '6.358.900,00', NOW(), NOW()),
('piutang', 'RS MEGA BUANA', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'APOTEK YUNI FARMA', '-', '-', '2.278.820,34', '-', '2.278.820,34', '-', '-', '-', '-', '2.278.820,34', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB. TAKALAR', '659.866.800,00', '-', '128.538.000,00', '-', '788.404.800,00', '-', '-', '-', '-', '788.404.800,00', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB. BANTAENG', '-', '-', '480.852.000,00', '-', '480.852.000,00', '-', '-', '-', '-', '480.852.000,00', NOW(), NOW()),
('piutang', 'SPPG TAMALATE BAROMBONG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG HAJI BAU', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD AMPANA', '-', '-', '141.271.010,99', '-', '141.271.010,99', '-', '-', '-', '-', '141.271.010,99', NOW(), NOW()),
('piutang', 'PT ANUGRAH SALMAN MEDIKA', '-', '-', '32.000.000,00', '-', '32.000.000,00', '-', '-', '-', '-', '32.000.000,00', NOW(), NOW()),
('piutang', 'RSUD MASSENREMPULU Enrekang', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD PENDAU TAMBU', '-', '-', '52.896.520,02', '-', '52.896.520,02', '-', '-', '-', '-', '52.896.520,02', NOW(), NOW()),
('piutang', 'RS. UNIVERSITAS HASANUDDIN MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'KLINIK AZKA NADHIFA', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'KLINIK GRIYA AFIAT', '-', '-', '675.000,00', '-', '675.000,00', '-', '-', '-', '-', '675.000,00', NOW(), NOW()),
('piutang', 'RS HIKMAH MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LAMADDUKELLENG KAB WAJO', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD Kab Poso', '-', '-', '10.820.842,55', '-', '10.820.842,55', '-', '-', '-', '-', '10.820.842,55', NOW(), NOW()),
('piutang', 'RSUD DAYA KOTA MAKASSAR', '-', '-', '5.577.600,02', '-', '5.577.600,02', '-', '-', '-', '-', '5.577.600,02', NOW(), NOW()),
('piutang', 'Dinas Kesehatan Kabupaten Pasangkayu', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RUMKIT TK. IV DR.M. YASIN BONE', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO', '-', '-', '62.140.122,70', '-', '62.140.122,70', '-', '-', '-', '-', '62.140.122,70', NOW(), NOW()),
('piutang', 'RSIA PERTIWI MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'ANDI AIDA BONE', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD MOKOPIDO KAB TOLI-TOLI', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD RUMBIA JENEPONTO', '-', '-', '769.896,00', '-', '769.896,00', '-', '-', '-', '-', '769.896,00', NOW(), NOW()),
('piutang', 'RS TK III DR Sindhu Trisno', '-', '-', '54.844.419,85', '-', '54.844.419,85', '-', '-', '-', '-', '54.844.419,85', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB SIGI', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'APOTEK A3 MEDIKA', '-', '-', '2.767.472,48', '-', '2.767.472,48', '-', '-', '-', '-', '2.767.472,48', NOW(), NOW()),
('piutang', 'RS MITRA HUSADA', '-', '-', '586.799,28', '-', '586.799,28', '-', '-', '-', '-', '586.799,28', NOW(), NOW()),
('piutang', 'RS PKU Muhammadiyah Unismuh Makassar', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Bara Rampoang', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Salohe Sinaji Timur', '-', '-', '7.900.000,04', '-', '7.900.000,04', '-', '-', '-', '-', '7.900.000,04', NOW(), NOW()),
('piutang', 'RS.Dr. TADJUDDIN CHALID MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG To''bulung 02', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Bangkala 3', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'Rs siti fatimah makassar', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'Ibu Habiba', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB SOPPENG', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'PUSKESMAS EMBO', '-', '-', '2.053.500,00', '-', '2.053.500,00', '-', '-', '-', '-', '2.053.500,00', NOW(), NOW()),
('piutang', 'RSUD Lakipadada', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'BBKK MAKASSAR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'DR. Ayudini', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD SIWA, KABUPATEN WAJO', '-', '-', '155.400,00', '-', '155.400,00', '-', '-', '-', '-', '155.400,00', NOW(), NOW()),
('piutang', 'RS HASRI AINUN HABIBIE', '-', '-', '15.606.245,00', '-', '15.606.245,00', '-', '-', '-', '-', '15.606.245,00', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB PINRANG', '-', '-', '358.747.338,00', '-', '358.747.338,00', '-', '-', '-', '-', '358.747.338,00', NOW(), NOW()),
('piutang', 'RSUD Hayyung Selayar', '-', '-', '67.436.940,00', '-', '67.436.940,00', '-', '-', '-', '-', '67.436.940,00', NOW(), NOW()),
('piutang', 'SPPG BARA BALANDAI 03', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG BAROMBONG 03', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'RSUD LUWUK', '-', '-', '445.090.128,78', '-', '445.090.128,78', '-', '-', '-', '-', '445.090.128,78', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KOTA MAKASSAR', '-', '-', '77.478.000,00', '-', '77.478.000,00', '-', '-', '-', '-', '77.478.000,00', NOW(), NOW()),
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
('piutang', 'SPPG To''bulung 01', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Wara Utara Pattene', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG Polres Palopo', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'SPPG BAROMBONG 05', '-', '-', '1.160.000,00', '-', '1.160.000,00', '-', '-', '-', '-', '1.160.000,00', NOW(), NOW()),
('piutang', 'User (Ibu Rini)', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', NOW(), NOW()),
('piutang', 'DINAS KESEHATAN KAB SIDENRENG RAPPANG', '-', '-', '21.756.000,00', '-', '21.756.000,00', '-', '-', '-', '-', '21.756.000,00', NOW(), NOW()),
('piutang', 'RS UIN Alauddin Makassar', '-', '-', '-', '-', '-', '-', '987.500,00', '-', '987.500,00', '987.500,00', NOW(), NOW());

COMMIT;

-- ============================================================================
-- QUERY VERIFIKASI HASIL UPDATE:
-- ============================================================================
-- SELECT c.name AS PT, COUNT(r.id) AS Jumlah_Outlet, SUM(r.total) AS Total_Piutang
-- FROM receivables r JOIN companies c ON r.company_id = c.id
-- WHERE c.id IN (@id_sanzaya, @id_ruma, @id_harkes)
-- GROUP BY c.id, c.name;

-- Ringkasan Total Sesuai File PDF (16 November 2026):
-- PT Sanzaya Medika Pratama: Rp 4.348.164.717,34
--   * 2024:   Rp 691.455.241,14
--   * 2025:   Rp 279.827.780,71
--   * 2026:   Rp 3.376.881.695,49
-- PT Ruma:    Rp 353.115.235,00
--   * 2025:   Rp 321.042.629,00
--   * 2026:   Rp 32.072.606,00
-- PT Harkes:  Rp 254.445.537,51
-- GRAND TOTAL GABUNGAN: Rp 4.955.725.489,85
-- ============================================================================