import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Users, CreditCard, Building, FileText, ClipboardList, Package, Archive, Sparkles, X, LayoutDashboard, Camera, Briefcase, Search, FileSignature, CheckCircle, FileSpreadsheet, Box, Map, Truck, ShieldCheck, FileClock, Bell, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';

const StatCard = ({ title, value, icon: Icon, color, delay, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-gray-200' : ''}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-500 shadow-inner flex-shrink-0`}>
                <Icon className="w-6 h-6" />
            </div>
            
            <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-500 truncate">{title}</p>
                <h3 className={`font-black text-gray-800 truncate ${typeof value === 'string' && value.length > 8 ? 'text-xl' : 'text-2xl'}`}>{value}</h3>
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

    const getWidgetConfig = (key) => {
        const configs = {
            'attendance': { title: 'Absen (Hari Ini)', value: stats.attendance_today, icon: Users, color: 'blue', action: () => setActiveModal('attendance') },
            'marketing': { title: 'Kunjungan Sales', value: stats.marketing_visits_today, icon: Building, color: 'blue', action: () => setActiveModal('marketing') },
            'uc': { title: 'Pengajuan UC (Pending)', value: stats.uc_pending, icon: CreditCard, color: 'emerald', action: () => setActiveModal('uc') },
            'bhp': { title: 'Pengajuan BHP (Pending)', value: stats.bhp_pending, icon: ClipboardList, color: 'orange', action: () => setActiveModal('bhp') },
            
            // Map the menu names to shortcut widgets
            'Dashboard': { title: 'Pintasan Menu', value: 'Dashboard', icon: LayoutDashboard, color: 'gray', action: () => router.visit(route('dashboard')) },
            'Ambil Absensi': { title: 'Pintasan Menu', value: 'Ambil Absen', icon: Camera, color: 'blue', action: () => router.visit(route('absensi.index')) },
            'Izin/Sakit': { title: 'Pintasan Menu', value: 'Izin/Sakit', icon: FileText, color: 'rose', action: () => router.visit(route('absensi.pengajuan')) },
            'Form Marketing': { title: 'Pintasan Menu', value: 'Form Sales', icon: Briefcase, color: 'blue', action: () => router.visit(route('marketing.index')) },
            'Rekap Marketing': { title: 'Pintasan Menu', value: 'Rekap Sales', icon: FileSpreadsheet, color: 'indigo', action: () => router.visit(route('marketing.recap.index')) },
            'Cari Produk': { title: 'Pintasan Menu', value: 'Cari Produk', icon: Search, color: 'teal', action: () => router.visit(route('marketing.products.index')) },
            'Form UC': { title: 'Pintasan Menu', value: 'Form UC', icon: CreditCard, color: 'emerald', action: () => router.visit(route('requests.uc.index')) },
            'Riwayat UC': { title: 'Pintasan Menu', value: 'Riwayat UC', icon: FileClock, color: 'emerald', action: () => router.visit(route('requests.uc.history')) },
            'Persetujuan UC': { title: 'Pintasan Menu', value: 'Persetujuan UC', icon: CheckCircle, color: 'emerald', action: () => router.visit(route('requests.uc.approval.index')) },
            'Input BHP': { title: 'Pintasan Menu', value: 'Input BHP', icon: ClipboardList, color: 'orange', action: () => router.visit(route('requests.bhp.index')) },
            'Rekap BHP': { title: 'Pintasan Menu', value: 'Rekap BHP', icon: FileSpreadsheet, color: 'orange', action: () => router.visit(route('requests.bhp.recap.index')) },
            'Pengajuan Pembayaran': { title: 'Pintasan Menu', value: 'Buat Tagihan', icon: FileSignature, color: 'red', action: () => router.visit(route('payment-requests.index')) },
            'Data Hutang': { title: 'Pintasan Menu', value: 'Data Hutang', icon: FileText, color: 'red', action: () => router.visit(route('payables.index')) },
            'Data Piutang': { title: 'Pintasan Menu', value: 'Data Piutang', icon: FileText, color: 'cyan', action: () => router.visit(route('receivables.index')) },
            'Persetujuan Pembayaran': { title: 'Pintasan Menu', value: 'Persetujuan Tagihan', icon: CheckCircle, color: 'red', action: () => router.visit(route('payment-approvals.index')) },
            'Laporan Logistik': { title: 'Pintasan Menu', value: 'Lap Logistik', icon: Archive, color: 'yellow', action: () => router.visit(route('logistic-reports.index')) },
            'Surat Pesanan': { title: 'Pintasan Menu', value: 'Surat Pesanan', icon: FileText, color: 'lime', action: () => router.visit(route('purchase-orders.index')) },
            'Data Penyedia': { title: 'Pintasan Menu', value: 'Data Penyedia', icon: Building, color: 'sky', action: () => router.visit(route('providers.index')) },
            'Data Produk': { title: 'Pintasan Menu', value: 'Data Produk', icon: Package, color: 'teal', action: () => router.visit(route('products.index')) },
            'Kebutuhan Barang': { title: 'Pintasan Menu', value: 'Kebutuhan Brg', icon: Box, color: 'amber', action: () => router.visit(route('item-requirements.index')) },
            'Data Outlet': { title: 'Pintasan Menu', value: 'Data Outlet', icon: Building, color: 'indigo', action: () => router.visit(route('outlets.index')) },
            'Pemetaan Outlet': { title: 'Pintasan Menu', value: 'Pemetaan', icon: Map, color: 'indigo', action: () => router.visit(route('outlet-mappings.index')) },
            'Data Armada': { title: 'Pintasan Menu', value: 'Data Armada', icon: Truck, color: 'slate', action: () => router.visit(route('vehicles.index')) },
            'Data Perusahaan': { title: 'Pintasan Menu', value: 'Perusahaan', icon: Building, color: 'fuchsia', action: () => router.visit(route('company.index')) },
            'Data Pengguna': { title: 'Pintasan Menu', value: 'Pengguna', icon: Users, color: 'blue', action: () => router.visit(route('users.index')) },
            'Manajemen SOP': { title: 'Pintasan Menu', value: 'SOP', icon: ShieldCheck, color: 'indigo', action: () => router.visit(route('sops.index')) },
            'Rekap Absensi': { title: 'Pintasan Menu', value: 'Rekap Absensi', icon: FileSpreadsheet, color: 'blue', action: () => router.visit(route('absensi.rekap')) },
            'Riwayat Perubahan': { title: 'Pintasan Menu', value: 'Riwayat Log', icon: FileClock, color: 'gray', action: () => router.visit(route('system.activity-logs')) },
            'Notifikasi': { title: 'Pintasan Menu', value: 'Notifikasi', icon: Bell, color: 'indigo', action: () => router.visit(route('notifications.index')) },
            'Profil & Akun': { title: 'Pintasan Menu', value: 'Profil Akun', icon: User, color: 'gray', action: () => router.visit(route('profile.edit')) },
        };
        
        return configs[key];
    };

    const dashboardPrefs = auth.user?.preferences?.dashboard || ['attendance', 'marketing', 'uc', 'bhp'];

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
                    {dashboardPrefs.slice(0, 4).map((prefKey, idx) => {
                        const config = getWidgetConfig(prefKey);
                        if (!config) return null;
                        return (
                            <StatCard 
                                key={idx}
                                title={config.title} 
                                value={config.value} 
                                icon={config.icon} 
                                color={config.color} 
                                onClick={config.action} 
                            />
                        );
                    })}
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
                                <p className="text-gray-500">karena Anda Kami Ada</p>
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
                                            <span className="font-bold text-gray-800">{item.pic_name || 'Kunjungan'}</span>
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
                                {stats.uc_list?.length > 0 ? stats.uc_list.map((item, idx) => {
                                    const totalAmount = (Number(item.estimated_gas_cost) || 0) + 
                                                        (Number(item.estimated_meals_cost) || 0) + 
                                                        (Number(item.estimated_accommodation_cost) || 0) + 
                                                        (Number(item.flight_ticket_cost) || 0) + 
                                                        (Number(item.ship_ticket_cost) || 0);
                                    return (
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
                                                Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}
                                            </span>
                                        </div>
                                    );
                                }) : <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Tidak ada pengajuan pending.</div>}
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
