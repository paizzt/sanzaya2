import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import CustomSelect from '@/Components/CustomSelect';
import Pagination from '@/Components/Pagination';
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

const renderCategoryBadge = (category) => {
    if (!category) return null;
    const catLower = category.toLowerCase();
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
    if (catLower.includes('support')) {
        colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (catLower.includes('entertain')) {
        colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
    } else if (catLower.includes('purchasing')) {
        colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider border ${colorClass}`}>
            {category}
        </span>
    );
};

export default function Index({ auth, paymentRequests, summary, filters, isApprovalView = false }) {
    const pageAuth = usePage().props.auth;
    const currentAuth = auth || pageAuth;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deadline, setDeadline] = useState(filters.deadline || '');
    const [nominal, setNominal] = useState(filters.nominal || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    
    const isSuperAdmin = currentAuth?.user?.roles?.some(r => r.name === 'SUPERADMIN');
    const canDownloadPdf = currentAuth?.can_download_pdf !== undefined
        ? Boolean(currentAuth.can_download_pdf)
        : (currentAuth?.active_feature_names 
            ? currentAuth.active_feature_names.some(n => typeof n === 'string' && n.toLowerCase().trim() === 'unduh pdf')
            : true);

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

    const nominalOptions = [
        { value: '', label: 'Semua Nominal' },
        { value: 'under_1m', label: '< 1 Juta' },
        { value: 'under_10m', label: '< 10 Juta' },
        { value: 'above_10m', label: '> 10 Juta' }
    ];

    const categoryFilterOptions = [
        { value: '', label: 'Semua Kategori' },
        { value: 'Pengajuan Umum', label: 'Pengajuan Umum' },
        { value: 'Entertaint', label: 'Entertaint' },
        { value: 'Support', label: 'Support' },
        { value: 'Purchasing', label: 'Purchasing' }
    ];

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { search, status, deadline, nominal, category: categoryFilter }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDeadline('');
        setNominal('');
        setCategoryFilter('');
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), {}, { preserveState: true });
    };

    const handleFilterCard = (newStatus, newDeadline = '') => {
        setStatus(newStatus);
        setDeadline(newDeadline);
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { search, status: newStatus, deadline: newDeadline, nominal, category: categoryFilter }, { preserveState: true });
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

                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2 w-full lg:max-w-4xl">
                                <div className="w-full sm:w-48">
                                    <TextInput
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="block w-full text-sm"
                                        placeholder="Cari..."
                                    />
                                </div>
                                <div className="w-full sm:w-36">
                                    <CustomSelect 
                                        value={status}
                                        onChange={(val) => setStatus(val)}
                                        options={statusOptions}
                                    />
                                </div>
                                <div className="w-full sm:w-48">
                                    <CustomSelect 
                                        value={nominal}
                                        onChange={(val) => setNominal(val)}
                                        options={nominalOptions}
                                    />
                                </div>
                                <div className="w-full sm:w-40">
                                    <CustomSelect 
                                        value={categoryFilter}
                                        onChange={(val) => setCategoryFilter(val)}
                                        options={categoryFilterOptions}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <PrimaryButton type="submit" className="w-full sm:w-auto justify-center">Filter</PrimaryButton>
                                    {(search || status || nominal || categoryFilter || deadline) && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="w-full sm:w-auto px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition text-center"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </form>

                            {!isApprovalView && (
                                <Link href={route('payment-requests.create')} className="w-full lg:w-auto shrink-0">
                                    <PrimaryButton>Buat Baru</PrimaryButton>
                                </Link>
                            )}
                        </div>

                        {/* Mobile View: Responsive Cards (No Horizontal Scrolling) */}
                        <div className="block md:hidden space-y-3">
                            {paymentRequests.data && paymentRequests.data.length > 0 ? (
                                paymentRequests.data.map((pr) => {
                                    const badge = getStatusBadge(pr.workflow_status);
                                    return (
                                        <div
                                            key={pr.id}
                                            onClick={(e) => {
                                                if (!e.target.closest('a') && !e.target.closest('button')) {
                                                    router.get(route(isApprovalView ? 'payment-approvals.show' : 'payment-requests.show', pr.id));
                                                }
                                            }}
                                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-400 cursor-pointer transition active:bg-gray-50 space-y-3"
                                        >
                                            {/* Top row: Date + Category Badge on left, Status Badge on right */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs font-semibold text-gray-600">
                                                        {pr.submission_date ? dayjs(pr.submission_date).format('DD MMM YYYY') : '-'}
                                                    </span>
                                                    {renderCategoryBadge(pr.category)}
                                                </div>
                                                <span className={`px-2.5 py-0.5 inline-flex text-[11px] font-bold rounded-full shrink-0 ${badge.color}`}>
                                                    {badge.text}
                                                </span>
                                            </div>

                                            {/* Tujuan Pembayaran */}
                                            <div>
                                                <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Tujuan Pembayaran</div>
                                                <div className="text-sm font-semibold text-gray-900 leading-snug mt-0.5 break-words">
                                                    {pr.purpose || '-'}
                                                </div>
                                            </div>

                                            {/* Requester & Recipient */}
                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                                                <div>
                                                    <span className="text-[11px] text-gray-400 block font-medium">Pengaju / Divisi</span>
                                                    <span className="font-semibold text-gray-800 block truncate">{pr.requester?.name || '-'}</span>
                                                    <span className="text-[11px] text-gray-500 block truncate">{pr.division?.name || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[11px] text-gray-400 block font-medium">Penerima</span>
                                                    <span className="font-semibold text-gray-800 block break-words">{pr.recipient_name || '-'}</span>
                                                </div>
                                            </div>

                                            {!isApprovalView && pr.notes && (
                                                <div className="pt-2 border-t border-gray-100 text-xs">
                                                    <span className="text-[11px] text-gray-400 block font-medium">Keterangan</span>
                                                    <span className="text-gray-600 block line-clamp-2">{pr.notes}</span>
                                                </div>
                                            )}

                                            {/* Bottom: Total & Actions */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Grand Total</span>
                                                    <span className="text-sm font-extrabold text-blue-600">
                                                        {formatCurrency(pr.grand_total)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    {canDownloadPdf && (
                                                        <a
                                                            href={route('payment-requests.pdf', pr.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                                            title="Unduh PDF"
                                                        >
                                                            <FileText size={16} />
                                                        </a>
                                                    )}
                                                    {isSuperAdmin && (
                                                        <>
                                                            <Link
                                                                href={route(isApprovalView ? 'payment-approvals.edit' : 'payment-requests.edit', pr.id)}
                                                                className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(pr.id)}
                                                                className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    Tidak ada data pengajuan pembayaran.
                                </div>
                            )}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full whitespace-nowrap text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                                        <th className="px-4 py-3 font-semibold">Tujuan Pembayaran</th>
                                        <th className="px-4 py-3 font-semibold">Pengaju / Divisi</th>
                                        <th className="px-4 py-3 font-semibold">Penerima</th>
                                        {!isApprovalView && <th className="px-4 py-3 font-semibold">Keterangan</th>}
                                        <th className="px-4 py-3 font-semibold text-right">Grand Total</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paymentRequests.data && paymentRequests.data.length > 0 ? (
                                        paymentRequests.data.map((pr) => {
                                            const badge = getStatusBadge(pr.workflow_status);
                                            return (
                                                <tr 
                                                    key={pr.id} 
                                                    onClick={(e) => {
                                                        if (!e.target.closest('a') && !e.target.closest('button')) {
                                                            router.get(route(isApprovalView ? 'payment-approvals.show' : 'payment-requests.show', pr.id));
                                                        }
                                                    }}
                                                    className="hover:bg-gray-100 cursor-pointer transition-colors"
                                                >
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {pr.submission_date ? dayjs(pr.submission_date).format('DD MMM YYYY') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-normal min-w-[150px] max-w-[250px] break-words">
                                                        <div className="font-medium text-gray-800">{pr.purpose || '-'}</div>
                                                        {renderCategoryBadge(pr.category)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{pr.requester?.name}</div>
                                                        <div className="text-xs text-gray-400">{pr.division?.name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-normal min-w-[150px] max-w-[250px] break-words">
                                                        {pr.recipient_name}
                                                    </td>
                                                    {!isApprovalView && (
                                                        <td className="px-4 py-3 whitespace-normal min-w-[150px] max-w-[220px] break-words text-xs text-gray-600">
                                                            {pr.notes || '-'}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatCurrency(pr.grand_total)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
                                                            {badge.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center space-x-3">
                                                        {canDownloadPdf && (
                                                            <a href={route('payment-requests.pdf', pr.id)} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-900 inline-block" title="Unduh PDF">
                                                                <FileText size={18} />
                                                            </a>
                                                        )}
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
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={isApprovalView ? 7 : 8} className="px-4 py-8 text-center text-gray-500">
                                                Tidak ada data pengajuan pembayaran.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4">
                            <Pagination 
                                links={paymentRequests.links} 
                                from={paymentRequests.from} 
                                to={paymentRequests.to} 
                                total={paymentRequests.total} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
