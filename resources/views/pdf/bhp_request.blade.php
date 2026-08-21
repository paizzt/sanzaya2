<!DOCTYPE html>
<html>
<head>
    <style>

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        body { font-family: Arial, sans-serif; font-size: 14px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        table { w-full; border-collapse: collapse; margin-top: 10px; }
        table, th, td { border: 1px solid #ddd; padding: 8px; }
        .signature-box { margin-top: 40px; float: right; text-align: center; }
        .clear { clear: both; }
    
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
        <div class="title">FORM PENGAJUAN BARANG HABIS PAKAI (BHP)</div>
    </div>
    
    <table>
        <tr><td width="30%"><strong>Nama Pemohon</strong></td><td>{{ $bhp->user->name ?? '-' }}</td></tr>
        <tr><td><strong>Divisi / Departemen</strong></td><td>{{ $bhp->department }}</td></tr>

        <tr><td><strong>Tanggal Pengajuan</strong></td><td>{{ $bhp->request_date }}</td></tr>
        <tr><td><strong>Target Dibutuhkan</strong></td><td>{{ $bhp->target_date }}</td></tr>
        <tr><td><strong>Nama Barang</strong></td><td>{{ $bhp->product_name }}</td></tr>
        <tr><td><strong>Spesifikasi & Jumlah</strong></td><td>{{ $bhp->specifications }}</td></tr>
    </table>

    <div class="approval-section" style="margin-top: 40px;">
        <table class="approval-table" style="width: 100%; border: none; text-align: center;">
            <tr style="border: none;">
                <td style="border: none; width: 33%;">
                    Dibuat Oleh,<br>
                    <div style="height: 80px;"></div>
                    <b>{{ $bhp->user->name ?? 'Pemohon' }}</b>
                </td>
                <td style="border: none; width: 33%;">
                    Diperiksa,<br>
                    <div style="height: 80px;"></div>
                    <b>Manager</b>
                </td>
                <td style="border: none; width: 33%;">
                    Disetujui,<br>
                    @if($bhp->status == 'Disetujui')
                        <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="80" /><br>
                        <b>{{ $bhp->approver->name ?? 'Finance' }}</b><br>
                        <small>{{ \Carbon\Carbon::parse($bhp->updated_at)->format('d M Y') }}</small>
                    @else
                        <div style="height: 80px;"></div>
                        <p style="color: #999; margin:0;"><strong>(Menunggu)</strong></p>
                        <b>Finance</b>
                    @endif
                </td>
            </tr>
        </table>
    </div>
    <div class="clear"></div>
</body>
</html>