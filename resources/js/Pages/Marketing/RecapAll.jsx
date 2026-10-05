import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { ClipboardList, CalendarDays, Filter, Download, X, Users, CheckCircle, Clock } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import ExportDropdown from '@/Components/ExportDropdown';
import Pagination from '@/Components/Pagination';

export default function RecapAll({ reports, allTargets, sales_users, filters, auth, summary }) {
    const [activeTab, setActiveTab] = useState('laporan');
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summaryModalType, setSummaryModalType] = useState(null); // 'reported' or 'unreported'
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);

    const openModal = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedReport(null), 300); // clear after animation
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    const renderPhotos = (photosData) => {
        if (!photosData) return <div className="text-sm text-gray-500 italic">Tidak ada foto terlampir.</div>;
        let photos = [];
        if (typeof photosData === 'string') {
            try {
                photos = JSON.parse(photosData);
            } catch (e) {
                return <div className="text-sm text-gray-500 italic">Tidak ada foto terlampir.</div>;
            }
        } else if (Array.isArray(photosData)) {
            photos = photosData;
        }
        
        if (photos.length === 0) return <div className="text-sm text-gray-500 italic">Tidak ada foto terlampir.</div>;

        return (
            <div className="flex flex-wrap gap-4 mt-2 pb-4">
                {photos.map((photo, idx) => {
                    const isHttp = photo.startsWith('http');
                    let src = isHttp ? photo : `/storage/${photo}`;
                    
                    // Proxy i.ibb.co to bypass ISP blocks in Indonesia
                    if (isHttp && photo.includes('i.ibb.co')) {
                        src = `https://wsrv.nl/?url=${encodeURIComponent(photo)}`;
                    }
                    
                    // Ekstrak ID Google Drive dari nama file jika ada
                    let driveId = null;
                    if (!isHttp && photo.includes('marketing_import_')) {
                        const match = photo.match(/marketing_import_(.*?)\.jpg/);
                        if (match && match[1]) {
                            driveId = match[1];
                        }
                    }

                    return (
                        <div key={idx} className="relative group mb-4">
                            <button 
                                type="button"
                                onClick={() => setSelectedImage(src)}
                                className="block focus:outline-none"
                            >
                                <img 
                                    src={src} 
                                    alt={`Lampiran ${idx+1}`} 
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Foto+Gagal+Muat';
                                    }}
                                />
                            </button>
                            {driveId && (
                                <a 
                                    href={`https://drive.google.com/file/d/${driveId}/view`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="absolute -bottom-5 left-0 text-[11px] text-blue-600 hover:underline w-max"
                                >
                                    Buka G-Drive &nearr;
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        router.get(route('marketing.recap.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handlePeriodChange = (val) => {
        let start = '';
        let end = '';
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];
        
        if (val === '1_minggu') {
            const d = new Date(today);
            d.setDate(today.getDate() - 7);
            start = formatDate(d);
            end = formatDate(today);
        } else if (val === '1_bulan') {
            const d = new Date(today);
            d.setMonth(today.getMonth() - 1);
            start = formatDate(d);
            end = formatDate(today);
        } else if (val === '1_tahun') {
            const d = new Date(today);
            d.setFullYear(today.getFullYear() - 1);
            start = formatDate(d);
            end = formatDate(today);
        }

        const newFilters = { ...filters, start_date: start, end_date: end, period: val };
        router.get(route('marketing.recap.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const getExportUrl = (format) => {
        const url = new URL(route(`marketing.recap.${format}`), window.location.origin);
        url.searchParams.append('type', activeTab);
        if (filters.user_id) url.searchParams.append('user_id', filters.user_id);
        if (filters.start_date) url.searchParams.append('start_date', filters.start_date);
        if (filters.end_date) url.searchParams.append('end_date', filters.end_date);
        return url.toString();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Rekap Semua Marketing</h2>}
        >
            <Head title="Rekap Semua Marketing" />

            <div className="pb-6 pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Daily Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                        className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSummaryModalType('reported')}
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Laporan Hari Ini</p>
                            <h4 className="text-2xl font-bold text-gray-800">{summary?.reports_today_count || 0}</h4>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>

                    <div 
                        className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSummaryModalType('period_reported')}
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Laporan</p>
                            <h4 className="text-2xl font-bold text-gray-800">{summary?.total_reports_period_count || 0}</h4>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    
                    <div 
                        className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSummaryModalType('unreported')}
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Jumlah Yang Belum Melapor</p>
                            <h4 className="text-2xl font-bold text-gray-800">{summary?.not_reported_users?.length || 0}</h4>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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
                            <CustomSelect
                                value={filters.period || ''}
                                onChange={(val) => handlePeriodChange(val)}
                                options={[
                                    { value: '', label: 'Semua Waktu' },
                                    { value: '1_minggu', label: '1 Minggu Terakhir' },
                                    { value: '1_bulan', label: '1 Bulan Terakhir' },
                                    { value: '1_tahun', label: '1 Tahun Terakhir' },
                                ]}
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
                {/* Tab Navigation & Export */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full pb-2">
                    <div className="flex overflow-x-auto gap-3 w-full md:w-auto p-2 pb-4 md:pb-2 -ml-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <button onClick={() => setActiveTab('laporan')} className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 whitespace-nowrap snap-start ${activeTab === 'laporan' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            <ClipboardList className="w-5 h-5"/> Rekap Laporan Harian
                        </button>
                        <button onClick={() => setActiveTab('target')} className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 whitespace-nowrap snap-start ${activeTab === 'target' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            <CalendarDays className="w-5 h-5"/> Rekap Target Bulanan
                        </button>
                    </div>
                    
                    <div className="w-full md:w-auto mt-2 md:mt-0">
                        <ExportDropdown 
                            pdfRoute={getExportUrl('pdf')} 
                            excelRoute={getExportUrl('excel')} 
                            trigger={
                                <button className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-all h-[42px] shrink-0 w-full sm:w-auto">
                                    <Download className="w-4 h-4 mr-2" /> Unduh PDF/Excel
                                </button>
                            } 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Rekap Laporan Harian */}
                    {activeTab === 'laporan' && (
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hide-scrollbar">
                            <div className="p-6 border-b border-gray-50">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <ClipboardList className="text-indigo-600 w-5 h-5" />
                                    Rekap Laporan Harian
                                </h3>
                            </div>
                            <div className="overflow-x-auto hide-scrollbar">
                                <table className="block md:table w-full text-sm text-left">
                                    <thead className="hidden md:table-header-group bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center">No</th>
                                            <th className="px-6 py-4">Nama Sales</th>
                                            <th className="px-6 py-4">Tanggal & Waktu</th>
                                            <th className="px-6 py-4">Aktivitas</th>
                                            <th className="px-6 py-4">Outlet / PIC</th>
                                            <th className="px-6 py-4">Kendala / Hasil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="block md:table-row-group divide-y divide-transparent md:divide-gray-50 bg-gray-50/30 md:bg-white p-4 md:p-0">
                                        {reports?.data?.length > 0 ? reports.data.map((r, i) => (
                                            <tr key={r.id} onClick={() => openModal(r)} className="block md:table-row hover:bg-indigo-50/30 cursor-pointer transition-colors mb-4 md:mb-0 bg-white md:bg-transparent border border-gray-100 md:border-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none p-4 md:p-0">
                                                <td className="hidden md:table-cell px-6 py-4 text-center text-gray-500 font-medium">
                                                    {(reports.current_page - 1) * reports.per_page + i + 1}
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Sales</span>
                                                        <div className="font-bold text-gray-800 text-base md:text-sm">{r.user?.name || '-'}</div>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Waktu</span>
                                                        <div className="text-right md:text-left">
                                                            <div className="font-medium text-gray-800">{new Date(r.visit_date).toLocaleDateString('id-ID')}</div>
                                                            <div className="text-xs text-gray-500">{r.visit_time}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Aktivitas</span>
                                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold">{r.activity_type}</span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Outlet</span>
                                                        <div className="text-right md:text-left">
                                                            {r.activity_type?.includes('Non-Kunjungan') ? '-' : (
                                                                <>
                                                                    <div className="font-medium text-gray-800">{r.outlet?.name || r.outlet_id || '-'}</div>
                                                                    <div className="text-xs text-gray-500">{r.pic_name ? `PIC: ${r.pic_name}` : ''}</div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4">
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Hasil</span>
                                                        <div className="text-right md:text-left">
                                                            <div className="text-xs text-orange-600 font-medium">{r.issue_type && r.issue_type !== 'Tidak Ada Kendala' ? `Kendala: ${r.issue_type}` : ''}</div>
                                                            <div className="text-gray-600 line-clamp-2 text-sm mt-1" title={r.visit_result}>{r.visit_result}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">Belum ada data laporan harian.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <Pagination links={reports.links} from={reports.from} to={reports.to} total={reports.total} />
                            </div>
                        </div>
                    )}

                    {/* Rekap Target Bulanan */}
                    {activeTab === 'target' && (
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hide-scrollbar">
                            <div className="p-6 border-b border-gray-50">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <CalendarDays className="text-teal-600 w-5 h-5" />
                                    Rekap Target Bulanan
                                </h3>
                            </div>
                            <div className="overflow-x-auto hide-scrollbar">
                                <table className="block md:table w-full text-sm text-left">
                                    <thead className="hidden md:table-header-group bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center">No</th>
                                            <th className="px-6 py-4">Nama Sales</th>
                                            <th className="px-6 py-4">Bulan/Tahun</th>
                                            <th className="px-6 py-4">Tanggal Periode</th>
                                            <th className="px-6 py-4 text-center">Target Kunjungan</th>
                                            <th className="px-6 py-4 text-center">Capaian (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="block md:table-row-group divide-y divide-transparent md:divide-gray-50 bg-gray-50/30 md:bg-white p-4 md:p-0">
                                        {allTargets?.data?.length > 0 ? allTargets.data.map((t, i) => (
                                            <tr key={t.id} className="block md:table-row hover:bg-teal-50/30 transition-colors mb-4 md:mb-0 bg-white md:bg-transparent border border-gray-100 md:border-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none p-4 md:p-0">
                                                <td className="hidden md:table-cell px-6 py-4 text-center text-gray-500 font-medium">
                                                    {(allTargets.current_page - 1) * allTargets.per_page + i + 1}
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Sales</span>
                                                        <div className="font-bold text-gray-800 text-base md:text-sm">{t.user?.name || '-'}</div>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0 font-medium text-gray-800">
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Bulan/Tahun</span>
                                                        <span>{new Date(t.start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0 text-gray-600">
                                                    <div className="flex flex-col md:block items-start md:items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider mb-1">Periode</span>
                                                        <span>{new Date(t.start_date).toLocaleDateString('id-ID')} s/d {new Date(t.end_date).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                    <div className="flex justify-between md:justify-center items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Kunjungan</span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSelectedTarget(t)}
                                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors px-3 py-1 rounded-full text-xs font-bold cursor-pointer border border-blue-100 shadow-sm"
                                                        >
                                                            {t.target_visits} Outlet
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                    <div className="flex justify-between md:justify-center items-center">
                                                        <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Capaian</span>
                                                        <div className="flex flex-col items-end md:items-center">
                                                            <span className="font-bold text-gray-800">{t.realized_visits || 0} <span className="text-gray-400 font-normal text-xs">/ {t.target_visits}</span></span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${t.target_visits > 0 ? Math.min(100, Math.round(((t.realized_visits || 0) / t.target_visits) * 100)) : 0}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-blue-600 mt-0.5">
                                                                {t.target_visits > 0 ? Math.min(100, Math.round(((t.realized_visits || 0) / t.target_visits) * 100)) : 0}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr className="block md:table-row">
                                                <td colSpan="6" className="block md:table-cell px-6 py-12 text-center text-gray-400 font-medium">Belum ada data target bulanan.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <Pagination links={allTargets.links} from={allTargets.from} to={allTargets.to} total={allTargets.total} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-black text-gray-800">Detail Laporan Harian</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-800 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    {selectedReport && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-sm text-gray-500 mb-1">Nama Sales</div>
                                    <div className="font-bold text-gray-800">{selectedReport.user?.name || '-'}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-sm text-gray-500 mb-1">Waktu Kunjungan</div>
                                    <div className="font-bold text-gray-800">
                                        {new Date(selectedReport.visit_date).toLocaleDateString('id-ID')} - {selectedReport.visit_time}
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-100 rounded-xl p-5 shadow-sm">
                                <h4 className="font-semibold text-gray-700 mb-4 border-b border-gray-50 pb-2">Informasi Kunjungan</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                    <div>
                                        <div className="text-xs text-gray-500">Jenis Aktivitas</div>
                                        <div className="font-medium text-gray-800 mt-1">{selectedReport.activity_type}</div>
                                    </div>
                                    {!selectedReport.activity_type?.includes('Non-Kunjungan') && (
                                        <>
                                            <div>
                                                <div className="text-xs text-gray-500">Tujuan Kunjungan</div>
                                                <div className="font-medium text-gray-800 mt-1">{selectedReport.visit_type || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Status Outlet</div>
                                                <div className="font-medium text-gray-800 mt-1">{selectedReport.outlet_status || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Outlet/Instansi</div>
                                                <div className="font-medium text-gray-800 mt-1">{selectedReport.outlet?.name || selectedReport.outlet_id || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">PIC Ditemui</div>
                                                <div className="font-medium text-gray-800 mt-1">{selectedReport.pic_name || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Jabatan PIC</div>
                                                <div className="font-medium text-gray-800 mt-1">{selectedReport.pic_position || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Kontak PIC</div>
                                                <div className="font-medium text-gray-800 mt-1">{selectedReport.pic_phone || '-'}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="border border-gray-100 rounded-xl p-5 shadow-sm">
                                <h4 className="font-semibold text-gray-700 mb-4 border-b border-gray-50 pb-2">Hasil Kunjungan</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Hasil / Catatan</div>
                                        <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                                            {selectedReport.visit_result || 'Tidak ada catatan hasil kunjungan.'}
                                        </div>
                                    </div>
                                    {selectedReport.competitor_notes && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Info Kompetitor</div>
                                            <div className="text-sm text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-100 whitespace-pre-wrap">
                                                {selectedReport.competitor_notes}
                                            </div>
                                        </div>
                                    )}
                                    {selectedReport.issue_type && selectedReport.issue_type !== 'Tidak Ada Kendala' && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Kendala yang Dihadapi</div>
                                            <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                                <span className="font-semibold block mb-1">{selectedReport.issue_type}</span>
                                                {selectedReport.issue_description}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="border border-gray-100 rounded-xl p-5 shadow-sm">
                                <h4 className="font-semibold text-gray-700 mb-4 border-b border-gray-50 pb-2">Foto Kunjungan / Lampiran</h4>
                                {renderPhotos(selectedReport.photos)}
                            </div>
                            
                            {selectedReport.signature && (
                                <div className="border border-gray-100 rounded-xl p-5 shadow-sm">
                                    <h4 className="font-semibold text-gray-700 mb-4 border-b border-gray-50 pb-2">Tanda Tangan PIC</h4>
                                    <div className="mt-2 pb-4">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                let sigSrc = selectedReport.signature;
                                                if (sigSrc.startsWith('http') && sigSrc.includes('i.ibb.co')) {
                                                    sigSrc = `https://wsrv.nl/?url=${encodeURIComponent(sigSrc)}`;
                                                }
                                                setSelectedImage(sigSrc);
                                            }}
                                            className="block focus:outline-none"
                                        >
                                            <img 
                                                src={(() => {
                                                    let sigSrc = selectedReport.signature;
                                                    if (sigSrc.startsWith('http') && sigSrc.includes('i.ibb.co')) {
                                                        return `https://wsrv.nl/?url=${encodeURIComponent(sigSrc)}`;
                                                    }
                                                    return sigSrc;
                                                })()} 
                                                alt="Tanda Tangan PIC" 
                                                className="h-32 object-contain bg-white rounded-lg border border-gray-200 p-2 cursor-pointer hover:shadow-md transition-shadow"
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="mt-8 flex justify-end">
                        <PrimaryButton onClick={closeModal}>Tutup Detail</PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Summary Detail Modal */}
            <Modal show={summaryModalType !== null} onClose={() => setSummaryModalType(null)} maxWidth="xl">
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-black text-gray-800">
                        {summaryModalType === 'reported' ? 'Sudah Melapor Hari Ini' : summaryModalType === 'period_reported' ? 'Total Laporan Periode Ini' : 'Belum Melapor Hari Ini'}
                    </h2>
                    <button onClick={() => setSummaryModalType(null)} className="text-gray-400 hover:text-gray-800 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {summaryModalType === 'reported' ? (
                        summary?.reported_users?.length > 0 ? (
                            <ul className="space-y-2">
                                {summary.reported_users.map(u => (
                                    <li key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">{u.name}</span>
                                            <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                                {u.report_count} Laporan
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500 italic">Belum ada yang melapor hari ini.</div>
                        )
                    ) : summaryModalType === 'period_reported' ? (
                        summary?.reports_per_user_period?.length > 0 ? (
                            <ul className="space-y-2">
                                {summary.reports_per_user_period.map(u => (
                                    <li key={u.id} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <ClipboardList className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">{u.name}</span>
                                            <span className="text-sm text-blue-600 font-medium bg-white px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                                                {u.report_count} Laporan
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500 italic">Belum ada laporan pada periode ini.</div>
                        )
                    ) : (
                        summary?.not_reported_users?.length > 0 ? (
                            <ul className="space-y-2">
                                {summary.not_reported_users.map(u => (
                                    <li key={u.id} className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-red-600" />
                                        </div>
                                        <span className="font-semibold text-gray-700">{u.name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500 italic">Semua sales sudah melapor!</div>
                        )
                    )}
                    <div className="mt-8 flex justify-end">
                        <PrimaryButton onClick={() => setSummaryModalType(null)}>Tutup Detail</PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Photo Viewer Modal */}
            <Modal show={selectedImage !== null} onClose={() => setSelectedImage(null)} maxWidth="4xl">
                <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[50vh] p-4">
                    <button 
                        onClick={() => setSelectedImage(null)} 
                        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    {selectedImage && (
                        <img 
                            src={selectedImage} 
                            alt="Foto Kunjungan Detail" 
                            className="max-w-full max-h-[85vh] object-contain rounded"
                        />
                    )}
                </div>
            </Modal>

            {/* Target Outlets Modal */}
            <Modal show={selectedTarget !== null} onClose={() => setSelectedTarget(null)} maxWidth="lg">
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-lg font-black text-gray-800">
                        List Outlet Target
                    </h2>
                    <button onClick={() => setSelectedTarget(null)} className="text-gray-400 hover:text-gray-800 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {selectedTarget?.target_outlet_names?.length > 0 ? (
                        <ul className="space-y-2">
                            {selectedTarget.target_outlet_names.map((outletName, idx) => (
                                <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-semibold text-gray-700">{outletName}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-500 italic">Tidak ada outlet.</div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
