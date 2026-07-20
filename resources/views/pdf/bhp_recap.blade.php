<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Pengajuan BHP</title>
    <style>

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-disetujui { color: green; font-weight: bold; }
        .status-ditolak { color: red; font-weight: bold; }
        .status-menunggu { color: orange; font-weight: bold; }
    
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
    @php
        $monthName = ($month && $month != 'Semua') ? date('F', strtotime('2024-' . $month . '-01')) : 'Semua Bulan';
        $yearName = ($year ?? 'Semua') != 'Semua' ? $year : 'Semua Tahun';
    @endphp
    <div class="header">
        <h2>Rekapitulasi Pengajuan BHP (Bahan Medis Habis Pakai)</h2>
        <p>
            Periode: {{ $monthName }} {{ $yearName }} | 
            Filter Status: {{ $status ?? 'Semua' }}
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nomor Pengajuan</th>
                <th>Tanggal Pengajuan</th>
                <th>Pemohon</th>
                <th>Divisi</th>
                <th>Nama Barang</th>
                <th>Spesifikasi</th>
                <th>Tanggal Target</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($requests as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->request_number }}</td>
                    <td>{{ date('d-m-Y', strtotime($item->request_date)) }}</td>
                    <td>{{ $item->user->name ?? 'Unknown' }}</td>
                    <td>{{ $item->division_name }}</td>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ $item->specifications }}</td>
                    <td>{{ date('d-m-Y', strtotime($item->target_date)) }}</td>
                    <td class="status-{{ strtolower($item->status) }}">{{ $item->status }}</td>
                </tr>
            @endforeach
            @if(count($requests) == 0)
                <tr>
                    <td colspan="9" style="text-align: center;">Tidak ada data pengajuan BHP pada periode ini.</td>
                </tr>
            @endif
        </tbody>
    </table>
</body>
</html>
