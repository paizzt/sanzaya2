<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>
        @page { margin: 15px; } /* Maximize paper space */
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #374151; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .header h2 { margin: 0; padding: 0; font-size: 18px; color: #111827; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .header p { margin: 5px 0 0 0; font-size: 9px; color: #6b7280; }
        
        .active-filters { text-align: center; margin-bottom: 15px; font-size: 8px; color: #475569; }
        .filter-badge { display: inline-block; background-color: #eff6ff; color: #1e3a8a; padding: 3px 6px; border-radius: 4px; margin: 0 4px; border: 1px solid #bfdbfe; }

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
        .data-table th { 
            background-color: #3b82f6; 
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

    @if(isset($summaryCards))
    <table style="width: 100%; margin-bottom: 20px; border-spacing: 10px; border-collapse: separate;">
        <tr>
            <!-- Card 1: Total Semua -->
            <td style="width: 25%; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; text-align: center; vertical-align: middle;">
                <div style="font-size: 10px; font-weight: bold; color: #92400e; margin-bottom: 8px;">{{ $summaryCards['total_title'] }}</div>
                <div style="font-size: 14px; font-weight: bold; color: #d97706;">Rp {{ number_format($summaryCards['total_amount'], 0, ',', '.') }}</div>
            </td>
            
            <!-- Card 2: Berdasarkan Tahun -->
            <td style="width: 25%; background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px; vertical-align: top;">
                <div style="font-size: 10px; font-weight: bold; color: #1e40af; margin-bottom: 8px;">{{ $summaryCards['year_title'] }}</div>
                <table style="width: 100%; border-collapse: collapse;">
                    @forelse($summaryCards['year_data'] as $year => $amount)
                    <tr>
                        <td style="font-size: 9px; color: #1d4ed8; padding: 2px 0; border-bottom: 1px solid #bfdbfe;">{{ $year }}</td>
                        <td style="font-size: 9px; font-weight: bold; color: #1e3a8a; text-align: right; padding: 2px 0; border-bottom: 1px solid #bfdbfe;">Rp {{ number_format($amount, 0, ',', '.') }}</td>
                    </tr>
                    @empty
                    <tr><td colspan="2" style="font-size: 9px; color: #60a5fa; text-align: center; padding: 4px 0;">Tidak ada data</td></tr>
                    @endforelse
                </table>
            </td>
            
            <!-- Card 3: Berdasarkan PT -->
            <td style="width: 25%; background-color: #eef2ff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 12px; vertical-align: top;">
                <div style="font-size: 10px; font-weight: bold; color: #3730a3; margin-bottom: 8px;">{{ $summaryCards['pt_title'] }}</div>
                <table style="width: 100%; border-collapse: collapse;">
                    @forelse($summaryCards['pt_data'] as $pt => $amount)
                    <tr>
                        <td style="font-size: 9px; color: #4338ca; padding: 2px 0; border-bottom: 1px solid #c7d2fe;">{{ $pt }}</td>
                        <td style="font-size: 9px; font-weight: bold; color: #312e81; text-align: right; padding: 2px 0; border-bottom: 1px solid #c7d2fe;">Rp {{ number_format($amount, 0, ',', '.') }}</td>
                    </tr>
                    @empty
                    <tr><td colspan="2" style="font-size: 9px; color: #818cf8; text-align: center; padding: 4px 0;">Tidak ada data</td></tr>
                    @endforelse
                </table>
            </td>
            
            <!-- Card 4: Total Outlet/Penyedia -->
            <td style="width: 25%; background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 12px; text-align: center; vertical-align: middle;">
                <div style="font-size: 10px; font-weight: bold; color: #065f46; margin-bottom: 8px;">{{ $summaryCards['count_title'] }}</div>
                <div style="font-size: 20px; font-weight: bold; color: #059669; margin-bottom: 4px;">{{ $summaryCards['count_value'] }}</div>
                <div style="font-size: 9px; color: #047857;">{{ $summaryCards['count_label'] }}</div>
            </td>
        </tr>
    </table>
    @else
        @if(isset($revenuePerPt) && (is_array($revenuePerPt) || $revenuePerPt->isNotEmpty()))
        <div style="margin-bottom: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
            <div style="font-size: 10px; font-weight: bold; margin-bottom: 8px; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Ringkasan per PT</div>
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
    
        @if(isset($revenuePerYear) && count($revenuePerYear) > 0)
        <div style="margin-bottom: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
            <div style="font-size: 10px; font-weight: bold; margin-bottom: 8px; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Ringkasan per Tahun</div>
            <table style="width: 100%; border-collapse: collapse;">
                @php $count = 0; @endphp
                @foreach($revenuePerYear as $year => $revenue)
                    @if($count % 4 == 0) <tr> @endif
                    <td style="width: 25%; padding: 4px; font-size: 8px; vertical-align: top;">
                        <strong style="color: #0f172a;">{{ $year }}</strong><br>
                        <span style="color: #3b82f6; font-weight: bold;">Rp {{ number_format($revenue, 0, ',', '.') }}</span>
                    </td>
                    @if($count % 4 == 3) </tr> @endif
                    @php $count++; @endphp
                @endforeach
                @if($count % 4 != 0) </tr> @endif
            </table>
        </div>
        @endif
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
        <p><strong>{{ auth()->user() ? auth()->user()->name : 'Admin / Manager' }}</strong></p>
    </div>
    <div style="clear: both;"></div>

    <div class="footer">
        * Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
    </div>
</body>
</html>
