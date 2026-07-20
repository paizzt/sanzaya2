import ExportDropdown from '@/Components/ExportDropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Calendar, Users, ClipboardCheck, Clock, CheckCircle2, AlertCircle, FileText, Search, Download, Camera } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomSelect from '@/Components/CustomSelect';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Rekap({ auth, recapList, summary, userSummaries, filters, users, isAdmin }) {
    
    // Setup Filter Form
    const { data, setData } = useForm({
        month: filters.month.toString(),
        year: filters.year.toString(),
        user_id: filters.user_id ? filters.user_id.toString() : 'all'
    });

    const handleFilter = () => {
        router.get(route('absensi.rekap'), data, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleShowPhoto = (url, type) => {
        if (!url) {
            Swal.fire('Tidak ada foto', `Foto ${type} tidak tersedia.`, 'info');
            return;
        }
        Swal.fire({
            title: `Foto ${type}`,
            imageUrl: url,
            imageAlt: `Foto ${type}`,
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#3b82f6',
            width: '400px'
        });
    };

    const handleUpdateStatus = (id, status) => {
        const realId = id.replace('req_', '');
        Swal.fire({
            title: 'Konfirmasi',
            text: `Anda yakin ingin ${status === 'Disetujui' ? 'menyetujui' : 'menolak'} pengajuan ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            confirmButtonColor: status === 'Disetujui' ? '#10b981' : '#ef4444'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('absensi.pengajuan.status', realId), { status }, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Berhasil!', 'Status berhasil diperbarui.', 'success'),
                    onError: () => Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error')
                });
            }
        });
    };

    // Month Options
    const monthOptions = [
        { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
        { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
    ];

    // Year Options (last 5 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({length: 5}, (_, i) => {
        const y = (currentYear - i).toString();
        return { value: y, label: y };
    });

    const userOptions = [
        { value: 'all', label: '-- Semua Karyawan --' },
        ...users.map(u => ({ value: u.id.toString(), label: u.name }))
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Rekap Absensi & Riwayat</h2>}
        >
            <Head title="Rekap Absensi" />

            <div className="pb-6 pt-0 space-y-6">
                
                {/* Filter Section */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-end gap-4">
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                        <CustomSelect 
                            value={data.month} 
                            onChange={(val) => setData('month', val)} 
                            options={monthOptions} 
                        />
                    </div>
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                        <CustomSelect 
                            value={data.year} 
                            onChange={(val) => setData('year', val)} 
                            options={yearOptions} 
                        />
                    </div>
                    {isAdmin && (
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
                            <CustomSelect 
                                value={data.user_id} 
                                onChange={(val) => setData('user_id', val)} 
                                options={userOptions} 
                            />
                        </div>
                    )}
                    <div className="w-full md:w-auto flex gap-2">
                        <PrimaryButton onClick={handleFilter} className="h-[42px] px-6 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-2">
                            <Search className="w-4 h-4" /> Tampilkan
                        </PrimaryButton>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Hadir</p>
                            <h4 className="text-2xl font-black text-gray-800">{summary.hadir}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Sakit</p>
                            <h4 className="text-2xl font-black text-gray-800">{summary.sakit}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Izin</p>
                            <h4 className="text-2xl font-black text-gray-800">{summary.izin}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Alpa</p>
                            <h4 className="text-2xl font-black text-gray-800">{summary.alpa}</h4>
                        </div>
                    </div>
                </div>

                {/* User Summaries Table */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500"/> Ringkasan Kehadiran per Karyawan
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold">Nama Karyawan</th>
                                    <th className="py-4 px-6 font-semibold text-center text-blue-600">Hadir</th>
                                    <th className="py-4 px-6 font-semibold text-center text-orange-600">Sakit</th>
                                    <th className="py-4 px-6 font-semibold text-center text-emerald-600">Izin</th>
                                    <th className="py-4 px-6 font-semibold text-center text-red-600">Alpa</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {userSummaries && userSummaries.length > 0 ? (
                                    userSummaries.map((u, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 font-medium text-gray-900">{u.name}</td>
                                            <td className="py-4 px-6 text-center font-bold text-blue-600">{u.hadir}</td>
                                            <td className="py-4 px-6 text-center font-bold text-orange-600">{u.sakit}</td>
                                            <td className="py-4 px-6 text-center font-bold text-emerald-600">{u.izin}</td>
                                            <td className="py-4 px-6 text-center font-bold text-red-600">{u.alpa}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-gray-500">
                                            Tidak ada data karyawan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500"/> Rincian Kehadiran
                        </h3>
                        <ExportDropdown pdfRoute={route('absensi.rekap.export-pdf', { month: data.month, year: data.year, user_id: data.user_id })} trigger={
                            <button className="text-sm font-semibold text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                <Download className="w-4 h-4"/> Export PDF
                            </button>
                        } />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold">Karyawan</th>
                                    <th className="py-4 px-6 font-semibold">Tanggal / Periode</th>
                                    <th className="py-4 px-6 font-semibold">Tipe Absen</th>
                                    <th className="py-4 px-6 font-semibold text-center">Jam Masuk</th>
                                    <th className="py-4 px-6 font-semibold text-center">Jam Keluar</th>
                                    <th className="py-4 px-6 font-semibold text-center">Foto</th>
                                    <th className="py-4 px-6 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {recapList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">
                                            Tidak ada riwayat absensi pada periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    recapList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 font-medium">{item.user_name}</td>
                                            <td className="py-4 px-6">{item.date}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.type === 'Hadir' ? 'bg-blue-50 text-blue-600' :
                                                    item.type === 'Sakit' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center font-medium">{item.check_in || '-'}</td>
                                            <td className="py-4 px-6 text-center font-medium">{item.check_out || '-'}</td>
                                            <td className="py-4 px-6 text-center">
                                                {item.type === 'Hadir' ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleShowPhoto(item.check_in_photo, 'Masuk')}
                                                            className={`p-1.5 rounded-lg border transition-colors ${item.check_in_photo ? 'border-blue-200 text-blue-600 hover:bg-blue-50' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                                                            title="Foto Masuk"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <Camera className="w-4 h-4" />
                                                                <span className="text-[10px] font-bold">Masuk</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleShowPhoto(item.check_out_photo, 'Pulang')}
                                                            className={`p-1.5 rounded-lg border transition-colors ${item.check_out_photo ? 'border-blue-200 text-blue-600 hover:bg-blue-50' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                                                            title="Foto Pulang"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <Camera className="w-4 h-4" />
                                                                <span className="text-[10px] font-bold">Pulang</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-2 items-start">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        item.status === 'Selesai' || item.status === 'Disetujui' ? 'text-emerald-600 bg-emerald-50' :
                                                        item.status === 'Menunggu' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                    {isAdmin && item.id.startsWith('req_') && item.status === 'Menunggu' && (
                                                        <div className="flex gap-1.5 mt-1">
                                                            <button 
                                                                onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                                                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm transition-colors"
                                                            >
                                                                ACC
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                                                                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow-sm transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
