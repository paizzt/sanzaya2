<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $payroll->user->name }} - {{ $payroll->period_formatted }}</title>
    <style>
        * {
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        body {
            font-size: 11px;
            color: #333;
            margin: 0;
            padding: 15px;
            background: #fff;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .logo-img {
            max-height: 55px;
            max-width: 150px;
        }
        .company-name {
            font-size: 15px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 3px;
            text-transform: uppercase;
        }
        .company-address {
            font-size: 9px;
            color: #64748b;
            line-height: 1.3;
        }
        .doc-title {
            text-align: right;
        }
        .doc-title h2 {
            font-size: 16px;
            margin: 0;
            color: #1e293b;
            letter-spacing: 1px;
        }
        .doc-title .period {
            font-size: 11px;
            color: #2563eb;
            font-weight: bold;
            margin-top: 3px;
        }
        .employee-info {
            width: 100%;
            margin-bottom: 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
        }
        .employee-info td {
            font-size: 10px;
            padding: 2px 4px;
        }
        .employee-info .label {
            color: #64748b;
            width: 15%;
        }
        .employee-info .colon {
            width: 2%;
            color: #94a3b8;
        }
        .employee-info .value {
            font-weight: bold;
            color: #1e293b;
            width: 33%;
        }
        .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        .salary-table th {
            background: #1e40af;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-align: left;
            padding: 6px 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .salary-table td {
            padding: 5px 10px;
            font-size: 10.5px;
            border-bottom: 1px solid #f1f5f9;
        }
        .salary-table .subtotal-row td {
            background: #f8fafc;
            font-weight: bold;
            border-top: 1.5px solid #cbd5e1;
            border-bottom: 1.5px solid #cbd5e1;
            color: #0f172a;
        }
        .text-right {
            text-align: right;
        }
        .bpjs-company-box {
            background: #eff6ff;
            border: 1px dashed #93c5fd;
            border-radius: 6px;
            padding: 7px 12px;
            margin-bottom: 12px;
            font-size: 9.5px;
            color: #1e40af;
        }
        .thp-box {
            background: #f0fdf4;
            border: 2px solid #22c55e;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
        }
        .thp-label {
            font-size: 12px;
            font-weight: bold;
            color: #15803d;
            text-transform: uppercase;
        }
        .thp-value {
            font-size: 17px;
            font-weight: bold;
            color: #166534;
            text-align: right;
        }
        .terbilang-text {
            font-size: 10px;
            font-style: italic;
            color: #475569;
            margin-top: 4px;
        }
        .signatures {
            width: 100%;
            margin-top: 20px;
        }
        .signatures td {
            text-align: center;
            font-size: 10px;
            vertical-align: top;
            width: 50%;
        }
        .sign-space {
            height: 55px;
        }
        .sign-name {
            font-weight: bold;
            text-decoration: underline;
            color: #1e293b;
        }
        .sign-title {
            color: #64748b;
            font-size: 9.5px;
        }
        .footer-note {
            margin-top: 25px;
            padding-top: 8px;
            border-top: 1px dashed #e2e8f0;
            text-align: center;
            font-size: 8.5px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td style="width: 60%; vertical-align: middle;">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" class="logo-img" alt="Logo">
                @else
                    <div class="company-name">{{ $company->name ?? 'SANZAYA GROUP' }}</div>
                @endif
                <div class="company-name" style="margin-top: 4px;">{{ $company->name ?? 'SANZAYA GROUP' }}</div>
                <div class="company-address">
                    {{ $company->address ?? 'Kalimantan Timur, Indonesia' }}
                    @if(!empty($company->phone)) &bull; Telp: {{ $company->phone }} @endif
                </div>
            </td>
            <td style="width: 40%; vertical-align: middle;" class="doc-title">
                <h2>SLIP GAJI KARYAWAN</h2>
                <div class="period">Periode: {{ $payroll->period_formatted }}</div>
                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
                    No. Ref: PAY/{{ $payroll->period_year }}/{{ str_pad($payroll->period_month, 2, '0', STR_PAD_LEFT) }}/{{ str_pad($payroll->id, 4, '0', STR_PAD_LEFT) }}
                </div>
            </td>
        </tr>
    </table>

    <!-- Employee Info -->
    <table class="employee-info">
        <tr>
            <td class="label">Nama Karyawan</td>
            <td class="colon">:</td>
            <td class="value">{{ $payroll->user->name ?? '-' }}</td>

            <td class="label">Jabatan</td>
            <td class="colon">:</td>
            <td class="value">{{ $payroll->user->position->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">NIK / ID Karyawan</td>
            <td class="colon">:</td>
            <td class="value">{{ $payroll->user->employee_id ?? $payroll->user->nik ?? '-' }}</td>

            <td class="label">Divisi</td>
            <td class="colon">:</td>
            <td class="value">{{ $payroll->user->division->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Perusahaan</td>
            <td class="colon">:</td>
            <td class="value">{{ $payroll->company->name ?? $payroll->user->company->name ?? 'Sanzaya Group' }}</td>

            <td class="label">Tgl Pembayaran</td>
            <td class="colon">:</td>
            <td class="value">{{ $payroll->payment_date ? \Carbon\Carbon::parse($payroll->payment_date)->translatedFormat('d F Y') : date('d F Y') }}</td>
        </tr>
        @if(!empty($payroll->user->employment_status))
        <tr>
            <td class="label">Status Kerja</td>
            <td class="colon">:</td>
            <td class="value">{{ $payroll->user->employment_status }}</td>

            <td class="label">Status Slip</td>
            <td class="colon">:</td>
            <td class="value" style="color: #16a34a;">{{ ucfirst($payroll->status) }}</td>
        </tr>
        @endif
    </table>

    <!-- Penerimaan & Potongan in 2 Columns -->
    <table style="width: 100%; border-spacing: 10px 0; margin-left: -10px; margin-right: -10px;">
        <tr>
            <!-- Column 1: Penerimaan -->
            <td style="width: 50%; vertical-align: top; padding: 0 5px;">
                <table class="salary-table">
                    <thead>
                        <tr>
                            <th>PENERIMAAN</th>
                            <th class="text-right">JUMLAH (RP)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Gaji Pokok</td>
                            <td class="text-right">{{ number_format($payroll->gaji_pokok, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Tunjangan Operasional</td>
                            <td class="text-right">{{ number_format($payroll->operasional, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Tunjangan Jabatan</td>
                            <td class="text-right">{{ number_format($payroll->tunjangan_jabatan, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Tunjangan Hari Raya (THR)</td>
                            <td class="text-right">{{ number_format($payroll->thr, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Uang Lembur</td>
                            <td class="text-right">{{ number_format($payroll->lembur, 0, ',', '.') }}</td>
                        </tr>
                        <tr class="subtotal-row">
                            <td>TOTAL PENERIMAAN</td>
                            <td class="text-right">{{ number_format($payroll->total_penerimaan, 0, ',', '.') }}</td>
                        </tr>
                    </tbody>
                </table>
            </td>

            <!-- Column 2: Potongan -->
            <td style="width: 50%; vertical-align: top; padding: 0 5px;">
                <table class="salary-table">
                    <thead>
                        <tr>
                            <th>POTONGAN</th>
                            <th class="text-right">JUMLAH (RP)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Iuran BPJS Kesehatan ({{ $payroll->bpjs_kesehatan_persen }}%)</td>
                            <td class="text-right">{{ number_format($payroll->bpjs_kesehatan, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Iuran BPJS Ketenagakerjaan ({{ $payroll->bpjs_ketenagakerjaan_persen }}%)</td>
                            <td class="text-right">{{ number_format($payroll->bpjs_ketenagakerjaan, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Pajak (PPh 21)</td>
                            <td class="text-right">{{ number_format($payroll->pajak, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Potongan Piutang / Pinjaman</td>
                            <td class="text-right">{{ number_format($payroll->piutang, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Potongan Absen</td>
                            <td class="text-right">{{ number_format($payroll->potongan_absen, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td>Potongan Lainnya</td>
                            <td class="text-right">{{ number_format($payroll->potongan_lainnya, 0, ',', '.') }}</td>
                        </tr>
                        <tr class="subtotal-row">
                            <td>TOTAL POTONGAN</td>
                            <td class="text-right">{{ number_format($payroll->total_potongan, 0, ',', '.') }}</td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <!-- BPJS Perusahaan Note -->
    <div class="bpjs-company-box">
        <table style="width: 100%;">
            <tr>
                <td style="width: 70%;">
                    <strong>Total BPJS yang Dibayarkan Perusahaan:</strong><br>
                    <span style="color: #475569; font-size: 8.5px;">
                        &bull; BPJS Kesehatan Perusahaan ({{ $payroll->bpjs_kesehatan_perusahaan_persen }}%): Rp {{ number_format($payroll->bpjs_kesehatan_perusahaan, 0, ',', '.') }} &nbsp;|&nbsp; 
                        &bull; BPJS TK Perusahaan ({{ $payroll->bpjs_ketenagakerjaan_perusahaan_persen }}%): Rp {{ number_format($payroll->bpjs_ketenagakerjaan_perusahaan, 0, ',', '.') }}
                    </span>
                </td>
                <td style="width: 30%; text-align: right; vertical-align: middle;">
                    <span style="font-weight: bold; font-size: 11px; color: #1e40af;">
                        Rp {{ number_format($payroll->total_bpjs_perusahaan, 0, ',', '.') }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <!-- Take Home Pay Box -->
    <div class="thp-box">
        <table style="width: 100%;">
            <tr>
                <td style="width: 60%; vertical-align: middle;">
                    <div class="thp-label">TOTAL GAJI DITERIMA (TAKE HOME PAY)</div>
                    <div class="terbilang-text">Terbilang: <strong>{{ $terbilang }}</strong></div>
                </td>
                <td style="width: 40%; vertical-align: middle;" class="thp-value">
                    Rp {{ number_format($payroll->total_diterima, 0, ',', '.') }}
                </td>
            </tr>
        </table>
    </div>

    @if(!empty($payroll->notes))
    <div style="margin-bottom: 15px; font-size: 9.5px; color: #64748b; background: #fff; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 4px;">
        <strong>Catatan:</strong> {{ $payroll->notes }}
    </div>
    @endif

    <!-- Signatures -->
    <table class="signatures">
        <tr>
            <td>
                <div>Penerima,</div>
                <div class="sign-space"></div>
                <div class="sign-name">{{ $payroll->user->name ?? 'Karyawan' }}</div>
                <div class="sign-title">Karyawan</div>
            </td>
            <td>
                <div>Mengetahui & Menyetujui,</div>
                <div class="sign-space"></div>
                <div class="sign-name">{{ $payroll->company->name ?? 'Management Sanzaya' }}</div>
                <div class="sign-title">Bagian HRD & Keuangan</div>
            </td>
        </tr>
    </table>

    <!-- Footer Note -->
    <div class="footer-note">
        Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
    </div>

</body>
</html>
