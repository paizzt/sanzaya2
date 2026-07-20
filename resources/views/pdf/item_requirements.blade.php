<!DOCTYPE html>
<html>
<head>
    <title>Laporan Pemenuhan Kebutuhan Barang</title>
    <style>

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .header { margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; }
        .subtitle { font-size: 14px; margin-top: 5px; }
    
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
        <div class="title">Laporan Pemenuhan Kebutuhan Barang</div>
        <div class="subtitle">
            Outlet: {{ $outlet_name ?? 'Semua Outlet' }}<br>
            Tanggal Unduh: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 30px;">No</th>
                @if(!$outlet_name)
                <th>Outlet</th>
                @endif
                <th>Bulan Tahun</th>
                <th>Nama Barang</th>
                <th>Satuan</th>
                <th class="text-center">Qty</th>
                <th>Keterangan</th>
                <th class="text-right">Harga</th>
                <th class="text-center">Terkirim</th>
                <th class="text-center">Belum</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    @if(!$outlet_name)
                    <td>{{ $item->outlet_name }}</td>
                    @endif
                    <td>{{ $item->month_year }}</td>
                    <td>{{ $item->item_name }}</td>
                    <td>{{ $item->unit }}</td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                    <td class="text-center">{{ $item->sent }}</td>
                    <td class="text-center">{{ $item->not_sent }}</td>
                    <td class="text-right">Rp {{ number_format($item->total, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ $outlet_name ? 10 : 11 }}" class="text-center">Tidak ada data</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
