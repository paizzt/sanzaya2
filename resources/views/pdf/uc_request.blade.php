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
        <div class="title">FORM PENGANGUAN UPCOUNTRY (UC)</div>
        <div>{{ $uc->entity }}</div>
    </div>
    
    <table>
        <tr><td width="30%"><strong>Nama Pegawai</strong></td><td>{{ $uc->user->name ?? '-' }}</td></tr>
        <tr><td><strong>Divisi / Departemen</strong></td><td>{{ $uc->department }}</td></tr>
        <tr><td><strong>Tujuan</strong></td><td>{{ $uc->destination_city }}</td></tr>
        <tr><td><strong>Tanggal Perjalanan</strong></td><td>{{ $uc->departure_date }} s/d {{ $uc->return_date }} ({{ $uc->estimated_days }} Hari)</td></tr>
        <tr><td><strong>Transportasi</strong></td><td>{{ $uc->transportation_type }} {{ $uc->vehicle_number ? '('.$uc->vehicle_number.')' : '' }}</td></tr>
        <tr><td><strong>Estimasi Bensin</strong></td><td>Rp {{ number_format($uc->estimated_gas_cost, 0, ',', '.') }}</td></tr>
        <tr><td><strong>Hasil Perjalanan</strong></td><td>{{ $uc->result_summary ?? '-' }}</td></tr>
    </table>

    <div class="signature-box">
        <p>Disetujui Oleh,</p>
        <img src="data:image/png;base64, {!! $qrCode !!}" width="80" />
        <p><strong>Digital Signature</strong><br><small>{{ date('d M Y') }}</small></p>
    </div>
    <div class="clear"></div>
</body>
</html>