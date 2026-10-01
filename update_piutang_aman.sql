-- Update Script Piutang (Aman untuk data/kolom PT lain)

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS TK IV DR. SUMANTRI PARE-PARE' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS TK IV DR. SUMANTRI PARE-PARE');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RS TK IV DR. SUMANTRI PARE-PARE';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU');
UPDATE `receivables` SET `tahun_1` = 8200000.00, `tahun_2` = 0, `tahun_3` = 2700000.03, `total_sanzaya` = 10900000.03, `ruma_1` = 21024000.00, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 21024000.00, `total_gabungan` = 31924000.03 WHERE `nama_outlet` = 'RUMAH SAKIT UMUM DAERAH LA PATARAI BARRU';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD Anuntaloko Parigi' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD Anuntaloko Parigi');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD Anuntaloko Parigi';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD LA TEMMAMALA KAB. SOPPENG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD LA TEMMAMALA KAB. SOPPENG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 9135002.80, `total_sanzaya` = 9135002.80, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 9135002.80 WHERE `nama_outlet` = 'RSUD LA TEMMAMALA KAB. SOPPENG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD SYEKH YUSUF KAB.GOWA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD SYEKH YUSUF KAB.GOWA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 273468880.71, `tahun_3` = 0, `total_sanzaya` = 273468880.71, `ruma_1` = 247431000.00, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 247431000.00, `total_gabungan` = 520899880.71 WHERE `nama_outlet` = 'RSUD SYEKH YUSUF KAB.GOWA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD Wonomulyo Kab Polewali' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD Wonomulyo Kab Polewali');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 9646780.00, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 9646780.00, `total_gabungan` = 9646780.00 WHERE `nama_outlet` = 'RSUD Wonomulyo Kab Polewali';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD. BATARA SIANG PANGKEP' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD. BATARA SIANG PANGKEP');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 16987463.00, `total_sanzaya` = 16987463.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 16987463.00 WHERE `nama_outlet` = 'RSUD. BATARA SIANG PANGKEP';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD BANYORANG KAB. BANTAENG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD BANYORANG KAB. BANTAENG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD BANYORANG KAB. BANTAENG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RUMKIT BHAYANGKARA MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RUMKIT BHAYANGKARA MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 134900011.00, `total_sanzaya` = 134900011.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 134900011.00 WHERE `nama_outlet` = 'RUMKIT BHAYANGKARA MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS PALEMMAI TANDI' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS PALEMMAI TANDI');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RS PALEMMAI TANDI';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'Rumah Sakit Umum Daerah I Lagaligo' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'Rumah Sakit Umum Daerah I Lagaligo');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 441676321.49, `total_sanzaya` = 441676321.49, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 441676321.49 WHERE `nama_outlet` = 'Rumah Sakit Umum Daerah I Lagaligo';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD Arifin NU\'mang' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD Arifin NU\'mang');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD Arifin NU\'mang';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD LASINRANG KAB. PINRANG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD LASINRANG KAB. PINRANG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 324195105.93, `total_sanzaya` = 324195105.93, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 324195105.93 WHERE `nama_outlet` = 'RSUD LASINRANG KAB. PINRANG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD NENE MALLOMO KAB.SIDRAP' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD NENE MALLOMO KAB.SIDRAP');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD NENE MALLOMO KAB.SIDRAP';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 5996664.00, `total_sanzaya` = 5996664.00, `ruma_1` = 0, `ruma_2` = 61438500.00, `ruma_3` = 1773380153.37, `total_ruma` = 61438500.00, `total_gabungan` = 1840815317.37 WHERE `nama_outlet` = 'RSUD. Prof Dr. H.M Anwar Makkatutu KAB.BANTAENG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 27305728.05, `tahun_3` = 160502309.12, `total_sanzaya` = 187808037.17, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 187808037.17 WHERE `nama_outlet` = 'RSUD H PADJONGA DG NGALLE KABUPATEN TAKALAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD BATARA GURU BELOPA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD BATARA GURU BELOPA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD BATARA GURU BELOPA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG');
UPDATE `receivables` SET `tahun_1` = 23388441.14, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 23388441.14, `ruma_1` = 9080944.00, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 9080944.00, `total_gabungan` = 32469385.14 WHERE `nama_outlet` = 'KLINIK UTAMA DOI 79 BANTAYAN KAB.BANTAENG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'Apotek Al Mujarab' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'Apotek Al Mujarab');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 159960.00, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 159960.00, `total_gabungan` = 159960.00 WHERE `nama_outlet` = 'Apotek Al Mujarab';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSU WISATA UIT' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSU WISATA UIT');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 23380374.73, `total_sanzaya` = 23380374.73, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 23380374.73 WHERE `nama_outlet` = 'RSU WISATA UIT';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSIA ANANDA MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSIA ANANDA MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 198173633.94, `total_sanzaya` = 198173633.94, `ruma_1` = 34845350.00, `ruma_2` = 31085106.00, `ruma_3` = 0, `total_ruma` = 65930456.00, `total_gabungan` = 264104089.94 WHERE `nama_outlet` = 'RSIA ANANDA MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSIA Kartini' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSIA Kartini');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 9543600.00, `total_sanzaya` = 9543600.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 9543600.00 WHERE `nama_outlet` = 'RSIA Kartini';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSU BAHAGIA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSU BAHAGIA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 3605075.00, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 3605075.00, `total_gabungan` = 3605075.00 WHERE `nama_outlet` = 'RSU BAHAGIA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'YAYASAN MUJAISYAH SEJAHTERA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'YAYASAN MUJAISYAH SEJAHTERA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 50349629.00, `total_sanzaya` = 50349629.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 50349629.00 WHERE `nama_outlet` = 'YAYASAN MUJAISYAH SEJAHTERA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RUMAH SAKIT HAPSAH' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RUMAH SAKIT HAPSAH');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RUMAH SAKIT HAPSAH';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'PT. Medical Solution Indonesia' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'PT. Medical Solution Indonesia');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 721348468.98, `total_sanzaya` = 721348468.98, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 721348468.98 WHERE `nama_outlet` = 'PT. Medical Solution Indonesia';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'PT.Haura Abadi Jaya' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'PT.Haura Abadi Jaya');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 6358900.00, `tahun_3` = 0, `total_sanzaya` = 6358900.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 6358900.00 WHERE `nama_outlet` = 'PT.Haura Abadi Jaya';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS MEGA BUANA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS MEGA BUANA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RS MEGA BUANA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'APOTEK YUNI FARMA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'APOTEK YUNI FARMA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 2271998.15, `total_sanzaya` = 2271998.15, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 2271998.15 WHERE `nama_outlet` = 'APOTEK YUNI FARMA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DINAS KESEHATAN KAB. TAKALAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DINAS KESEHATAN KAB. TAKALAR');
UPDATE `receivables` SET `tahun_1` = 659866800.00, `tahun_2` = 0, `tahun_3` = 144966000.00, `total_sanzaya` = 804832800.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 804832800.00 WHERE `nama_outlet` = 'DINAS KESEHATAN KAB. TAKALAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DINAS KESEHATAN KAB. BANTAENG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DINAS KESEHATAN KAB. BANTAENG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'DINAS KESEHATAN KAB. BANTAENG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG TAMALATE BAROMBONG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG TAMALATE BAROMBONG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 1159999.95, `total_sanzaya` = 1159999.95, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 1159999.95 WHERE `nama_outlet` = 'SPPG TAMALATE BAROMBONG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG HAJI BAU' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG HAJI BAU');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 940000.00, `total_sanzaya` = 940000.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 940000.00 WHERE `nama_outlet` = 'SPPG HAJI BAU';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD AMPANA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD AMPANA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 129717851.71, `total_sanzaya` = 129717851.71, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 129717851.71 WHERE `nama_outlet` = 'RSUD AMPANA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'PT ANUGRAH SALMAN MEDIKA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'PT ANUGRAH SALMAN MEDIKA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 20000000.00, `total_sanzaya` = 20000000.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 20000000.00 WHERE `nama_outlet` = 'PT ANUGRAH SALMAN MEDIKA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD MASSENREMPULU Enrekang' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD MASSENREMPULU Enrekang');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD MASSENREMPULU Enrekang';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD PENDAU TAMBU' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD PENDAU TAMBU');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 19664520.02, `total_sanzaya` = 19664520.02, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 19664520.02 WHERE `nama_outlet` = 'RSUD PENDAU TAMBU';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS. UNIVERSITAS HASANUDDIN MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS. UNIVERSITAS HASANUDDIN MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RS. UNIVERSITAS HASANUDDIN MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'KLINIK AZKA NADHIFA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'KLINIK AZKA NADHIFA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 775000.00, `total_sanzaya` = 775000.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 775000.00 WHERE `nama_outlet` = 'KLINIK AZKA NADHIFA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'KLINIK GRIYA AFIAT' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'KLINIK GRIYA AFIAT');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'KLINIK GRIYA AFIAT';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS HIKMAH MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS HIKMAH MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RS HIKMAH MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD LAMADDUKELLENG KAB WAJO' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD LAMADDUKELLENG KAB WAJO');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD LAMADDUKELLENG KAB WAJO';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD Kab Poso' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD Kab Poso');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 14520842.55, `total_sanzaya` = 14520842.55, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 14520842.55 WHERE `nama_outlet` = 'RSUD Kab Poso';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD DAYA KOTA MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD DAYA KOTA MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 202406280.00, `total_sanzaya` = 202406280.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 202406280.00 WHERE `nama_outlet` = 'RSUD DAYA KOTA MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'Dinas Kesehatan Kabupaten Pasangkayu' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'Dinas Kesehatan Kabupaten Pasangkayu');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'Dinas Kesehatan Kabupaten Pasangkayu';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RUMKIT TK. IV DR.M. YASIN BONE' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RUMKIT TK. IV DR.M. YASIN BONE');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RUMKIT TK. IV DR.M. YASIN BONE';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 62140122.70, `total_sanzaya` = 62140122.70, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 62140122.70 WHERE `nama_outlet` = 'RSUD LANTO DG. PASEWANG KAB. JENEPONTO';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSIA PERTIWI MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSIA PERTIWI MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSIA PERTIWI MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'ANDI AIDA BONE' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'ANDI AIDA BONE');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'ANDI AIDA BONE';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'PT RUMA UTAMA MEGATRADING' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'PT RUMA UTAMA MEGATRADING');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 51605010.00, `total_sanzaya` = 51605010.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 51605010.00 WHERE `nama_outlet` = 'PT RUMA UTAMA MEGATRADING';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD MOKOPIDO KAB TOLI-TOLI' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD MOKOPIDO KAB TOLI-TOLI');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RSUD MOKOPIDO KAB TOLI-TOLI';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD RUMBIA JENEPONTO' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD RUMBIA JENEPONTO');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 35951679.00, `total_sanzaya` = 35951679.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 35951679.00 WHERE `nama_outlet` = 'RSUD RUMBIA JENEPONTO';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS TK III DR Sindhu Trisno' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS TK III DR Sindhu Trisno');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 54844419.85, `total_sanzaya` = 54844419.85, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 54844419.85 WHERE `nama_outlet` = 'RS TK III DR Sindhu Trisno';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DINAS KESEHATAN KAB SIGI' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DINAS KESEHATAN KAB SIGI');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'DINAS KESEHATAN KAB SIGI';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'APOTEK A3 MEDIKA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'APOTEK A3 MEDIKA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 2179878.13, `total_sanzaya` = 2179878.13, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 2179878.13 WHERE `nama_outlet` = 'APOTEK A3 MEDIKA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS MITRA HUSADA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS MITRA HUSADA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 501347.77, `total_sanzaya` = 501347.77, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 501347.77 WHERE `nama_outlet` = 'RS MITRA HUSADA';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS PKU Muhammadiyah Unismuh Makassar' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS PKU Muhammadiyah Unismuh Makassar');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'RS PKU Muhammadiyah Unismuh Makassar';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG Bara Rampoang' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG Bara Rampoang');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'SPPG Bara Rampoang';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG Salohe Sinaji Timur' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG Salohe Sinaji Timur');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 2899999.98, `total_sanzaya` = 2899999.98, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 2899999.98 WHERE `nama_outlet` = 'SPPG Salohe Sinaji Timur';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS.Dr. TADJUDDIN CHALID MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS.Dr. TADJUDDIN CHALID MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 2568011.64, `total_sanzaya` = 2568011.64, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 2568011.64 WHERE `nama_outlet` = 'RS.Dr. TADJUDDIN CHALID MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG To\'bulung 02' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG To\'bulung 02');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'SPPG To\'bulung 02';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG Bangkala 3' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG Bangkala 3');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'SPPG Bangkala 3';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'Rs siti fatimah makassar' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'Rs siti fatimah makassar');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'Rs siti fatimah makassar';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'Ibu Habiba' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'Ibu Habiba');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'Ibu Habiba';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DINAS KESEHATAN KAB SOPPENG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DINAS KESEHATAN KAB SOPPENG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'DINAS KESEHATAN KAB SOPPENG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'PUSKESMAS EMBO' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'PUSKESMAS EMBO');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'PUSKESMAS EMBO';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD Lakipadada' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD Lakipadada');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 1998000.00, `total_sanzaya` = 1998000.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 1998000.00 WHERE `nama_outlet` = 'RSUD Lakipadada';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'BBKK MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'BBKK MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'BBKK MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'PT HARTA TAHTA KESEHATAN' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'PT HARTA TAHTA KESEHATAN');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 882744612.88, `total_sanzaya` = 882744612.88, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 882744612.88 WHERE `nama_outlet` = 'PT HARTA TAHTA KESEHATAN';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DR. Ayudini' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DR. Ayudini');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'DR. Ayudini';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD SIWA, KABUPATEN WAJO' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD SIWA, KABUPATEN WAJO');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 10016640.00, `total_sanzaya` = 10016640.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 10016640.00 WHERE `nama_outlet` = 'RSUD SIWA, KABUPATEN WAJO';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RS HASRI AINUN HABIBIE' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RS HASRI AINUN HABIBIE');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 52555170.00, `total_sanzaya` = 52555170.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 52555170.00 WHERE `nama_outlet` = 'RS HASRI AINUN HABIBIE';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DINAS KESEHATAN KAB PINRANG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DINAS KESEHATAN KAB PINRANG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 88888800.00, `total_sanzaya` = 88888800.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 88888800.00 WHERE `nama_outlet` = 'DINAS KESEHATAN KAB PINRANG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD Hayyung Selayar' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD Hayyung Selayar');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 180165210.00, `total_sanzaya` = 180165210.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 180165210.00 WHERE `nama_outlet` = 'RSUD Hayyung Selayar';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG BARA BALANDAI 03' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG BARA BALANDAI 03');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 2179680.14, `total_sanzaya` = 2179680.14, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 2179680.14 WHERE `nama_outlet` = 'SPPG BARA BALANDAI 03';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG BAROMBONG 03' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG BAROMBONG 03');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'SPPG BAROMBONG 03';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD LUWUK' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD LUWUK');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 217417717.98, `total_sanzaya` = 217417717.98, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 217417717.98 WHERE `nama_outlet` = 'RSUD LUWUK';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DINAS KESEHATAN KOTA MAKASSAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DINAS KESEHATAN KOTA MAKASSAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 38739000.00, `total_sanzaya` = 38739000.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 38739000.00 WHERE `nama_outlet` = 'DINAS KESEHATAN KOTA MAKASSAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD DR. MUHAMMAD ZEIN PAINAN' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD DR. MUHAMMAD ZEIN PAINAN');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 76265281.00, `total_sanzaya` = 76265281.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 76265281.00 WHERE `nama_outlet` = 'RSUD DR. MUHAMMAD ZEIN PAINAN';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'RSUD MOHAMMAD NATSIR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'RSUD MOHAMMAD NATSIR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 821400.00, `total_sanzaya` = 821400.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 821400.00 WHERE `nama_outlet` = 'RSUD MOHAMMAD NATSIR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'NDF PRINTING' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'NDF PRINTING');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 516000.02, `total_sanzaya` = 516000.02, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 516000.02 WHERE `nama_outlet` = 'NDF PRINTING';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'APOTEK MAWAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'APOTEK MAWAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 4574039.93, `total_sanzaya` = 4574039.93, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 4574039.93 WHERE `nama_outlet` = 'APOTEK MAWAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG PATTENE PALOPO' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG PATTENE PALOPO');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 0, `total_sanzaya` = 0, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 0 WHERE `nama_outlet` = 'SPPG PATTENE PALOPO';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG ANGGERAJA ENREKANG' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG ANGGERAJA ENREKANG');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 1344000.00, `total_sanzaya` = 1344000.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 1344000.00 WHERE `nama_outlet` = 'SPPG ANGGERAJA ENREKANG';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'SPPG SELAYAR' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'SPPG SELAYAR');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 1159999.95, `total_sanzaya` = 1159999.95, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 1159999.95 WHERE `nama_outlet` = 'SPPG SELAYAR';

INSERT INTO `receivables` (`nama_outlet`) SELECT 'DINAS KESEHATAN LUWU UTARA' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `receivables` WHERE `nama_outlet` = 'DINAS KESEHATAN LUWU UTARA');
UPDATE `receivables` SET `tahun_1` = 0, `tahun_2` = 0, `tahun_3` = 97331460.00, `total_sanzaya` = 97331460.00, `ruma_1` = 0, `ruma_2` = 0, `ruma_3` = 0, `total_ruma` = 0, `total_gabungan` = 97331460.00 WHERE `nama_outlet` = 'DINAS KESEHATAN LUWU UTARA';

