# Task Tracker: Kustomisasi PDF

- [x] Update `ExportDropdown.jsx` (Frontend)
  - [x] Tambahkan `useState` untuk konfigurasi PDF (paper, orientation, font, size).
  - [x] Buat UI Dropdown / Select untuk pengaturan tersebut khusus di tab PDF.
  - [x] Update fungsi `getPreviewUrl` agar menyertakan parameter `paper`, `orientation`, `font`, `size`.
- [x] Buat `patch_pdf_controllers.php` (Backend)
  - [x] Modifikasi semua 20 controller yang menggunakan `Pdf::loadView(...)` untuk membaca parameter `paper` dan `orientation`.
  - [x] Khusus jika `paper == 'f4'`, set paper koordinat F4 `[0, 0, 609.4488, 935.433]`.
  - [x] Jalankan script dan pastikan semua controller berhasil dimodifikasi.
- [x] Buat `patch_pdf_views.php` (Blade Templates)
  - [x] Cari semua view `.blade.php` di dalam folder `resources/views/pdf/`.
  - [x] Inject rule CSS ke dalam blok `<style>` untuk mendengarkan `request('font')` dan `request('size')`.
  - [x] Jalankan script patch.
- [x] Build Frontend Assets (`npm run build`).
- [x] Verifikasi perubahan berhasil diterapkan.
