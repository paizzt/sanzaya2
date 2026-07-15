<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
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

    <!-- LOGISTIK -->
    <h3 class="section-title">1. Data Logistik</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Nama Sales</th>
                <th>Outlet</th>
                <th>Produk</th>
                <th class="text-right">Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logistik as $row)
                <tr>
                    <td>{{ $row->tanggal }}</td>
                    <td>{{ $row->nama_sales }}</td>
                    <td>{{ $row->nama_outlet }}</td>
                    <td>{{ $row->nama_produk }}</td>
                    <td class="text-right">{{ $row->total_sales }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="text-center">Tidak ada data logistik untuk periode ini</td></tr>
            @endforelse
        </tbody>
    </table>

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

    <!-- DATA HUTANG -->
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

</body>
</html>
