<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$html = '
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Panduan Penggunaan Aplikasi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #1e40af;
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        h2 {
            color: #2563eb;
            margin-top: 30px;
        }
        h3 {
            color: #4b5563;
        }
        .step {
            margin-bottom: 25px;
            padding: 15px;
            background: #f9fafb;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
        }
        .button-mock {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 10px 0;
        }
        .btn-primary { background-color: #2563eb; }
        .btn-success { background-color: #10b981; }
        .btn-danger { background-color: #ef4444; }
        .btn-camera { background-color: #6366f1; }
        
        .screenshot-container {
            border: 1px solid #ddd;
            padding: 15px;
            background: #fff;
            margin-top: 10px;
            border-radius: 8px;
            text-align: center;
        }
        
        .mock-ui {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            display: inline-block;
            background: #ffffff;
            width: 80%;
            text-align: left;
        }
    </style>
</head>
<body>

    <h1>Panduan Penggunaan Sanzaya App</h1>
    <p style="text-align:center">Dokumen panduan langkah demi langkah untuk menggunakan fitur Absensi dan Laporan Kunjungan Marketing.</p>

    <h2>1. Panduan Sistem Absensi</h2>
    
    <div class="step">
        <h3>Langkah 1: Buka Menu Absensi</h3>
        <p>Pada halaman utama (Dashboard), cari dan klik tombol menu <strong>Ambil Absensi</strong>.</p>
        <div class="screenshot-container">
            <span class="button-mock btn-primary" style="background:#4f46e5; font-size:16px;">+ Ambil Absensi</span>
        </div>
    </div>

    <div class="step">
        <h3>Langkah 2: Ambil Foto Selfie</h3>
        <p>Setelah halaman absensi terbuka, kamera akan aktif (pastikan Anda mengizinkan akses kamera dan lokasi). Klik tombol <strong>Ambil Foto</strong>.</p>
        <div class="screenshot-container">
            <span class="button-mock btn-camera">📸 Ambil Foto</span>
        </div>
    </div>

    <div class="step">
        <h3>Langkah 3: Pilih Jenis Absen</h3>
        <p>Setelah foto berhasil diambil, tekan salah satu tombol di bawah ini sesuai waktu kerja Anda:</p>
        <div class="screenshot-container">
            <span class="button-mock btn-success" style="margin-right: 15px;">📥 Absen Masuk</span>
            <span class="button-mock btn-danger">📤 Absen Pulang</span>
        </div>
    </div>


    <h2>2. Panduan Form Laporan Marketing</h2>

    <div class="step">
        <h3>Langkah 1: Buka Form Marketing</h3>
        <p>Pada Dashboard, klik menu <strong>Form Marketing</strong>.</p>
        <div class="screenshot-container">
            <span class="button-mock btn-primary" style="background:#0ea5e9; font-size:16px;">📝 Form Marketing</span>
        </div>
    </div>

    <div class="step">
        <h3>Langkah 2: Isi Data Kunjungan</h3>
        <p>Isi formulir dengan lengkap, termasuk memilih <strong>Nama Outlet</strong>, mengetikkan <strong>Hasil Kunjungan</strong>, dan nama PIC (Person in Charge).</p>
        <div class="screenshot-container">
            <div class="mock-ui">
                <p style="margin:0; font-size:12px; color:#6b7280;">Nama Outlet / Instansi *</p>
                <div style="border:1px solid #ccc; padding:8px; border-radius:4px; margin-bottom:10px; color:#374151;">Pilih Outlet...</div>
                
                <p style="margin:0; font-size:12px; color:#6b7280;">Hasil Kunjungan *</p>
                <div style="border:1px solid #ccc; padding:8px; border-radius:4px; height: 40px; color:#374151;">Ketik hasil kunjungan di sini...</div>
            </div>
        </div>
    </div>

    <div class="step">
        <h3>Langkah 3: Ambil/Pilih Foto Kunjungan</h3>
        <p>Gulir ke bawah pada bagian <strong>Foto Dokumentasi</strong>. Klik tombol area foto untuk mengambil gambar dari kamera atau memilih file dari galeri HP.</p>
        <div class="screenshot-container">
            <div class="mock-ui" style="text-align:center; border:2px dashed #94a3b8; padding:20px; background:#f8fafc;">
                <p style="color:#64748b; margin:0;">📁 Klik di sini untuk memilih foto</p>
            </div>
        </div>
    </div>

    <div class="step">
        <h3>Langkah 4: Buat Tanda Tangan</h3>
        <p>Pada area <strong>Tanda Tangan PIC</strong>, minta PIC (pelanggan/toko) untuk menandatangani di area kotak yang disediakan.</p>
        <div class="screenshot-container">
            <div class="mock-ui" style="text-align:center; border:1px solid #cbd5e1; padding:30px 10px; background:#fff; height: 60px;">
                <em style="color:#94a3b8;">(Area goresan tanda tangan)</em>
            </div>
            <div style="text-align:right; margin-top:5px;">
                <span style="font-size:12px; color:#ef4444; cursor:pointer;">Hapus / Bersihkan</span>
            </div>
        </div>
    </div>

    <div class="step">
        <h3>Langkah 5: Simpan Laporan</h3>
        <p>Jika semua data, foto, dan tanda tangan sudah terisi, klik tombol <strong>Simpan Laporan</strong> di bagian paling bawah untuk mengirim data.</p>
        <div class="screenshot-container">
            <span class="button-mock btn-primary" style="width:100%; display:block; padding:12px 0;">💾 Simpan Laporan</span>
        </div>
    </div>

</body>
</html>
';

$pdf = \PDF::loadHTML($html);
$pdf->setPaper('A4', 'portrait');
$pdf->save(public_path('panduan_penggunaan.pdf'));

echo "PDF Berhasil dibuat di public/panduan_penggunaan.pdf";
