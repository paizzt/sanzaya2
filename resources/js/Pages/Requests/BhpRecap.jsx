import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Search, ShoppingCart, Calendar, User, FileText, Download, CheckCircle, Clock, Check, X, FileBarChart
} from 'lucide-react';
import Swal from 'sweetalert2';
import CustomSelect from '@/Components/CustomSelect';

export default function BhpRecap({ requests }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [monthFilter, setMonthFilter] = useState('Semua');
    const [yearFilter, setYearFilter] = useState('Semua');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Generate options
    const monthOptions = useMemo(() => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months.map((m, i) => ({ value: String(i + 1).padStart(2, '0'), label: m }));
    }, []);

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let i = 0; i < 5; i++) {
            options.push({ value: String(currentYear - i), label: String(currentYear - i) });
        }
        return options;
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = 
                req.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'Semua' || req.status === statusFilter;
            
            let matchesMonth = true;
            if (req.request_date) {
                const [reqYear, reqMonth] = req.request_date.split('-');
                if (yearFilter !== 'Semua' && reqYear !== yearFilter) matchesMonth = false;
                if (monthFilter !== 'Semua' && reqMonth !== monthFilter) matchesMonth = false;
            }

            return matchesSearch && matchesStatus && matchesMonth;
        });
    }, [requests, searchTerm, statusFilter, monthFilter, yearFilter]);

    const handleUpdateStatus = (id, newStatus) => {
        Swal.fire({
            title: 'Konfirmasi',
            text: `Apakah Anda yakin ingin mengubah status pengajuan ini menjadi ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'Disetujui' ? '#0d9488' : '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('requests.bhp.recap.status', id), {
                    status: newStatus
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsModalOpen(false);
                        Swal.fire(
                            'Berhasil!',
                            `Status berhasil diubah menjadi ${newStatus}.`,
                            'success'
                        );
                    }
                });
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'disetujui':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Disetujui</span>;
            case 'ditolak':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1 w-max">Ditolak</span>;
            case 'menunggu':
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Menunggu</span>;
        }
    };

    const openModal = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const exportUrl = route('requests.bhp.recap.export') + `?month=${monthFilter}&year=${yearFilter}&status=${statusFilter}&search=${searchTerm}`;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Rekap BHP</h2>}
        >
            <Head title="Rekap BHP" />

            <div className="py-6 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6 text-teal-600" />
                            Riwayat & Rekapitulasi Pengajuan BHP
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Daftar seluruh pengajuan Bahan Medis Habis Pakai (BMHP) dari semua divisi.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 rounded-t-3xl">
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all shadow-sm"
                                    placeholder="Cari No. Form, Barang, atau Pemohon..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <div className="w-[140px]">
                                <CustomSelect
                                    value={monthFilter}
                                    onChange={setMonthFilter}
                                    options={[
                                        { value: 'Semua', label: 'Semua Bulan' },
                                        ...monthOptions
                                    ]}
                                    placeholder="Bulan"
                                />
                            </div>

                            <div className="w-[120px]">
                                <CustomSelect
                                    value={yearFilter}
                                    onChange={setYearFilter}
                                    options={[
                                        { value: 'Semua', label: 'Semua Tahun' },
                                        ...yearOptions
                                    ]}
                                    placeholder="Tahun"
                                />
                            </div>
                            
                            <div className="w-[180px]">
                                <CustomSelect
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={[
                                        { value: 'Semua', label: 'Semua Status' },
                                        { value: 'Menunggu', label: 'Menunggu' },
                                        { value: 'Disetujui', label: 'Disetujui' },
                                        { value: 'Ditolak', label: 'Ditolak' }
                                    ]}
                                    placeholder="Semua Status"
                                />
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3">
                            <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto text-center">
                                Total Data: <span className="text-gray-900 font-bold">{filteredRequests.length}</span>
                            </div>
                            <a 
                                href={exportUrl} 
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm whitespace-nowrap"
                            >
                                <FileBarChart className="w-4 h-4" /> Unduh PDF
                            </a>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Nomor & Tanggal</th>
                                    <th className="px-6 py-4">Pemohon & Divisi</th>
                                    <th className="px-6 py-4">Nama Barang & Spesifikasi</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                    <tr 
                                        key={req.id} 
                                        onClick={() => openModal(req)}
                                        className="bg-white border-b border-gray-50 hover:bg-teal-50/30 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-gray-900">{req.request_number}</span>
                                                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>Pengajuan: {formatDate(req.request_date)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {req.user?.name ? req.user.name.charAt(0) : '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{req.user?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-500">{req.division_name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-gray-800 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    {req.product_name}
                                                </span>
                                                <span className="text-xs text-gray-500 max-w-[200px] truncate" title={req.specifications}>
                                                    {req.specifications}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <p className="text-lg font-medium text-gray-900">Tidak ada pengajuan BHP</p>
                                            <p className="text-sm mt-1">Belum ada data yang sesuai dengan pencarian Anda.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            
            {/* Modal Preview */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Detail Pengajuan BHP</h3>
                                <p className="text-sm text-gray-500">{selectedRequest.request_number}</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pemohon</p>
                                    <p className="font-medium text-gray-900">{selectedRequest.user?.name || 'Unknown'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Divisi</p>
                                    <p className="font-medium text-gray-900">{selectedRequest.division_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</p>
                                    <p className="font-medium text-gray-900">{formatDate(selectedRequest.request_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Target</p>
                                    <p className="font-medium text-teal-600">{formatDate(selectedRequest.target_date)}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</p>
                                    <p className="font-bold text-gray-900 text-lg">{selectedRequest.product_name}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Spesifikasi</p>
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                                        {selectedRequest.specifications}
                                    </div>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status Saat Ini</p>
                                    {getStatusBadge(selectedRequest.status)}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <a 
                                href={route('requests.bhp.pdf', selectedRequest.id)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-colors shadow-sm w-full sm:w-auto"
                            >
                                <Download className="w-4 h-4" /> Unduh PDF Form Ini
                            </a>
                            
                            {selectedRequest.status === 'Menunggu' && (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'Ditolak')}
                                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-colors font-medium border border-red-200"
                                    >
                                        <X className="w-4 h-4" /> Tolak
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'Disetujui')}
                                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl transition-colors font-medium shadow-sm"
                                    >
                                        <Check className="w-4 h-4" /> Setujui
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
