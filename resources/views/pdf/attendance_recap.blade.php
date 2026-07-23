<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Absensi</title>
    <style>

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; padding: 0; }
        .header p { margin: 5px 0 0 0; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        .text-center { text-align: center; }
        .summary-box { 
            margin-top: 20px; 
            padding: 10px; 
            border: 1px solid #ddd; 
            background: #fafafa;
            display: inline-block;
        }
        .summary-box p { margin: 5px 0; }
        .status-hadir { color: #10b981; font-weight: bold; }
        .status-sakit { color: #f59e0b; font-weight: bold; }
        .status-izin { color: #3b82f6; font-weight: bold; }
        .status-alpa { color: #ef4444; font-weight: bold; }
    
        /* PDF Fixes for Overflow & Layout */
        table { width: 100%; border-collapse: collapse; table-layout: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        th, td { word-wrap: break-word; overflow-wrap: break-word; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan Rekapitulasi Absensi</h2>
        <p>Periode: Bulan {{ $filters['month'] }} Tahun {{ $filters['year'] }}</p>
    </div>

    <div class="summary-box">
        <strong>Ringkasan Kehadiran Keseluruhan:</strong>
        <p>Hadir: <span class="status-hadir">{{ $summary['hadir'] }} hari</span></p>
        <p>Sakit: <span class="status-sakit">{{ $summary['sakit'] }} hari</span></p>
        <p>Izin: <span class="status-izin">{{ $summary['izin'] }} hari</span></p>
        <p>Alpa: <span class="status-alpa">{{ $summary['alpa'] }} hari</span></p>
        <p>Lembur: <span style="color:#8b5cf6; font-weight:bold;">{{ $summary['lembur'] ?? 0 }} hari</span></p>
    </div>

    @if(isset($userSummaries) && count($userSummaries) > 0)
    <div style="margin-top: 20px;">
        <strong>Ringkasan Kehadiran per Karyawan:</strong>
        <table>
            <thead>
                <tr>
                    <th>Nama Karyawan</th>
                    <th class="text-center">Hadir</th>
                    <th class="text-center">Sakit</th>
                    <th class="text-center">Izin</th>
                    <th class="text-center">Alpa</th>
                      <th class="text-center">Lembur</th>
                </tr>
            </thead>
            <tbody>
                @foreach($userSummaries as $u)
                <tr>
                    <td>{{ $u['name'] }}</td>
                    <td class="text-center status-hadir">{{ $u['hadir'] }}</td>
                    <td class="text-center status-sakit">{{ $u['sakit'] }}</td>
                    <td class="text-center status-izin">{{ $u['izin'] }}</td>
                    <td class="text-center status-alpa">{{ $u['alpa'] }}</td>
                      <td class="text-center" style="color:#8b5cf6; font-weight:bold;">{{ $u['lembur'] ?? 0 }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div style="margin-top: 30px;">
        <strong>Rincian Kehadiran:</strong>
    </div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Karyawan</th>
                <th>Tanggal / Periode</th>
                <th>Tipe Absen</th>
                <th class="text-center">Jam Masuk</th>
                <th class="text-center">Jam Keluar</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($recapList as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $item['user_name'] }}</td>
                    <td>{{ $item['date'] }}</td>
                    <td>{{ $item['type'] }}</td>
                    <td class="text-center">{{ $item['check_in'] ?? '-' }}</td>
                    <td class="text-center">{{ $item['check_out'] ?? '-' }}</td>
                    <td class="text-center">{{ $item['status'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center">Tidak ada data absensi untuk periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>
