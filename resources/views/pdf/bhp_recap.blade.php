<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Pengajuan BHP</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-disetujui { color: green; font-weight: bold; }
        .status-ditolak { color: red; font-weight: bold; }
        .status-menunggu { color: orange; font-weight: bold; }
    </style>
</head>
<body>
    @php
        \ = (\ && \ != 'Semua') ? date('F', strtotime('2024-' . \ . '-01')) : 'Semua Bulan';
        \ = (\ ?? 'Semua') != 'Semua' ? \ : 'Semua Tahun';
    @endphp
    <div class="header">
        <h2>Rekapitulasi Pengajuan BHP (Bahan Medis Habis Pakai)</h2>
        <p>
            Periode: {{ \ }} {{ \ }} | 
            Filter Status: {{ \ ?? 'Semua' }}
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
            @foreach (\ as \ => \)
                <tr>
                    <td>{{ \ + 1 }}</td>
                    <td>{{ \->request_number }}</td>
                    <td>{{ date('d-m-Y', strtotime(\->request_date)) }}</td>
                    <td>{{ \->user->name ?? 'Unknown' }}</td>
                    <td>{{ \->division_name }}</td>
                    <td>{{ \->product_name }}</td>
                    <td>{{ \->specifications }}</td>
                    <td>{{ date('d-m-Y', strtotime(\->target_date)) }}</td>
                    <td class="status-{{ strtolower(\->status) }}">{{ \->status }}</td>
                </tr>
            @endforeach
            @if(count(\) == 0)
                <tr>
                    <td colspan="9" style="text-align: center;">Tidak ada data pengajuan BHP pada periode ini.</td>
                </tr>
            @endif
        </tbody>
    </table>
</body>
</html>
