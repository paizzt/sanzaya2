import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Users, CreditCard, Building, FileText, ClipboardList, Package, Archive } from 'lucide-react';
import { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-500 shadow-inner`}>
                <Icon className="w-7 h-7" />
            </div>
            
            <div>
                <p className="text-sm font-semibold text-gray-500">{title}</p>
                <h3 className="text-2xl font-black text-gray-800">{value}</h3>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, stats, isAdmin }) {
    
    // Auto-refresh (Realtime Polling) every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['stats'], preserveScroll: true, preserveState: true });
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">Command Center</h2>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6 space-y-6">
                
                {/* Main Metrics (Today/Pending) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Absen (Hari Ini)" value={stats.attendance_today} icon={Users} color="blue" />
                    <StatCard title="Kunjungan Sales" value={stats.marketing_visits_today} icon={Building} color="purple" />
                    <StatCard title="Pengajuan UC (Pending)" value={stats.uc_pending} icon={CreditCard} color="emerald" />
                    <StatCard title="Pengajuan BHP (Pending)" value={stats.bhp_pending} icon={ClipboardList} color="orange" />
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
                                <img src="https://illustrations.popsy.co/amber/success.svg" alt="Success" className="w-48 h-48 opacity-80" />
                                <h3 className="text-xl font-bold text-gray-700 mt-4">Semangat Bekerja!</h3>
                                <p className="text-gray-500">Pastikan untuk selalu melaporkan kunjungan dan kehadiran tepat waktu.</p>
                            </div>
                        )}
                    </div>

                    {/* Greeting Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Selamat Datang,</h3>
                            <h2 className="text-3xl font-black mb-6 relative z-10">{auth.user.name}</h2>
                            <p className="text-blue-100 text-sm mb-8 relative z-10 leading-relaxed">
                                Fitur Dashboard Real-Time diaktifkan. Data pada layar ini diperbarui secara otomatis setiap 15 detik.
                            </p>
                        </div>
                        <Link href={route('absensi.index')} className="w-full bg-white text-center text-blue-600 font-bold py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-lg relative z-10">
                            Buka Menu Absensi
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
