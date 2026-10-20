-- ==============================================================
-- SCRIPT UPDATE DATABASE: ROLE SATPAM & SHIFT ABSENSI (2026)
-- ==============================================================
-- Anda bisa menjalankan script ini di phpMyAdmin / MySQL Workbench
-- jika ingin memastikan struktur database diperbarui secara manual.
-- (Catatan: Kode aplikasi juga sudah dilengkapi sistem auto-check
-- sehingga kolom dan role akan otomatis terbuat saat web dibuka).
-- ==============================================================

-- 1. Tambahkan kolom 'shift' pada tabel 'attendances' (jika belum ada)
-- Untuk MySQL 8.0.19+:
-- ALTER TABLE `attendances` ADD COLUMN IF NOT EXISTS `shift` VARCHAR(50) NULL AFTER `status`;

-- Versi standar (kompatibel semua versi MySQL/MariaDB):
SET @dbname = DATABASE();
SET @tablename = "attendances";
SET @columnname = "shift";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `attendances` ADD `shift` VARCHAR(50) NULL AFTER `status`;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Pastikan Role SATPAM tersedia di tabel 'roles'
INSERT IGNORE INTO `roles` (`name`, `guard_name`, `created_at`, `updated_at`) 
VALUES ('SATPAM', 'web', NOW(), NOW());

-- 3. Pastikan Divisi SATPAM tersedia di tabel 'divisions'
INSERT IGNORE INTO `divisions` (`name`, `created_at`, `updated_at`) 
VALUES ('SATPAM', NOW(), NOW());

-- 4. Berikan Hak Akses (Permissions) Absensi ke Role SATPAM
-- Pastikan permission absensi terdaftar
INSERT IGNORE INTO `permissions` (`name`, `guard_name`, `created_at`, `updated_at`) VALUES
('view absensi', 'web', NOW(), NOW()),
('create absensi', 'web', NOW(), NOW()),
('view rekap absensi', 'web', NOW(), NOW()),
('view pengajuan absensi', 'web', NOW(), NOW()),
('create pengajuan absensi', 'web', NOW(), NOW());

-- Pasangkan permission ke role SATPAM
INSERT IGNORE INTO `role_has_permissions` (`permission_id`, `role_id`)
SELECT p.id, r.id 
FROM `permissions` p
CROSS JOIN `roles` r
WHERE r.name = 'SATPAM' 
  AND p.name IN ('view absensi', 'create absensi', 'view rekap absensi', 'view pengajuan absensi', 'create pengajuan absensi');
