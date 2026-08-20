<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; }
        h2, h3 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: avoid; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f4f4f4; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .header { text-align: center; margin-bottom: 20px; }
        .section-title { margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
        .page-break { page-break-before: always; }
    
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
        <h2>{{ $title }}</h2>
        <p>Dicetak pada: {{ \Carbon\Carbon::now()->format('d M Y H:i:s') }}</p>
    </div>

    <!-- RINGKASAN -->
    @if(isset($summary))
    <div style="margin-bottom: 30px;">
        <h3 class="section-title">Ringkasan Eksekutif</h3>
        <table style="width: 100%; border: none; margin-bottom: 10px;">
            <tr style="border: none;">
                <td style="width: 50%; vertical-align: top; border: none; padding: 0;">
                    <table style="width: 95%;">
                        <tr><th style="background:#e0f2fe; width:50%;">Total Penjualan</th><td class="text-right font-bold">Rp {{ number_format($summary['total_penjualan'], 0, ',', '.') }}</td></tr>
                        <tr><th style="background:#fef3c7;">Total Piutang</th><td class="text-right">Rp {{ number_format($summary['total_piutang'], 0, ',', '.') }}</td></tr>
                        <tr><th style="background:#fee2e2;">Total Hutang</th><td class="text-right">Rp {{ number_format($summary['total_hutang'], 0, ',', '.') }}</td></tr>
                        <tr><th style="background:#d1fae5;">Pesanan Terkirim</th><td class="text-right">{{ number_format($summary['pesanan_terkirim'], 0, ',', '.') }} Data</td></tr>
                        <tr><th style="background:#fef2f2;">Pesanan Belum Terkirim</th><td class="text-right">{{ number_format($summary['pesanan_belum'], 0, ',', '.') }} Data</td></tr>
                    </table>
                </td>
                <td style="width: 50%; vertical-align: top; border: none; padding: 0; text-align: center;">
                    @if(isset($chartBase64))
                    <img src="{{ $chartBase64 }}" style="max-width: 100%; height: auto; max-height: 180px; border: 1px solid #eee; padding: 5px; background: #fff; border-radius: 5px;" alt="Grafik Ringkasan" />
                    @endif
                </td>
            </tr>
        </table>
        
        @if(isset($summary['sales_penjualan']) && count($summary['sales_penjualan']) > 0)
        <h4 style="margin-bottom: 5px; font-size: 11px; color: #4b5563;">Rincian Penjualan per Sales</h4>
        <table style="width: 100%; border: none;">
            <tr>
                @foreach(array_chunk(array_slice($summary['sales_penjualan'], 0, 8, true), 4, true) as $chunk)
                <td style="width: 50%; vertical-align: top; border: none; padding: 0;">
                    <table style="width: 95%;">
                        @foreach($chunk as $nama => $total)
                        <tr>
                            <th style="background:#f3f4f6; width:50%;">{{ $nama }}</th>
                            <td class="text-right font-bold">Rp {{ number_format($total, 0, ',', '.') }}</td>
                        </tr>
                        @endforeach
                    </table>
                </td>
                @endforeach
            </tr>
        </table>
        @endif
    </div>
    @endif

    @if(in_array('logistik', $datasets ?? []))
    <!-- LOGISTIK -->
    <h3 class="section-title">1. Data Logistik</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Nama Sales</th>
                <th>Outlet / Pelanggan</th>
                <th>Produk</th>
                <th class="text-right">Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logistik as $row)
                <tr>
                    <td>{{ $row->tanggal }}</td>
                    <td>{{ $row->nama_sales }}</td>
                    <td>{{ $row->pelanggan }}</td>
                    <td>{{ $row->nama_produk }}</td>
                    <td class="text-right">{{ $row->grand_total }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="text-center">Tidak ada data logistik untuk periode ini</td></tr>
            @endforelse
        </tbody>
    </table>
    @endif

    @if(in_array('pesanan', $datasets ?? []))
    <!-- SURAT PESANAN -->
    <h3 class="section-title">2. Data Surat Pesanan</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Outlet</th>
                <th>Produk</th>
                <th class="text-right">Jml</th>
                <th>Satuan</th>
                <th class="text-right">T.Faktur</th>
                <th>Status Pengiriman</th>
            </tr>
        </thead>
        <tbody>
            @forelse($pesanan as $row)
                <tr>
                    <td>{{ $row->tanggal }}</td>
                    <td>{{ $row->nama_outlet }}</td>
                    <td>{{ $row->nama_produk }}</td>
                    <td class="text-right">{{ $row->jumlah }}</td>
                    <td>{{ $row->satuan }}</td>
                    <td class="text-right">{{ $row->total_faktur }}</td>
                    <td>
                        Terkirim: {{ $row->terkirim }} ({{ $row->persen_terpenuhi }})<br>
                        Belum: {{ $row->belum_terkirim }} ({{ $row->persen_belum_terpenuhi }})
                    </td>
                </tr>
            @empty
                <tr><td colspan="7" class="text-center">Tidak ada data surat pesanan untuk periode ini</td></tr>
            @endforelse
        </tbody>
    </table>
    @endif

    @if(in_array('piutang', $datasets ?? []))
    <!-- DATA PIUTANG -->
    <div class="page-break"></div>
    <h3 class="section-title">3. Data Piutang</h3>
    <table>
        <thead>
            <tr>
                <th>Outlet</th>
                <th class="text-right">Tahun 1</th>
                <th class="text-right">Tahun 2</th>
                <th class="text-right">Tahun 3</th>
                <th class="text-right">Total Sanzaya</th>
                <th class="text-right">Ruma 1</th>
                <th class="text-right">Ruma 2</th>
                <th class="text-right">Ruma 3</th>
                <th class="text-right">Total Ruma</th>
                <th class="text-right">Total Gabungan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($piutang as $row)
                <tr>
                    <td>{{ $row->nama_outlet }}</td>
                    <td class="text-right">{{ $row->tahun_1 }}</td>
                    <td class="text-right">{{ $row->tahun_2 }}</td>
                    <td class="text-right">{{ $row->tahun_3 }}</td>
                    <td class="text-right">{{ $row->total_sanzaya }}</td>
                    <td class="text-right">{{ $row->ruma_1 }}</td>
                    <td class="text-right">{{ $row->ruma_2 }}</td>
                    <td class="text-right">{{ $row->ruma_3 }}</td>
                    <td class="text-right">{{ $row->total_ruma }}</td>
                    <td class="text-right">{{ $row->total_gabungan }}</td>
                </tr>
            @empty
                <tr><td colspan="10" class="text-center">Tidak ada data piutang untuk periode ini</td></tr>
            @endforelse
        </tbody>
    </table>
    @endif

    @if(in_array('hutang', $datasets ?? []))
    <!-- DATA HUTANG -->
    <div class="page-break"></div>
    <h3 class="section-title">4. Data Hutang</h3>
    <table>
        <thead>
            <tr>
                <th class="text-center">No</th>
                <th>Nama Penyedia</th>
                <th class="text-right">Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($hutang as $row)
                <tr>
                    <td class="text-center">{{ $row->no }}</td>
                    <td>{{ $row->nama_penyedia }}</td>
                    <td class="text-right">{{ $row->nominal }}</td>
                </tr>
            @empty
                <tr><td colspan="3" class="text-center">Tidak ada data hutang untuk periode ini</td></tr>
            @endforelse
        </tbody>
    </table>
    @endif

    <div style="margin-top: 40px; float: right; text-align: center; width: 250px;">
        <p>Makassar, {{ \Carbon\Carbon::now()->format('d M Y') }}</p>
        <p>Mengetahui,</p>
        <br><br><br>
        <p><strong>Admin Logistik / Keuangan</strong></p>
    </div>
    <div style="clear: both;"></div>
</body>
</html>
