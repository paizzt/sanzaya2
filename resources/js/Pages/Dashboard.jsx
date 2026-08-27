import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Users, CreditCard, Building, FileText, ClipboardList, Package, Archive, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';

const StatCard = ({ title, value, icon: Icon, color, delay, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-gray-200' : ''}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-500 shadow-inner`}>
                <Icon className="w-6 h-6" />
            </div>
            
            <div>
                <p className="text-sm font-semibold text-gray-500">{title}</p>
                <h3 className="text-2xl font-black text-gray-800">{value}</h3>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, stats, isAdmin }) {
    const [activeModal, setActiveModal] = useState(null);
    
    // Auto-refresh (Realtime Polling) every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['stats'], preserveScroll: true, preserveState: true });
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">Beranda</h2>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="pb-6 pt-0 space-y-6">
                
                {/* Main Metrics (Today/Pending) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Absen (Hari Ini)" value={stats.attendance_today} icon={Users} color="blue" onClick={() => setActiveModal('attendance')} />
                    <StatCard title="Kunjungan Sales" value={stats.marketing_visits_today} icon={Building} color="purple" onClick={() => setActiveModal('marketing')} />
                    <StatCard title="Pengajuan UC (Pending)" value={stats.uc_pending} icon={CreditCard} color="emerald" onClick={() => setActiveModal('uc')} />
                    <StatCard title="Pengajuan BHP (Pending)" value={stats.bhp_pending} icon={ClipboardList} color="orange" onClick={() => setActiveModal('bhp')} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Admin Specific Metrics */}
                    <div className="lg:col-span-2">
                        {isAdmin && (
                            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        <Archive className="text-indigo-500 w-5 h-5"/>
                                        Total Data Sinkronisasi Spreadsheet
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium text-sm">Surat Pesanan</span>
                                        <span className="text-2xl font-black text-gray-800">{stats.total_surat_pesanan}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium text-sm">Data Piutang</span>
                                        <span className="text-2xl font-black text-gray-800">{stats.total_piutang}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium text-sm">Laporan Logistik</span>
                                        <span className="text-2xl font-black text-gray-800">{stats.total_logistik}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!isAdmin && (
                            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                                <div className="w-48 h-48 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                                    <Sparkles className="w-24 h-24 text-blue-500 opacity-80" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mt-4">Semangat Bekerja!</h3>
                                <p className="text-gray-500">Pastikan untuk selalu melaporkan kunjungan dan kehadiran tepat waktu.</p>
                            </div>
                        )}
                    </div>

                    {/* Greeting Card */}
                    <div className="bg-blue-500 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Selamat Datang,</h3>
                            <h2 className="text-3xl font-black mb-6 relative z-10">{auth.user.name}</h2>
                            <p className="text-blue-100 text-sm mb-8 relative z-10 leading-relaxed">
                                Fitur Dashboard Real-Time diaktifkan. Data pada layar ini diperbarui secara otomatis setiap 1 menit.
                            </p>
                        </div>
                        <Link href={route('absensi.index')} className="w-full bg-white text-center text-blue-600 font-bold py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-lg relative z-10">
                            Buka Menu Absensi
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal for Details */}
            <Modal show={activeModal !== null} onClose={() => setActiveModal(null)} maxWidth="lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeModal === 'attendance' && 'Daftar Absen (Hari Ini)'}
                            {activeModal === 'marketing' && 'Daftar Kunjungan Sales (Hari Ini)'}
                            {activeModal === 'uc' && 'Daftar Pengajuan UC (Pending)'}
                            {activeModal === 'bhp' && 'Daftar Pengajuan BHP (Pending)'}
                        </h2>
                        <button onClick={() => setActiveModal(null)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {activeModal === 'attendance' && (
                            <div className="space-y-3">
                                {stats.attendance_list?.length > 0 ? stats.attendance_list.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                {item.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-800 block">{item.user?.name}</span>
                                                <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">{item.status || 'Hadir'}</span>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Belum ada data hari ini.</div>}
                            </div>
                        )}

                        {activeModal === 'marketing' && (
                            <div className="space-y-3">
                                {stats.marketing_list?.length > 0 ? stats.marketing_list.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 hover:border-purple-200 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-purple-500" />
                                            <span className="font-bold text-gray-800">{item.store_name}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-gray-400" /> {item.user?.name}
                                        </div>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Belum ada data hari ini.</div>}
                            </div>
                        )}

                        {activeModal === 'uc' && (
                            <div className="space-y-3">
                                {stats.uc_list?.length > 0 ? stats.uc_list.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-800 block">{item.user?.name}</span>
                                                <span className="text-xs text-gray-500">Menunggu Persetujuan</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            Rp {new Intl.NumberFormat('id-ID').format(item.total_amount || 0)}
                                        </span>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Tidak ada pengajuan pending.</div>}
                            </div>
                        )}

                        {activeModal === 'bhp' && (
                            <div className="space-y-3">
                                {stats.bhp_list?.length > 0 ? stats.bhp_list.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-orange-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                                <ClipboardList className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-800 block">{item.user?.name}</span>
                                                <span className="text-xs text-gray-500">Menunggu Persetujuan</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold px-3 py-1 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">
                                            {item.status}
                                        </span>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Tidak ada pengajuan pending.</div>}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
