<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>
        @page { margin: 15px; } /* Maximize paper space */
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #374151; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
        .header h2 { margin: 0; padding: 0; font-size: 18px; color: #111827; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .header p { margin: 5px 0 0 0; font-size: 9px; color: #6b7280; }
        
        .active-filters { text-align: center; margin-bottom: 15px; font-size: 8px; color: #475569; }
        .filter-badge { display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 3px 6px; border-radius: 4px; margin: 0 4px; border: 1px solid #c7d2fe; }

        .summary-container { width: 100%; margin-bottom: 15px; }
        .summary-table { width: 100%; border: none; border-collapse: separate; border-spacing: 10px 0; }
        .summary-box { 
            background-color: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 8px; 
            text-align: center; 
            width: 25%;
        }
        .summary-title { font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
        .summary-value { font-size: 12px; color: #0f172a; font-weight: bold; }
        
        .summary-box.blue { border-top: 3px solid #3b82f6; }
        .summary-box.green { border-top: 3px solid #10b981; }
        .summary-box.indigo { border-top: 3px solid #6366f1; }
        .summary-box.orange { border-top: 3px solid #f97316; }

        table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; }
        .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 2px; text-align: left; vertical-align: middle; word-wrap: break-word; }
        .data-table th { 
            background-color: #4f46e5; 
            color: #ffffff; 
            font-weight: bold; 
            text-transform: uppercase; 
            font-size: 6px; 
            text-align: center; 
        }
        .data-table td { font-size: 7px; color: #334155; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        
        .data-table tr { page-break-inside: avoid; page-break-after: auto; }
        .data-table thead { display: table-header-group; }
        
        .text-right { text-align: right !important; white-space: nowrap; }
        .text-center { text-align: center !important; }
        .nowrap { white-space: nowrap; }
        
        .footer { text-align: right; margin-top: 30px; font-size: 9px; color: #94a3b8; font-style: italic; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        .signature { margin-top: 30px; float: right; text-align: center; width: 200px; font-size: 10px; color: #334155; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $title }}</h2>
        <p>Dicetak pada: {{ now()->format('d M Y H:i') }}</p>
    </div>

    @if(isset($activeFilters) && count($activeFilters) > 0)
    <div class="active-filters">
        @foreach($activeFilters as $key => $val)
            <span class="filter-badge">{{ $key }}: <strong>{{ $val }}</strong></span>
        @endforeach
    </div>
    @endif

    @if(isset($summary))
    <div class="summary-container">
        <table class="summary-table">
            <tr>
                @if(isset($summary['total_transaksi']))
                <td class="summary-box blue">
                    <div class="summary-title">Total Transaksi</div>
                    <div class="summary-value">{{ $summary['total_transaksi'] }}</div>
                </td>
                @endif
                @if(isset($summary['total_pendapatan']))
                <td class="summary-box green">
                    <div class="summary-title">Total Pendapatan</div>
                    <div class="summary-value">Rp {{ number_format($summary['total_pendapatan'], 0, ',', '.') 
}}</div>
                </td>
                @endif
                @if(isset($summary['pendapatan_bmhp']))
                <td class="summary-box indigo">
                    <div class="summary-title">Pendapatan BMHP</div>
                    <div class="summary-value">Rp {{ number_format($summary['pendapatan_bmhp'], 0, ',', '.') }}</div>
                </td>
                @endif
                @if(isset($summary['pendapatan_alat']))
                <td class="summary-box orange">
                    <div class="summary-title">Pendapatan ALAT</div>
                    <div class="summary-value">Rp {{ number_format($summary['pendapatan_alat'], 0, ',', '.') }}</div>
                </td>
                @endif
            </tr>
        </table>
    </div>
    @endif

    @if(isset($revenuePerPt) && $revenuePerPt->isNotEmpty())
    <div style="margin-bottom: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
        <div style="font-size: 10px; font-weight: bold; margin-bottom: 8px; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Ringkasan Pendapatan per PT</div>
        <table style="width: 100%; border-collapse: collapse;">
            @php $count = 0; @endphp
            @foreach($revenuePerPt as $ptName => $revenue)
                @if($count % 3 == 0) <tr> @endif
                <td style="width: 33.33%; padding: 4px; font-size: 8px; vertical-align: top;">
                    <strong style="color: #0f172a;">{{ $ptName ?: 'Tanpa PT' }}</strong><br>
                    <span style="color: #10b981; font-weight: bold;">Rp {{ number_format($revenue, 0, ',', '.') }}</span>
                </td>
                @if($count % 3 == 2) </tr> @endif
                @php $count++; @endphp
            @endforeach
            @if($count % 3 != 0) </tr> @endif
        </table>
    </div>
    @endif

    <table class="data-table">
        <thead>
            <tr>
                @foreach($headings as $heading)
                    <th>{{ $heading }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
                <tr>
                    @foreach($row as $index => $cell)
                        @php
                            $heading = $headings[$index] ?? '';
                            $isNumber = in_array($heading, ['No', 'Qty', 'HNA', 'Subtotal', 'PPN', 'Total', 'Grand Total']);
                            $isDate = ($heading === 'Tanggal');
                        @endphp
                        <td class="{{ $isNumber ? 'text-right' : '' }} {{ $isDate ? 'nowrap text-center' : '' }}">
                            {{ $cell }}
                        </td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signature">
        <p>Makassar, {{ \Carbon\Carbon::now()->format('d M Y') }}</p>
        <p style="margin-bottom: 60px;">Mengetahui,</p>
        <p><strong>Admin / Manager</strong></p>
    </div>
    <div style="clear: both;"></div>

    <div class="footer">
        * Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
    </div>
</body>
</html>
