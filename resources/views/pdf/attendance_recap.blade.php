<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Absensi</title>
    <style>
        @page { margin-top: 1.27cm; margin-left: 1.27cm; margin-right: 1.27cm; margin-bottom: 1.8cm; }

        body {
            font-family: {!! request('font', 'sans-serif') !!};
            font-size: {{ (int)request('size', 10) }}px;
            color: #374151;
            margin: 0;
            padding: 0;
        }

        .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
        .header h2 { margin: 0; padding: 0; font-size: 16px; color: #111827; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; color: #6b7280; font-size: 9px; }

        table { width: 100%; border-collapse: collapse; margin-top: 12px; table-layout: fixed; }
        th, td { border: 1px solid #d1d5db; padding: 5px 6px; text-align: left; word-wrap: break-word; overflow-wrap: break-word; font-size: 8.5px; }
        th { background-color: #f1f5f9; font-weight: bold; color: #1e293b; text-transform: uppercase; font-size: 8px; }
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }

        .summary-box { 
            margin-top: 10px; 
            padding: 8px 12px; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            background: #f8fafc;
            display: inline-block;
            font-size: 8.5px;
        }
        .summary-box p { margin: 2px 0; }
        .status-hadir { color: #10b981; font-weight: bold; }
        .status-sakit { color: #f59e0b; font-weight: bold; }
        .status-izin { color: #3b82f6; font-weight: bold; }
        .status-alpa { color: #ef4444; font-weight: bold; }
        .status-terlambat { color: #e11d48; font-weight: bold; } /* rose-600 */
    
        /* PDF Fixes for Overflow & Layout */
        tr { page-break-inside: avoid; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        .page-break { page-break-after: always; }

        .footer { 
            position: fixed; 
            bottom: -1.2cm; 
            left: 0; 
            right: 0; 
            height: 20px; 
            text-align: right; 
            font-size: 8px; 
            color: #94a3b8; 
            font-style: italic; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 5px; 
        }
    </style>
</head>
<body>

    <div class="footer">
        * Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
    </div>

    <div class="header">
        <h2>Laporan Rekapitulasi Absensi</h2>
        <p>Periode: Bulan {{ $filters['month'] }} Tahun {{ $filters['year'] }}</p>
    </div>

    <div class="summary-box">
        <strong>Ringkasan Kehadiran:</strong>
        <p>Hadir: <span class="status-hadir">{{ $summary['hadir'] }} hari</span></p>
        <p>Sakit: <span class="status-sakit">{{ $summary['sakit'] }} hari</span></p>
        <p>Izin: <span class="status-izin">{{ $summary['izin'] }} hari</span></p>
        <p>Alpa: <span class="status-alpa">{{ $summary['alpa'] }} hari</span></p>
        <p>Terlambat: <span class="status-terlambat">{{ $summary['terlambat'] ?? 0 }} hari</span></p>
        <p>Lembur: <span style="color:#8b5cf6; font-weight:bold;">{{ $summary['lembur'] ?? 0 }} hari</span></p>
        @if(!empty($summary['shift_siang']) || !empty($summary['shift_malam']))
        <p>Shift Satpam: <span style="color:#d97706; font-weight:bold;">Siang {{ $summary['shift_siang'] ?? 0 }}</span> | <span style="color:#4f46e5; font-weight:bold;">Malam {{ $summary['shift_malam'] ?? 0 }}</span></p>
        @endif
    </div>

    @if(isset($userSummaries) && count($userSummaries) > 0)
    <div style="margin-top: 15px;">
        <strong style="font-size: 9.5px;">Ringkasan Kehadiran per Karyawan:</strong>
        <table>
            <thead>
                <tr>
                    <th style="width: 32%;">Nama Karyawan</th>
                    <th class="text-center" style="width: 11%;">Hadir</th>
                    <th class="text-center" style="width: 11%;">Sakit</th>
                    <th class="text-center" style="width: 11%;">Izin</th>
                    <th class="text-center" style="width: 11%;">Alpa</th>
                    <th class="text-center" style="width: 12%;">Terlambat</th>
                    <th class="text-center" style="width: 12%;">Lembur</th>
                </tr>
            </thead>
            <tbody>
                @foreach($userSummaries as $u)
                <tr>
                    <td>
                        {{ $u['name'] }}
                        @if(!empty($u['is_satpam']))
                            <small style="color: #4f46e5; font-weight: bold;">(Satpam)</small>
                            <br><small style="color: #6b7280;">Siang: {{ $u['shift_siang'] ?? 0 }} | Malam: {{ $u['shift_malam'] ?? 0 }}</small>
                        @endif
                    </td>
                    <td class="text-center status-hadir">{{ $u['hadir'] }}</td>
                    <td class="text-center status-sakit">{{ $u['sakit'] }}</td>
                    <td class="text-center status-izin">{{ $u['izin'] }}</td>
                    <td class="text-center status-alpa">{{ !empty($u['is_satpam']) ? '-' : $u['alpa'] }}</td>
                    <td class="text-center status-terlambat">{{ !empty($u['is_satpam']) ? '-' : ($u['terlambat'] ?? 0) }}</td>
                    <td class="text-center" style="color:#8b5cf6; font-weight:bold;">{{ !empty($u['is_satpam']) ? '-' : ($u['lembur'] ?? 0) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div style="margin-top: 20px;">
        <strong style="font-size: 9.5px;">Rincian Kehadiran:</strong>
    </div>
    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 5%;">No</th>
                <th style="width: 18%;">Karyawan</th>
                <th style="width: 15%;">Tanggal / Periode</th>
                <th style="width: 13%;">Tipe Absen</th>
                <th class="text-center" style="width: 17%;">Jam Masuk</th>
                <th class="text-center" style="width: 17%;">Jam Keluar</th>
                <th class="text-center" style="width: 15%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($recapList as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        {{ $item['user_name'] }}
                        @if(!empty($item['is_satpam']))
                            <br><small style="color: #4f46e5; font-weight: bold;">[SATPAM]</small>
                        @endif
                    </td>
                    <td>{{ $item['date'] }}</td>
                    <td>
                        {{ $item['type'] }}
                        @if(!empty($item['shift']))
                            <br><small style="color: #d97706; font-weight: bold;">[{{ $item['shift'] }}]</small>
                        @endif
                    </td>
                    <td class="text-center">
                        {{ $item['check_in'] ?? '-' }}
                        @if(!empty($item['is_late']))
                            <br><small class="status-terlambat">(Terlambat)</small>
                        @endif
                        @if(!empty($item['check_in_notes']))
                            <br><small style="color: #2563eb;">Masuk: {{ $item['check_in_notes'] }}</small>
                        @endif
                    </td>
                    <td class="text-center">
                        {{ $item['check_out'] ?? '-' }}
                        @if(!empty($item['is_lembur']))
                            <br><small style="color: #2563eb; font-weight: bold;">(Lembur{{ !empty($item['is_saturday']) ? ' Sabtu' : '' }})</small>
                            @if(!empty($item['check_out_notes']) || !empty($item['notes']))
                                <br><small style="color: #1e40af; font-weight: 500;">Alasan: {{ $item['check_out_notes'] ?? $item['notes'] }}</small>
                            @endif
                        @elseif(!empty($item['check_out_notes']))
                            <br><small style="color: #059669;">Pulang: {{ $item['check_out_notes'] }}</small>
                        @endif
                    </td>
                    <td class="text-center">
                        {{ $item['status'] }}
                        @if(!empty($item['is_lembur']) && $item['status'] === 'Hadir')
                            <br><small style="color: #2563eb; font-weight: bold;">[Lembur]</small>
                        @endif
                        @if(!empty($item['notes']) && empty($item['check_in_notes']) && empty($item['check_out_notes']) && empty($item['is_lembur']))
                            <br><small style="color: #6b7280; font-style: italic;">"{{ $item['notes'] }}"</small>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center">Tidak ada data absensi untuk periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 25px; float: right; text-align: center; width: 200px; font-size: 8.5px;">
        <p>Makassar, {{ date('d F Y') }}</p>
        <p>Mengetahui,</p>
        <br><br><br>
        <p><strong>HR / Manager</strong></p>
    </div>
    <div style="clear: both;"></div>

</body>
</html>
