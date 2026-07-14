<div align="center">

# <img src="https://api.iconify.design/lucide:building-2.svg?color=%232563eb" width="32" height="32" style="vertical-align: middle;"> Sanzaya Information System (SIS)

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Inertia.js](https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Sanzaya Information System adalah aplikasi sistem informasi manajemen internal atau *Enterprise Resource Planning* (ERP) berskala ringan yang dirancang untuk mendigitalkan seluruh proses operasional bisnis. Aplikasi ini mengelola absensi karyawan, pengajuan biaya dan barang, manajemen outlet, laporan kinerja (marketing & logistik), serta pemantauan keuangan (hutang-piutang).

</div>

---

## <img src="https://api.iconify.design/lucide:layout-list.svg?color=%232563eb" width="24" height="24" style="vertical-align: middle;"> Fitur & Penjelasan Proses Utama

Aplikasi ini dibagi menjadi beberapa modul besar yang saling terintegrasi. Berikut adalah rincian detail setiap proses yang ada di dalam sistem:

### <img src="https://api.iconify.design/lucide:users.svg" width="20" height="20" style="vertical-align: middle;"> 1. Manajemen Karyawan & Autentikasi
*   **Role-Based Access Control (RBAC):** Sistem ini dilengkapi dengan pembagian hak akses (Superadmin, Admin, Manager, Direktur, dan Staff/Sales).
*   **Profil & Pengaturan:** Karyawan dapat mengelola data profil mereka, sementara Admin dapat mengelola penempatan, jabatan, serta status aktif karyawan.

### <img src="https://api.iconify.design/lucide:camera.svg" width="20" height="20" style="vertical-align: middle;"> 2. Modul Absensi (Kehadiran)
Proses pencatatan kehadiran harian karyawan secara *real-time*.
*   **Check-in & Check-out:** Karyawan melakukan absensi dengan melampirkan foto secara langsung melalui kamera perangkat genggam atau laptop. 
*   **Pengajuan Izin & Sakit:** Jika karyawan berhalangan hadir, mereka dapat mengisi *Form Pengajuan Absen* dengan memilih tanggal dan melampirkan alasan.
*   **Rekap Absensi:** Halaman laporan yang menampilkan rangkuman kehadiran, sakit, izin, dan alpa. Admin dapat memantau kehadiran seluruh karyawan, sedangkan staff biasa hanya dapat melihat riwayat mereka sendiri. Halaman ini juga dilengkapi fitur *preview* pop-up untuk **melihat bukti foto absensi**.

### <img src="https://api.iconify.design/lucide:file-text.svg" width="20" height="20" style="vertical-align: middle;"> 3. Modul Pengajuan (Requests)
Modul untuk mendigitalkan sistem perizinan pengeluaran atau permintaan barang.
*   **Pengajuan Upcountry (UC):** 
    Digunakan oleh sales atau staff yang akan melakukan perjalanan dinas/luar kota. Karyawan memilih entitas tujuan, jenis transportasi (Darat/Laut/Udara), dan nama pendamping. Sistem secara cerdas akan mengaktifkan form "Estimasi Biaya" (Bensin, Penginapan, Konsumsi) dan meminta nomor plat kendaraan jika transportasi darat dipilih. Proses ini melewati sistem *Approval* berjenjang (Disetujui/Ditolak).
*   **Pengajuan BHP (Barang Habis Pakai):**
    Proses permintaan alat tulis kantor (ATK) atau perlengkapan operasional. Karyawan memilih barang dan kuantitas, kemudian sistem akan meneruskannya ke bagian logistik untuk diproses.

### <img src="https://api.iconify.design/lucide:bar-chart-2.svg" width="20" height="20" style="vertical-align: middle;"> 4. Modul Laporan (Reporting)
*   **Laporan Logistik:** Form pelaporan pengiriman barang ke outlet. Terintegrasi dengan fitur pencarian cepat (*Searchable Select*) untuk mempercepat pemilihan nama Sales, Nama Outlet, dan rincian logistik lainnya, guna meminimalisir kesalahan ketik (*typo*).
*   **Laporan Marketing (Daily & Weekly Target):** Pencatatan kinerja harian tim marketing dan penentuan target mingguan. Data ini membantu manajemen melacak produktivitas secara harian.
*   **Sinkronisasi Spreadsheet:** Terdapat sistem *Spreadsheet Sync* untuk mengekspor atau menarik data pelaporan secara langsung ke/dari Google Sheets.

### <img src="https://api.iconify.design/lucide:wallet.svg" width="20" height="20" style="vertical-align: middle;"> 5. Modul Keuangan (Hutang Piutang)
Modul untuk memantau arus kas keluar dan piutang toko.
*   **Piutang (Receivables):** Mencatat tagihan yang belum dibayar oleh outlet atau klien. Menampilkan sisa tagihan, riwayat cicilan, dan format mata uang Rupiah otomatis.
*   **Hutang (Payables):** Mencatat tanggungan perusahaan kepada pihak ketiga/distributor.

### <img src="https://api.iconify.design/lucide:database.svg" width="20" height="20" style="vertical-align: middle;"> 6. Manajemen Data Master
Tempat penyimpanan *database* utama yang menjadi tulang punggung transaksi.
*   **Manajemen Kendaraan:** Mendata plat nomor, jenis, dan kondisi kendaraan operasional.
*   **Manajemen Provider & Outlet:** Mendata rekanan bisnis dan daftar toko/outlet tujuan distribusi, lengkap dengan pemetaan rute.

---

## <img src="https://api.iconify.design/lucide:code-2.svg?color=%232563eb" width="24" height="24" style="vertical-align: middle;"> Teknologi yang Digunakan (Tech Stack)

| Bagian | Teknologi |
| :--- | :--- |
| **Backend** | Laravel 12.x, PHP 8.2 |
| **Frontend** | React.js, Inertia.js |
| **Styling** | Tailwind CSS v3, Headless UI, Lucide Icons |
| **Database** | SQLite (Development) / MySQL (Production) |
| **Utilities** | SweetAlert2 (Notifikasi & Pop-up Foto), Day.js (Format Waktu) |

---

## <img src="https://api.iconify.design/lucide:terminal.svg?color=%232563eb" width="24" height="24" style="vertical-align: middle;"> Panduan Instalasi (Development)

Jika Anda ingin menjalankan aplikasi ini di lingkungan lokal (*localhost*), ikuti langkah-langkah berikut:

1. **Persiapan Sistem**
   Pastikan Anda telah menginstal `PHP >= 8.2`, `Composer`, dan `Node.js >= 18`.

2. **Clone Repositori & Masuk ke Direktori**
   \`\`\`bash
   git clone <url-repo> sanzaya2
   cd sanzaya2
   \`\`\`

3. **Instalasi Dependensi**
   \`\`\`bash
   composer install
   npm install
   \`\`\`

4. **Konfigurasi Environment**
   Salin file konfigurasi bawaan dan sesuaikan (seperti koneksi database):
   \`\`\`bash
   cp .env.example .env
   php artisan key:generate
   \`\`\`

5. **Migrasi Database & Seeder**
   \`\`\`bash
   php artisan migrate --seed
   \`\`\`
   *(Catatan: Jangan lupa untuk menautkan storage agar foto absensi dapat dimuat dengan `php artisan storage:link`)*

6. **Jalankan Aplikasi**
   Buka dua jendela terminal.
   Terminal 1 (Menjalankan server PHP):
   \`\`\`bash
   php artisan serve
   \`\`\`
   Terminal 2 (Menjalankan Vite bundler untuk React):
   \`\`\`bash
   npm run dev
   \`\`\`
   Aplikasi dapat diakses melalui `http://127.0.0.1:8000`.

---
<div align="center">
<i>Dibuat & Dikelola untuk kebutuhan operasional Sanzaya Group.</i>
</div>
