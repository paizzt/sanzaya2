import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import CustomSelect from '@/Components/CustomSelect';
import { Eye, FileText, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

// Formatting helper local
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
};

export default function Index({ auth, paymentRequests, summary, filters, isApprovalView = false }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deadline, setDeadline] = useState(filters.deadline || '');
    
    const isSuperAdmin = auth.user?.roles?.some(r => r.name === 'SUPERADMIN');

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Pengajuan?',
            text: "Apakah Anda yakin ingin menghapus pengajuan ini?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('payment-requests.destroy', id));
            }
        });
    };
    
    const pageTitle = isApprovalView ? "Persetujuan Pembayaran" : "Pengajuan Pembayaran";

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'draft', label: 'Revisi' },
        ...(isApprovalView ? [{ value: 'unprocessed', label: 'Belum di Proses' }] : []),
        { value: 'pending', label: 'Di Proses' },
        { value: 'approved', label: 'Di Setujui' },
        { value: 'rejected', label: 'Di Tolak' },
        { value: 'paid', label: 'Selesai' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { search, status, deadline }, { preserveState: true });
    };

    const handleFilterCard = (newStatus, newDeadline = '') => {
        setStatus(newStatus);
        setDeadline(newDeadline);
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { search, status: newStatus, deadline: newDeadline }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{pageTitle}</h2>}
        >
            <Head title={pageTitle} />

            <div className="py-2">
                <div className="">
                    {/* Dashboard Summary Cards - Only show on Request View */}
                    {!isApprovalView ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div onClick={() => handleFilterCard('')} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Total Pengajuan</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.total || 0}</p>
                            </div>
                            <div onClick={() => handleFilterCard('pending')} className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Menunggu Persetujuan</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.waiting_approval || 0}</p>
                            </div>
                            <div onClick={() => handleFilterCard('paid')} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Dibayar</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.paid || 0}</p>
                            </div>
                            <div onClick={() => handleFilterCard('draft')} className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Revisi</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.draft || 0}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div onClick={() => handleFilterCard('')} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Total Persetujuan Anda</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.waiting_approval || 0}</p>
                            </div>
                            <div onClick={() => handleFilterCard('unprocessed')} className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Belum di Proses</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.unprocessed || 0}</p>
                            </div>
                            <div onClick={() => handleFilterCard('draft')} className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Revisi</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.draft || 0}</p>
                            </div>
                            <div onClick={() => handleFilterCard('', 'nearing')} className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Dekat Jatuh Tempo</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.nearing_deadline || 0}</p>
                            </div>
                            <div onClick={() => handleFilterCard('', 'overdue')} className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 cursor-pointer hover:bg-gray-50 transition">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Lewat Jatuh Tempo</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.overdue || 0}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:max-w-lg">
                                <TextInput
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="block w-full"
                                    placeholder="Cari..."
                                />
                                <div className="w-full sm:w-auto sm:min-w-[200px]">
                                    <CustomSelect 
                                        value={status}
                                        onChange={(val) => setStatus(val)}
                                        options={statusOptions}
                                    />
                                </div>
                                <PrimaryButton type="submit" >Filter</PrimaryButton>
                            </form>

                            {!isApprovalView && (
                                <Link href={route('payment-requests.create')} className="w-full md:w-auto">
                                    <PrimaryButton >Buat Baru</PrimaryButton>
                                </Link>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Referensi & Tanggal</th>
                                        <th className="px-4 py-3 font-semibold">Pengaju / Divisi</th>
                                        <th className="px-4 py-3 font-semibold">Penerima</th>
                                        <th className="px-4 py-3 font-semibold text-right">Grand Total</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paymentRequests.data && paymentRequests.data.length > 0 ? (
                                        paymentRequests.data.map((pr) => (
                                            <tr 
                                                key={pr.id} 
                                                onClick={(e) => {
                                                    if (!e.target.closest('a') && !e.target.closest('button')) {
                                                        router.get(route(isApprovalView ? 'payment-approvals.show' : 'payment-requests.show', pr.id));
                                                    }
                                                }}
                                                className="hover:bg-gray-100 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{pr.reference_number}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {pr.submission_date ? dayjs(pr.submission_date).format('DD MMM YYYY') : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{pr.requester?.name}</div>
                                                    <div className="text-xs text-gray-400">{pr.division?.name}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-normal min-w-[150px] max-w-[250px] break-words">
                                                    {pr.recipient_name}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {formatCurrency(pr.grand_total)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {(() => {
                                                        const getStatusBadge = (status) => {
                                                            switch (status) {
                                                                case 'waiting_ga':
                                                                case 'waiting_supervisor':
                                                                    return { text: 'DI PROSES', color: 'bg-yellow-100 text-yellow-800' };
                                                                case 'approved':
                                                                    return { text: 'DI SETUJUI', color: 'bg-blue-100 text-blue-800' };
                                                                case 'paid':
                                                                    return { text: 'SELESAI', color: 'bg-green-100 text-green-800' };
                                                                case 'rejected':
                                                                    return { text: 'DI TOLAK', color: 'bg-red-100 text-red-800' };
                                                                case 'draft':
                                                                    return { text: 'REVISI', color: 'bg-gray-100 text-gray-800' };
                                                                default:
                                                                    return { text: 'REVISI', color: 'bg-gray-100 text-gray-800' };
                                                            }
                                                        };
                                                        const badge = getStatusBadge(pr.workflow_status);
                                                        return (
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
                                                                {badge.text}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-4 py-3 text-center space-x-3">
                                                    <a href={route('payment-requests.pdf', pr.id)} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-900 inline-block" title="Unduh PDF">
                                                        <FileText size={18} />
                                                    </a>
                                                    {isSuperAdmin && (
                                                        <>
                                                            <Link href={route(isApprovalView ? 'payment-approvals.edit' : 'payment-requests.edit', pr.id)} className="text-blue-600 hover:text-blue-900 inline-block" title="Edit">
                                                                <Edit size={18} />
                                                            </Link>
                                                            <button onClick={() => handleDelete(pr.id)} className="text-red-600 hover:text-red-900 inline-block" title="Hapus">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                Tidak ada data pengajuan pembayaran.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
