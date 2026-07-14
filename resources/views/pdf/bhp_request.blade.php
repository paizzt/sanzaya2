<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        table { w-full; border-collapse: collapse; margin-top: 10px; }
        table, th, td { border: 1px solid #ddd; padding: 8px; }
        .signature-box { margin-top: 40px; float: right; text-align: center; }
        .clear { clear: both; }
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

    <div class="signature-box">
        <p>Disetujui Oleh,</p>
        <img src="data:image/svg+xml;base64, {!! $qrCode !!}" width="80" />
        <p><strong>Digital Signature</strong><br><small>{{ date('d M Y') }}</small></p>
    </div>
    <div class="clear"></div>
</body>
</html>