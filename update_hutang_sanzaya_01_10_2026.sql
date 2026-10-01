SET FOREIGN_KEY_CHECKS = 0;
SET @company_id = (SELECT id FROM companies WHERE name = 'PT SANZAYA' LIMIT 1);
DELETE FROM payables WHERE company_id = @company_id;
-- Insert Providers if they don't exist
INSERT IGNORE INTO `providers` (`name`, `created_at`, `updated_at`) VALUES
('CV ARGHA INTI ALKESINDO', NOW(), NOW()),
('CV. Acropolis Ortopedi', NOW(), NOW()),
('CV. INDO MEDIKA', NOW(), NOW()),
('CV. JAYA UTAMA', NOW(), NOW()),
('CV. SURYA MEGAH PERKASA', NOW(), NOW()),
('PT ANUGERAH SANTOSA ABADI', NOW(), NOW()),
('PT ELVINCO MEDTECH', NOW(), NOW()),
('PT. Alexa Medika', NOW(), NOW()),
('PT. ALPHA INTI MEDICALINDO', NOW(), NOW()),
('PT. ANUGRAH SALMAN MEDIKA', NOW(), NOW()),
('PT. BIO KARYA SEJAHTERA', NOW(), NOW()),
('PT. BU KWANG MEDICAL', NOW(), NOW()),
('PT. BUANA INTIPRIMA MEDIKA', NOW(), NOW()),
('PT. BUMI INDAH SARANA MEDIS', NOW(), NOW()),
('PT. Citra Persada', NOW(), NOW()),
('PT. Endo Indonesia', NOW(), NOW()),
('PT. ENERGI MEDISTRON', NOW(), NOW()),
('PT. ENSEVAL PUTERA MEGATRADING', NOW(), NOW()),
('PT. GLOBAL PHARMA INDONESIA', NOW(), NOW()),
('PT. HAURA ABADI JAYA', NOW(), NOW()),
('PT. Indocore Perkasa', NOW(), NOW()),
('PT. KLIK BERSAMA TEKNOLOGI', NOW(), NOW()),
('PT. KUNINGAN SARANA BERSAMA', NOW(), NOW()),
('PT. LABIO SISTEM MANUFAKTUR', NOW(), NOW()),
('PT. LINTANG DIAGNOSTIK SUKSES', NOW(), NOW()),
('PT. MATESU ABADI', NOW(), NOW()),
('PT. Medical Solution Indonesia', NOW(), NOW()),
('PT. MediHop', NOW(), NOW()),
('PT. MEDISON JAYA RAYA', NOW(), NOW()),
('PT. Mensa Bina Sukses', NOW(), NOW()),
('PT. MITRA ASA PRATAMA', NOW(), NOW()),
('PT. Mukti Rejo Abadi', NOW(), NOW()),
('PT. MULTI SINAR MEDITRON', NOW(), NOW()),
('PT. Muzamal Ventures Indonesia', NOW(), NOW()),
('PT. OXY MEDICA INDONESIA', NOW(), NOW()),
('PT. SAFELOCK MEDICAL INDONESIA', NOW(), NOW()),
('PT. SARANA LINTAS MEDIKA', NOW(), NOW()),
('PT. SEKAR GUNA', NOW(), NOW()),
('PT. SINAR RODA UTAMA', NOW(), NOW()),
('PT. SUBUR MAKMUR LINTANG GEMILANG', NOW(), NOW()),
('PT. SUN UP HEALTH CARE', NOW(), NOW()),
('PT. SURGICA ALKESINDO', NOW(), NOW()),
('PT. TRISA LIKUID FARMA', NOW(), NOW()),
('PT. United Dico Citas', NOW(), NOW()),
('SHOOPE', NOW(), NOW()),
('SHOPEE', NOW(), NOW()),
('Toko MEDSO', NOW(), NOW()),
('Toko Sabaria Clothing', NOW(), NOW());

