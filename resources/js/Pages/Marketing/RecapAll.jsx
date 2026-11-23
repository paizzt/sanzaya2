import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { ClipboardList, CalendarDays, Filter, Download, X, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import CustomDateRangePicker from '@/Components/CustomDateRangePicker';
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

    const isFilterActive = Boolean(
        filters.start_date || filters.end_date || filters.filter_date || filters.filter_month || filters.user_id
    );

    const handleDateRangeChange = (range) => {
        const start = range?.startDate || range?.start_date || '';
        const end = range?.endDate || range?.end_date || '';

        const newFilters = { ...filters };

        if (start && end) {
            newFilters.start_date = start;
            newFilters.end_date = end;
        } else {
            delete newFilters.start_date;
            delete newFilters.end_date;
        }

        delete newFilters.filter_date;
        delete newFilters.filter_month;
        delete newFilters.period;

        router.get(route('marketing.recap.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        
        if (key === 'filter_date') {
            delete newFilters.filter_month;
            delete newFilters.start_date;
            delete newFilters.end_date;
            delete newFilters.period;
        }
        
        if (key === 'filter_month') {
            delete newFilters.filter_date;
            delete newFilters.start_date;
            delete newFilters.end_date;
            delete newFilters.period;
        }

        if (!value) {
            delete newFilters[key];
        }

        router.get(route('marketing.recap.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleResetFilter = () => {
        router.get(route('marketing.recap.index'), {}, {
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
        if (filters.filter_date) url.searchParams.append('filter_date', filters.filter_date);
        if (filters.filter_month) url.searchParams.append('filter_month', filters.filter_month);
        return url.toString();
    };

    const exportButton = (
        <ExportDropdown
            pdfRoute={getExportUrl('pdf')}
            excelRoute={getExportUrl('excel')}
            trigger={
                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors min-h-[40px] shrink-0 cursor-pointer"
                >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Unduh</span>
                </button>
            }
        />
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Rekap Semua Marketing</h2>}
        >
            <Head title="Rekap Semua Marketing" />

            <div className="pb-6 pt-0 space-y-4 sm:space-y-6">
                
                {/* Daily Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div 
                        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-200 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-300 transition-colors"
                        onClick={() => setSummaryModalType('reported')}
                    >
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 truncate">Total Laporan Hari Ini</p>
                            <h4 className="text-2xl font-bold text-gray-900 tabular-nums">{summary?.reports_today_count || 0}</h4>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>

                    <div 
                        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-200 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 transition-colors"
                        onClick={() => setSummaryModalType('period_reported')}
                    >
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 truncate">Total Laporan</p>
                            <h4 className="text-2xl font-bold text-gray-900 tabular-nums">{summary?.total_reports_period_count || 0}</h4>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div 
                        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-200 flex items-center justify-between gap-3 cursor-pointer hover:border-orange-300 transition-colors"
                        onClick={() => setSummaryModalType('unreported')}
                    >
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 truncate">Jumlah Yang Belum Melapor</p>
                            <h4 className="text-2xl font-bold text-gray-900 tabular-nums">{summary?.not_reported_users?.length || 0}</h4>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">Filter Data Marketing</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                                {filters.start_date && filters.end_date 
                                    ? `Rentang aktif: ${filters.start_date} s/d ${filters.end_date}` 
                                    : 'Pilih rentang tanggal dan nama sales.'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full xl:w-auto">
                        {/* Filter Rentang Tanggal */}
                        <div className="w-full sm:w-72">
                            <CustomDateRangePicker
                                value={{
                                    startDate: filters.start_date || '',
                                    endDate: filters.end_date || ''
                                }}
                                onChange={handleDateRangeChange}
                                placeholder="Rentang Tanggal (cth: 1 s/d 5)..."
                                primaryColor="blue"
                                readOnly={true}
                            />
                        </div>

                        {/* Filter Bulan Opsional */}
                        <div className="w-full sm:w-40">
                            <TextInput
                                type="month"
                                className="w-full text-sm"
                                value={filters.filter_month || ''}
                                onChange={(e) => handleFilterChange('filter_month', e.target.value)}
                                title="Pilih Bulan Tertentu"
                            />
                        </div>

                        {/* Filter Sales */}
                        <div className="w-full sm:w-56">
                            <CustomSelect
                                value={filters.user_id || ''}
                                onChange={(val) => handleFilterChange('user_id', val)}
                                options={[
                                    { value: '', label: 'Semua Sales' },
                                    ...(sales_users || []).map(u => ({ value: u.id, label: u.name }))
                                ]}
                            />
                        </div>

                        {/* Tombol Reset Filter */}
                        {isFilterActive && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors min-h-[42px] shrink-0 cursor-pointer"
                                title="Reset Filter"
                            >
                                <X className="w-4 h-4" /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation (Responsif Tanpa Scroll Horizontal di Mobile) */}
                <div className="grid grid-cols-3 md:flex md:flex-wrap items-center gap-2 w-full">
                    <button
                        type="button"
                        onClick={() => setActiveTab('laporan')}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors text-center min-w-0 min-h-[44px] border cursor-pointer ${
                            activeTab === 'laporan'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        <ClipboardList className="w-4 h-4 shrink-0" />
                        <span className="md:hidden truncate max-w-full">Laporan</span>
                        <span className="hidden md:inline whitespace-nowrap">Rekap Laporan Harian</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('target')}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors text-center min-w-0 min-h-[44px] border cursor-pointer ${
                            activeTab === 'target'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        <span className="md:hidden truncate max-w-full">Target</span>
                        <span className="hidden md:inline whitespace-nowrap">Rekap Target Bulanan</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('kendala')}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors text-center min-w-0 min-h-[44px] border cursor-pointer ${
                            activeTab === 'kendala'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="md:hidden truncate max-w-full">Kendala</span>
                        <span className="hidden md:inline whitespace-nowrap">Kesimpulan & Kendala</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {/* Rekap Laporan Harian */}
                    {activeTab === 'laporan' && (
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-gray-200 flex items-center justify-between gap-2">
                                <h3 className="font-bold text-base sm:text-lg text-gray-800 flex items-center gap-2 min-w-0">
                                    <ClipboardList className="text-indigo-600 w-5 h-5 shrink-0" />
                                    <span className="truncate">Rekap Laporan Harian</span>
                                </h3>
                                {exportButton}
                            </div>

                            {/* Tampilan Mobile: Kartu Ringkas Tanpa Scroll Horizontal */}
                            <div className="block md:hidden p-3 space-y-2.5 bg-gray-50">
                                {reports?.data?.length > 0 ? reports.data.map((r) => (
                                    <div
                                        key={r.id}
                                        onClick={() => openModal(r)}
                                        className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-2 cursor-pointer active:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-gray-900 truncate">{r.user?.name || '-'}</div>
                                                <div className="text-xs text-gray-600 mt-0.5 tabular-nums">
                                                    {new Date(r.visit_date).toLocaleDateString('id-ID')} &bull; {r.visit_time}
                                                </div>
                                            </div>
                                            <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0">
                                                {r.activity_type}
                                            </span>
                                        </div>

                                        {!r.activity_type?.includes('Non-Kunjungan') && (
                                            <div className="pt-2 border-t border-gray-100 text-xs min-w-0">
                                                <div className="font-semibold text-gray-800 break-words">
                                                    {r.outlet?.name || r.outlet_id || '-'}
                                                </div>
                                                {r.pic_name && (
                                                    <div className="text-gray-600 mt-0.5 break-words">PIC: {r.pic_name}</div>
                                                )}
                                            </div>
                                        )}

                                        {(r.visit_result || (r.issue_type && r.issue_type !== 'Tidak Ada Kendala')) && (
                                            <div className="pt-2 border-t border-gray-100 space-y-1 min-w-0">
                                                {r.issue_type && r.issue_type !== 'Tidak Ada Kendala' && (
                                                    <div className="text-[11px] text-orange-700 font-semibold">
                                                        Kendala: {r.issue_type}
                                                    </div>
                                                )}
                                                {r.visit_result && (
                                                    <div className="text-xs text-gray-700 line-clamp-2 break-words" title={r.visit_result}>
                                                        {r.visit_result}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="py-8 text-center text-sm text-gray-600">
                                        Belum ada data laporan harian.
                                    </div>
                                )}
                            </div>

                            {/* Tampilan Desktop / Tablet: Tabel */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center">No</th>
                                            <th className="px-6 py-4">Nama Sales</th>
                                            <th className="px-6 py-4">Tanggal & Waktu</th>
                                            <th className="px-6 py-4">Aktivitas</th>
                                            <th className="px-6 py-4">Outlet / PIC</th>
                                            <th className="px-6 py-4">Kendala / Hasil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {reports?.data?.length > 0 ? reports.data.map((r, i) => (
                                            <tr key={r.id} onClick={() => openModal(r)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                                                <td className="px-6 py-4 text-center text-gray-600 font-medium">
                                                    {(reports.current_page - 1) * reports.per_page + i + 1}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {r.user?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-800">{new Date(r.visit_date).toLocaleDateString('id-ID')}</div>
                                                    <div className="text-xs text-gray-600">{r.visit_time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold">{r.activity_type}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {r.activity_type?.includes('Non-Kunjungan') ? '-' : (
                                                        <>
                                                            <div className="font-medium text-gray-800">{r.outlet?.name || r.outlet_id || '-'}</div>
                                                            <div className="text-xs text-gray-600">{r.pic_name ? `PIC: ${r.pic_name}` : ''}</div>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-orange-700 font-semibold">{r.issue_type && r.issue_type !== 'Tidak Ada Kendala' ? `Kendala: ${r.issue_type}` : ''}</div>
                                                    <div className="text-gray-700 line-clamp-2 text-sm mt-0.5" title={r.visit_result}>{r.visit_result}</div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-600">Belum ada data laporan harian.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={reports.links} from={reports.from} to={reports.to} total={reports.total} />
                        </div>
                    )}

                    {/* Rekap Target Bulanan */}
                    {activeTab === 'target' && (
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-gray-200 flex items-center justify-between gap-2">
                                <h3 className="font-bold text-base sm:text-lg text-gray-800 flex items-center gap-2 min-w-0">
                                    <CalendarDays className="text-teal-600 w-5 h-5 shrink-0" />
                                    <span className="truncate">Rekap Target Bulanan</span>
                                </h3>
                                {exportButton}
                            </div>

                            {/* Tampilan Mobile: Kartu Ringkas Tanpa Scroll Horizontal */}
                            <div className="block md:hidden p-3 space-y-2.5 bg-gray-50">
                                {allTargets?.data?.length > 0 ? allTargets.data.map((t) => {
                                    const pct = t.target_visits > 0 ? Math.min(100, Math.round(((t.realized_visits || 0) / t.target_visits) * 100)) : 0;
                                    return (
                                        <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-2.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm text-gray-900 truncate">{t.user?.name || '-'}</div>
                                                    <div className="text-xs text-gray-600 mt-0.5">
                                                        {new Date(t.start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTarget(t)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white transition-colors px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0"
                                                >
                                                    {t.target_visits} Outlet
                                                </button>
                                            </div>
                                            <div className="pt-2 border-t border-gray-100 space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-gray-600">Capaian</span>
                                                    <span className="font-bold text-gray-900 tabular-nums">
                                                        {t.realized_visits || 0} / {t.target_visits} <span className="text-blue-700">({pct}%)</span>
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="py-8 text-center text-sm text-gray-600">
                                        Belum ada data target bulanan.
                                    </div>
                                )}
                            </div>

                            {/* Tampilan Desktop / Tablet: Tabel */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center">No</th>
                                            <th className="px-6 py-4">Nama Sales</th>
                                            <th className="px-6 py-4">Bulan/Tahun</th>
                                            <th className="px-6 py-4 text-center">Target Kunjungan</th>
                                            <th className="px-6 py-4 text-center">Capaian (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {allTargets?.data?.length > 0 ? allTargets.data.map((t, i) => {
                                            const pct = t.target_visits > 0 ? Math.min(100, Math.round(((t.realized_visits || 0) / t.target_visits) * 100)) : 0;
                                            return (
                                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-center text-gray-600 font-medium">
                                                        {(allTargets.current_page - 1) * allTargets.per_page + i + 1}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">
                                                        {t.user?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-800">
                                                        {new Date(t.start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSelectedTarget(t)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                                                        >
                                                            {t.target_visits} Outlet
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-gray-800">{t.realized_visits || 0} <span className="text-gray-500 font-normal text-xs">/ {t.target_visits}</span></span>
                                                            <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-blue-700 mt-0.5">
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-600 font-medium">Belum ada data target bulanan.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={allTargets.links} from={allTargets.from} to={allTargets.to} total={allTargets.total} />
                        </div>
                    )}

                    {/* Kesimpulan & Kendala */}
                    {activeTab === 'kendala' && (
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-gray-200 flex items-center justify-between gap-2">
                                <h3 className="font-bold text-base sm:text-lg text-gray-800 flex items-center gap-2 min-w-0">
                                    <AlertCircle className="text-red-600 w-5 h-5 shrink-0" />
                                    <span className="truncate">Kesimpulan & Kendala</span>
                                </h3>
                                {exportButton}
                            </div>

                            <div className="p-3 sm:p-6 bg-gray-50 sm:bg-white">
                                {summary?.kendala_per_user_period && summary.kendala_per_user_period.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                                        {summary.kendala_per_user_period.map((mkt, idx) => (
                                            <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 flex flex-col">
                                                <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
                                                    <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">{mkt.name}</h4>
                                                        <p className="text-xs text-gray-600 mt-0.5">{mkt.kendal_list.length} Laporan Kendala</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar" style={{maxHeight: '300px'}}>
                                                    {mkt.kendal_list.length > 0 ? (
                                                        <ul className="space-y-3">
                                                            {mkt.kendal_list.map((k, i) => (
                                                                <li key={i} className="flex gap-2.5 min-w-0">
                                                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-red-600 shrink-0"></div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-bold text-gray-800 break-words">{k.outlet} <span className="font-normal text-gray-500">({k.date})</span></p>
                                                                        <p className="text-xs sm:text-sm text-gray-700 mt-0.5 leading-relaxed whitespace-pre-line break-words">{k.description}</p>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                                                            <CheckCircle className="w-7 h-7 mb-1.5 text-emerald-600" />
                                                            <p className="text-xs sm:text-sm text-center">Tidak ada kendala yang dilaporkan pada periode ini.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <AlertCircle className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <h4 className="text-base font-bold text-gray-800">Belum Ada Data Kendala</h4>
                                        <p className="text-xs sm:text-sm text-gray-600 max-w-md mt-1">Tidak ditemukan catatan kendala lapangan untuk filter periode dan sales yang dipilih.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <h2 className="text-lg sm:text-xl font-black text-gray-800">Detail Laporan Harian</h2>
                    <button onClick={closeModal} className="text-gray-600 hover:text-gray-900 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full border border-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
                    {selectedReport && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        {summaryModalType === 'reported' ? 'Sudah Melapor Hari Ini' : summaryModalType === 'period_reported' ? 'Total Laporan Periode Ini' : summaryModalType === 'unreported' ? 'Belum Melapor Hari Ini' : ''}
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
                    ) : summaryModalType === 'unreported' ? (
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
                    ) : null}
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
