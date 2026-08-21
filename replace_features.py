import re

filepath = 'c:/xampp/htdocs/sanzaya2/resources/js/Layouts/AuthenticatedLayout.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

mapping = {
    15: 'Dashboard',
    30: 'Ambil Absensi',
    31: 'Izin / Sakit',
    3: 'Form Marketing',
    10: 'Rekap Marketing',
    32: 'Cari Produk',
    4: 'Menu Pengajuan UC',
    33: 'Riwayat UC',
    8: 'Menu Persetujuan UC',
    5: 'Menu Pengajuan BHP',
    24: 'Rekap BHP',
    25: 'Menu Pengajuan Pembayaran',
    20: 'Data Hutang',
    19: 'Data Piutang',
    26: 'Persetujuan Pembayaran',
    17: 'Laporan Logistik',
    18: 'Surat Pesanan',
    12: 'Data Penyedia',
    22: 'Data Produk',
    16: 'Kebutuhan Barang',
    9: 'Data Outlet',
    23: 'Pemetaan Outlet',
    11: 'Data Armada',
    21: 'Data Perusahaan',
    6: 'Data Pengguna',
    28: 'Manajemen SOP',
    34: 'Rekap Absensi',
    27: 'Riwayat Perubahan',
    13: 'Notifikasi',
    14: 'Profil & Akun',
    2: 'Ambil Absensi'
}

def repl(match):
    id_val = int(match.group(1))
    if id_val in mapping:
        name = mapping[id_val]
        return f"auth.active_feature_names?.includes('{name}')"
    return match.group(0)

new_content = re.sub(r'auth\.active_features\?\.includes\((\d+)\)', repl, content)

new_content = new_content.replace(
    "name: 'Izin/Sakit', href: route('absensi.pengajuan'), icon: FileText, active: url.startsWith('/absensi/pengajuan'), show: auth.active_feature_names?.includes('Ambil Absensi')",
    "name: 'Izin/Sakit', href: route('absensi.pengajuan'), icon: FileText, active: url.startsWith('/absensi/pengajuan'), show: auth.active_feature_names?.includes('Izin / Sakit')"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Replaced successfully.')