-- Insert Payables
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'CV ARGHA INTI ALKESINDO' LIMIT 1), '[{"year": "2026", "amount": 6105000.0}]', 6105000.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'CV. Acropolis Ortopedi' LIMIT 1), '[{"year": "2026", "amount": 20388000.000028}]', 20388000.000028, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'CV. INDO MEDIKA' LIMIT 1), '[{"year": "2026", "amount": 43278900.0}]', 43278900.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'CV. JAYA UTAMA' LIMIT 1), '[{"year": "2024", "amount": 18155385.0}]', 18155385.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'CV. SURYA MEGAH PERKASA' LIMIT 1), '[{"year": "2026", "amount": 6394728.32475}]', 6394728.32475, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT ANUGERAH SANTOSA ABADI' LIMIT 1), '[{"year": "2026", "amount": 17911515.0}]', 17911515.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT ELVINCO MEDTECH' LIMIT 1), '[{"year": "2025", "amount": 238350000.0}]', 238350000.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. ALPHA INTI MEDICALINDO' LIMIT 1), '[{"year": "2025", "amount": 106758600.3}, {"year": "2026", "amount": 219331750.00060302}]', 326090350.30060303, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. ANUGRAH SALMAN MEDIKA' LIMIT 1), '[{"year": "2026", "amount": 136786859.34798}]', 136786859.34798, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Alexa Medika' LIMIT 1), '[{"year": "2025", "amount": 23993838.0}]', 23993838.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. BIO KARYA SEJAHTERA' LIMIT 1), '[{"year": "2026", "amount": 2408100.0}]', 2408100.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. BU KWANG MEDICAL' LIMIT 1), '[{"year": "2026", "amount": 98249760.0}]', 98249760.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. BUANA INTIPRIMA MEDIKA' LIMIT 1), '[{"year": "2025", "amount": 58717073.0}]', 58717073.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. BUMI INDAH SARANA MEDIS' LIMIT 1), '[{"year": "2026", "amount": 150117299.9826}]', 150117299.9826, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Citra Persada' LIMIT 1), '[{"year": "2026", "amount": 20009999.999937}]', 20009999.999937, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. ENERGI MEDISTRON' LIMIT 1), '[{"year": "2026", "amount": 9776325.0}]', 9776325.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. ENSEVAL PUTERA MEGATRADING' LIMIT 1), '[{"year": "2026", "amount": 110226239.7681}]', 110226239.7681, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Endo Indonesia' LIMIT 1), '[{"year": "2025", "amount": 38690387.15}, {"year": "2026", "amount": 2225550.0}]', 40915937.15, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. GLOBAL PHARMA INDONESIA' LIMIT 1), '[{"year": "2025", "amount": 124760335.91}]', 124760335.91, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. HAURA ABADI JAYA' LIMIT 1), '[{"year": "2025", "amount": 1298700.0}]', 1298700.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Indocore Perkasa' LIMIT 1), '[{"year": "2025", "amount": 68055168.25}]', 68055168.25, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. KLIK BERSAMA TEKNOLOGI' LIMIT 1), '[{"year": "2026", "amount": 15947103.398113001}]', 15947103.398113001, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. KUNINGAN SARANA BERSAMA' LIMIT 1), '[{"year": "2026", "amount": 19182680.0}]', 19182680.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. LABIO SISTEM MANUFAKTUR' LIMIT 1), '[{"year": "2024", "amount": 17002764.32}]', 17002764.32, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. LINTANG DIAGNOSTIK SUKSES' LIMIT 1), '[{"year": "2024", "amount": 9893738.0}]', 9893738.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. MATESU ABADI' LIMIT 1), '[{"year": "2025", "amount": 31557300.0}]', 31557300.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. MEDISON JAYA RAYA' LIMIT 1), '[{"year": "2026", "amount": 1450000.0}]', 1450000.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. MITRA ASA PRATAMA' LIMIT 1), '[{"year": "2024", "amount": 23625000.0}]', 23625000.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. MULTI SINAR MEDITRON' LIMIT 1), '[{"year": "2026", "amount": 8147400.0}]', 8147400.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. MediHop' LIMIT 1), '[{"year": "2024", "amount": 48209389.0}]', 48209389.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Medical Solution Indonesia' LIMIT 1), '[{"year": "2024", "amount": 13336125.0}, {"year": "2026", "amount": 19290062.0286}]', 32626187.0286, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Mensa Bina Sukses' LIMIT 1), '[{"year": "2026", "amount": 37342620.0}]', 37342620.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Mukti Rejo Abadi' LIMIT 1), '[{"year": "2024", "amount": 109462826.2}]', 109462826.2, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. Muzamal Ventures Indonesia' LIMIT 1), '[{"year": "2026", "amount": 104496929.78999999}]', 104496929.78999999, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. OXY MEDICA INDONESIA' LIMIT 1), '[{"year": "2026", "amount": 34676400.0}]', 34676400.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. SAFELOCK MEDICAL INDONESIA' LIMIT 1), '[{"year": "2026", "amount": 334344700.012608}]', 334344700.012608, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. SARANA LINTAS MEDIKA' LIMIT 1), '[{"year": "2026", "amount": 8068812.0}]', 8068812.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. SEKAR GUNA' LIMIT 1), '[{"year": "2026", "amount": 11233750.0}]', 11233750.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. SINAR RODA UTAMA' LIMIT 1), '[{"year": "2026", "amount": 89163500.0}]', 89163500.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. SUBUR MAKMUR LINTANG GEMILANG' LIMIT 1), '[{"year": "2026", "amount": 90000.0}]', 90000.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. SUN UP HEALTH CARE' LIMIT 1), '[{"year": "2026", "amount": 31506950.00002}]', 31506950.00002, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. SURGICA ALKESINDO' LIMIT 1), '[{"year": "2025", "amount": 1653000.0}, {"year": "2026", "amount": 64130472.0}]', 65783472.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. TRISA LIKUID FARMA' LIMIT 1), '[{"year": "2026", "amount": 35501060.003178}]', 35501060.003178, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'PT. United Dico Citas' LIMIT 1), '[{"year": "2024", "amount": 266022000.0}]', 266022000.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'SHOOPE' LIMIT 1), '[{"year": "2026", "amount": 64500.0}]', 64500.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'SHOPEE' LIMIT 1), '[{"year": "2026", "amount": 61500.0}]', 61500.0, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'Toko MEDSO' LIMIT 1), '[{"year": "2025", "amount": 22934769.74}, {"year": "2026", "amount": 34952934.333299994}]', 57887704.07329999, NOW(), NOW());
INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = 'Toko Sabaria Clothing' LIMIT 1), '[{"year": "2026", "amount": 1574999.999973}]', 1574999.999973, NOW(), NOW());
SET FOREIGN_KEY_CHECKS = 1;