<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Marketing - {{ ucfirst($type) }}</title>
    <style>

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 5px 0 0 0; font-size: 12px; color: #666; }
        .filters { margin-bottom: 20px; font-size: 12px; }
        .filters table { width: 100%; }
        .filters td { padding: 2px 0; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.data-table th, table.data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        table.data-table th { background-color: #f8f9fa; font-weight: bold; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
    
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
        <h1>REKAPITULASI MARKETING ({{ strtoupper($type) }})</h1>
        <p>Dicetak pada: {{ date('d-m-Y H:i') }}</p>
    </div>

    <div class="filters">
        <table>
            <tr>
                <td width="120"><strong>Filter Sales</strong></td>
                <td>: {{ $filters['user'] }}</td>
            </tr>
            <tr>
                <td><strong>Periode</strong></td>
                <td>: {{ $filters['start_date'] ? date('d-m-Y', strtotime($filters['start_date'])) : 'Awal' }} s/d {{ $filters['end_date'] ? date('d-m-Y', strtotime($filters['end_date'])) : 'Akhir' }}</td>
            </tr>
        </table>
    </div>

    @if($type === 'laporan')
        <table class="data-table">
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th width="15%">Nama Sales</th>
                    <th width="15%">Waktu & Tanggal</th>
                    <th width="15%">Aktivitas</th>
                    <th width="20%">Outlet / PIC</th>
                    <th width="15%">Kendala</th>
                    <th width="15%">Hasil</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reports as $index => $report)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $report->user ? $report->user->name : '-' }}</td>
                    <td>{{ date('d-m-Y', strtotime($report->visit_date)) }} <br> {{ $report->visit_time }}</td>
                    <td>{{ $report->activity_type }}</td>
                    <td>
                        {{ str_contains($report->activity_type, 'Non-Kunjungan') ? '-' : ($report->outlet ? $report->outlet->name : $report->outlet_id) }}<br>
                        <small>{{ $report->pic_name ? 'PIC: '.$report->pic_name : '' }}</small>
                    </td>
                    <td>{{ $report->issue_type }}</td>
                    <td>{{ $report->visit_result }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center">Tidak ada data laporan.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    @else
        <table class="data-table">
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th width="20%">Nama Sales</th>
                    <th width="15%">Tahun/Minggu</th>
                    <th width="30%">Periode</th>
                    <th width="15%" class="text-center">Target Outlet</th>
                    <th width="15%" class="text-right">Target Nominal</th>
                </tr>
            </thead>
            <tbody>
                @forelse($targets as $index => $target)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $target->user ? $target->user->name : '-' }}</td>
                    <td>Tahun {{ $target->year }} <br> M-{{ $target->week_number }}</td>
                    <td>{{ date('d-m-Y', strtotime($target->start_date)) }} s/d {{ date('d-m-Y', strtotime($target->end_date)) }}</td>
                    <td class="text-center">{{ $target->target_visits }} Outlet</td>
                    <td class="text-right">Rp {{ number_format($target->target_transactions, 0, ',', '.') }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="text-center">Tidak ada data target.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    @endif
</body>
</html>
