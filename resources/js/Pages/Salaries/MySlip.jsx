import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { 
    Receipt, 
    Calendar, 
    Download, 
    Eye, 
    TrendingUp, 
    TrendingDown, 
    ShieldCheck, 
    Building2, 
    Wallet, 
    X, 
    DollarSign,
    CheckCircle2,
    FileText,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

const MONTHS = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

export default function MySlip({ auth, slips = [], year, user }) {
    const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear());
    const [previewSlip, setPreviewSlip] = useState(null);

    const formatRp = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(val))}`;
    };

    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
        router.get(route('salaries.my-slip'), { year: newYear }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                    <div>
                        <h2 className="font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-xl shadow-md">
                                <Receipt className="w-6 h-6" />
                            </span>
                            Slip Gaji Saya
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Lihat rincian penerimaan, potongan BPJS, pajak, dan unduh dokumen slip gaji resmi Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            Tahun:
                        </span>
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(parseInt(e.target.value))}
                            className="text-xs font-bold rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 py-2 pr-8"
                        >
                            {[2024, 2025, 2026, 2027, 2028].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Slip Gaji Saya" />

            <div className="space-y-6 max-w-5xl mx-auto">

                {/* Employee Profile Quick Card */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-emerald-600/15 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/30 text-white shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-black">{user?.name}</h3>
                                <p className="text-xs text-emerald-100 flex items-center gap-2 mt-0.5">
                                    <span>{user?.employee_id || user?.nik || 'ID Karyawan'}</span>
                                    <span>&bull;</span>
                                    <span>{user?.position?.name || 'Karyawan'}</span>
                                </p>
                                <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {user?.company?.name || 'Sanzaya Group'} &bull; Divisi {user?.division?.name || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
                            <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">Total Slip Tahun Ini</span>
                            <span className="text-xl font-black">{slips.length} Bulan</span>
                        </div>
                    </div>
                </div>

                {/* List of Slips */}
                {slips.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
                            <Receipt className="w-8 h-8 stroke-1" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-base">Belum Ada Slip Gaji</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            Slip gaji untuk tahun {selectedYear} belum diterbitkan oleh bagian HRD/Keuangan.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slips.map((slip) => {
                            const monthLabel = MONTHS.find(m => m.value === slip.period_month)?.label || slip.period_month;
                            return (
                                <div
                                    key={slip.id}
                                    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block">
                                                Periode Penggajian
                                            </span>
                                            <h4 className="text-lg font-black text-gray-900 mt-0.5">
                                                {monthLabel} {slip.period_year}
                                            </h4>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                Dibayarkan: {slip.payment_date || '-'}
                                            </p>
                                        </div>

                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                            slip.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                            slip.status === 'published' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                            'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}>
                                            {slip.status === 'paid' ? 'Dibayarkan' : slip.status === 'published' ? 'Publik' : 'Draft'}
                                        </span>
                                    </div>

                                    {/* Financial Highlight */}
                                    <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl my-3">
                                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                                            Gaji Bersih Diterima (THP)
                                        </span>
                                        <span className="text-xl font-black text-emerald-700">
                                            {formatRp(slip.total_diterima)}
                                        </span>
                                    </div>

                                    {/* Breakdown Quick Numbers */}
                                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-gray-100 text-gray-600 mb-4">
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">Gaji Pokok:</span>
                                            <span className="font-semibold text-gray-800">{formatRp(slip.gaji_pokok)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">Operasional:</span>
                                            <span className="font-semibold text-gray-800">{formatRp(slip.operasional)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">Total Penerimaan:</span>
                                            <span className="font-semibold text-blue-700">{formatRp(slip.total_penerimaan)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">Total Potongan:</span>
                                            <span className="font-semibold text-rose-600">{formatRp(slip.total_potongan)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                        <button
                                            onClick={() => setPreviewSlip(slip)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Lihat Slip
                                        </button>
                                        <a
                                            href={route('salaries.slip.pdf', slip.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Unduh PDF
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* Modal: Pratinjau Detail Slip Gaji */}
            <Modal show={!!previewSlip} onClose={() => setPreviewSlip(null)} maxWidth="2xl">
                {previewSlip && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-emerald-600" />
                                Dokumen Slip Gaji Karyawan
                            </h3>
                            <button
                                onClick={() => setPreviewSlip(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Slip Detail */}
                        <div className="mt-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm text-xs space-y-4">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                    <h4 className="font-extrabold text-blue-900 text-sm uppercase">
                                        {previewSlip.company?.name || previewSlip.user?.company?.name || 'SANZAYA GROUP'}
                                    </h4>
                                    <p className="text-[11px] text-gray-500">
                                        {previewSlip.company?.address || 'Kalimantan Timur, Indonesia'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-gray-900 text-sm block">SLIP GAJI RESMI</span>
                                    <span className="text-emerald-600 font-bold">
                                        {MONTHS.find(m => m.value === previewSlip.period_month)?.label} {previewSlip.period_year}
                                    </span>
                                </div>
                            </div>

                            {/* Info Karyawan */}
                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Nama Karyawan</span>
                                    <span className="font-bold text-gray-900">{previewSlip.user?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Jabatan / Divisi</span>
                                    <span className="font-bold text-gray-900">
                                        {previewSlip.user?.position?.name || '-'} / {previewSlip.user?.division?.name || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">NIK / ID Karyawan</span>
                                    <span className="font-bold text-gray-900">
                                        {previewSlip.user?.employee_id || previewSlip.user?.nik || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Tanggal Pembayaran</span>
                                    <span className="font-bold text-gray-900">{previewSlip.payment_date || '-'}</span>
                                </div>
                            </div>

                            {/* Penerimaan vs Potongan */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-extrabold text-blue-900 border-b border-blue-100 pb-1 mb-2 uppercase text-[11px]">
                                        Penerimaan
                                    </h5>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between"><span>Gaji Pokok:</span><strong className="text-gray-900">{formatRp(previewSlip.gaji_pokok)}</strong></div>
                                        <div className="flex justify-between"><span>T. Operasional:</span><strong className="text-gray-900">{formatRp(previewSlip.operasional)}</strong></div>
                                        <div className="flex justify-between"><span>T. Jabatan:</span><strong className="text-gray-900">{formatRp(previewSlip.tunjangan_jabatan)}</strong></div>
                                        <div className="flex justify-between"><span>THR:</span><strong className="text-gray-900">{formatRp(previewSlip.thr)}</strong></div>
                                        <div className="flex justify-between"><span>Lembur:</span><strong className="text-gray-900">{formatRp(previewSlip.lembur)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-blue-900">
                                            <span>Total Penerimaan:</span>
                                            <span>{formatRp(previewSlip.total_penerimaan)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-extrabold text-rose-900 border-b border-rose-100 pb-1 mb-2 uppercase text-[11px]">
                                        Potongan
                                    </h5>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between"><span>Iuran BPJS Kes ({previewSlip.bpjs_kesehatan_persen}%):</span><strong className="text-rose-600">{formatRp(previewSlip.bpjs_kesehatan)}</strong></div>
                                        <div className="flex justify-between"><span>Iuran BPJS TK ({previewSlip.bpjs_ketenagakerjaan_persen}%):</span><strong className="text-rose-600">{formatRp(previewSlip.bpjs_ketenagakerjaan)}</strong></div>
                                        <div className="flex justify-between"><span>Pajak (PPh 21):</span><strong className="text-rose-600">{formatRp(previewSlip.pajak)}</strong></div>
                                        <div className="flex justify-between"><span>Piutang / Pinjaman:</span><strong className="text-rose-600">{formatRp(previewSlip.piutang)}</strong></div>
                                        <div className="flex justify-between"><span>Potongan Absen:</span><strong className="text-rose-600">{formatRp(previewSlip.potongan_absen)}</strong></div>
                                        <div className="flex justify-between"><span>Potongan Lainnya:</span><strong className="text-rose-600">{formatRp(previewSlip.potongan_lainnya)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-rose-700">
                                            <span>Total Potongan:</span>
                                            <span>{formatRp(previewSlip.total_potongan)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BPJS Ditanggung Perusahaan */}
                            <div className="bg-indigo-50/70 p-2.5 rounded-xl text-[11px] text-indigo-900 flex justify-between items-center">
                                <span>Total BPJS Dibayarkan Perusahaan (Kes {previewSlip.bpjs_kesehatan_perusahaan_persen}% + TK {previewSlip.bpjs_ketenagakerjaan_perusahaan_persen}%):</span>
                                <strong className="font-bold">{formatRp(previewSlip.total_bpjs_perusahaan)}</strong>
                            </div>

                            {/* Take Home Pay */}
                            <div className="bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-xl flex justify-between items-center">
                                <div>
                                    <span className="font-extrabold text-emerald-900 uppercase block text-xs">
                                        TOTAL DITERIMA (TAKE HOME PAY):
                                    </span>
                                    <span className="text-[10px] text-gray-500 italic">
                                        Terbilang: {previewSlip.terbilang || ''}
                                    </span>
                                </div>
                                <span className="text-xl font-black text-emerald-700">{formatRp(previewSlip.total_diterima)}</span>
                            </div>

                            <p className="text-[10px] text-center text-gray-400 pt-2 border-t border-gray-100">
                                Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex items-center justify-end gap-2">
                            <a
                                href={route('salaries.slip.pdf', previewSlip.id)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Unduh Dokumen PDF
                            </a>
                            <button
                                onClick={() => setPreviewSlip(null)}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
