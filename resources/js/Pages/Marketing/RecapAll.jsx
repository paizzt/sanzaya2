import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClipboardList, CalendarDays, Filter, Download } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function RecapAll({ reports, allTargets, sales_users, filters, auth }) {
    const [activeTab, setActiveTab] = useState('laporan');

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        router.get(route('marketing.recap.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleExportPdf = () => {
        const url = new URL(route('marketing.recap.pdf'), window.location.origin);
        url.searchParams.append('type', activeTab);
        if (filters.user_id) url.searchParams.append('user_id', filters.user_id);
        if (filters.start_date) url.searchParams.append('start_date', filters.start_date);
        if (filters.end_date) url.searchParams.append('end_date', filters.end_date);
        window.open(url.toString(), '_blank');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Rekap Semua Marketing</h2>}
        >
            <Head title="Rekap Semua Marketing" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Filter Section */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Filter className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Filter Data Marketing</h3>
                            <p className="text-sm text-gray-500">Pilih rentang tanggal dan nama sales.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="w-full md:w-48">
                            <TextInput 
                                type="date" 
                                className="block w-full text-sm" 
                                value={filters.start_date || ''}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                title="Mulai Tanggal"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <TextInput 
                                type="date" 
                                className="block w-full text-sm" 
                                value={filters.end_date || ''}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                title="Sampai Tanggal"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <CustomSelect
                                value={filters.user_id || ''}
                                onChange={(val) => handleFilterChange('user_id', val)}
                                options={[
                                    { value: '', label: 'Semua Sales' },
                                    ...(sales_users || []).map(u => ({ value: u.id, label: u.name }))
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation & Export */}
                <div className="flex flex-wrap items-center justify-between gap-4 w-full pb-2">
                    <div className="flex gap-2 overflow-x-auto">
                        <button onClick={() => setActiveTab('laporan')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab==='laporan'?'bg-indigo-600 text-white shadow-md shadow-indigo-500/30':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                            <ClipboardList className="w-4 h-4"/> Rekap Laporan Harian
                        </button>
                        <button onClick={() => setActiveTab('target')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab==='target'?'bg-teal-600 text-white shadow-md shadow-teal-500/30':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                            <CalendarDays className="w-4 h-4"/> Rekap Target Mingguan
                        </button>
                    </div>
                    
                    <PrimaryButton onClick={handleExportPdf} className="bg-rose-600 hover:bg-rose-700 whitespace-nowrap">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </PrimaryButton>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Rekap Laporan Harian */}
                    {activeTab === 'laporan' && (
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                                <ClipboardList className="text-indigo-600 w-5 h-5" />
                                Rekap Laporan Harian
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-xl">Nama Sales</th>
                                            <th className="px-4 py-3">Tanggal & Waktu</th>
                                            <th className="px-4 py-3">Aktivitas</th>
                                            <th className="px-4 py-3">Outlet / PIC</th>
                                            <th className="px-4 py-3">Kendala / Hasil</th>
                                            <th className="px-4 py-3 text-right rounded-r-xl">Estimasi/Aktual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reports.length > 0 ? reports.map(r => (
                                            <tr key={r.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-gray-800">{r.user?.name || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-800">{new Date(r.visit_date).toLocaleDateString('id-ID')}</div>
                                                    <div className="text-xs text-gray-500">{r.visit_time}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">{r.activity_type}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {r.activity_type?.includes('Non-Kunjungan') ? '-' : (
                                                        <>
                                                            <div className="font-medium text-gray-800">{r.outlet?.name || r.outlet_id || '-'}</div>
                                                            <div className="text-xs text-gray-500">{r.pic_name ? `PIC: ${r.pic_name}` : ''}</div>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs text-orange-600 font-medium">{r.issue_type && r.issue_type !== 'Tidak Ada Kendala' ? `Kendala: ${r.issue_type}` : ''}</div>
                                                    <div className="text-gray-600 line-clamp-2" title={r.visit_result}>{r.visit_result}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="text-gray-500 text-xs">Est: {formatRupiah(r.estimated_value)}</div>
                                                    <div className="font-medium text-emerald-600">Akt: {formatRupiah(r.actual_value)}</div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">Belum ada data laporan harian.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Rekap Target Mingguan */}
                    {activeTab === 'target' && (
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                                <CalendarDays className="text-teal-600 w-5 h-5" />
                                Rekap Target Mingguan
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-xl">Nama Sales</th>
                                            <th className="px-4 py-3">Tahun/Minggu</th>
                                            <th className="px-4 py-3">Tanggal Periode</th>
                                            <th className="px-4 py-3 text-center">Target Kunjungan</th>
                                            <th className="px-4 py-3 text-right rounded-r-xl">Target Transaksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {allTargets && allTargets.length > 0 ? allTargets.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-gray-800">{t.user?.name || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    Tahun {t.year} - M{t.week_number}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {new Date(t.start_date).toLocaleDateString('id-ID')} s/d {new Date(t.end_date).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{t.target_visits} Outlet</span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                                    {formatRupiah(t.target_transactions)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-gray-400">Belum ada data target mingguan.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
