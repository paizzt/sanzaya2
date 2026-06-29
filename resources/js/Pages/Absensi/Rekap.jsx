import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Calendar, Users, ClipboardCheck, Clock, CheckCircle2, AlertCircle, FileText, Search, Download } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Rekap({ auth, recapList, summary, filters, users, isAdmin }) {
    
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

            <div className="py-6 space-y-6">
                
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

                {/* Table Data */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500"/> Rincian Kehadiran
                        </h3>
                        <button className="text-sm font-semibold text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Download className="w-4 h-4"/> Export PDF
                        </button>
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
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    item.status === 'Selesai' || item.status === 'Disetujui' ? 'text-emerald-600 bg-emerald-50' :
                                                    item.status === 'Menunggu' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'
                                                }`}>
                                                    {item.status}
                                                </span>
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
