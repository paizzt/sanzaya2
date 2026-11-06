import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportDropdown from '@/Components/ExportDropdown';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { PlaneTakeoff, FileCheck, Calendar, Download, FileImage, UploadCloud, X, FileText, ExternalLink, AlertCircle, CheckCircle, Clock, AlertTriangle, Edit, Ban, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import ClientPagination from '@/Components/ClientPagination';
import CurrencyInput from '@/Components/CurrencyInput';

export default function UcHistory({ requests = [], activeUcs = [], isAdmin = false }) {
    const user = usePage().props.auth.user;
    
    // Form Result State
    const { data: resultData, setData: setResultData, post: postResult, processing: resultProcessing, errors: resultErrors, reset: resultReset } = useForm({
        result_summary: '',
        receipt_photos: [],
        total_nota: '',
        dibayarkan: '',
        reimburse_sisa_dana: '',
        pengembalian_dana: '',
    });

    const [selectedUc, setSelectedUc] = useState(null);
    const [expandedActiveUc, setExpandedActiveUc] = useState(null);
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedTab, setSelectedTab] = useState('Semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { flash } = usePage().props;

    const openResultForm = (req) => {
        if (selectedUc === req.id) {
            setSelectedUc(null);
            return;
        }
        setSelectedUc(req.id);
        const totalApproved = Number(req.approved_gas_cost) || getRequestTotal(req);
        let defaultDibayarkan = req.dibayarkan;
        if (defaultDibayarkan === undefined || defaultDibayarkan === null || defaultDibayarkan === '') {
            defaultDibayarkan = req.payment_option === 'PANJAR BIAYA 50%' ? Math.round(totalApproved / 2) : totalApproved;
        }
        const initialNota = req.total_nota !== null && req.total_nota !== undefined && req.total_nota !== '' ? req.total_nota : '';
        const initialPaid = defaultDibayarkan !== null && defaultDibayarkan !== undefined && defaultDibayarkan !== '' ? defaultDibayarkan : '';
        
        const nNota = parseFloat(initialNota) || 0;
        const nPaid = parseFloat(initialPaid) || 0;
        const initialReimburse = req.reimburse_sisa_dana !== null && req.reimburse_sisa_dana !== undefined && req.reimburse_sisa_dana !== '' 
            ? req.reimburse_sisa_dana 
            : (nNota > nPaid ? nNota - nPaid : 0);
        const initialPengembalian = req.pengembalian_dana !== null && req.pengembalian_dana !== undefined && req.pengembalian_dana !== '' 
            ? req.pengembalian_dana 
            : (nPaid > nNota ? nPaid - nNota : 0);

        setResultData({
            result_summary: req.result_report || '',
            receipt_photos: [],
            total_nota: initialNota,
            dibayarkan: initialPaid,
            reimburse_sisa_dana: initialReimburse,
            pengembalian_dana: initialPengembalian,
        });
        setPreviewUrls([]);
    };

    const handleTotalNotaChange = (val) => {
        const nNota = parseFloat(val) || 0;
        const nPaid = parseFloat(resultData.dibayarkan) || 0;
        let reimb = 0;
        let refund = 0;
        if (nNota > nPaid) {
            reimb = nNota - nPaid;
            refund = 0;
        } else if (nPaid > nNota) {
            reimb = 0;
            refund = nPaid - nNota;
        }
        setResultData(prev => ({
            ...prev,
            total_nota: val,
            reimburse_sisa_dana: reimb,
            pengembalian_dana: refund
        }));
    };

    const handleDibayarkanChange = (val) => {
        const nPaid = parseFloat(val) || 0;
        const nNota = parseFloat(resultData.total_nota) || 0;
        let reimb = 0;
        let refund = 0;
        if (nNota > nPaid) {
            reimb = nNota - nPaid;
            refund = 0;
        } else if (nPaid > nNota) {
            reimb = 0;
            refund = nPaid - nNota;
        }
        setResultData(prev => ({
            ...prev,
            dibayarkan: val,
            reimburse_sisa_dana: reimb,
            pengembalian_dana: refund
        }));
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab]);

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-2xl' }
            });
            resultReset();
            setSelectedUc(null);
            setPreviewUrls([]);
        }
    }, [flash]);

    const submitResult = (e, id) => {
        e.preventDefault();
        postResult(route('requests.uc.storeResult', id), { preserveScroll: true });
    };

    const handleCancel = (req) => {
        Swal.fire({
            title: 'Batalkan Pengajuan UC?',
            text: `Apakah Anda yakin ingin membatalkan pengajuan ${req.request_number}? Pengajuan ini tidak akan diproses lebih lanjut.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Kembali',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('requests.uc.cancel', req.id), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Dibatalkan!',
                            text: 'Pengajuan UC berhasil dibatalkan.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            customClass: { popup: 'rounded-2xl' }
                        });
                    }
                });
            }
        });
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const allFiles = [...resultData.receipt_photos, ...newFiles];
        setResultData('receipt_photos', allFiles);
        
        const newUrls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newUrls]);
    };

    const removeFile = (indexToRemove) => {
        const newFiles = resultData.receipt_photos.filter((_, index) => index !== indexToRemove);
        setResultData('receipt_photos', newFiles);
        
        const newUrls = previewUrls.filter((_, index) => index !== indexToRemove);
        setPreviewUrls(newUrls);
    };

    const formatRupiah = (val) => {
        if (!val && val !== 0) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const getRequestTotal = (req) => {
        if (req.approved_gas_cost) return Number(req.approved_gas_cost);
        if (req.items && req.items.length > 0) {
            return req.items.reduce((sum, item) => sum + (Number(item.total_cost) || (Number(item.quantity || 1) * Number(item.estimated_cost || 0))), 0);
        }
        return 0;
    };

    const getStatusInfo = (req) => {
        const s = req.status || 'Menunggu';
        if (s === 'Selesai') {
            return { label: 'ACC (Selesai)', color: 'text-emerald-700' };
        }
        if (s === 'Selesai / Result Dikirim') {
            return { label: 'Result Dikirim', color: 'text-indigo-600' };
        }
        if (s === 'Disetujui' || s === 'ACC') {
            return { label: req.result_report ? 'Result Dikirim' : 'ACC (Disetujui)', color: req.result_report ? 'text-indigo-600' : 'text-emerald-700' };
        }
        if (s === 'Ditolak' || s === 'Tolak') {
            return { label: 'Ditolak', color: 'text-rose-600' };
        }
        if (s === 'Dibatalkan' || s === 'Batal') {
            return { label: 'Dibatalkan', color: 'text-gray-500' };
        }
        if (s === 'Direvisi' || s === 'Revisi') {
            return { label: 'Direvisi', color: 'text-amber-600' };
        }
        if (s === 'Dicairkan') {
            return { label: 'Dicairkan', color: 'text-blue-600' };
        }
        return { label: 'Menunggu Persetujuan', color: 'text-yellow-600' };
    };

    const counts = {
        semua: requests.length,
        menunggu: requests.filter(r => !r.status || r.status === 'Menunggu' || r.status === 'Pending').length,
        disetujui: requests.filter(r => (r.status === 'Disetujui' || r.status === 'ACC') && !r.result_report).length,
        direvisi: requests.filter(r => r.status === 'Direvisi' || r.status === 'Revisi').length,
        ditolak: requests.filter(r => r.status === 'Ditolak' || r.status === 'Tolak').length,
        dibatalkan: requests.filter(r => r.status === 'Dibatalkan' || r.status === 'Batal').length,
        selesai: requests.filter(r => r.status === 'Selesai' || r.status === 'Selesai / Result Dikirim' || (Boolean(r.result_report) && (r.status === 'Disetujui' || r.status === 'ACC'))).length,
    };

    const filteredRequests = requests.filter(req => {
        const s = req.status || 'Menunggu';
        if (selectedTab === 'Menunggu') return !req.status || s === 'Menunggu' || s === 'Pending';
        if (selectedTab === 'Disetujui') return (s === 'Disetujui' || s === 'ACC') && !req.result_report;
        if (selectedTab === 'Direvisi') return s === 'Direvisi' || s === 'Revisi';
        if (selectedTab === 'Ditolak') return s === 'Ditolak' || s === 'Tolak';
        if (selectedTab === 'Dibatalkan') return s === 'Dibatalkan' || s === 'Batal';
        if (selectedTab === 'Selesai') return s === 'Selesai' || s === 'Selesai / Result Dikirim' || (Boolean(req.result_report) && (s === 'Disetujui' || s === 'ACC'));
        return true;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Riwayat & Result UC</h2>}
        >
            <Head title="Riwayat & Result UC" />

            <div className="pb-6 pt-0 space-y-8">

                {/* Siapa yang Sedang UC Hari Ini */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <PlaneTakeoff className="text-blue-600" /> Sedang UC Hari Ini
                        </h3>
                    </div>

                    {activeUcs.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                            <p>Tidak ada UC hari ini</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeUcs.map(uc => (
                                <div key={uc.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div 
                                        className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition-colors"
                                        onClick={() => setExpandedActiveUc(expandedActiveUc === uc.id ? null : uc.id)}
                                    >
                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {uc.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{uc.user?.name}</h4>
                                                <p className="text-xs text-gray-500">{uc.department} - {uc.destination_city}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600">Sedang Berlangsung</span>
                                    </div>
                                    
                                    {expandedActiveUc === uc.id && (
                                        <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2">
                                            <div>
                                                <p className="text-gray-500 mb-1">Tanggal</p>
                                                <p className="font-semibold text-gray-800"><Calendar className="inline w-4 h-4 mr-1 text-gray-400"/> {uc.departure_date} s/d {uc.return_date}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">Durasi & Kendaraan</p>
                                                <p className="font-semibold text-gray-800">{uc.estimated_days} Hari - {uc.transport_type} {uc.vehicle_number ? `(${uc.vehicle_number})` : ''}</p>
                                            </div>
                                            <div className="col-span-1 md:col-span-2 mt-2">
                                                <p className="text-gray-500 mb-1">Pendamping</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {uc.companions && uc.companions.length > 0 ? (
                                                        uc.companions.map((comp, idx) => (
                                                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
                                                                {comp}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 italic">Tidak ada pendamping</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-50 flex justify-end">
                                                <ExportDropdown 
                                                    pdfRoute={route('requests.uc.pdf', { id: uc.id, without_result: 1 })}
                                                    trigger={
                                                        <button 
                                                            type="button"
                                                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                            title="Pratinjau & Unduh PDF Formulir UC (Tanpa Result)"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" /> Unduh PDF UC
                                                        </button>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Daftar Riwayat Pengajuan UC */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5 border-b border-gray-50 pb-4">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                <FileCheck className="text-blue-600" /> Riwayat Pengajuan UC
                            </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="w-full">
                                <ExportDropdown pdfRoute={route('requests.uc.export.pdf')} excelRoute={route('requests.uc.export.excel')} className="w-full justify-center" />
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs Status */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-gray-100">
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Semua')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                                selectedTab === 'Semua' 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Semua ({counts.semua})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Menunggu')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                                selectedTab === 'Menunggu' 
                                    ? 'bg-yellow-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Menunggu ({counts.menunggu})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Disetujui')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                                selectedTab === 'Disetujui' 
                                    ? 'bg-emerald-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            ACC ({counts.disetujui})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Direvisi')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                                selectedTab === 'Direvisi' 
                                    ? 'bg-amber-500 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Direvisi ({counts.direvisi})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Ditolak')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                                selectedTab === 'Ditolak' 
                                ? 'bg-rose-600 text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Ditolak ({counts.ditolak})
                        </button>
                        {counts.dibatalkan > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedTab('Dibatalkan')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                                    selectedTab === 'Dibatalkan' 
                                        ? 'bg-gray-600 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Dibatalkan ({counts.dibatalkan})
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setSelectedTab('Selesai')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                                selectedTab === 'Selesai' 
                                    ? 'bg-emerald-700 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Selesai ({counts.selesai})
                        </button>
                    </div>

                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <PlaneTakeoff className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Tidak ada data riwayat pengajuan {selectedTab !== 'Semua' ? `dengan status ${selectedTab}` : 'UC'}.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {paginatedRequests.map(req => {
                                const stInfo = getStatusInfo(req);
                                const total = getRequestTotal(req);
                                const isAcc = req.status === 'Disetujui' || req.status === 'ACC' || req.status === 'Dicairkan';
                                const isTolak = req.status === 'Ditolak' || req.status === 'Tolak';
                                const isRevisi = req.status === 'Direvisi' || req.status === 'Revisi';
                                const isDibatalkan = req.status === 'Dibatalkan' || req.status === 'Batal';
                                const isSelesai = req.status === 'Selesai' || req.status === 'Selesai / Result Dikirim' || (Boolean(req.result_report) && isAcc);
                                const canDownloadPdfUc = isAcc || isSelesai || Boolean(req.result_report) || Boolean(req.approved_at);

                                const isOwner = req.user_id === user?.id || req.created_by === user?.id;
                                const isInitialOrPending = !req.status || req.status === 'Menunggu' || req.status === 'Pending' || isRevisi;
                                const isApprovedBeforeResult = isAcc && !req.result_report;

                                const hasResult = Boolean(req.result_report && req.result_report.trim().length > 0);
                                const isResultAcc = req.status === 'Selesai' || (hasResult && (req.status === 'Disetujui' || req.status === 'ACC'));

                                // Jika result sudah diisi atau sudah di-ACC, Edit Pengajuan dan Batalkan TIDAK BISA lagi ditampilkan
                                const canEdit = (isOwner || isAdmin) && !isResultAcc && !hasResult && (isInitialOrPending || isApprovedBeforeResult) && !isTolak && !isDibatalkan;
                                const canCancel = (isOwner || isAdmin) && !isResultAcc && !hasResult && (isInitialOrPending || isApprovedBeforeResult) && !isTolak && !isDibatalkan;

                                let photos = [];
                                try {
                                    if (req.result_receipts) {
                                        const parsed = JSON.parse(req.result_receipts);
                                        if (Array.isArray(parsed)) photos = parsed;
                                    }
                                } catch (e) {}

                                const isExpanded = expandedRequest === req.id || selectedUc === req.id;

                                return (
                                    <div key={req.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white transition-all">
                                        {/* Header Ringkasan: Nama sales, tujuan, berapa hari (Klik untuk buka/tutup) */}
                                        <div 
                                            className="p-4 bg-gray-50 hover:bg-gray-100/80 cursor-pointer flex justify-between items-center transition-colors select-none"
                                            onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {req.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{req.user?.name || '-'}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                        <span>Tujuan: <strong className="text-gray-700 capitalize">{req.destination_city || '-'}</strong></span>
                                                        <span>•</span>
                                                        <span className="font-medium text-gray-600">{req.estimated_days || 0} Hari</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="text-right">
                                                    <span className={`text-xs ${stInfo.color} font-semibold block`}>
                                                        {stInfo.label}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-900 block mt-0.5">
                                                        {formatRupiah(total)}
                                                    </span>
                                                </div>
                                                <div className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}>
                                                    <ChevronDown className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rincian Lengkap Saat Ditekan */}
                                        {isExpanded && (
                                            <div className="p-5 border-t border-gray-100 bg-white space-y-4 animate-in slide-in-from-top-2">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-gray-100">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-gray-900 text-sm">{req.request_number}</span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-600">{req.user?.name} ({req.department})</span>
                                                            {req.entity && (
                                                                <>
                                                                    <span className="text-xs text-gray-400">•</span>
                                                                    <span className="text-xs text-gray-500">{req.entity}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <h4 className="font-bold text-base text-gray-800 mt-1 capitalize">Tujuan: {req.destination_city}</h4>
                                                        {req.description && (
                                                            <p className="text-xs text-gray-600 mt-0.5"><span className="font-medium text-gray-500">Keterangan:</span> {req.description}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                            {req.departure_date} s/d {req.return_date} ({req.estimated_days} Hari)
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Transportasi: <strong className="text-gray-700">{req.transport_type || '-'}</strong> {req.vehicle_number ? `(${req.vehicle_number})` : ''}
                                                        </p>
                                                    </div>
                                                    <div className="text-left md:text-right w-full md:w-auto">
                                                        <div className="text-xs text-gray-400 mb-0.5">Status Pengajuan:</div>
                                                        <span className={`text-sm ${stInfo.color} block`}>
                                                            {stInfo.label}
                                                        </span>
                                                        <div className="text-xs font-bold text-gray-900 mt-1">
                                                            {formatRupiah(total)}
                                                        </div>
                                                        {req.payment_option && (
                                                            <div className="text-[11px] text-gray-500 font-medium">
                                                                {req.payment_option}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Pendamping jika ada */}
                                                {req.companions && req.companions.length > 0 && (
                                                    <div className="text-xs">
                                                        <span className="text-gray-400 block mb-1">Pendamping:</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {req.companions.map((comp, idx) => (
                                                                <span key={idx} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                                    {comp}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Rincian Item Estimasi Biaya */}
                                                {req.items && req.items.length > 0 && (
                                                    <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100 text-xs">
                                                        <span className="font-bold text-gray-700 block mb-1.5">Rincian Item Estimasi Biaya:</span>
                                                        <div className="space-y-1">
                                                            {req.items.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between items-center text-gray-600">
                                                                    <span>{item.item_name} <span className="text-gray-400">({item.quantity}x @{formatRupiah(item.estimated_cost)})</span></span>
                                                                    <span className="font-semibold text-gray-800">{formatRupiah(item.total_cost || (item.quantity * item.estimated_cost))}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Catatan Finance / Alasan Penolakan / Catatan Revisi */}
                                                {req.finance_note && (
                                                    <div className={`p-3 rounded-xl text-xs border ${
                                                        isTolak 
                                                            ? 'bg-rose-50 border-rose-200 text-rose-800' 
                                                            : (isRevisi 
                                                                ? 'bg-amber-50 border-amber-200 text-amber-800' 
                                                                : 'bg-gray-50 border-gray-200 text-gray-800')
                                                    }`}>
                                                        <span className="font-bold block mb-0.5">
                                                            {isTolak ? 'Alasan Penolakan:' : (isRevisi ? 'Catatan Revisi:' : 'Catatan Finance:')}
                                                        </span>
                                                        <p className="whitespace-pre-wrap">{req.finance_note}</p>
                                                    </div>
                                                )}

                                                {/* Aksi Bar */}
                                                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Tombol Isi Result & Nota jika sudah di-ACC dan belum ada result */}
                                                {isAcc && !req.result_report && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => openResultForm(req)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                                                    >
                                                        {selectedUc === req.id ? 'Tutup Form Result' : 'Isi Result & Nota'}
                                                    </button>
                                                )}

                                                {/* Tombol Edit Pengajuan jika masih dalam daftar pengajuan / belum di-ACC result */}
                                                {canEdit && (
                                                    <Link 
                                                        href={route('uc-requests.edit', req.id)}
                                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                                                        title="Edit Data Pengajuan UC"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Edit Pengajuan
                                                    </Link>
                                                )}

                                                {/* Tombol Batalkan jika masih dalam daftar pengajuan / belum di-ACC result */}
                                                {canCancel && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleCancel(req)}
                                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                                                        title="Batalkan Pengajuan UC"
                                                    >
                                                        <Ban className="w-3.5 h-3.5" /> Batalkan
                                                    </button>
                                                )}

                                                {/* Jika result direvisi */}
                                                {isRevisi && req.result_report && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => openResultForm(req)}
                                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                                                    >
                                                        {selectedUc === req.id ? 'Tutup Form' : 'Perbaiki Result & Nota'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Tombol Unduh PDF dengan Pratinjau Data */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Unduh PDF Formulir UC Saja (Tanpa Result) - Selalu bisa diunduh jika sudah ACC / Selesai */}
                                                {canDownloadPdfUc && (
                                                    <ExportDropdown 
                                                        pdfRoute={route('requests.uc.pdf', { id: req.id, without_result: 1 })}
                                                        trigger={
                                                            <button 
                                                                type="button"
                                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                                title="Pratinjau & Unduh PDF Formulir UC saja tanpa lampiran result"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> Unduh PDF UC
                                                            </button>
                                                        }
                                                    />
                                                )}

                                                {/* Unduh PDF Formulir UC Lengkap (+ Result & Nota) jika ada result */}
                                                {(isSelesai || req.result_report) && (
                                                    <ExportDropdown 
                                                        pdfRoute={route('requests.uc.pdf', req.id)}
                                                        trigger={
                                                            <button 
                                                                type="button"
                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                                title="Pratinjau & Unduh PDF Formulir UC lengkap (+ Result & Nota)"
                                                            >
                                                                <FileCheck className="w-3.5 h-3.5" /> Unduh PDF + Result
                                                            </button>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Form Input Result & Nota */}
                                        {selectedUc === req.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                                                <form onSubmit={(e) => submitResult(e, req.id)} className="space-y-4">
                                                    <div>
                                                        <InputLabel value="Hasil Result UC *" />
                                                        <textarea 
                                                            className="mt-1 block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                            rows="3"
                                                            value={resultData.result_summary}
                                                            onChange={(e) => setResultData('result_summary', e.target.value)}
                                                            placeholder="Tuliskan ringkasan hasil kegiatan dan agenda perjalanan dinas..."
                                                        ></textarea>
                                                        <InputError message={resultErrors.result_summary} className="mt-2" />
                                                    </div>

                                                    {/* Kolom Finansial: Total Nota, Dibayarkan, Reimburse Sisa Dana, Pengembalian Dana */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                                                        <div>
                                                            <InputLabel value="Total Nota *" />
                                                            <div className="mt-1">
                                                                <CurrencyInput
                                                                    value={resultData.total_nota}
                                                                    onChange={handleTotalNotaChange}
                                                                    placeholder="0"
                                                                    className="rounded-xl border-gray-200"
                                                                    required
                                                                />
                                                            </div>
                                                            <InputError message={resultErrors.total_nota} className="mt-1" />
                                                        </div>

                                                        <div>
                                                            <InputLabel value="Dibayarkan *" />
                                                            <div className="mt-1">
                                                                <CurrencyInput
                                                                    value={resultData.dibayarkan}
                                                                    onChange={handleDibayarkanChange}
                                                                    placeholder="0"
                                                                    className="rounded-xl border-gray-200"
                                                                    required
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 mt-1">
                                                                Dana awal yang diterima (Panjar / Full)
                                                            </p>
                                                            <InputError message={resultErrors.dibayarkan} className="mt-1" />
                                                        </div>

                                                        <div>
                                                            <InputLabel value="Reimburse Sisa Dana" />
                                                            <div className="mt-1">
                                                                <CurrencyInput
                                                                    value={resultData.reimburse_sisa_dana}
                                                                    onChange={(val) => setResultData('reimburse_sisa_dana', val)}
                                                                    placeholder="0"
                                                                    className="rounded-xl border-gray-200 bg-emerald-50/50 font-bold text-emerald-800"
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-emerald-700 mt-1">
                                                                (Otomatis terisi jika Total Nota &gt; Dibayarkan)
                                                            </p>
                                                            <InputError message={resultErrors.reimburse_sisa_dana} className="mt-1" />
                                                        </div>

                                                        <div>
                                                            <InputLabel value="Pengembalian Dana" />
                                                            <div className="mt-1">
                                                                <CurrencyInput
                                                                    value={resultData.pengembalian_dana}
                                                                    onChange={(val) => setResultData('pengembalian_dana', val)}
                                                                    placeholder="0"
                                                                    className="rounded-xl border-gray-200 bg-blue-50/50 font-bold text-blue-800"
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-blue-700 mt-1">
                                                                (Otomatis terisi jika Dibayarkan &gt; Total Nota)
                                                            </p>
                                                            <InputError message={resultErrors.pengembalian_dana} className="mt-1" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <InputLabel value="Upload Foto Nota (Bisa lebih dari 1) *" />
                                                        <div className="mt-1 flex items-center justify-center w-full">
                                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk memilih beberapa foto nota</span></p>
                                                                    <p className="text-xs text-gray-500">Format: PNG, JPG (Tersimpan otomatis)</p>
                                                                </div>
                                                                <input 
                                                                    type="file" 
                                                                    className="hidden" 
                                                                    multiple 
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                />
                                                            </label>
                                                        </div>
                                                        {previewUrls.length > 0 && (
                                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {previewUrls.map((url, i) => (
                                                                    <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square shadow-sm group">
                                                                        <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeFile(i)}
                                                                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {resultData.receipt_photos.length > 0 && (
                                                            <p className="text-sm font-bold text-emerald-600 mt-3 flex items-center gap-1">
                                                                <FileImage className="w-4 h-4"/> {resultData.receipt_photos.length} file nota dipilih
                                                            </p>
                                                        )}
                                                        <InputError message={resultErrors.receipt_photos} className="mt-2" />
                                                    </div>

                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedUc(null)}
                                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                                                        >
                                                            Batal
                                                        </button>
                                                        <PrimaryButton disabled={resultProcessing}>
                                                            Kirim Laporan Result
                                                        </PrimaryButton>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Tampilan Result jika sudah pernah dikirim */}
                                        {req.result_report && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50/70 p-4 rounded-xl space-y-3">
                                                <div>
                                                    <div className="text-xs font-bold text-gray-700 mb-1">Hasil Perjalanan / Result:</div>
                                                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{req.result_report}</p>
                                                </div>

                                                {/* Rekap Finansial Nota */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200 text-xs">
                                                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                                                        <span className="text-gray-500 block text-[11px]">Total Nota:</span>
                                                        <span className="font-bold text-gray-900">{formatRupiah(req.total_nota)}</span>
                                                    </div>
                                                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                                                        <span className="text-gray-500 block text-[11px]">Dibayarkan:</span>
                                                        <span className="font-bold text-gray-900">{formatRupiah(req.dibayarkan)}</span>
                                                    </div>
                                                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                                                        <span className="text-gray-500 block text-[11px]">Reimburse Sisa Dana:</span>
                                                        <span className={`font-bold ${Number(req.reimburse_sisa_dana) > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                                                            {formatRupiah(req.reimburse_sisa_dana)}
                                                        </span>
                                                    </div>
                                                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                                                        <span className="text-gray-500 block text-[11px]">Pengembalian Dana:</span>
                                                        <span className={`font-bold ${Number(req.pengembalian_dana) > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                                                            {formatRupiah(req.pengembalian_dana)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {photos.length > 0 && (
                                                    <div className="pt-2 border-t border-gray-200 flex gap-2 flex-wrap items-center">
                                                        <span className="text-xs text-gray-500 font-medium">Bukti Nota:</span>
                                                        {photos.map((photo, i) => {
                                                            const photoUrl = photo.startsWith('http') 
                                                                ? (photo.includes('i.ibb.co') ? `https://wsrv.nl/?url=${encodeURIComponent(photo)}` : photo)
                                                                : `/storage/${photo}`;
                                                            return (
                                                                <button 
                                                                    key={i} 
                                                                    type="button"
                                                                    onClick={() => setPreviewImage({ url: photoUrl, title: `Nota ${i + 1} (${req.destination_city || ''})` })}
                                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                >
                                                                    [Lihat Nota {i + 1}]
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 border-t border-gray-100">
                            <ClientPagination
                                total={filteredRequests.length}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                                perPageOptions={[10, 20, 50, 100]}
                                alwaysShow={true}
                            />
                        </div>
                    </>
                    )}
                </div>

            </div>

            {/* Modal Pop-up Lihat Nota */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
                    onClick={() => setPreviewImage(null)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                                <FileImage className="w-5 h-5 text-blue-500" />
                                {previewImage.title || 'Foto Nota'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a 
                                    href={previewImage.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
                                </a>
                                <button 
                                    type="button" 
                                    onClick={() => setPreviewImage(null)} 
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
                                    title="Tutup"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 overflow-auto flex items-center justify-center bg-gray-900/5 min-h-[300px]">
                            <img 
                                src={previewImage.url} 
                                alt={previewImage.title || 'Nota'} 
                                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-sm border border-gray-200 bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
