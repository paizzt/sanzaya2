-- ============================================================
-- SCRIPT UPDATE STRUKTUR TABEL ATTENDANCES (KETERANGAN MASUK & PULANG)
-- Tanggal: 20 Oktober 2026
-- Sistem: SANZAYA APP
-- ============================================================

-- Tambah kolom check_in_notes dan check_out_notes di tabel attendances (jika belum ada)
ALTER TABLE `attendances` 
ADD COLUMN IF NOT EXISTS `check_in_notes` TEXT NULL AFTER `notes`,
ADD COLUMN IF NOT EXISTS `check_out_notes` TEXT NULL AFTER `check_in_notes`;

-- Selesai!
