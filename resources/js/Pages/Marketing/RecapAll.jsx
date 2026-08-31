import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { ClipboardList, CalendarDays, Filter, Download, X } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import ExportDropdown from '@/Components/ExportDropdown';
import Pagination from '@/Components/Pagination';

export default function RecapAll({ reports, allTargets, sales_users, filters, auth }) {
    const [activeTab, setActiveTab] = useState('laporan');
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                    const src = isHttp ? photo : `/storage/${photo}`;
                    
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
                            <a href={driveId ? `https://drive.google.com/file/d/${driveId}/view` : src} target="_blank" rel="noreferrer">
                                <img 
                                    src={src} 
                                    alt={`Lampiran ${idx+1}`} 
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-80 transition-opacity"
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Foto+Gagal+Muat';
                                    }}
                                />
                            </a>
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
                <div className="flex flex-wrap items-center justify-between gap-4 w-full pb-2">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto pb-2">
                        <button onClick={() => setActiveTab('laporan')} className={`flex items-center justify-center sm:justify-start gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap w-full sm:w-auto ${activeTab==='laporan'?'bg-indigo-600 text-white shadow-md shadow-indigo-500/30':'bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm border border-gray-100'}`}>
                            <ClipboardList className="w-4 h-4"/> Rekap Laporan Harian
                        </button>
                        <button onClick={() => setActiveTab('target')} className={`flex items-center justify-center sm:justify-start gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap w-full sm:w-auto ${activeTab==='target'?'bg-teal-600 text-white shadow-md shadow-teal-500/30':'bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm border border-gray-100'}`}>
                            <CalendarDays className="w-4 h-4"/> Rekap Target Mingguan
                        </button>
                    </div>
                    
                    <ExportDropdown pdfRoute={getExportUrl('pdf')} excelRoute={getExportUrl('excel')} />
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
                                            <th className="px-4 py-3 rounded-l-xl w-12 text-center">No</th>
                                            <th className="px-4 py-3">Nama Sales</th>
                                            <th className="px-4 py-3">Tanggal & Waktu</th>
                                            <th className="px-4 py-3">Aktivitas</th>
                                            <th className="px-4 py-3">Outlet / PIC</th>
                                            <th className="px-4 py-3 rounded-r-xl">Kendala / Hasil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reports?.data?.length > 0 ? reports.data.map((r, i) => (
                                            <tr key={r.id} onClick={() => openModal(r)} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                                                <td className="px-4 py-3 text-center text-gray-500 font-medium">
                                                    {(reports.current_page - 1) * reports.per_page + i + 1}
                                                </td>
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
                                            <th className="px-4 py-3 rounded-l-xl w-12 text-center">No</th>
                                            <th className="px-4 py-3">Nama Sales</th>
                                            <th className="px-4 py-3">Tahun/Minggu</th>
                                            <th className="px-4 py-3">Tanggal Periode</th>
                                            <th className="px-4 py-3 text-center">Target Kunjungan</th>
                                            <th className="px-4 py-3 text-right rounded-r-xl">Target Transaksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {allTargets?.data?.length > 0 ? allTargets.data.map((t, i) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 text-center text-gray-500 font-medium">
                                                    {(allTargets.current_page - 1) * allTargets.per_page + i + 1}
                                                </td>
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
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">Belum ada data target mingguan.</td>
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
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">Detail Laporan Harian</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
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
                        </div>
                    )}
                    <div className="mt-8 flex justify-end">
                        <PrimaryButton onClick={closeModal}>Tutup Detail</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
