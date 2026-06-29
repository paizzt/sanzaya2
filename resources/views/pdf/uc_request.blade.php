<!DOCTYPE html>
<html>
<head>
    <style>
        @page {
            margin: 30px 40px 60px 40px; /* Added more bottom margin for footer */
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #000;
        }
        table {
            border-collapse: collapse;
        }
        .header {
            width: 100%;
            margin-bottom: 20px;
        }
        .header td {
            vertical-align: top;
            border: none;
            padding: 0;
        }
        .company-name {
            color: #1a75d2;
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            padding: 0;
        }
        .company-sub {
            color: #666;
            font-size: 10px;
            margin: 0;
            padding: 0;
        }
        .form-title {
            font-size: 15px;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 0;
        }
        .form-subtitle {
            font-size: 16px;
            font-weight: bold;
            margin-top: 3px;
        }
        
        .signature-wrapper {
            text-align: right;
            width: 100%;
        }
        
        .signature-table {
            font-size: 10px;
            text-align: center;
            width: 320px;
            margin-left: auto; /* Push to right */
        }
        .signature-table th, .signature-table td {
            border: 1px solid #000;
            padding: 4px;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
            margin-top: 5px;
        }
        
        .date-right {
            text-align: right;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 20px;
        }
        .intro-text {
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .form-list {
            width: 100%;
        }
        .form-list td {
            padding: 6px 0;
            vertical-align: top;
            border: none;
        }
        .box-outline {
            border: 1px solid #000;
            padding: 5px 8px;
            width: 95%; /* Avoid 100% to prevent overflow */
            display: block;
        }
        .checkbox-container {
            margin-bottom: 6px;
        }
        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            text-align: center;
            line-height: 12px;
            font-size: 10px;
            margin-right: 5px;
            vertical-align: middle;
        }
        
        .closing-text {
            margin-top: 40px;
        }
        
        .footer {
            position: fixed;
            bottom: -60px;
            left: -40px;
            right: -40px;
            height: 30px;
            background-color: #799fbb;
            color: white;
            font-style: italic;
            font-weight: bold;
            padding: 8px 40px;
            font-size: 11px;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .lampiran-table {
            width: 100%;
            margin-top: 20px;
        }
        .lampiran-table th {
            background-color: #fff;
            border: 1px solid #000;
            padding: 8px;
            font-weight: bold;
            text-align: center;
        }
        .lampiran-table td {
            border: 1px solid #000;
            padding: 8px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .red-text {
            color: red;
            font-weight: bold;
            font-size: 11px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="footer">
        Make a Different
    </div>

    <!-- PAGE 1: FORM PENGAJUAN -->
    <table class="header">
        <tr>
            <td width="50%">
                <p class="company-name">PT. SANZAYA MEDIKA PRATAMA</p>
                <p class="company-sub">MEDICAL & HEALTHCARE</p>
                
                <p class="form-title">FORM PENGAJUAN BIAYA</p>
                <p class="form-subtitle">UPCOUNTRY (UC)</p>
            </td>
            <td width="50%" align="right">
                <div class="signature-wrapper">
                    <table class="signature-table">
                        <tr>
                            <th width="33%">Dibuat Oleh</th>
                            <th width="33%">Diperiksa Oleh</th>
                            <th width="33%">Disetujui Oleh</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">{{ $uc->user->name ?? 'Staff Pegawai' }}</div>
                            </td>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">Bapak Manajer</div>
                            </td>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">Ibu Finance</div>
                            </td>
                        </tr>
                        <tr>
                            <td>Staff</td>
                            <td>Manager</td>
                            <td>Finance</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <div class="date-right">
        Makassar, {{ \Carbon\Carbon::parse($uc->created_at)->format('d F Y') }}
    </div>

    <div class="intro-text">
        Sehubungan dengan kebutuhan operasional guna memaksimalkan upaya pengembangan performa penjualan perusahaan, dengan ini kami mengajukan untuk melakukan perjalanan sebagai berikut:
    </div>

    <table class="form-list">
        <tr>
            <td width="5%">1.</td>
            <td width="25%">Nama</td>
            <td width="2%">:</td>
            <td width="68%">{{ $uc->user->name ?? 'Staff Pegawai' }}</td>
        </tr>
        <tr>
            <td>2.</td>
            <td>Jabatan</td>
            <td>:</td>
            <td>Staff - Sales</td>
        </tr>
        <tr>
            <td>3.</td>
            <td>Tujuan</td>
            <td>:</td>
            <td>{{ $uc->destination_city }}</td>
        </tr>
        <tr>
            <td>4.</td>
            <td>Waktu (hari)</td>
            <td>:</td>
            <td><div class="box-outline">{{ $uc->estimated_days }} Hari</div></td>
        </tr>
        <tr>
            <td>5.</td>
            <td>Tanggal Berangkat</td>
            <td>:</td>
            <td><div class="box-outline">{{ \Carbon\Carbon::parse($uc->departure_date)->format('d F Y') }}</div></td>
        </tr>
        <tr>
            <td>6.</td>
            <td>Tanggal Pulang</td>
            <td>:</td>
            <td><div class="box-outline">{{ \Carbon\Carbon::parse($uc->return_date)->format('d F Y') }}</div></td>
        </tr>
        <tr>
            <td>7.</td>
            <td>Nama & Jabatan<br>Pendamping</td>
            <td>:<br>&nbsp;</td>
            <td>
                @php
                    $companions = is_array($uc->companions) ? $uc->companions : json_decode($uc->companions, true) ?? [];
                @endphp
                <div style="margin-bottom: 5px;">
                    1. <div class="box-outline" style="display: inline-block; width: 90%;">{{ $companions[0]['name'] ?? '-' }} {{ isset($companions[0]['position']) ? '('.$companions[0]['position'].')' : '' }}</div>
                </div>
                <div>
                    2. <div class="box-outline" style="display: inline-block; width: 90%;">{{ $companions[1]['name'] ?? '-' }} {{ isset($companions[1]['position']) ? '('.$companions[1]['position'].')' : '' }}</div>
                </div>
            </td>
        </tr>
        <tr>
            <td>8.</td>
            <td>Jenis Transportasi</td>
            <td>:</td>
            <td>
                @php
                    $trans = strtolower($uc->transport_type ?? $uc->transportation_type ?? '');
                @endphp
                <div class="checkbox-container">
                    <span class="checkbox">{!! $trans == 'darat' ? 'x' : '&nbsp;' !!}</span> Darat
                </div>
                <div class="checkbox-container">
                    <span class="checkbox">{!! $trans == 'laut' ? 'x' : '&nbsp;' !!}</span> Laut
                </div>
                <div class="checkbox-container">
                    <span class="checkbox">{!! $trans == 'udara' ? 'x' : '&nbsp;' !!}</span> Udara
                </div>
            </td>
        </tr>
        <tr>
            <td>9.</td>
            <td>No. Polisi</td>
            <td>:</td>
            <td><div class="box-outline">{{ $uc->vehicle_number ?: 'Sesuai Lampiran' }}</div></td>
        </tr>
    </table>

    <div class="closing-text">
        Demikian surat tugas ini kami buat. Atas perhatiannya kami ucapkan terima kasih.
    </div>


    <div class="page-break"></div>

    <!-- PAGE 2: LAMPIRAN -->
    <table class="header">
        <tr>
            <td width="50%">
                <p class="company-name">PT. SANZAYA MEDIKA PRATAMA</p>
                
                <p class="form-title">LAMPIRAN PENGAJUAN</p>
                <p class="form-subtitle">UPCOUNTRY (UC)</p>
            </td>
            <td width="50%" align="right">
                <div class="signature-wrapper">
                    <table class="signature-table">
                        <tr>
                            <th width="33%">Dibuat Oleh</th>
                            <th width="33%">Diperiksa Oleh</th>
                            <th width="33%">Disetujui Oleh</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">{{ $uc->user->name ?? 'Staff Pegawai' }}</div>
                            </td>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">Bapak Manajer</div>
                            </td>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">Ibu Finance</div>
                            </td>
                        </tr>
                        <tr>
                            <td>Staff</td>
                            <td>Manager</td>
                            <td>Finance</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    @php
        $gasCost = (float)($uc->estimated_gas_cost ?? 0);
        $mealsCost = (float)($uc->estimated_meals_cost ?? 0);
        $hotelCost = (float)($uc->estimated_accommodation_cost ?? 0);
        $totalCost = $gasCost + $mealsCost + $hotelCost;
        $panjarCost = $totalCost / 2;
    @endphp

    <table class="lampiran-table">
        <thead>
            <tr>
                <th width="5%">NO</th>
                <th width="40%">ITEM</th>
                <th width="30%">KETERANGAN</th>
                <th width="25%">BIAYA (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-center">1</td>
                <td>BIAYA BAHAN BAKAR / TIKET</td>
                <td class="text-center">Transportasi</td>
                <td class="text-right">Rp. {{ number_format($gasCost, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="text-center">2</td>
                <td>BIAYA KONSUMSI</td>
                <td class="text-center">Makan</td>
                <td class="text-right">Rp. {{ number_format($mealsCost, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="text-center">3</td>
                <td>BIAYA PENGINAPAN</td>
                <td class="text-center">Akomodasi (Hotel)</td>
                <td class="text-right">Rp. {{ number_format($hotelCost, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td colspan="3"><strong>TOTAL ESTIMASI BIAYA PERJALANAN</strong></td>
                <td class="text-right"><strong>Rp. {{ number_format($totalCost, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td colspan="3"><strong>PANJAR BIAYA 50%</strong></td>
                <td class="text-right"><strong>Rp. {{ number_format($panjarCost, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td colspan="3"><strong>SISA BIAYA KLAIM PERJALANAN</strong></td>
                <td class="text-right"><strong>Rp. {{ number_format($panjarCost, 0, ',', '.') }}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="red-text">
        Rek ....... A/N {{ $uc->user->name ?? 'Staff Pegawai' }} (.........................)
    </div>

    @if($uc->result_report)
    <div class="page-break"></div>

    <!-- PAGE 3: RESULT PERJALANAN -->
    <table class="header">
        <tr>
            <td width="50%">
                <p class="company-name">PT. SANZAYA MEDIKA PRATAMA</p>
                <div class="form-title" style="margin-top: 15px;">LAPORAN HASIL PERJALANAN</div>
                <div class="form-subtitle">UPCOUNTRY (UC)</div>
            </td>
            <td width="50%" align="right">
                <div class="signature-wrapper">
                    <table class="signature-table">
                        <tr>
                            <th width="50%">Dilaporkan Oleh</th>
                            <th width="50%">Diterima Oleh</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">{{ $uc->user->name ?? 'Staff Pegawai' }}</div>
                            </td>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">Bapak Manajer</div>
                            </td>
                        </tr>
                        <tr>
                            <td>Staff</td>
                            <td>Manager</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <div style="margin-top: 30px; font-size: 14px;">
        <p style="font-weight: bold; margin-bottom: 5px;">A. Keterangan / Hasil Perjalanan:</p>
        <div class="box-outline" style="min-height: 100px; line-height: 1.5;">
            {!! nl2br(e($uc->result_report)) !!}
        </div>
    </div>

    @php
        $receipts = json_decode($uc->result_receipts, true) ?? [];
    @endphp
    
    @if(count($receipts) > 0)
    <div style="margin-top: 30px; font-size: 14px;">
        <p style="font-weight: bold; margin-bottom: 10px;">B. Lampiran Nota / Bukti Result:</p>
        <div>
            @foreach($receipts as $receipt)
                @if(file_exists(public_path('storage/' . $receipt)))
                    <div style="margin-bottom: 15px; text-align: center;">
                        <img src="{{ public_path('storage/' . $receipt) }}" style="max-width: 90%; max-height: 400px; border: 1px solid #ccc; padding: 5px;" />
                    </div>
                @endif
            @endforeach
        </div>
    </div>
    @endif
    @endif

</body>
</html>