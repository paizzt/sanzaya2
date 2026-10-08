<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        @page {
            margin: 25px 35px 50px 35px;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #000;
        }
        table {
            border-collapse: collapse;
            width: 100%;
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
            width: 250px;
            margin-left: auto;
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
            margin-top: 5px;
            margin-bottom: 10px;
        }
        .intro-text {
            margin-bottom: 10px;
            line-height: 1.4;
        }
        
        .form-list {
            width: 100%;
            margin-bottom: 20px;
        }
        .form-list td {
            padding: 6px 0;
            vertical-align: top;
            border: none;
        }
        .box-outline {
            border: 1px solid #000;
            padding: 5px 8px;
            width: 95%;
            display: block;
        }
        
        .lampiran-table {
            width: 100%;
            margin-top: 10px;
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
        .bold {
            font-weight: bold;
        }
        .red-text {
            color: red;
            font-weight: bold;
            font-size: 11px;
            margin-top: 15px;
        }
        
        .footer {
            position: fixed;
            bottom: -30px;
            left: -35px;
            right: -35px;
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
                
                <p class="form-title">FORM PENGAJUAN PEMBAYARAN</p>
                <p class="form-subtitle">{{ $paymentRequest->reference_number }}</p>
            </td>
            <td width="50%" align="right">
                <div class="signature-wrapper">
                    <table class="signature-table">
                        <tr>
                            <th width="50%">Dibuat Oleh</th>
                            <th width="50%">Disetujui Oleh</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">
                                <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                <div class="signature-name">{{ $paymentRequest->requester->name ?? 'Pemohon' }}</div>
                            </td>
                            <td style="padding: 10px;">
                                @if(in_array($paymentRequest->workflow_status, ['approved', 'paid']))
                                    <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="50" />
                                    <div class="signature-name">Finance</div>
                                @else
                                    <div style="height: 50px;"></div>
                                    <div class="signature-name" style="color: #999;">(Menunggu)</div>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td>Pemohon</td>
                            <td>Finance</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <div class="date-right">
        Makassar, {{ \Carbon\Carbon::parse($paymentRequest->submission_date ?? $paymentRequest->created_at)->format('d F Y') }}
    </div>

    <div class="intro-text">
        Dengan ini kami mengajukan permohonan pembayaran untuk keperluan operasional/kegiatan perusahaan sebagai berikut:
    </div>

    <table class="form-list">
        <tr>
            <td width="5%">1.</td>
            <td width="25%">Nama Divisi / Pengaju</td>
            <td width="2%">:</td>
            <td width="68%">{{ $paymentRequest->division->name ?? '-' }} / {{ $paymentRequest->requester->name ?? '-' }}</td>
        </tr>
        <tr>
            <td>2.</td>
            <td>Penerima Dana</td>
            <td>:</td>
            <td><div class="box-outline">{{ $paymentRequest->recipient_name }}</div></td>
        </tr>
        <tr>
            <td>3.</td>
            <td>Kategori / Tujuan</td>
            <td>:</td>
            <td>{{ $paymentRequest->category }} / {{ $paymentRequest->purpose }}</td>
        </tr>
        <tr>
            <td>4.</td>
            <td>Bank / Dompet Digital</td>
            <td>:</td>
            <td>{{ $paymentRequest->bank_or_wallet ?? '-' }}</td>
        </tr>
        <tr>
            <td>5.</td>
            <td>Nomor Rekening / Akun</td>
            <td>:</td>
            <td><div class="box-outline">{{ $paymentRequest->account_number ?? '-' }}</div></td>
        </tr>
    </table>

    <table class="lampiran-table">
        <thead>
            <tr>
                <th width="5%">NO</th>
                <th width="40%">KETERANGAN ITEM</th>
                <th width="20%">QTY / UNIT</th>
                <th width="15%">HARGA (Rp)</th>
                <th width="20%">TOTAL (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @if($paymentRequest->items && $paymentRequest->items->count() > 0)
                @foreach($paymentRequest->items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="text-center">{{ $item->quantity }} {{ $item->unit }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="5" class="text-center">Tidak ada rincian item.</td>
                </tr>
            @endif
            
            <tr>
                <td colspan="4" class="text-right"><strong>SUBTOTAL</strong></td>
                <td class="text-right"><strong>{{ number_format($paymentRequest->subtotal, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td colspan="4" class="text-right"><strong>DISKON</strong></td>
                <td class="text-right"><strong>{{ number_format($paymentRequest->discount, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td colspan="4" class="text-right"><strong>BIAYA LAINNYA</strong></td>
                <td class="text-right"><strong>{{ number_format($paymentRequest->other_cost, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td colspan="4" class="text-right"><strong>PPN ({{ $paymentRequest->vat_status }})</strong></td>
                <td class="text-right"><strong>{{ number_format($paymentRequest->vat_amount, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td colspan="4" class="text-right" style="background-color: #f5f5f5;"><strong>GRAND TOTAL</strong></td>
                <td class="text-right" style="background-color: #f5f5f5;"><strong>Rp. {{ number_format($paymentRequest->grand_total, 0, ',', '.') }}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="red-text">
        Rek {{ $paymentRequest->bank_or_wallet ?? '...' }} A/N {{ $paymentRequest->recipient_name }} ({{ $paymentRequest->account_number ?? '...' }})
    </div>

    @if($paymentRequest->attachments && $paymentRequest->attachments->count() > 0)
        <div class="page-break"></div>
        <div style="margin-top: 30px; font-size: 14px;">
            <p style="font-weight: bold; margin-bottom: 10px;">Lampiran / Bukti Pendukung:</p>
            <div>
                @foreach($paymentRequest->attachments as $attachment)
                    @if($attachment->attachment_type === 'Lampiran Foto')
                        @php
                            $isHttp = str_starts_with($attachment->file_path, 'http');
                            $isValid = $isHttp || file_exists(public_path('storage/' . $attachment->file_path));
                            $imgSrc = $isHttp ? $attachment->file_path : public_path('storage/' . $attachment->file_path);
                        @endphp
                        @if($isValid)
                            <div style="margin-bottom: 15px; text-align: center;">
                                <img src="{{ $imgSrc }}" style="max-width: 90%; max-height: 400px; border: 1px solid #ccc; padding: 5px;" />
                            </div>
                        @endif
                    @endif
                @endforeach
            </div>
        </div>
    @endif

</body>
</html>
