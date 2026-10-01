-- Script Reset & Update Piutang dari PDF
-- Aman untuk PT lain (MSI, CV Meraki, BUMA)

-- RESET DATA UNTUK 3 PT TERSEBUT
DELETE FROM `receivables` WHERE `company_id` IN (1, 2, 4);

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2024", "amount": "8200000.0"}, {"year": "2026", "amount": "2700000.03"}]', 10900000.03, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2025", "amount": "21024000.0"}]', 21024000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD LA TEMMAMALA KAB. SOPPENG', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LA TEMMAMALA KAB. SOPPENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LA TEMMAMALA KAB. SOPPENG' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "9135002.8"}]', 9135002.8, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD SYEKH YUSUF KAB.GOWA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD SYEKH YUSUF KAB.GOWA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD SYEKH YUSUF KAB.GOWA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2025", "amount": "273468880.71"}]', 273468880.71, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2025", "amount": "247431000.0"}]', 247431000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD Wonomulyo Kab Polewali', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Wonomulyo Kab Polewali');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Wonomulyo Kab Polewali' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2025", "amount": "9646780.0"}]', 9646780.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD. BATARA SIANG PANGKEP', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD. BATARA SIANG PANGKEP');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD. BATARA SIANG PANGKEP' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "16987463.0"}]', 16987463.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RUMKIT BHAYANGKARA MAKASSAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RUMKIT BHAYANGKARA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RUMKIT BHAYANGKARA MAKASSAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "134900011.0"}]', 134900011.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'Rumah Sakit Umum Daerah I Lagaligo', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'Rumah Sakit Umum Daerah I Lagaligo');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'Rumah Sakit Umum Daerah I Lagaligo' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "441676321.49"}]', 441676321.49, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD LASINRANG KAB. PINRANG', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LASINRANG KAB. PINRANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LASINRANG KAB. PINRANG' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "324195105.93"}]', 324195105.93, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "5996664.0"}]', 5996664.0, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2026", "amount": "61438500.0"}]', 61438500.0, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 4, '[{"year": "2026", "amount": "1773380153.37"}]', 1773380153.37, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2025", "amount": "27305728.05"}, {"year": "2026", "amount": "160502309.12"}]', 187808037.17, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2024", "amount": "23388441.14"}]', 23388441.14, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2025", "amount": "9080944.0"}]', 9080944.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'Apotek Al Mujarab', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'Apotek Al Mujarab');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'Apotek Al Mujarab' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2025", "amount": "159960.0"}]', 159960.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSU WISATA UIT', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSU WISATA UIT');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSU WISATA UIT' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "23380374.73"}]', 23380374.73, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSIA ANANDA MAKASSAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSIA ANANDA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSIA ANANDA MAKASSAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "198173633.94"}]', 198173633.94, NOW(), NOW());
INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2025", "amount": "34845350.0"}, {"year": "2026", "amount": "31085106.0"}]', 65930456.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSIA Kartini', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSIA Kartini');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSIA Kartini' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "9543600.0"}]', 9543600.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSU BAHAGIA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSU BAHAGIA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSU BAHAGIA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '[{"year": "2025", "amount": "3605075.0"}]', 3605075.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'YAYASAN MUJAISYAH SEJAHTERA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'YAYASAN MUJAISYAH SEJAHTERA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'YAYASAN MUJAISYAH SEJAHTERA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "50349629.0"}]', 50349629.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'PT. Medical Solution Indonesia', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT. Medical Solution Indonesia');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT. Medical Solution Indonesia' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "721348468.98"}]', 721348468.98, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'PT.Haura Abadi Jaya', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT.Haura Abadi Jaya');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT.Haura Abadi Jaya' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2025", "amount": "6358900.0"}]', 6358900.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'APOTEK YUNI FARMA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK YUNI FARMA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK YUNI FARMA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "2271998.15"}]', 2271998.15, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB. TAKALAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. TAKALAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB. TAKALAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2024", "amount": "659866800.0"}, {"year": "2026", "amount": "144966000.0"}]', 804832800.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'SPPG TAMALATE BAROMBONG', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG TAMALATE BAROMBONG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG TAMALATE BAROMBONG' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "1159999.95"}]', 1159999.95, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'SPPG HAJI BAU', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG HAJI BAU');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG HAJI BAU' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "940000.0"}]', 940000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD AMPANA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD AMPANA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD AMPANA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "129717851.71"}]', 129717851.71, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'PT ANUGRAH SALMAN MEDIKA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT ANUGRAH SALMAN MEDIKA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT ANUGRAH SALMAN MEDIKA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "20000000.0"}]', 20000000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD PENDAU TAMBU', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD PENDAU TAMBU');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD PENDAU TAMBU' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "19664520.02"}]', 19664520.02, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'KLINIK AZKA NADHIFA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'KLINIK AZKA NADHIFA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'KLINIK AZKA NADHIFA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "775000.0"}]', 775000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD Kab Poso', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Kab Poso');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Kab Poso' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "14520842.55"}]', 14520842.55, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD DAYA KOTA MAKASSAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD DAYA KOTA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD DAYA KOTA MAKASSAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "202406280.0"}]', 202406280.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "62140122.7"}]', 62140122.7, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'PT RUMA UTAMA MEGATRADING', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT RUMA UTAMA MEGATRADING');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT RUMA UTAMA MEGATRADING' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "51605010.0"}]', 51605010.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD RUMBIA JENEPONTO', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD RUMBIA JENEPONTO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD RUMBIA JENEPONTO' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "35951679.0"}]', 35951679.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RS TK III DR Sindhu Trisno', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS TK III DR Sindhu Trisno');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS TK III DR Sindhu Trisno' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "54844419.85"}]', 54844419.85, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'APOTEK A3 MEDIKA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK A3 MEDIKA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK A3 MEDIKA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "2179878.13"}]', 2179878.13, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RS MITRA HUSADA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS MITRA HUSADA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS MITRA HUSADA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "501347.77"}]', 501347.77, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'SPPG Salohe Sinaji Timur', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG Salohe Sinaji Timur');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG Salohe Sinaji Timur' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "2899999.98"}]', 2899999.98, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RS.Dr. TADJUDDIN CHALID MAKASSAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS.Dr. TADJUDDIN CHALID MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS.Dr. TADJUDDIN CHALID MAKASSAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "2568011.64"}]', 2568011.64, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD Lakipadada', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Lakipadada');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Lakipadada' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "1998000.0"}]', 1998000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'PT HARTA TAHTA KESEHATAN', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'PT HARTA TAHTA KESEHATAN');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'PT HARTA TAHTA KESEHATAN' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "882744612.88"}]', 882744612.88, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD SIWA, KABUPATEN WAJO', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD SIWA, KABUPATEN WAJO');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD SIWA, KABUPATEN WAJO' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "10016640.0"}]', 10016640.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RS HASRI AINUN HABIBIE', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RS HASRI AINUN HABIBIE');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RS HASRI AINUN HABIBIE' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "52555170.0"}]', 52555170.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KAB PINRANG', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB PINRANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KAB PINRANG' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "88888800.0"}]', 88888800.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD Hayyung Selayar', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD Hayyung Selayar');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD Hayyung Selayar' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "180165210.0"}]', 180165210.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'SPPG BARA BALANDAI 03', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG BARA BALANDAI 03');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG BARA BALANDAI 03' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "2179680.14"}]', 2179680.14, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD LUWUK', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD LUWUK');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD LUWUK' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "217417717.98"}]', 217417717.98, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN KOTA MAKASSAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KOTA MAKASSAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN KOTA MAKASSAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "38739000.0"}]', 38739000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD DR. MUHAMMAD ZEIN PAINAN', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD DR. MUHAMMAD ZEIN PAINAN');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD DR. MUHAMMAD ZEIN PAINAN' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "76265281.0"}]', 76265281.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'RSUD MOHAMMAD NATSIR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'RSUD MOHAMMAD NATSIR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'RSUD MOHAMMAD NATSIR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "821400.0"}]', 821400.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'NDF PRINTING', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'NDF PRINTING');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'NDF PRINTING' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "516000.02"}]', 516000.02, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'APOTEK MAWAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'APOTEK MAWAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'APOTEK MAWAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "4574039.93"}]', 4574039.93, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'SPPG ANGGERAJA ENREKANG', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG ANGGERAJA ENREKANG');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG ANGGERAJA ENREKANG' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "1344000.0"}]', 1344000.0, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'SPPG SELAYAR', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'SPPG SELAYAR');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'SPPG SELAYAR' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "1159999.95"}]', 1159999.95, NOW(), NOW());

INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT 'DINAS KESEHATAN LUWU UTARA', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = 'DINAS KESEHATAN LUWU UTARA');
SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = 'DINAS KESEHATAN LUWU UTARA' LIMIT 1);

INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '[{"year": "2026", "amount": "97331460.0"}]', 97331460.0, NOW(), NOW());

