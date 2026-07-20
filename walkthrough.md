# Walkthrough: Fitur Kustomisasi PDF

Berikut adalah ringkasan pengembangan yang telah dilakukan untuk fitur kustomisasi PDF:

## 1. Antarmuka Pengguna (Frontend)
- Komponen `ExportDropdown.jsx` telah diperbarui dengan menu samping *Pengaturan PDF*.
- Menu ini akan muncul jika pengguna memilih tab **Pratinjau PDF**.
- Pengguna dapat memilih:
  - **Ukuran Kertas:** A4, F4 (Folio), Letter, Legal, A3.
  - **Orientasi:** Potret atau Lanskap.
  - **Jenis Font:** Sans-serif, Serif, Arial, Times New Roman, Monospace.
  - **Ukuran Teks:** 10px, 12px, 14px, 16px.
- Pilihan pengguna ini akan langsung tercermin (secara *real-time*) di dalam *iframe* Pratinjau.

## 2. Pemrosesan Data (Backend)
- Sebanyak 20 *Controller* (seperti `OutletController`, `AttendanceRecapController`, dsb.) telah dimodifikasi melalui skrip.
- Logika Laravel PDF (DOMPDF) kini akan mendeteksi parameter pengaturan yang dikirimkan dari frontend.
- Untuk ukuran khusus **F4**, sistem menggunakan ukuran koordinat milimeter kustom `[0, 0, 609.4488, 935.433]` agar sesuai dengan standar F4 (Folio).

## 3. Desain Kertas (Blade Templates)
- Sebanyak 8 templat desain laporan PDF (seperti `generic_table.blade.php`, `reports.blade.php`) telah diperbarui.
- *Inline CSS* dinamis telah ditambahkan untuk mengubah gaya huruf (`font-family`) dan ukuran tulisan (`font-size`) berdasarkan pilihan pengguna.

## 4. Validasi
- Tombol **Unduh PDF** dijamin akan mencetak data (mengunduh file) yang sama persis dengan yang dilihat pengguna pada layar Pratinjau.
