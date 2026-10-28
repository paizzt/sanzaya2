-- Tabel Manajemen Gaji (Payrolls) untuk Sistem Sanzaya Group
-- Eksekusi file SQL ini di database hosting / phpMyAdmin jika migrasi belum dijalankan

CREATE TABLE IF NOT EXISTS `payrolls` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `company_id` bigint(20) unsigned DEFAULT NULL,
  `period_month` int(11) NOT NULL,
  `period_year` int(11) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'published',
  
  -- Penerimaan
  `gaji_pokok` decimal(15,2) NOT NULL DEFAULT 0.00,
  `operasional` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tunjangan_jabatan` decimal(15,2) NOT NULL DEFAULT 0.00,
  `thr` decimal(15,2) NOT NULL DEFAULT 0.00,
  `lembur` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_penerimaan` decimal(15,2) NOT NULL DEFAULT 0.00,
  
  -- Potongan
  `bpjs_kesehatan_persen` decimal(5,2) NOT NULL DEFAULT 1.00,
  `bpjs_kesehatan` decimal(15,2) NOT NULL DEFAULT 0.00,
  `bpjs_ketenagakerjaan_persen` decimal(5,2) NOT NULL DEFAULT 2.00,
  `bpjs_ketenagakerjaan` decimal(15,2) NOT NULL DEFAULT 0.00,
  `pajak` decimal(15,2) NOT NULL DEFAULT 0.00,
  `piutang` decimal(15,2) NOT NULL DEFAULT 0.00,
  `potongan_absen` decimal(15,2) NOT NULL DEFAULT 0.00,
  `potongan_lainnya` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_potongan` decimal(15,2) NOT NULL DEFAULT 0.00,
  
  -- BPJS Perusahaan
  `bpjs_kesehatan_perusahaan_persen` decimal(5,2) NOT NULL DEFAULT 4.00,
  `bpjs_kesehatan_perusahaan` decimal(15,2) NOT NULL DEFAULT 0.00,
  `bpjs_ketenagakerjaan_perusahaan_persen` decimal(5,2) NOT NULL DEFAULT 4.24,
  `bpjs_ketenagakerjaan_perusahaan` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_bpjs_perusahaan` decimal(15,2) NOT NULL DEFAULT 0.00,
  
  -- Total Diterima (Take Home Pay)
  `total_diterima` decimal(15,2) NOT NULL DEFAULT 0.00,
  
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payrolls_user_month_year_unique` (`user_id`,`period_month`,`period_year`),
  KEY `payrolls_company_id_index` (`company_id`),
  KEY `payrolls_period_index` (`period_year`,`period_month`),
  CONSTRAINT `fk_payrolls_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
