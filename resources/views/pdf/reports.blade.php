<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 1.27cm; }

        html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #111827 !important;
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
        h2, h3 { color: #333; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
            table-layout: auto; 
            page-break-inside: auto; 
        }
        tr { 
            page-break-inside: avoid; 
            page-break-after: auto; 
        }
        thead { 
            display: table-header-group; 
        }
        tfoot { 
            display: table-footer-group; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            word-wrap: break-word; 
            overflow-wrap: break-word; 
        }
        th { 
            background-color: #f4f4f4; 
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .header { text-align: center; margin-bottom: 20px; }
        .section-title { 
            margin-top: 18px; 
            margin-bottom: 8px; 
            border-bottom: 2px solid #ddd; 
            padding-bottom: 4px; 
            page-break-after: avoid; 
        }
        .page-break { page-break-before: always; }
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
                    @if(isset($summary['pt_penjualan']) && count($summary['pt_penjualan']) > 1)
                        @foreach($summary['pt_penjualan'] as $ptName => $ptTotal)
                        <td style="background-color: #ffffff; border: 1.5px solid #16a34a; border-radius: 6px; padding: 8px 10px; vertical-align: top;">
                            <p style="font-size: 8px; margin: 0 0 3px 0; font-weight: bold; text-transform: uppercase; color: #15803d;">{{ $ptName }}</p>
                            <p style="font-size: 11px; font-weight: bold; margin: 0; color: #166534;">Rp {{ number_format($ptTotal, 0, ',', '.') }}</p>
                        </td>
                        @endforeach
                        <td style="background-color: #ffffff; border: 1.5px solid #0284c7; border-radius: 6px; padding: 8px 10px; vertical-align: top;">
                            <p style="font-size: 8px; margin: 0 0 3px 0; font-weight: bold; text-transform: uppercase; color: #0284c7;">TOTAL GABUNGAN</p>
                            <p style="font-size: 12px; font-weight: bold; margin: 0; color: #0369a1;">Rp {{ number_format($summary['total_penjualan'], 0, ',', '.') }}</p>
                        </td>
                    @else
                        <td style="background-color: #ffffff; border: 1.5px solid #0284c7; border-radius: 6px; padding: 10px; vertical-align: top;">
                            <p style="font-size: 9px; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; color: #0284c7;">
                                {{ !empty($summary['pt_penjualan']) ? 'Total Penjualan (' . key($summary['pt_penjualan']) . ')' : 'Total Penjualan' }}
                            </p>
                            <p style="font-size: 13px; font-weight: bold; margin: 0; color: #0369a1;">Rp {{ number_format($summary['total_penjualan'], 0, ',', '.') }}</p>
                        </td>
                    @endif

                    @if(isset($summary['target_bulanan']) && $summary['target_bulanan'] > 0)
                    <td style="background-color: #ffffff; border: 1.5px solid #6366f1; border-radius: 6px; padding: 10px; vertical-align: top;">
                        <p style="font-size: 9px; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; color: #4f46e5;">Target Bulanan</p>
                        <p style="font-size: 12px; font-weight: bold; margin: 0; color: #3730a3;">Rp {{ number_format($summary['target_bulanan'], 0, ',', '.') }}</p>
                    </td>
                    <td style="background-color: #ffffff; border: 1.5px solid #ec4899; border-radius: 6px; padding: 10px; vertical-align: top;">
                        <p style="font-size: 9px; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; color: #db2777;">Capaian Target</p>
                        <p style="font-size: 12px; font-weight: bold; margin: 0; color: #9d174d;">{{ number_format(($summary['total_penjualan'] / $summary['target_bulanan']) * 100, 1, ',', '.') }}%</p>
                    </td>
                    @endif
                @endif
                @if(in_array('piutang', $datasets ?? []))
                <td style="background-color: #ffffff; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 10px; vertical-align: top;">
                    <p style="font-size: 9px; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; color: #d97706;">Total Piutang</p>
                    <p style="font-size: 12px; font-weight: bold; margin: 0; color: #b45309;">Rp {{ number_format($summary['total_piutang'], 0, ',', '.') }}</p>
                </td>
                @endif
                @if(in_array('hutang', $datasets ?? []))
                <td style="background-color: #ffffff; border: 1.5px solid #ef4444; border-radius: 6px; padding: 10px; vertical-align: top;">
                    <p style="font-size: 9px; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; color: #dc2626;">Total Hutang</p>
                    <p style="font-size: 12px; font-weight: bold; margin: 0; color: #991b1b;">Rp {{ number_format($summary['total_hutang'], 0, ',', '.') }}</p>
                </td>
                @endif
                @if(in_array('pesanan', $datasets ?? []))
                <td style="background-color: #ffffff; border: 1.5px solid #10b981; border-radius: 6px; padding: 10px; vertical-align: top;">
                    <p style="font-size: 9px; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; color: #059669;">Pesanan Terkirim</p>
                    <p style="font-size: 12px; font-weight: bold; margin: 0; color: #047857;">{{ number_format($summary['pesanan_terkirim'], 0, ',', '.') }}</p>
                </td>
                <td style="background-color: #ffffff; border: 1.5px solid #64748b; border-radius: 6px; padding: 10px; vertical-align: top;">
                    <p style="font-size: 9px; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; color: #475569;">Belum Terkirim</p>
                    <p style="font-size: 12px; font-weight: bold; margin: 0; color: #334155;">{{ number_format($summary['pesanan_belum'], 0, ',', '.') }}</p>
                </td>
                @endif
            </tr>
        </table>

        @if(in_array('logistik', $datasets ?? []) && isset($summary['pt_penjualan']) && count($summary['pt_penjualan']) > 1)
        <!-- Tabel Rincian Total Penjualan per PT -->
        <div style="margin-top: 5px; margin-bottom: 12px;">
            <h4 style="margin-bottom: 6px; margin-top: 0; font-size: 11px; font-weight: bold; color: #1e3a8a;">
                Total Penjualan per PT / Perusahaan
            </h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
                <thead>
                    <tr style="background-color: #f1f5f9;">
                        <th style="width: 5%; text-align: center; padding: 5px; font-size: 9px;">No</th>
                        <th style="width: 50%; padding: 5px; font-size: 9px;">Nama PT / Perusahaan</th>
                        <th style="width: 30%; text-align: right; padding: 5px; font-size: 9px;">Total Penjualan (Rp)</th>
                        <th style="width: 15%; text-align: center; padding: 5px; font-size: 9px;">Kontribusi</th>
                    </tr>
                </thead>
                <tbody>
                    @php $noPt = 1; @endphp
                    @foreach($summary['pt_penjualan'] as $ptName => $ptTotal)
                    @php 
                        $kontribusi = $summary['total_penjualan'] > 0 ? ($ptTotal / $summary['total_penjualan']) * 100 : 0; 
                    @endphp
                    <tr>
                        <td style="text-align: center; font-size: 9px; padding: 5px;">{{ $noPt++ }}</td>
                        <td style="font-size: 9px; font-weight: bold; padding: 5px;">{{ $ptName }}</td>
                        <td style="text-align: right; font-size: 9px; font-weight: bold; padding: 5px; color: #0284c7;">
                            Rp {{ number_format($ptTotal, 0, ',', '.') }}
                        </td>
                        <td style="text-align: center; font-size: 9px; padding: 5px;">
                            {{ number_format($kontribusi, 1, ',', '.') }}%
                        </td>
                    </tr>
                    @endforeach
                    <tr style="background-color: #e0f2fe; font-weight: bold;">
                        <td colspan="2" style="padding: 6px 8px; font-size: 9px; text-transform: uppercase;">Total Gabungan Penjualan</td>
                        <td style="text-align: right; padding: 6px 8px; font-size: 9px; color: #0369a1;">Rp {{ number_format($summary['total_penjualan'], 0, ',', '.') }}</td>
                        <td style="text-align: center; padding: 6px 8px; font-size: 9px; color: #0369a1;">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
        @endif

        <!-- Charts Grid -->
        @if(in_array('logistik', $datasets ?? []) && !empty($charts['penjualan_bulan']))
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; text-align: center;">
            <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; color: #1e3a8a; text-align: left;">Penjualan Per Bulan</h4>
            <img src="{{ $charts['penjualan_bulan'] }}" style="width: 100%; height: auto; max-height: 240px;" />
        </div>
        @endif

        @if(in_array('logistik', $datasets ?? []) && (!empty($charts['top_sales']) || !empty($charts['brand'])))
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-left: -10px; margin-bottom: 8px;">
            <tr>
                @if(!empty($charts['top_sales']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; text-align: center; width: 50%; vertical-align: top;">
                    <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; color: #1e3a8a; text-align: left;">Top 10 Penjualan per Sales</h4>
                    <img src="{{ $charts['top_sales'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif

                @if(!empty($charts['brand']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; text-align: center; width: 50%; vertical-align: top;">
                    <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; color: #1e3a8a; text-align: left;">Penjualan per Brand</h4>
                    <img src="{{ $charts['brand'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif
            </tr>
        </table>
        @endif

        @if((in_array('logistik', $datasets ?? []) && !empty($charts['outlets'])) || ((in_array('piutang', $datasets ?? []) || in_array('hutang', $datasets ?? [])) && !empty($charts['piutang_hutang'])) || (in_array('pesanan', $datasets ?? []) && !empty($charts['pesanan'])))
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-left: -10px; margin-bottom: 5px;">
            <tr>
                @if(in_array('logistik', $datasets ?? []) && !empty($charts['outlets']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; width: 45%; vertical-align: middle;">
                    <h4 style="margin-top:0; font-size: 10px; color: #4b5563; text-align: left;">Top 5 Outlet (Juta)</h4>
                    <img src="{{ $charts['outlets'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif

                @if((in_array('piutang', $datasets ?? []) || in_array('hutang', $datasets ?? [])) && !empty($charts['piutang_hutang']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; width: 30%; vertical-align: middle;">
                    <h4 style="margin-top:0; font-size: 10px; color: #4b5563; text-align: left;">Piutang vs Hutang (Juta)</h4>
                    <img src="{{ $charts['piutang_hutang'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif
                
                @if(in_array('pesanan', $datasets ?? []) && !empty($charts['pesanan']))
                <td style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; width: 25%; vertical-align: middle;">
                    <h4 style="margin-top:0; font-size: 10px; color: #4b5563; text-align: left;">Status Pesanan</h4>
                    <img src="{{ $charts['pesanan'] }}" style="width: 100%; height: auto;" />
                </td>
                @endif
            </tr>
        </table>
        @endif
        <table style="width: 100%; border: none;">
            <tr>
                @php
                    $sales = $summary['sales_penjualan'];
                    $salesCount = count($sales);
                    $chunkSize = max(1, ceil($salesCount / 2));
                @endphp
                @foreach(array_chunk($sales, $chunkSize, true) as $chunk)
                <td style="width: 50%; vertical-align: top; border: none; padding: 0;">
                    <table style="width: 95%;">
                        @foreach($chunk as $nama => $total)
                        <tr>
                            <th style="background:#f3f4f6; width:50%; font-size: 9px;">{{ $nama }}</th>
                            <td class="text-right font-bold" style="font-size: 9px;">Rp {{ number_format($total, 0, ',', '.') }}</td>
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
                            <th style="background:#e0f2fe; width:60%; font-size: 9px; word-wrap: break-word;">{{ $nama }}</th>
                            <td class="text-right font-bold" style="font-size: 9px; width:40%;">Rp {{ number_format($total, 0, ',', '.') }}</td>
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
    @if($isPreview ?? false)
    <p style="font-size: 9px; color: #64748b; font-style: italic; margin-top: -4px; margin-bottom: 6px;">
        * Pratinjau menampilkan {{ count($logistik) }} baris data pertama dari {{ $totalLogistikCount ?? count($logistik) }} data. Unduh PDF untuk mengunduh seluruh data lengkap.
    </p>
    @endif
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
                @php
                    $rowPt = trim((string)($row->nama_pt ?: $row->sheet_name));
                    $salesDisplay = $row->nama_sales ?: ($rowPt ? 'KANTOR ' . $rowPt : '-');
                    $pelangganDisplay = $row->pelanggan ?: ($rowPt ? 'Non-Outlet (' . $rowPt . ')' : '-');
                    $produkDisplay = $row->nama_produk ?: ($row->no_faktur ? 'Faktur ' . $row->no_faktur : ($rowPt ?: '-'));
                @endphp
                <tr>
                    <td>{{ $row->tanggal }}</td>
                    <td>{{ $salesDisplay }}</td>
                    <td>{{ $pelangganDisplay }}</td>
                    <td>{{ $produkDisplay }}</td>
                    <td class="text-right">{{ $row->total ? 'Rp ' . number_format(\App\Http\Controllers\ReportController::parseCurrency($row->total), 2, ',', '.') : '-' }}</td>
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
    @if($isPreview ?? false)
    <p style="font-size: 9px; color: #64748b; font-style: italic; margin-top: -4px; margin-bottom: 6px;">
        * Pratinjau menampilkan {{ count($pesanan) }} baris data pertama dari {{ $totalPesananCount ?? count($pesanan) }} data. Unduh PDF untuk mengunduh seluruh data lengkap.
    </p>
    @endif
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
        <div style="margin: 10px 0;">
            <img src="data:image/svg+xml;base64,{{ base64_encode(QrCode::format('svg')->size(70)->generate('Ditandatangani secara digital oleh: ' . (auth()->user()?->name ?? 'Admin') . ' pada ' . \Carbon\Carbon::now()->format('d M Y H:i:s'))) }}" alt="QR Code" width="70" height="70">
        </div>
        <p style="text-decoration: underline; font-weight: bold; margin-bottom: 2px;">{{ auth()->user()?->name ?? '..........................................' }}</p>
        <p style="margin-top: 0; font-size: 11px; color: #4b5563;">{{ auth()->user()?->division?->name ?? 'Admin' }}</p>
    </div>
    <div style="clear: both;"></div>
</body>
</html>

