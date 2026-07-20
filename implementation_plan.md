# Fitur Kustomisasi PDF (Ukuran Kertas, Font, dan Teks)

Pengguna meminta agar fitur *Pratinjau PDF* juga dilengkapi dengan kemampuan untuk mengatur ukuran kertas (F4, A4, dll), memilih jenis font, serta mengatur ukuran teks secara dinamis sebelum diunduh.

## User Review Required
> [!IMPORTANT]
> Mohon periksa rancangan di bawah ini dan berikan konfirmasi (Proceed) jika sudah sesuai dengan kebutuhan Anda. Jika ada ukuran kertas atau jenis font khusus yang wajib dimasukkan, silakan beri tahu saya.

## Proposed Changes

### 1. Frontend: Modifikasi `ExportDropdown.jsx`
- Menambahkan **Panel Pengaturan** di dalam tab *Pratinjau PDF*.
- **Dropdown Ukuran Kertas:** A4, F4 (Folio), Letter, A3, Legal.
- **Dropdown Orientasi:** Potret (Portrait) & Lanskap (Landscape).
- **Dropdown Jenis Font:** Sans-serif, Serif, Arial, Times New Roman, Courier.
- **Dropdown Ukuran Teks:** 10px, 12px, 14px, 16px.
- Pengaturan ini akan memperbarui URL *iframe* pratinjau secara otomatis dan diterapkan ke tombol "Unduh PDF".

### 2. Backend: Pembaruan Seluruh Controller Laporan (20 File)
- Membuat *script* otomatis untuk memodifikasi 20 *Controller* yang menangani ekspor PDF (seperti `OutletController`, `UserController`, `BhpRecapController`, dll).
- *Script* ini akan mengubah bagian `$pdf->setPaper(...)` agar membaca pengaturan `paper` dan `orientation` dari URL (berdasarkan pilihan pengguna).
- Karena PDF bawaan Laravel (DOMPDF) tidak mendeteksi ukuran "F4" secara otomatis, sistem akan membaca "F4" sebagai koordinat kustom `[0, 0, 609.4488, 935.433]`.

### 3. Backend: Pembaruan Seluruh Template Desain PDF (Blade)
- Memodifikasi seluruh *file view* `.blade.php` (sekitar 8 *file*) yang bertugas mencetak PDF.
- Menambahkan *inline CSS* dinamis pada tag `<body>` untuk mendeteksi pilihan `font` dan `size` dari URL.
  ```css
  body {
      font-family: {{ request('font', 'sans-serif') }} !important;
      font-size: {{ request('size', '12') }}px !important;
  }
  ```

## Verification Plan
1. Mengubah opsi-opsi pada *dropdown* Pratinjau PDF di *frontend* (misal: di halaman Data Outlet).
2. Memastikan bahwa tampilan pratinjau di *iframe* berubah secara langsung *(real-time)*.
3. Memastikan tombol "Unduh PDF" menghasilkan *file* fisik yang sama persis dengan yang ada di pratinjau.
