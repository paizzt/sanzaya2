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
    <div style="margin-bottom: 20px;">
        <h3 class="section-title" style="margin-bottom: 5px;">Dashboard Eksekutif</h3>
        
        <table style="width: 100%; border-collapse: separate; border-spacing: 5px; margin-bottom: 10px; margin-left: -5px;">
            <tr>
                @if(in_array('logistik', $datasets ?? []))
                <td style="background-color: #3b82f6; border-radius: 6px; padding: 10px; color: #fff; width: 20%;">
                    <p style="font-size: 10px; margin: 0 0 4px 0; opacity: 0.9;">Total Penjualan</p>
                    <p style="font-size: 13px; font-weight: bold; margin: 0;">Rp {{ number_format($summary['total_penjualan'], 0, ',', '.') }}</p>
                </td>
                @endif
                @if(in_array('piutang', $datasets ?? []))
                <td style="background-color: #14b8a6; border-radius: 6px; padding: 10px; color: #fff; width: 20%;">
                    <p style="font-size: 10px; margin: 0 0 4px 0; opacity: 0.9;">Total Piutang</p>
                    <p style="font-size: 13px; font-weight: bold; margin: 0;">Rp {{ number_format($summary['total_piutang'], 0, ',', '.') }}</p>
                </td>
                @endif
                @if(in_array('hutang', $datasets ?? []))
                <td style="background-color: #f59e0b; border-radius: 6px; padding: 10px; color: #fff; width: 20%;">
                    <p style="font-size: 10px; margin: 0 0 4px 0; opacity: 0.9;">Total Hutang</p>
                    <p style="font-size: 13px; font-weight: bold; margin: 0;">Rp {{ number_format($summary['total_hutang'], 0, ',', '.') }}</p>
                </td>
                @endif
                @if(in_array('pesanan', $datasets ?? []))
                <td style="background-color: #10b981; border-radius: 6px; padding: 10px; color: #fff; width: 20%;">
                    <p style="font-size: 10px; margin: 0 0 4px 0; opacity: 0.9;">Pesanan Terkirim</p>
                    <p style="font-size: 13px; font-weight: bold; margin: 0;">{{ number_format($summary['pesanan_terkirim'], 0, ',', '.') }}</p>
                </td>
                <td style="background-color: #059669; border-radius: 6px; padding: 10px; color: #fff; width: 20%;">
                    <p style="font-size: 10px; margin: 0 0 4px 0; opacity: 0.9;">Belum Terkirim</p>
                    <p style="font-size: 13px; font-weight: bold; margin: 0;">{{ number_format($summary['pesanan_belum'], 0, ',', '.') }}</p>
                </td>
                @endif
            </tr>
        </table>

        <!-- Charts Grid -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-left: -10px; margin-bottom: 5px;">
            <tr>
                @if(in_array('logistik', $datasets ?? []) && !empty($charts['outlets']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; width: 45%; vertical-align: middle;">
                    <h4 style="margin-top:0; font-size: 10px; color: #4b5563;">Top 5 Outlet (Juta)</h4>
                    <img src="{{ $charts['outlets'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif

                @if((in_array('piutang', $datasets ?? []) || in_array('hutang', $datasets ?? [])) && !empty($charts['piutang_hutang']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; width: 30%; vertical-align: middle;">
                    <h4 style="margin-top:0; font-size: 10px; color: #4b5563;">Piutang vs Hutang (Juta)</h4>
                    <img src="{{ $charts['piutang_hutang'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif
                
                @if(in_array('pesanan', $datasets ?? []) && !empty($charts['pesanan']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; width: 25%; vertical-align: middle;">
                    <h4 style="margin-top:0; font-size: 10px; color: #4b5563;">Status Pesanan</h4>
                    <img src="{{ $charts['pesanan'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif
            </tr>
        </table>
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

        @if(in_array('logistik', $datasets ?? []) && isset($summary['outlet_penjualan']) && count($summary['outlet_penjualan']) > 0)
        <h4 style="margin-bottom: 5px; margin-top: 10px; font-size: 11px; color: #4b5563;">Ringkasan Penjualan per Outlet</h4>
        <table style="width: 100%; border: none;">
            <tr>
                @php
                    $isFiltered = request()->query('sales_filter') || request()->query('pt_filter') || request()->query('outlet_filter');
                    $limit = $isFiltered ? count($summary['outlet_penjualan']) : 16;
                    $outlets = array_slice($summary['outlet_penjualan'], 0, $limit, true);
                    $chunkSize = max(1, ceil(count($outlets) / 2));
                @endphp
                @foreach(array_chunk($outlets, $chunkSize, true) as $chunk)
                <td style="width: 50%; vertical-align: top; border: none; padding: 0;">
                    <table style="width: 95%;">
                        @foreach($chunk as $nama => $total)
                        <tr>
                            <th style="background:#e0f2fe; width:50%; font-size: 9px;">{{ Str::limit($nama, 25) }}</th>
                            <td class="text-right font-bold" style="font-size: 9px;">Rp {{ number_format($total, 0, ',', '.') }}</td>
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
                    <td class="text-right">{{ $row->total ? 'Rp ' . number_format(intval(preg_replace('/[^0-9]/', '', $row->total)), 0, ',', '.') : '-' }}</td>
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
                  <th>TANGGAL</th>
                  <th>NOMOR KLIKKAN</th>
                  <th>NAMA PELANGGAN</th>
                  <th>NAMA PRODUK</th>
                  <th class="text-right">JUMLAH</th>
                  <th>SATUAN</th>
                  <th class="text-right">HARGA FAKTUR</th>
                  <th class="text-right">TOTAL FAKTUR</th>
                  <th class="text-center">TERKIRIM</th>
                  <th class="text-center">BELUM KIRIM</th>
                  <th class="text-right">NOMINAL SDH KIRIM</th>
                  <th class="text-right">NOMINAL BLM KIRIM</th>
                  <th class="text-center">% TERPENUHI</th>
                  <th class="text-center">%BELUM TERPENUHI</th>
                  <th>KETERANGAN</th>
              </tr>
          </thead>
          <tbody>
              @forelse($pesanan as $row)
                  <tr>
                      <td>{{ $row->tanggal }}</td>
                      <td>{{ $row->nomor_klikkan }}</td>
                      <td>{{ $row->nama_outlet }}</td>
                      <td>{{ $row->nama_produk }}</td>
                      <td class="text-right">{{ $row->jumlah }}</td>
                      <td>{{ $row->satuan }}</td>
                      <td class="text-right">{{ $row->harga_faktur }}</td>
                      <td class="text-right">{{ $row->total_faktur }}</td>
                      <td class="text-center">{{ $row->terkirim }}</td>
                      <td class="text-center">{{ $row->belum_terkirim }}</td>
                      <td class="text-right">{{ $row->nominal_sdh_kirim }}</td>
                      <td class="text-right">{{ $row->nominal_blm_kirim }}</td>
                      <td class="text-center" style="color: #059669">{{ $row->persen_terpenuhi }}</td>
                      <td class="text-center" style="color: #ef4444">{{ $row->persen_belum_terpenuhi }}</td>
                      <td>{{ $row->keterangan }}</td>
                  </tr>
              @empty
                  <tr><td colspan="15" class="text-center">Tidak ada data surat pesanan untuk periode ini</td></tr>
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
        <p style="text-decoration: underline; font-weight: bold; margin-bottom: 2px;">{{ auth()->user()->name ?? '..........................................' }}</p>
        <p style="margin-top: 0; font-size: 11px; color: #4b5563;">{{ optional(auth()->user()->division)->name ?? 'Admin' }}</p>
    </div>
    <div style="clear: both;"></div>
</body>
</html>
