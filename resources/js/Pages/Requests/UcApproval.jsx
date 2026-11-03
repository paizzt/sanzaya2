import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportDropdown from '@/Components/ExportDropdown';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { FileCheck, Edit3, X, Loader2, Trash2, Edit, CheckCircle, RotateCcw, XCircle } from 'lucide-react';
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

    const openModal = (req) => {
        setSelectedRequest(req);

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

        const initialStatus = (req.status === 'Ditolak' || req.status === 'Tolak') 
            ? 'Ditolak' 
            : ((req.status === 'Direvisi' || req.status === 'Revisi') ? 'Direvisi' : 'Disetujui');

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
        const finalStatus = statusChoice || data.status || 'Disetujui';

        setData('status', finalStatus);
        transform((currData) => ({
            ...currData,
            status: finalStatus,
        }));

        post(route('requests.uc.approval.update', selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                const label = (finalStatus === 'Disetujui' || finalStatus === 'ACC')
                    ? 'disetujui (ACC)'
                    : ((finalStatus === 'Direvisi' || finalStatus === 'Revisi') ? 'diminta revisi' : 'ditolak');
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

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Persetujuan UC</h2>}
        >
            <Head title="Persetujuan UC" />

            <div className="">
                <div className="">
                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                <FileCheck className="text-blue-500" /> Daftar Pengajuan UC
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <ExportDropdown pdfRoute={route('requests.uc.approval.export.pdf')} excelRoute={route('requests.uc.approval.export.excel')} />
                            </div>
                        </div>
                        
                        {!requests || requests.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Belum ada data pengajuan UC.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-xl">
                                        <tr>
                                            <th className="px-6 py-4 rounded-l-xl">No. Request</th>
                                            <th className="px-6 py-4">Pengaju</th>
                                            <th className="px-6 py-4">Tujuan</th>
                                            <th className="px-6 py-4">Tgl Berangkat</th>
                                            <th className="px-6 py-4">Est. Biaya</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 rounded-r-xl">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(requests || []).map((req) => {
                                            const totalEst = getRequestTotal(req);
                                            return (
                                                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{req.request_number}</td>
                                                    <td className="px-6 py-4">{req.user?.name} <br/><span className="text-xs text-gray-400">{req.department}</span></td>
                                                    <td className="px-6 py-4">{req.destination_city}</td>
                                                    <td className="px-6 py-4">{req.departure_date} <br/><span className="text-xs text-gray-400">({req.estimated_days} Hari)</span></td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">
                                                            {formatRupiah(totalEst)}
                                                        </div>
                                                        {req.payment_option && (
                                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                req.payment_option === 'PANJAR BIAYA 50%' 
                                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            }`}>
                                                                {req.payment_option}
                                                            </span>
                                                        )}
                                                        {req.approved_gas_cost && req.approved_gas_cost != totalEst && (
                                                            <div className="text-xs text-green-600 font-semibold mt-1">
                                                                Rev: {formatRupiah(req.approved_gas_cost)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            req.status?.includes('Selesai') ? 'bg-indigo-100 text-indigo-700' :
                                                            (req.status === 'Disetujui' || req.status === 'ACC') ? 'bg-green-100 text-green-700' :
                                                            (req.status === 'Ditolak' || req.status === 'Tolak') ? 'bg-red-100 text-red-700' :
                                                            req.status === 'Direvisi' ? 'bg-orange-100 text-orange-700' :
                                                            req.status === 'Dicairkan' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {req.status === 'Disetujui' ? 'ACC' : req.status === 'Ditolak' ? 'Tolak' : req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button 
                                                                onClick={() => openModal(req)}
                                                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                                            >
                                                                <Edit3 className="w-4 h-4" /> Review
                                                            </button>
                                                            {isAdmin && (
                                                                <>
                                                                    <Link 
                                                                        href={route('uc-requests.edit', req.id)}
                                                                        className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <Edit className="w-4 h-4" /> Edit
                                                                    </Link>
                                                                    <button 
                                                                        onClick={() => deleteRequest(req.id)}
                                                                        className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Delete
                                                                    </button>
                                                                </>
                                                            )}
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
                </div>
            </div>

            {/* Modal Review */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto pb-10">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl relative my-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Review Pengajuan UC</h3>
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
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        selectedRequest.payment_option === 'PANJAR BIAYA 50%'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}>
                                        {selectedRequest.payment_option || 'BAYAR FULL'}
                                    </span>
                                </div>

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

                                {selectedRequest.result_report && (
                                    <div className="sm:col-span-2 pt-3 border-t border-gray-200">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Hasil Perjalanan / Result:</span>
                                        <div className="p-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
                                            {selectedRequest.result_report}
                                        </div>
                                        {selectedRequest.result_receipts && (() => {
                                            try {
                                                const photos = JSON.parse(selectedRequest.result_receipts);
                                                if (Array.isArray(photos) && photos.length > 0) {
                                                    return (
                                                        <div className="mt-2.5 flex gap-2 flex-wrap">
                                                            {photos.map((photo, i) => {
                                                                const photoUrl = photo.startsWith('http')
                                                                    ? (photo.includes('i.ibb.co') ? `https://wsrv.nl/?url=${encodeURIComponent(photo)}` : photo)
                                                                    : `/storage/${photo}`;
                                                                return (
                                                                    <a key={i} href={photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                                                        Lihat Nota {i + 1}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                }
                                            } catch (e) {}
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel value="Status Persetujuan" className="mb-2 font-semibold text-gray-700" />
                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setData('status', 'Disetujui')}
                                            className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 border ${
                                                data.status === 'Disetujui' || data.status === 'ACC'
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                                            }`}
                                        >
                                            <CheckCircle className="w-4 h-4" /> ACC
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

                                {/* Estimasi Biaya Disetujui (Mengikuti Form UC) */}
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
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    disabled={processing}
                                    className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                                >
                                    Batal
                                </button>
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
                                        onClick={() => submitApproval('Disetujui')}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                                            data.status === 'Disetujui' || data.status === 'ACC'
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-200'
                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        }`}
                                    >
                                        {processing && (data.status === 'Disetujui' || data.status === 'ACC') ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        ACC
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
