<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Marketing - {{ ucfirst($type) }}</title>
    <style>
        @page { margin: 1cm; }

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '11') }}px !important;
            color: #333;
        }
    
        .header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 6px; }
        .header h1 { margin: 0; font-size: 16px; }
        .header p { margin: 3px 0 0 0; font-size: 11px; color: #666; }
        .filters { margin-bottom: 12px; font-size: 11px; }
        .filters table { width: 100%; }
        .filters td { padding: 1px 0; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        table.data-table th, table.data-table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
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
        <h1>REKAPITULASI MARKETING{{ $type === 'kendala' ? '' : ' (' . strtoupper($type) . ')' }}</h1>
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

    @if(($type === 'laporan' || $type === 'kendala') && isset($kendala_per_user) && count($kendala_per_user) > 0)
    <div style="margin-bottom: 15px;">
        <h3 style="margin-bottom: 8px; font-size: 13px; border-bottom: 1px solid #ddd; padding-bottom: 4px; page-break-after: avoid;">Kesimpulan dan Kendala Per Marketing</h3>
        @foreach($kendala_per_user as $mkt)
            @if(count($mkt['kendal_list']) > 0)
                <div style="border: 1px solid #e2e8f0; padding: 10px 12px; margin-bottom: 10px; border-radius: 4px; page-break-inside: auto;">
                    <div style="font-weight: bold; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; color: #1e293b; page-break-after: avoid;">{{ $mkt['name'] }}</div>
                    <ul style="margin: 0; padding-left: 20px; list-style-type: disc; text-align: justify;">
                        @foreach($mkt['kendal_list'] as $kendala)
                            <li style="margin-bottom: 4px; line-height: 1.35; page-break-inside: avoid;">
                                <strong>{{ $kendala['outlet'] }}</strong> : {{ str_replace("\n", ' | ', $kendala['description']) }}
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif
        @endforeach
    </div>
    
    <h3 style="margin-bottom: 8px; font-size: 13px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 15px; page-break-after: avoid;">Rekapan Laporan</h3>
    @endif


    @if($type === 'laporan' || $type === 'kendala')
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
                    <th width="15%">Dokumentasi</th>
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
                    <td>{{ $report->issue_type ? $report->issue_type . ($report->issue_description ? ': ' . $report->issue_description : '') : ($report->issue_description ?: '-') }}</td>
                    <td>{{ $report->visit_result ?: '-' }}</td>
                    <td class="text-center">
                        @if($report->photos)
                            @php $photos = json_decode($report->photos, true); @endphp
                            @if(is_array($photos) && count($photos) > 0)
                                @php
                                    $photoPath = storage_path('app/public/' . $photos[0]);
                                    $base64 = '';
                                    if(file_exists($photoPath)) {
                                        $type = pathinfo($photoPath, PATHINFO_EXTENSION);
                                        $data = file_get_contents($photoPath);
                                        $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                                    } else {
                                        $base64 = str_starts_with($photos[0], 'http') ? $photos[0] : '';
                                    }
                                @endphp
                                @if($base64)
                                    <img src="{{ $base64 }}" style="max-width: 60px; max-height: 40px; margin-bottom: 2px; border-radius: 4px;">
                                @endif
                                @if(count($photos) > 1)
                                    <div style="font-size: 8px; color: #666;">+{{ count($photos) - 1 }} foto</div>
                                @endif
                            @endif
                        @endif
                        
                        @if($report->signature)
                            <div style="font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 3px;">[Tanda Tangan PIC]</div>
                            @php
                                $sigPath = storage_path('app/public/' . $report->signature);
                                $sigBase64 = '';
                                if(file_exists($sigPath)) {
                                    $sigType = pathinfo($sigPath, PATHINFO_EXTENSION);
                                    $sigData = file_get_contents($sigPath);
                                    $sigBase64 = 'data:image/' . $sigType . ';base64,' . base64_encode($sigData);
                                } else {
                                    $sigBase64 = str_starts_with($report->signature, 'http') ? $report->signature : '';
                                }
                            @endphp
                            @if($sigBase64)
                                <img src="{{ $sigBase64 }}" style="max-width: 60px; max-height: 40px; margin-top: 2px;">
                            @endif
                        @endif
                    </td>
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
                    <th width="5%" class="text-center">No</th>
                    <th width="20%">Nama Sales</th>
                    <th width="15%" class="text-center">Bulan Tahun</th>
                    <th width="45%">Outlet Target</th>
                    <th width="15%" class="text-center">Capaian</th>
                </tr>
            </thead>
            <tbody>
                @forelse($targets as $index => $target)
                @php
                    $outletList = $target->target_outlet_names;
                    $realized = $target->realized_visits ?? 0;
                    $targetCount = $target->target_visits ?? (is_array($outletList) ? count($outletList) : 0);
                    $percentage = $targetCount > 0 ? min(100, round(($realized / $targetCount) * 100)) : 0;
                @endphp
                <tr>
                    <td class="text-center" style="vertical-align: top;">{{ $index + 1 }}</td>
                    <td style="vertical-align: top; font-weight: bold;">{{ $target->user ? $target->user->name : '-' }}</td>
                    <td class="text-center" style="vertical-align: top;">
                        {{ $target->start_date ? \Carbon\Carbon::parse($target->start_date)->locale('id')->translatedFormat('F Y') : '-' }}
                    </td>
                    <td style="vertical-align: top;">
                        @if(!empty($outletList) && count($outletList) > 0)
                            <ol style="margin: 0; padding-left: 18px; line-height: 1.4;">
                                @foreach($outletList as $outletName)
                                    <li>{{ $outletName }}</li>
                                @endforeach
                            </ol>
                        @elseif($targetCount > 0)
                            <span>{{ $targetCount }} Outlet</span>
                        @else
                            <span style="color: #999;">-</span>
                        @endif
                    </td>
                    <td class="text-center" style="vertical-align: top;">
                        <div style="font-weight: bold; font-size: 11px;">
                            {{ $realized }} / {{ $targetCount }}
                        </div>
                        <div style="font-size: 11px; font-weight: bold; color: {{ $percentage >= 100 ? '#16a34a' : ($percentage >= 50 ? '#2563eb' : '#dc2626') }}; margin-top: 2px;">
                            {{ $percentage }}%
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="text-center">Tidak ada data target.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    @endif

    <div style="margin-top: 40px; float: right; text-align: center; width: 250px;">
        <p>Makassar, {{ date('d F Y') }}</p>
        <p>Mengetahui,</p>
        <br><br><br>
        <p><strong>Manager Marketing / Direktur</strong></p>
    </div>
    <div style="clear: both;"></div>
</body>
</html>

