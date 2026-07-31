<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pengajuan Pembayaran - {{ $paymentRequest->reference_number }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 0; padding: 0; font-size: 18px; }
        .info-table { width: 100%; margin-bottom: 20px; }
        .info-table td { padding: 3px 0; vertical-align: top; }
        .info-table .label { width: 150px; font-weight: bold; }
        .info-table .colon { width: 10px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; }
        .items-table th { background-color: #f5f5f5; text-align: left; }
        .items-table .text-right { text-align: right; }
        .summary-box { float: right; width: 300px; border: 1px solid #ddd; padding: 10px; }
        .summary-table { width: 100%; }
        .summary-table td { padding: 3px 0; }
        .summary-table .bold { font-weight: bold; }
        .clear { clear: both; }
        .approval-section { margin-top: 40px; }
        .approval-table { width: 100%; text-align: center; }
        .approval-table td { padding: 10px; width: 25%; vertical-align: bottom; }
        .signature-box { height: 80px; border-bottom: 1px solid #333; margin: 10px 20px; }
    </style>
</head>
<body>

    <div class="header">
        <h2>FORM PENGAJUAN PEMBAYARAN</h2>
        <p>No: {{ $paymentRequest->reference_number }}</p>
    </div>

    <table class="info-table">
        <tr>
            <td class="label">Tanggal Pengajuan</td><td class="colon">:</td>
            <td>{{ \Carbon\Carbon::parse($paymentRequest->submission_date ?? $paymentRequest->created_at)->format('d M Y') }}</td>
            <td class="label">Divisi / Pengaju</td><td class="colon">:</td>
            <td>{{ $paymentRequest->division->name ?? '-' }} / {{ $paymentRequest->requester->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Penerima Dana</td><td class="colon">:</td>
            <td>{{ $paymentRequest->recipient_name }}</td>
            <td class="label">Kategori</td><td class="colon">:</td>
            <td>{{ $paymentRequest->purpose }}</td>
        </tr>
        <tr>
            <td class="label">Bank & Rekening</td><td class="colon">:</td>
            <td colspan="4">{{ $paymentRequest->recipient_bank ?? '-' }} - {{ $paymentRequest->recipient_account_number ?? '-' }}</td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>No</th>
                <th>Keterangan Item</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @if($paymentRequest->items && $paymentRequest->items->count() > 0)
                @foreach($paymentRequest->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">Rp {{ number_format($item->total_price ?? ($item->quantity * $item->unit_price), 0, ',', '.') }}</td>
                </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="3" class="text-center">Tidak ada rincian item. (Gunakan Grand Total)</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="summary-box">
        <table class="summary-table">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">Rp {{ number_format($paymentRequest->subtotal, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Diskon</td>
                <td class="text-right">Rp {{ number_format($paymentRequest->discount, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Biaya Lainnya</td>
                <td class="text-right">Rp {{ number_format($paymentRequest->other_cost, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>PPN</td>
                <td class="text-right">Rp {{ number_format($paymentRequest->vat_amount, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="bold">Grand Total</td>
                <td class="text-right bold">Rp {{ number_format($paymentRequest->grand_total, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>
    <div class="clear"></div>

    <div class="approval-section">
        <h3>Riwayat Persetujuan</h3>
        @if($paymentRequest->approvals && $paymentRequest->approvals->count() > 0)
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Nama</th>
                        <th>Tahap</th>
                        <th>Status</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($paymentRequest->approvals as $approval)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($approval->acted_at)->format('d/m/Y H:i') }}</td>
                        <td>{{ $approval->approver->name ?? '-' }}</td>
                        <td>{{ strtoupper(str_replace('_', ' ', $approval->approval_stage)) }}</td>
                        <td>{{ strtoupper($approval->action) }}</td>
                        <td>{{ $approval->notes ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>Belum ada persetujuan tercatat.</p>
        @endif
    </div>

    <div class="approval-section" style="margin-top: 50px;">
        <table class="approval-table">
            <tr>
                <td>
                    Dibuat Oleh,<br>
                    <div class="signature-box"></div>
                    <b>{{ $paymentRequest->requester->name ?? 'Pemohon' }}</b>
                </td>
                <td>
                    Diperiksa,<br>
                    <div class="signature-box"></div>
                    <b>Manager</b>
                </td>
                <td>
                    Verifikasi,<br>
                    <div class="signature-box"></div>
                    <b>Finance / GA</b>
                </td>
                <td>
                    Disetujui,<br>
                    <div class="signature-box"></div>
                    <b>Direktur</b>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
