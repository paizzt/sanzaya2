import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import Modal from '@/Components/Modal';
import CustomSelect from '@/Components/CustomSelect';
import SecondaryButton from '@/Components/SecondaryButton';
import ClientPagination from '@/Components/ClientPagination';
import { 
    Receipt, 
    Download, 
    Eye, 
    Building, 
    Wallet, 
    X, 
    User,
    Briefcase
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
    const [selectedYear, setSelectedYear] = useState(Number(year) || new Date().getFullYear());
    const [previewSlip, setPreviewSlip] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const formatRp = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(val))}`;
    };

    const handleYearChange = (newYear) => {
        const y = parseInt(newYear);
        setSelectedYear(y);
        setCurrentPage(1);
        router.get(route('salaries.my-slip'), { year: y }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const totalThpYear = useMemo(() => {
        return slips.reduce((sum, s) => sum + (parseFloat(s.total_diterima) || 0), 0);
    }, [slips]);

    const paginatedSlips = slips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Slip Gaji</h2>}
        >
            <Head title="Slip Gaji Saya" />

            <div className="pb-6 pt-0 space-y-6">
                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Nama Karyawan</p>
                            <h4 className="text-base font-bold text-gray-900 truncate">{user?.name || auth.user?.name}</h4>
                            <p className="text-[11px] text-gray-400 truncate">{user?.employee_id || user?.nik || '-'}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Jabatan & Divisi</p>
                            <h4 className="text-base font-bold text-gray-900 truncate">{user?.position?.name || 'Karyawan'}</h4>
                            <p className="text-[11px] text-gray-400 truncate">{user?.division?.name || '-'} &bull; {user?.company?.name || 'Sanzaya'}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Total Slip ({selectedYear})</p>
                            <h4 className="text-xl font-bold text-gray-900 truncate">{slips.length} Bulan</h4>
                            <p className="text-[11px] text-gray-400">Slip Gaji Terbit</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-emerald-200 bg-emerald-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-emerald-700 font-semibold">Total Diterima ({selectedYear})</p>
                            <h4 className="text-base font-extrabold text-emerald-700 truncate">{formatRp(totalThpYear)}</h4>
                            <p className="text-[11px] text-emerald-600">Akumulasi THP</p>
                        </div>
                    </div>
                </div>

                {/* Page Heading & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Receipt className="w-8 h-8 text-blue-600" />
                            Daftar Slip Gaji Saya
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                            Lihat rincian penerimaan, potongan BPJS, pajak, dan unduh dokumen slip gaji resmi Anda.
                        </p>
                    </div>

                    <div className="w-full sm:w-44">
                        <CustomSelect
                            value={selectedYear}
                            onChange={handleYearChange}
                            options={[2024, 2025, 2026, 2027, 2028].map(y => ({ value: y, label: `Tahun ${y}` }))}
                        />
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="text-sm text-gray-600 font-medium">
                            Riwayat Slip Gaji Tahun <span className="font-bold text-gray-900">{selectedYear}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            Total Data: <span className="text-gray-900 font-bold">{slips.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Periode Bulan</th>
                                    <th className="px-6 py-4">Tanggal Pembayaran</th>
                                    <th className="px-6 py-4 text-right">Gaji Pokok</th>
                                    <th className="px-6 py-4 text-right">Total Penerimaan</th>
                                    <th className="px-6 py-4 text-right">Total Potongan</th>
                                    <th className="px-6 py-4 text-right">Gaji Bersih (THP)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSlips.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            Slip gaji untuk tahun {selectedYear} belum diterbitkan oleh bagian HRD/Keuangan.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSlips.map((slip) => {
                                        const monthLabel = MONTHS.find(m => m.value === slip.period_month)?.label || slip.period_month;
                                        return (
                                            <tr
                                                key={slip.id}
                                                onClick={() => setPreviewSlip(slip)}
                                                className="bg-white border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                            {String(monthLabel).slice(0, 3).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-gray-900 font-semibold">{monthLabel} {slip.period_year}</div>
                                                            <div className="text-xs text-gray-500 font-normal">Slip Gaji Bulanan</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                    {slip.payment_date || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900 whitespace-nowrap">
                                                    {formatRp(slip.gaji_pokok)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-blue-600 whitespace-nowrap">
                                                    {formatRp(slip.total_penerimaan)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-red-600 whitespace-nowrap">
                                                    {formatRp(slip.total_potongan)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                    {formatRp(slip.total_diterima)}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                        slip.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        slip.status === 'published' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}>
                                                        {slip.status === 'paid' ? 'Dibayarkan' : slip.status === 'published' ? 'Publik' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewSlip(slip)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Slip Gaji"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <a
                                                            href={route('salaries.slip.pdf', slip.id)}
                                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Unduh Slip PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {slips.length > 0 && (
                        <div className="border-t border-gray-100">
                            <ClientPagination
                                total={slips.length}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                                alwaysShow={true}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Pratinjau Detail Slip Gaji */}
            <Modal show={!!previewSlip} onClose={() => setPreviewSlip(null)} maxWidth="2xl">
                {previewSlip && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-blue-600" />
                                Dokumen Slip Gaji Karyawan
                            </h3>
                            <button
                                onClick={() => setPreviewSlip(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm text-xs space-y-4">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm uppercase">
                                        {previewSlip.company?.name || previewSlip.user?.company?.name || 'SANZAYA GROUP'}
                                    </h4>
                                    <p className="text-[11px] text-gray-500">
                                        {previewSlip.company?.address || 'Indonesia'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gray-900 text-sm block">SLIP GAJI RESMI</span>
                                    <span className="text-blue-600 font-semibold">
                                        {MONTHS.find(m => m.value === previewSlip.period_month)?.label} {previewSlip.period_year}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Nama Karyawan</span>
                                    <span className="font-semibold text-gray-900">{previewSlip.user?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Jabatan / Divisi</span>
                                    <span className="font-semibold text-gray-900">
                                        {previewSlip.user?.position?.name || '-'} / {previewSlip.user?.division?.name || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">NIK / ID Karyawan</span>
                                    <span className="font-semibold text-gray-900">
                                        {previewSlip.user?.employee_id || previewSlip.user?.nik || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Tanggal Pembayaran</span>
                                    <span className="font-semibold text-gray-900">{previewSlip.payment_date || '-'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase text-[11px]">
                                        Penerimaan
                                    </h5>
                                    <div className="space-y-1.5 text-gray-600">
                                        <div className="flex justify-between"><span>Gaji Pokok:</span><strong className="text-gray-900">{formatRp(previewSlip.gaji_pokok)}</strong></div>
                                        <div className="flex justify-between"><span>T. Operasional:</span><strong className="text-gray-900">{formatRp(previewSlip.operasional)}</strong></div>
                                        <div className="flex justify-between"><span>T. Jabatan:</span><strong className="text-gray-900">{formatRp(previewSlip.tunjangan_jabatan)}</strong></div>
                                        <div className="flex justify-between"><span>THR:</span><strong className="text-gray-900">{formatRp(previewSlip.thr)}</strong></div>
                                        <div className="flex justify-between"><span>Lembur:</span><strong className="text-gray-900">{formatRp(previewSlip.lembur)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-blue-600">
                                            <span>Total Penerimaan:</span>
                                            <span>{formatRp(previewSlip.total_penerimaan)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase text-[11px]">
                                        Potongan
                                    </h5>
                                    <div className="space-y-1.5 text-gray-600">
                                        <div className="flex justify-between"><span>Iuran BPJS Kes ({previewSlip.bpjs_kesehatan_persen}%):</span><strong className="text-red-600">{formatRp(previewSlip.bpjs_kesehatan)}</strong></div>
                                        <div className="flex justify-between"><span>Iuran BPJS TK ({previewSlip.bpjs_ketenagakerjaan_persen}%):</span><strong className="text-red-600">{formatRp(previewSlip.bpjs_ketenagakerjaan)}</strong></div>
                                        <div className="flex justify-between"><span>Pajak (PPh 21):</span><strong className="text-red-600">{formatRp(previewSlip.pajak)}</strong></div>
                                        <div className="flex justify-between"><span>Piutang / Pinjaman:</span><strong className="text-red-600">{formatRp(previewSlip.piutang)}</strong></div>
                                        <div className="flex justify-between"><span>Potongan Absen:</span><strong className="text-red-600">{formatRp(previewSlip.potongan_absen)}</strong></div>
                                        <div className="flex justify-between"><span>Potongan Lainnya:</span><strong className="text-red-600">{formatRp(previewSlip.potongan_lainnya)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-red-600">
                                            <span>Total Potongan:</span>
                                            <span>{formatRp(previewSlip.total_potongan)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-[11px] text-indigo-900 flex justify-between items-center">
                                <span>Total BPJS Dibayarkan Perusahaan (Kes {previewSlip.bpjs_kesehatan_perusahaan_persen}% + TK {previewSlip.bpjs_ketenagakerjaan_perusahaan_persen}%):</span>
                                <strong className="font-bold">{formatRp(previewSlip.total_bpjs_perusahaan)}</strong>
                            </div>

                            <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-emerald-900 uppercase block text-xs">
                                        Total Diterima (Take Home Pay):
                                    </span>
                                    <span className="text-[10px] text-gray-500 italic">
                                        Terbilang: {previewSlip.terbilang || ''}
                                    </span>
                                </div>
                                <span className="text-xl font-extrabold text-emerald-700">{formatRp(previewSlip.total_diterima)}</span>
                            </div>

                            <p className="text-[10px] text-center text-gray-400 pt-2 border-t border-gray-100">
                                Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
                            </p>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setPreviewSlip(null)} className="rounded-xl px-4 py-2">
                                Tutup
                            </SecondaryButton>
                            <a
                                href={route('salaries.slip.pdf', previewSlip.id)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md"
                            >
                                <Download className="w-4 h-4" />
                                Unduh Dokumen PDF
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
