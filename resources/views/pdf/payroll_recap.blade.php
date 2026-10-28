<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi Gaji - {{ $monthName }} {{ $year }}</title>
    <style>
        * {
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        body {
            font-size: 8.5px;
            color: #1e293b;
            margin: 0;
            padding: 10px;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .company-name {
            font-size: 14px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
        }
        .doc-title {
            text-align: right;
        }
        .doc-title h2 {
            font-size: 14px;
            margin: 0;
            color: #1e293b;
        }
        .doc-title .period {
            font-size: 10px;
            color: #2563eb;
            font-weight: bold;
            margin-top: 2px;
        }
        .table-data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .table-data th {
            background: #1e40af;
            color: #ffffff;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            padding: 5px 3px;
            border: 1px solid #1e3a8a;
        }
        .table-data td {
            padding: 4px 3px;
            border: 1px solid #cbd5e1;
            font-size: 8px;
        }
        .table-data tr:nth-child(even) {
            background: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-row td {
            background: #e2e8f0;
            font-weight: bold;
            border-top: 2px solid #64748b;
        }
        .footer-note {
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px dashed #cbd5e1;
            padding-top: 6px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td style="width: 60%; vertical-align: middle;">
                <div class="company-name">{{ $company->name ?? 'SANZAYA GROUP' }}</div>
                <div style="font-size: 8.5px; color: #64748b;">{{ $company->address ?? 'Kalimantan Timur, Indonesia' }}</div>
            </td>
            <td style="width: 40%; vertical-align: middle;" class="doc-title">
                <h2>REKAPITULASI GAJI KARYAWAN</h2>
                <div class="period">Periode: {{ $monthName }} {{ $year }}</div>
            </td>
        </tr>
    </table>

    <table class="table-data">
        <thead>
            <tr>
                <th rowspan="2" style="width: 2%;">No</th>
                <th rowspan="2" style="width: 12%;">Nama Karyawan</th>
                <th rowspan="2" style="width: 8%;">Divisi / Jabatan</th>
                <th colspan="5">Penerimaan</th>
                <th rowspan="2" style="width: 7%;">Total Penerimaan</th>
                <th colspan="6">Potongan</th>
                <th rowspan="2" style="width: 7%;">Total Potongan</th>
                <th rowspan="2" style="width: 6%;">BPJS Perusahaan</th>
                <th rowspan="2" style="width: 8%;">Total Diterima (THP)</th>
            </tr>
            <tr>
                <th>Gaji Pokok</th>
                <th>Operasional</th>
                <th>T. Jabatan</th>
                <th>THR</th>
                <th>Lembur</th>
                <th>BPJS Kes</th>
                <th>BPJS TK</th>
                <th>Pajak</th>
                <th>Piutang</th>
                <th>Absen</th>
                <th>Lainnya</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totGajiPokok = 0; $totOperasional = 0; $totTunjangan = 0; $totThr = 0; $totLembur = 0;
                $totPenerimaan = 0; $totBpjsKes = 0; $totBpjsTk = 0; $totPajak = 0; $totPiutang = 0;
                $totAbsen = 0; $totLain = 0; $totPotongan = 0; $totBpjsPerusahaan = 0; $totThp = 0;
            @endphp
            @forelse($payrolls as $index => $p)
                @php
                    $totGajiPokok += $p->gaji_pokok;
                    $totOperasional += $p->operasional;
                    $totTunjangan += $p->tunjangan_jabatan;
                    $totThr += $p->thr;
                    $totLembur += $p->lembur;
                    $totPenerimaan += $p->total_penerimaan;
                    $totBpjsKes += $p->bpjs_kesehatan;
                    $totBpjsTk += $p->bpjs_ketenagakerjaan;
                    $totPajak += $p->pajak;
                    $totPiutang += $p->piutang;
                    $totAbsen += $p->potongan_absen;
                    $totLain += $p->potongan_lainnya;
                    $totPotongan += $p->total_potongan;
                    $totBpjsPerusahaan += $p->total_bpjs_perusahaan;
                    $totThp += $p->total_diterima;
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ $p->user->name ?? '-' }}</strong><br><span style="color: #64748b; font-size: 7.5px;">{{ $p->user->employee_id ?? $p->user->nik ?? '-' }}</span></td>
                    <td>{{ $p->user->division->name ?? '-' }}<br><span style="color: #64748b; font-size: 7.5px;">{{ $p->user->position->name ?? '-' }}</span></td>
                    <td class="text-right">{{ number_format($p->gaji_pokok, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->operasional, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->tunjangan_jabatan, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->thr, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->lembur, 0, ',', '.') }}</td>
                    <td class="text-right" style="font-weight: bold; background: #f1f5f9;">{{ number_format($p->total_penerimaan, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->bpjs_kesehatan, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->bpjs_ketenagakerjaan, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->pajak, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->piutang, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->potongan_absen, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->potongan_lainnya, 0, ',', '.') }}</td>
                    <td class="text-right" style="font-weight: bold; background: #fef2f2; color: #dc2626;">{{ number_format($p->total_potongan, 0, ',', '.') }}</td>
                    <td class="text-right" style="color: #2563eb;">{{ number_format($p->total_bpjs_perusahaan, 0, ',', '.') }}</td>
                    <td class="text-right" style="font-weight: bold; background: #f0fdf4; color: #16a34a;">{{ number_format($p->total_diterima, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="18" class="text-center" style="padding: 15px; color: #94a3b8;">Tidak ada data gaji untuk periode ini.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" class="text-center">TOTAL KESELURUHAN ({{ count($payrolls) }} KARYAWAN)</td>
                <td class="text-right">{{ number_format($totGajiPokok, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totOperasional, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totTunjangan, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totThr, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totLembur, 0, ',', '.') }}</td>
                <td class="text-right" style="background: #e2e8f0;">{{ number_format($totPenerimaan, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totBpjsKes, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totBpjsTk, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totPajak, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totPiutang, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totAbsen, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totLain, 0, ',', '.') }}</td>
                <td class="text-right" style="color: #dc2626;">{{ number_format($totPotongan, 0, ',', '.') }}</td>
                <td class="text-right" style="color: #2563eb;">{{ number_format($totBpjsPerusahaan, 0, ',', '.') }}</td>
                <td class="text-right" style="color: #16a34a;">{{ number_format($totThp, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer-note">
        Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
    </div>

</body>
</html>
