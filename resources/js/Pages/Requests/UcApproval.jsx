import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportDropdown from '@/Components/ExportDropdown';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { FileCheck, Edit3, X, Loader2, Trash2, Edit, CheckCircle, RotateCcw, XCircle, FileImage, ExternalLink, PlaneTakeoff, FileText, CheckCircle2, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomSelect from '@/Components/CustomSelect';
import CurrencyInput from '@/Components/CurrencyInput';
import InputError from '@/Components/InputError';

export default function UcApproval({ requests, isAdmin }) {
    const user = usePage().props.auth.user;
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [modalSource, setModalSource] = useState('uc');

    const { data, setData, post, processing, reset, errors, transform } = useForm({
        status: '',
        items: [],
        approved_gas_cost: '',
        approved_meals_cost: '',
        approved_accommodation_cost: '',
        finance_note: '',
    });

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);
    };

    const calculateItemsTotal = (items) => {
        if (!items || !items.length) return 0;
        return items.reduce((sum, item) => sum + (parseFloat(item.total_cost || (item.quantity * item.estimated_cost)) || 0), 0);
    };

    const getRequestTotal = (req) => {
        if (!req) return 0;
        if (req.items && req.items.length > 0) {
            return calculateItemsTotal(req.items);
        }
        return (parseFloat(req.estimated_gas_cost) || 0) +
               (parseFloat(req.estimated_meals_cost) || 0) +
               (parseFloat(req.estimated_accommodation_cost) || 0) +
               (parseFloat(req.flight_ticket_cost) || 0) +
               (parseFloat(req.ship_ticket_cost) || 0);
    };

    const isCompletedResult = (req) => {
        if (!req) return false;
        return req.status === 'Selesai';
    };

    const isUcInitialPending = (req) => {
        if (!req) return false;
        if (isCompletedResult(req)) return false;
        if (req.status === 'Disetujui' || req.status === 'ACC' || req.status === 'Selesai / Result Dikirim') {
            return false;
        }
        if (req.result_report && req.result_report.trim().length > 0) {
            return false;
        }
        return true;
    };

    const isResultPending = (req) => {
        if (!req) return false;
        return !isCompletedResult(req) && !isUcInitialPending(req);
    };

    const isResult = (req) => {
        if (!req) return false;
        return isResultPending(req) || isCompletedResult(req) || Boolean(req.result_report);
    };

    const ucRequests = (requests || []).filter(isUcInitialPending);
    const pendingResultRequests = (requests || []).filter(isResultPending);
    const completedResultRequests = (requests || []).filter(isCompletedResult);

    const openModal = (req, defaultStatus = null, source = null) => {
        setSelectedRequest(req);
        const determinedSource = source || (isCompletedResult(req) ? 'completed' : (isResultPending(req) ? 'result' : 'uc'));
        setModalSource(determinedSource);

        let initialItems = [];
        if (req.items && req.items.length > 0) {
            initialItems = req.items.map(item => ({
                item_name: item.item_name || '',
                quantity: item.quantity || 1,
                estimated_cost: item.estimated_cost || 0,
            }));
        } else {
            if (req.estimated_gas_cost) {
                initialItems.push({ item_name: 'BBM / Bensin', quantity: 1, estimated_cost: req.estimated_gas_cost });
            }
            if (req.estimated_meals_cost) {
                initialItems.push({ item_name: 'Uang Makan / Konsumsi', quantity: 1, estimated_cost: req.estimated_meals_cost });
            }
            if (req.estimated_accommodation_cost) {
                initialItems.push({ item_name: 'Penginapan / Hotel', quantity: 1, estimated_cost: req.estimated_accommodation_cost });
            }
            if (req.flight_ticket_cost) {
                initialItems.push({ item_name: 'Tiket Pesawat', quantity: 1, estimated_cost: req.flight_ticket_cost });
            }
            if (req.ship_ticket_cost) {
                initialItems.push({ item_name: 'Tiket Kapal', quantity: 1, estimated_cost: req.ship_ticket_cost });
            }
            if (initialItems.length === 0) {
                initialItems = [{ item_name: '', quantity: 1, estimated_cost: 0 }];
            }
        }

        let initialStatus = defaultStatus;
        if (!initialStatus) {
            if (req.status === 'Ditolak' || req.status === 'Tolak') {
                initialStatus = 'Ditolak';
            } else if (req.status === 'Direvisi' || req.status === 'Revisi') {
                initialStatus = 'Direvisi';
            } else if (determinedSource === 'result' || req.status === 'Selesai') {
                initialStatus = 'Selesai';
            } else {
                initialStatus = 'Disetujui';
            }
        }

        setData({
            status: initialStatus,
            items: initialItems,
            approved_gas_cost: req.approved_gas_cost || '',
            approved_meals_cost: req.approved_meals_cost || '',
            approved_accommodation_cost: req.approved_accommodation_cost || '',
            finance_note: req.finance_note || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        reset();
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;
        setData('items', updated);
    };

    const addItem = () => {
        setData('items', [...data.items, { item_name: '', quantity: 1, estimated_cost: 0 }]);
    };

    const removeItem = (index) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_, i) => i !== index));
        }
    };

    const currentTotalApproved = (data.items || []).reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const cost = parseFloat(item.estimated_cost) || 0;
        return sum + (qty * cost);
    }, 0);

    const submitApproval = (statusChoice) => {
        let finalStatus = statusChoice || data.status || 'Disetujui';

        if (modalSource === 'result' && (finalStatus === 'Disetujui' || finalStatus === 'ACC')) {
            finalStatus = 'Selesai';
        }

        setData('status', finalStatus);
        transform((currData) => ({
            ...currData,
            status: finalStatus,
        }));

        post(route('requests.uc.approval.update', selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                let label = 'disetujui (ACC)';
                if (finalStatus === 'Selesai') {
                    label = 'disetujui selesai (ACC)';
                } else if (finalStatus === 'Direvisi' || finalStatus === 'Revisi') {
                    label = 'diminta revisi';
                } else if (finalStatus === 'Ditolak' || finalStatus === 'Tolak') {
                    label = 'ditolak';
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: `Pengajuan UC berhasil ${label}`,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const deleteRequest = (id) => {
        Swal.fire({
            title: 'Hapus Pengajuan UC?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('uc-requests.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Pengajuan UC berhasil dihapus.', 'success');
                    }
                });
            }
        });
    };

    const getStatusText = (req, context = 'uc') => {
        if (!req) return { label: '-', color: 'text-gray-500 font-bold' };
        const s = typeof req === 'string' ? req : (req.status || 'Menunggu');

        if (context === 'completed' || s === 'Selesai') {
            return { label: 'ACC (Selesai)', color: 'text-emerald-700 font-bold' };
        }
        if (context === 'result' || (typeof req === 'object' && isResultPending(req))) {
            if (s === 'Selesai / Result Dikirim') {
                return { label: 'Result Dikirim', color: 'text-indigo-600 font-bold' };
            }
            if (s === 'Direvisi' || s === 'Revisi') {
                return { label: 'Result Direvisi', color: 'text-amber-600 font-bold' };
            }
            if (s === 'Ditolak' || s === 'Tolak') {
                return { label: 'Result Ditolak', color: 'text-rose-600 font-bold' };
            }
            if (typeof req === 'object' && req.result_report && req.result_report.trim().length > 0) {
                return { label: 'Result Dikirim', color: 'text-indigo-600 font-bold' };
            }
            return { label: 'ACC (Menunggu Result)', color: 'text-blue-600 font-bold' };
        }
        if (s === 'Disetujui' || s === 'ACC') {
            return { label: 'ACC', color: 'text-emerald-700 font-bold' };
        }
        if (s === 'Ditolak' || s === 'Tolak') {
            return { label: 'Tolak', color: 'text-rose-600 font-bold' };
        }
        if (s === 'Direvisi' || s === 'Revisi') {
            return { label: 'Revisi', color: 'text-amber-600 font-bold' };
        }
        if (s === 'Dicairkan') {
            return { label: 'Dicairkan', color: 'text-blue-600 font-bold' };
        }
        return { label: s, color: 'text-amber-600 font-bold' };
    };

    const handleRowAction = (req, actionType, source = 'uc') => {
        const isResultSource = source === 'result';
        const reqLabel = isResultSource ? 'Result UC' : 'Pengajuan UC';

        if (actionType === 'Disetujui') {
            const nextStatus = isResultSource ? 'Selesai' : 'Disetujui';
            const actionTitle = isResultSource ? 'ACC Result UC?' : 'ACC Pengajuan UC?';
            const actionText = isResultSource 
                ? 'Result UC akan disetujui dan dipindahkan ke Daftar UC Selesai (ACC).'
                : 'Pengajuan UC akan disetujui dan dipindahkan ke Daftar Pengajuan Result.';

            Swal.fire({
                title: actionTitle,
                html: `
                    <div class="text-left text-sm space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p><span class="text-gray-500">No. Request:</span> <strong>${req.request_number}</strong></p>
                        <p><span class="text-gray-500">Pengaju:</span> <strong>${req.user?.name || '-'}</strong> (${req.department || '-'})</p>
                        <p><span class="text-gray-500">Tujuan:</span> <strong>${req.destination_city || '-'}</strong></p>
                        <p><span class="text-gray-500">Total Biaya:</span> <strong>${formatRupiah(req.approved_gas_cost || getRequestTotal(req))}</strong></p>
                        ${req.result_report ? `<p><span class="text-gray-500">Laporan:</span> <span class="italic text-gray-700 block mt-0.5 line-clamp-2">${req.result_report}</span></p>` : ''}
                        <p class="text-xs text-blue-600 font-medium pt-1">${actionText}</p>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonColor: '#059669',
                denyButtonColor: '#2563eb',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, ACC Sekarang',
                denyButtonText: 'Periksa / Ubah Rincian',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.post(route('requests.uc.approval.update', req.id), {
                        status: nextStatus,
                        items: req.items && req.items.length > 0 ? req.items : undefined,
                        approved_gas_cost: req.approved_gas_cost || getRequestTotal(req),
                        finance_note: req.finance_note || '',
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: `${reqLabel} berhasil di-ACC`,
                                timer: 1500,
                                showConfirmButton: false
                            });
                        }
                    });
                } else if (result.isDenied) {
                    openModal(req, nextStatus, source);
                }
            });
        } else if (actionType === 'Ditolak') {
            Swal.fire({
                title: `Tolak ${reqLabel}?`,
                text: `${reqLabel} ${req.request_number} dari ${req.user?.name || '-'} akan ditolak.`,
                input: 'textarea',
                inputPlaceholder: 'Tuliskan alasan penolakan di sini...',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, Tolak',
                cancelButtonText: 'Batal',
                inputValidator: (val) => {
                    if (!val || !val.trim()) {
                        return 'Alasan penolakan wajib diisi!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    router.post(route('requests.uc.approval.update', req.id), {
                        status: 'Ditolak',
                        finance_note: result.value || req.finance_note || '',
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: `${reqLabel} berhasil ditolak`,
                                timer: 1500,
                                showConfirmButton: false
                            });
                        }
                    });
                }
            });
        } else if (actionType === 'Direvisi') {
            Swal.fire({
                title: `Minta Revisi ${reqLabel}?`,
                text: `Masukkan catatan bagian yang perlu direvisi untuk ${req.request_number}:`,
                input: 'textarea',
                inputPlaceholder: 'Tuliskan rincian apa yang perlu diperbaiki...',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Kirim Revisi',
                cancelButtonText: 'Batal',
                inputValidator: (val) => {
                    if (!val || !val.trim()) {
                        return 'Catatan revisi wajib diisi!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    router.post(route('requests.uc.approval.update', req.id), {
                        status: 'Direvisi',
                        finance_note: result.value,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: `Permintaan revisi ${reqLabel} berhasil dikirim`,
                                timer: 1500,
                                showConfirmButton: false
                            });
                        }
                    });
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Persetujuan UC</h2>}
        >
            <Head title="Persetujuan UC" />

            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <FileCheck className="text-blue-600 w-6 h-6" /> Persetujuan UC
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <ExportDropdown pdfRoute={route('requests.uc.approval.export.pdf')} excelRoute={route('requests.uc.approval.export.excel')} />
                    </div>
                </div>

                {/* 2 Card Containers Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                    
                    {/* CONTAINER 1 (Kiri): DAFTAR PENGAJUAN UC */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-w-0">
                        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                    <PlaneTakeoff className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-gray-800">Daftar Pengajuan UC</h3>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-500 shrink-0">
                                {ucRequests.length} Pengajuan
                            </span>
                        </div>

                        {ucRequests.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                                <PlaneTakeoff className="w-10 h-10 mx-auto mb-2 opacity-25" />
                                <p className="text-sm font-medium">Belum ada data pengajuan biaya UC.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 rounded-xl">
                                        <tr>
                                            <th className="px-3.5 py-3 rounded-l-xl">Pengaju</th>
                                            <th className="px-3.5 py-3">Tujuan</th>
                                            <th className="px-3.5 py-3">Est. Biaya</th>
                                            <th className="px-3.5 py-3">Status</th>
                                            <th className="px-3.5 py-3 rounded-r-xl text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {ucRequests.map((req) => {
                                            const totalEst = getRequestTotal(req);
                                            const st = getStatusText(req, 'uc');
                                            return (
                                                <tr 
                                                    key={req.id} 
                                                    onClick={() => openModal(req, null, 'uc')}
                                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                                    title="Klik baris untuk Review Pengajuan"
                                                >
                                                    <td className="px-3.5 py-3">
                                                        <span className="font-bold text-gray-900 block text-xs sm:text-sm">{req.user?.name || '-'}</span>
                                                        <span className="text-[11px] text-gray-500 block">{req.department || '-'}</span>
                                                    </td>
                                                    <td className="px-3.5 py-3">
                                                        <span className="font-semibold text-gray-800 block text-xs sm:text-sm capitalize">{req.destination_city}</span>
                                                        <span className="text-xs text-gray-500 block">{req.estimated_days} Hari</span>
                                                    </td>
                                                    <td className="px-3.5 py-3">
                                                        <div className="font-bold text-gray-900 text-xs sm:text-sm">
                                                            {formatRupiah(totalEst)}
                                                        </div>
                                                        {req.payment_option && (
                                                            <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                                                                {req.payment_option}
                                                            </div>
                                                        )}
                                                        {req.approved_gas_cost && req.approved_gas_cost != totalEst && (
                                                            <div className="text-[11px] text-green-600 font-semibold mt-0.5">
                                                                Rev: {formatRupiah(req.approved_gas_cost)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-3">
                                                        <span className={`text-xs ${st.color}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-3.5 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex flex-col items-stretch gap-1 w-full max-w-[64px] mx-auto">
                                                            <button 
                                                                type="button" 
                                                                onClick={(e) => { e.stopPropagation(); handleRowAction(req, 'Disetujui', 'uc'); }} 
                                                                className="w-full py-1 px-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all text-center"
                                                            >
                                                                ACC
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                onClick={(e) => { e.stopPropagation(); handleRowAction(req, 'Ditolak', 'uc'); }} 
                                                                className="w-full py-1 px-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all text-center"
                                                            >
                                                                Tolak
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                onClick={(e) => { e.stopPropagation(); handleRowAction(req, 'Direvisi', 'uc'); }} 
                                                                className="w-full py-1 px-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all text-center"
                                                            >
                                                                Revisi
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* CONTAINER 2 (Kanan): DAFTAR PENGAJUAN RESULT */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-w-0">
                        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-gray-800">Daftar Pengajuan Result</h3>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-500 shrink-0">
                                {pendingResultRequests.length} Menunggu
                            </span>
                        </div>

                        {pendingResultRequests.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                                <FileText className="w-10 h-10 mx-auto mb-2 opacity-25" />
                                <p className="text-sm font-medium">Belum ada pengajuan result yang menunggu persetujuan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 rounded-xl">
                                        <tr>
                                            <th className="px-3.5 py-3 rounded-l-xl">Pengaju</th>
                                            <th className="px-3.5 py-3">Tujuan</th>
                                            <th className="px-3.5 py-3">Hasil & Bukti Nota</th>
                                            <th className="px-3.5 py-3">Status</th>
                                            <th className="px-3.5 py-3 rounded-r-xl text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pendingResultRequests.map((req) => {
                                            const totalEst = getRequestTotal(req);
                                            const st = getStatusText(req, 'result');
                                            let photos = [];
                                            try {
                                                if (req.result_receipts) {
                                                    const parsed = JSON.parse(req.result_receipts);
                                                    if (Array.isArray(parsed)) photos = parsed;
                                                }
                                            } catch(e) {}

                                            const hasResult = Boolean(
                                                (req.result_report && req.result_report.trim().length > 0) ||
                                                photos.length > 0 ||
                                                req.status === 'Selesai / Result Dikirim'
                                            );
                                            const isWaitingResult = st.label === 'ACC (Menunggu Result)' || !hasResult;

                                            return (
                                                <tr 
                                                    key={req.id} 
                                                    onClick={() => openModal(req, null, 'result')}
                                                    className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                                                    title="Klik baris untuk Review Pengajuan"
                                                >
                                                    <td className="px-3.5 py-3">
                                                        <span className="font-bold text-gray-900 block text-xs sm:text-sm">{req.user?.name || '-'}</span>
                                                        <span className="text-[11px] text-gray-500 block">{req.department || '-'}</span>
                                                    </td>
                                                    <td className="px-3.5 py-3">
                                                        <span className="font-semibold text-gray-800 block text-xs sm:text-sm capitalize">{req.destination_city}</span>
                                                        <span className="text-xs text-gray-500 block">{req.estimated_days} Hari</span>
                                                    </td>
                                                    <td className="px-3.5 py-3 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                                        {req.result_report ? (
                                                            <p className="text-xs text-gray-700 line-clamp-2 mb-1.5" title={req.result_report}>
                                                                {req.result_report}
                                                            </p>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic block mb-1">Menunggu laporan hasil dinas & nota dari pengaju</span>
                                                        )}
                                                        {photos.length > 0 && (
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                {photos.map((photo, i) => {
                                                                    const photoUrl = photo.startsWith('http')
                                                                        ? (photo.includes('i.ibb.co') ? `https://wsrv.nl/?url=${encodeURIComponent(photo)}` : photo)
                                                                        : `/storage/${photo}`;
                                                                    return (
                                                                        <button 
                                                                            key={i} 
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: photoUrl, title: `Nota ${i + 1} (${req.destination_city || ''})` }); }}
                                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                            title="Klik untuk lihat nota pop-up"
                                                                        >
                                                                            [Nota {i + 1}]
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-3">
                                                        <span className={`text-xs ${st.color}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-3.5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        {!isWaitingResult ? (
                                                            <div className="flex flex-col items-stretch gap-1 w-full max-w-[64px] mx-auto">
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); handleRowAction(req, 'Disetujui', 'result'); }} 
                                                                    className="w-full py-1 px-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all text-center"
                                                                >
                                                                    ACC
                                                                </button>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); handleRowAction(req, 'Ditolak', 'result'); }} 
                                                                    className="w-full py-1 px-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all text-center"
                                                                >
                                                                    Tolak
                                                                </button>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); handleRowAction(req, 'Direvisi', 'result'); }} 
                                                                    className="w-full py-1 px-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all text-center"
                                                                >
                                                                    Revisi
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] text-gray-400 italic block leading-tight">
                                                                Menunggu Result
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 3 (Bawah): DAFTAR SELESAI (RESULT SUDAH ACC) */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base sm:text-lg text-gray-800">
                                    Daftar UC Selesai (ACC)
                                </h3>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 shrink-0">
                            {completedResultRequests.length} Selesai
                        </span>
                    </div>

                    {completedResultRequests.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-25" />
                            <p className="text-sm font-medium">Belum ada pengajuan result yang berstatus selesai (ACC).</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 rounded-xl">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-xl">Pengaju</th>
                                        <th className="px-4 py-3">Tujuan</th>
                                        <th className="px-4 py-3">Total Biaya</th>
                                        <th className="px-4 py-3">Hasil & Bukti Nota</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-r-xl text-center">Unduh</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {completedResultRequests.map((req) => {
                                        const totalEst = getRequestTotal(req);
                                        let photos = [];
                                        try {
                                            if (req.result_receipts) {
                                                const parsed = JSON.parse(req.result_receipts);
                                                if (Array.isArray(parsed)) photos = parsed;
                                            }
                                        } catch(e) {}

                                        return (
                                            <tr 
                                                key={req.id} 
                                                onClick={() => openModal(req, null, 'completed')}
                                                className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                                                title="Klik baris untuk Review Pengajuan"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <span className="font-bold text-gray-900 block text-xs sm:text-sm">{req.user?.name || '-'}</span>
                                                    <span className="text-[11px] text-gray-500 block">{req.department || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="font-semibold text-gray-800 block text-xs sm:text-sm capitalize">{req.destination_city}</span>
                                                    <span className="text-xs text-gray-500 block">{req.estimated_days} Hari</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="font-bold text-gray-900 text-xs sm:text-sm">
                                                        {formatRupiah(req.approved_gas_cost || totalEst)}
                                                    </div>
                                                    {req.payment_option && (
                                                        <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                                                            {req.payment_option}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 max-w-xs" onClick={(e) => e.stopPropagation()}>
                                                    {req.result_report ? (
                                                        <p className="text-xs text-gray-700 line-clamp-2 mb-1.5" title={req.result_report}>
                                                            {req.result_report}
                                                        </p>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic block mb-1">-</span>
                                                    )}
                                                    {photos.length > 0 && (
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {photos.map((photo, i) => {
                                                                const photoUrl = photo.startsWith('http')
                                                                    ? (photo.includes('i.ibb.co') ? `https://wsrv.nl/?url=${encodeURIComponent(photo)}` : photo)
                                                                    : `/storage/${photo}`;
                                                                return (
                                                                    <button 
                                                                        key={i} 
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: photoUrl, title: `Nota ${i + 1} (${req.destination_city || ''})` }); }}
                                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                        title="Lihat Nota"
                                                                    >
                                                                        [Nota {i + 1}]
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-xs font-bold text-emerald-700">
                                                        ACC (Selesai)
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <ExportDropdown 
                                                        pdfRoute={route('requests.uc.pdf', req.id)}
                                                        trigger={
                                                            <button 
                                                                type="button"
                                                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                                                title="Unduh PDF Formulir & Bukti UC"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> Unduh PDF
                                                            </button>
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Review */}
            {isModalOpen && selectedRequest && (() => {
                const photos = (() => {
                    try {
                        if (!selectedRequest.result_receipts) return [];
                        const parsed = typeof selectedRequest.result_receipts === 'string'
                            ? JSON.parse(selectedRequest.result_receipts)
                            : selectedRequest.result_receipts;
                        return Array.isArray(parsed) ? parsed : [];
                    } catch (e) {
                        return [];
                    }
                })();

                const isResultReview = modalSource === 'result' || modalSource === 'completed';
                const hasResultData = Boolean(
                    (selectedRequest.result_report && selectedRequest.result_report.trim().length > 0) ||
                    photos.length > 0 ||
                    selectedRequest.status === 'Selesai / Result Dikirim'
                );
                const isResultWaiting = modalSource === 'result' && !hasResultData;

                return (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto pb-10">
                        <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl relative my-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalSource === 'result' ? 'Review Pengajuan Result UC' : (modalSource === 'completed' ? 'Detail Pengajuan UC (Selesai)' : 'Review Pengajuan Biaya UC')}
                                </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); submitApproval(); }} className="p-6">
                            
                            {/* Ringkasan Data Pengajuan */}
                            <div className="bg-gray-50 p-4 rounded-2xl mb-6 text-sm grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-100">
                                <div>
                                    <span className="text-gray-500 block mb-1">Pengaju</span>
                                    <span className="font-semibold text-gray-900">{selectedRequest.user?.name} ({selectedRequest.department})</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Tujuan</span>
                                    <span className="font-semibold text-gray-900">{selectedRequest.destination_city}</span>
                                </div>
                                {selectedRequest.description && (
                                    <div className="sm:col-span-2">
                                        <span className="text-gray-500 block mb-1">Keterangan</span>
                                        <span className="font-semibold text-gray-900 whitespace-pre-wrap">{selectedRequest.description}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500 block mb-1">Jadwal</span>
                                    <span className="font-semibold text-gray-900">{selectedRequest.departure_date} s/d {selectedRequest.return_date} ({selectedRequest.estimated_days} Hari)</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Opsi Pembayaran</span>
                                    <span className="font-semibold text-gray-900">
                                        {selectedRequest.payment_option || 'BAYAR FULL'}
                                    </span>
                                </div>

                                    {modalSource === 'uc' ? (
                                        <>
                                            <div className="sm:col-span-2 pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 uppercase">Total Estimasi Diajukan:</span>
                                                    <div className="text-base font-bold text-gray-900">
                                                        {formatRupiah(getRequestTotal(selectedRequest))}
                                                    </div>
                                                </div>
                                                {selectedRequest.payment_option === 'PANJAR BIAYA 50%' && (
                                                    <div className="sm:text-right">
                                                        <span className="text-xs font-semibold text-amber-700 uppercase">Panjar 50% Yang Diajukan:</span>
                                                        <div className="text-base font-bold text-amber-800">
                                                            {formatRupiah(getRequestTotal(selectedRequest) / 2)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {selectedRequest.items && selectedRequest.items.length > 0 && (
                                                <div className="sm:col-span-2 pt-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Rincian Estimasi Biaya Diajukan</span>
                                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                                        <table className="min-w-full text-xs text-left">
                                                            <thead className="bg-gray-100 text-gray-600 font-semibold">
                                                                <tr>
                                                                    <th className="px-3 py-2">Item</th>
                                                                    <th className="px-3 py-2 text-center">QTY</th>
                                                                    <th className="px-3 py-2 text-right">Biaya Satuan</th>
                                                                    <th className="px-3 py-2 text-right">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {selectedRequest.items.map((it, idx) => (
                                                                    <tr key={idx} className="hover:bg-gray-50/50">
                                                                        <td className="px-3 py-2 text-gray-800 font-medium">{it.item_name}</td>
                                                                        <td className="px-3 py-2 text-center text-gray-600">{it.quantity}</td>
                                                                        <td className="px-3 py-2 text-right text-gray-600">{formatRupiah(it.estimated_cost)}</td>
                                                                        <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatRupiah(it.total_cost || (it.quantity * it.estimated_cost))}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="sm:col-span-2 pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <div>
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Total Biaya Disetujui:</span>
                                                <div className="text-base font-bold text-emerald-800">
                                                    {formatRupiah(selectedRequest.approved_gas_cost || getRequestTotal(selectedRequest))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* KHUSUS RESULT UC: Bagian Laporan Hasil Perjalanan & Bukti Nota */}
                                {isResultReview && (
                                    <div className="space-y-4 mb-6">
                                        {/* Card Hasil Laporan Perjalanan */}
                                        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
                                                <FileText className="w-4 h-4 text-amber-600" />
                                                <span>Hasil Kunjungan / Laporan Perjalanan Dinas:</span>
                                            </div>
                                            <div className="p-3.5 bg-white rounded-xl border border-amber-100 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed shadow-xs min-h-[60px]">
                                                {selectedRequest.result_report ? selectedRequest.result_report : (
                                                    <span className="text-gray-400 italic">Belum ada laporan hasil yang diisi oleh pengaju.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Bukti Nota / Kwitansi */}
                                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                                                    <FileImage className="w-4 h-4 text-blue-600" />
                                                    <span>Bukti Nota / Kwitansi {photos.length > 0 ? `(${photos.length} Nota)` : ''}</span>
                                                </div>
                                                {photos.length > 0 && (
                                                    <span className="text-xs text-blue-600 font-semibold">
                                                        Klik nota untuk melihat foto
                                                    </span>
                                                )}
                                            </div>

                                            {photos.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-gray-400 italic bg-white rounded-xl border border-dashed border-gray-200">
                                                    Tidak ada lampiran bukti nota.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {photos.map((photo, i) => {
                                                            const photoUrl = photo.startsWith('http')
                                                                ? (photo.includes('i.ibb.co') ? `https://wsrv.nl/?url=${encodeURIComponent(photo)}` : photo)
                                                                : `/storage/${photo}`;
                                                            return (
                                                                <button 
                                                                    key={i} 
                                                                    type="button" 
                                                                    onClick={() => setPreviewImage({ url: photoUrl, title: `Nota ${i + 1} (${selectedRequest.destination_city || ''})` })}
                                                                    className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                                                >
                                                                    <FileImage className="w-3.5 h-3.5 text-blue-600" /> [Nota {i + 1}]
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                                                        {photos.map((photo, i) => {
                                                            const photoUrl = photo.startsWith('http')
                                                                ? (photo.includes('i.ibb.co') ? `https://wsrv.nl/?url=${encodeURIComponent(photo)}` : photo)
                                                                : `/storage/${photo}`;
                                                            return (
                                                                <div 
                                                                    key={i} 
                                                                    onClick={() => setPreviewImage({ url: photoUrl, title: `Nota ${i + 1} (${selectedRequest.destination_city || ''})` })}
                                                                    className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
                                                                >
                                                                    <div className="aspect-4/3 w-full bg-gray-100 overflow-hidden relative">
                                                                        <img 
                                                                            src={photoUrl} 
                                                                            alt={`Nota ${i + 1}`} 
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                            loading="lazy"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                                                            <ExternalLink className="w-3.5 h-3.5" /> Buka
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-1.5 text-center bg-white border-t border-gray-100 text-xs font-bold text-gray-700 group-hover:text-blue-600">
                                                                        Nota {i + 1}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            <div className="space-y-4">
                                {modalSource === 'completed' ? (
                                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Pengajuan UC ini telah Selesai (ACC)</span>
                                        </div>
                                        <ExportDropdown 
                                            pdfRoute={route('requests.uc.pdf', selectedRequest.id)} 
                                            trigger={
                                                <button 
                                                    type="button" 
                                                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> Unduh PDF
                                                </button>
                                            }
                                        />
                                    </div>
                                ) : isResultWaiting ? (
                                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-blue-800 text-xs sm:text-sm font-medium">
                                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span>Menunggu pengaju mengisi laporan hasil dinas & bukti nota. Aksi persetujuan result (ACC / Tolak / Revisi) akan tersedia setelah result dikirim.</span>
                                    </div>
                                ) : (
                                    <div>
                                        <InputLabel value="Status Persetujuan" className="mb-2 font-semibold text-gray-700" />
                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setData('status', modalSource === 'result' ? 'Selesai' : 'Disetujui')}
                                                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 border ${
                                                    data.status === 'Disetujui' || data.status === 'ACC' || data.status === 'Selesai'
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                                                }`}
                                            >
                                                <CheckCircle className="w-4 h-4" /> {modalSource === 'result' ? 'ACC Result' : 'ACC'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('status', 'Ditolak')}
                                                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 border ${
                                                    data.status === 'Ditolak' || data.status === 'Tolak'
                                                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-200'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-rose-50 hover:text-rose-700'
                                                }`}
                                            >
                                                <XCircle className="w-4 h-4" /> Tolak
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('status', 'Direvisi')}
                                                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 border ${
                                                    data.status === 'Direvisi' || data.status === 'Revisi'
                                                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-200'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50 hover:text-amber-700'
                                                }`}
                                            >
                                                <RotateCcw className="w-4 h-4" /> Revisi
                                            </button>
                                        </div>
                                        <InputError message={errors.status} />
                                    </div>
                                )}

                                {modalSource === 'uc' && (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">Estimasi Biaya Disetujui</h4>
                                            <p className="text-xs text-gray-500">Sesuaikan item atau nominal jika Anda ingin merevisi biaya yang disetujui.</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={addItem} 
                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors shrink-0"
                                        >
                                            + Tambah Item
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-white border border-gray-200 rounded-xl items-end relative shadow-sm">
                                                {data.items.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeItem(index)} 
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors font-bold z-10 text-xs"
                                                        title="Hapus Item"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                                <div className="w-full sm:w-5/12">
                                                    <InputLabel value="Nama Item" className="text-xs" />
                                                    <TextInput 
                                                        type="text"
                                                        value={item.item_name}
                                                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                        className="w-full text-sm mt-1"
                                                        placeholder="Ketik nama item..."
                                                        required
                                                    />
                                                    <InputError message={errors[`items.${index}.item_name`]} />
                                                </div>
                                                <div className="w-full sm:w-2/12">
                                                    <InputLabel value="QTY" className="text-xs" />
                                                    <TextInput 
                                                        type="number" 
                                                        min="1"
                                                        value={item.quantity} 
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                                        className="w-full text-sm mt-1 text-center" 
                                                    />
                                                    <InputError message={errors[`items.${index}.quantity`]} />
                                                </div>
                                                <div className="w-full sm:w-5/12">
                                                    <InputLabel value="Biaya Disetujui (Satuan)" className="text-xs" />
                                                    <CurrencyInput 
                                                        className="mt-1 block w-full bg-white text-sm" 
                                                        value={item.estimated_cost}
                                                        onChange={(val) => handleItemChange(index, 'estimated_cost', val)}
                                                    />
                                                    <InputError message={errors[`items.${index}.estimated_cost`]} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Ringkasan Total Disetujui */}
                                    <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-semibold">Total Biaya Disetujui:</span>
                                            <div className="text-lg font-bold text-blue-900">
                                                {formatRupiah(currentTotalApproved)}
                                            </div>
                                        </div>
                                        {selectedRequest.payment_option === 'PANJAR BIAYA 50%' && (
                                            <div className="sm:text-right">
                                                <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block">
                                                    Panjar Disetujui (50%):
                                                </span>
                                                <span className="text-base font-extrabold text-amber-800">
                                                    {formatRupiah(currentTotalApproved / 2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                )}

                                {!isResultWaiting && modalSource !== 'completed' && (
                                <div>
                                    <InputLabel value="Catatan Finance / Manager (Opsional)" />
                                    <textarea
                                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm mt-1"
                                        rows="3"
                                        value={data.finance_note}
                                        onChange={e => setData('finance_note', e.target.value)}
                                        placeholder="Tambahkan catatan jika diperlukan..."
                                    ></textarea>
                                    <InputError message={errors.finance_note} />
                                </div>
                                )}
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    disabled={processing}
                                    className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                                >
                                    {isResultWaiting || modalSource === 'completed' ? 'Tutup' : 'Batal'}
                                </button>
                                {modalSource !== 'completed' && !isResultWaiting ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => submitApproval('Ditolak')}
                                            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                                                data.status === 'Ditolak' || data.status === 'Tolak'
                                                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-200'
                                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                            }`}
                                        >
                                            {processing && (data.status === 'Ditolak' || data.status === 'Tolak') ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Tolak
                                        </button>
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => submitApproval('Direvisi')}
                                            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                                                data.status === 'Direvisi' || data.status === 'Revisi'
                                                    ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-200'
                                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                            }`}
                                        >
                                            {processing && (data.status === 'Direvisi' || data.status === 'Revisi') ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                            Revisi
                                        </button>
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => submitApproval(modalSource === 'result' ? 'Selesai' : 'Disetujui')}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                                                data.status === 'Disetujui' || data.status === 'ACC' || data.status === 'Selesai'
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-200'
                                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            }`}
                                        >
                                            {processing && (data.status === 'Disetujui' || data.status === 'ACC' || data.status === 'Selesai') ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            {modalSource === 'result' ? 'ACC Result' : 'ACC'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button" 
                                            onClick={closeModal} 
                                            className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
                );
            })()}
            {/* Modal Pop-up Lihat Nota */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
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
