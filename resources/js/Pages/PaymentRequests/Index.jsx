import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import CustomSelect from '@/Components/CustomSelect';

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
    
    const isSuperAdmin = auth.user?.roles?.some(r => r.name === 'SUPERADMIN');

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
            router.delete(route('payment-requests.destroy', id));
        }
    };
    
    const pageTitle = isApprovalView ? "Persetujuan Pembayaran" : "Pengajuan Pembayaran";

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'waiting_supervisor', label: 'Menunggu Atasan' },
        { value: 'waiting_ga', label: 'Menunggu GA' },
        { value: 'waiting_director', label: 'Menunggu Direktur' },
        { value: 'approved', label: 'Disetujui' },
        { value: 'rejected', label: 'Ditolak' },
        { value: 'paid', label: 'Dibayar' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { search, status }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{pageTitle}</h2>}
        >
            <Head title={pageTitle} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Dashboard Summary Cards - Only show on Request View */}
                    {!isApprovalView ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Total Pengajuan</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.total || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Menunggu Persetujuan</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.waiting_approval || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Dibayar</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.paid || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Draft</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.draft || 0}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Menunggu Persetujuan Anda</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.waiting_approval || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Dekat Jatuh Tempo</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.nearing_deadline || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                                <p className="text-sm text-gray-500 font-semibold uppercase">Lewat Jatuh Tempo</p>
                                <p className="text-3xl font-bold text-gray-800">{summary?.overdue || 0}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <form onSubmit={handleSearch} className="flex space-x-2 w-full max-w-lg">
                                <TextInput
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="block w-full"
                                />
                                <CustomSelect 
                                    value={status}
                                    onChange={(val) => setStatus(val)}
                                    options={statusOptions}
                                    className="min-w-[200px]"
                                />
                                <PrimaryButton type="submit">Filter</PrimaryButton>
                            </form>

                            {!isApprovalView && (
                                <Link href={route('payment-requests.create')}>
                                    <PrimaryButton>Buat</PrimaryButton>
                                </Link>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nomor Referensi</th>
                                        <th className="px-4 py-3 font-semibold">Tgl. Pengajuan</th>
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
                                            <tr key={pr.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {pr.reference_number}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {pr.submission_date || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>{pr.requester?.name}</div>
                                                    <div className="text-xs text-gray-400">{pr.division?.name}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {pr.recipient_name}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {formatCurrency(pr.grand_total)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${pr.workflow_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                          pr.workflow_status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                                          'bg-yellow-100 text-yellow-800'}`}>
                                                        {pr.workflow_status.replace(/_/g, ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center space-x-2">
                                                    <Link href={route('payment-requests.show', pr.id)} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                                        Detail
                                                    </Link>
                                                    <a href={route('payment-requests.pdf', pr.id)} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-900 font-semibold">
                                                        PDF
                                                    </a>
                                                    {isSuperAdmin && (
                                                        <>
                                                            <Link href={route('payment-requests.edit', pr.id)} className="text-blue-600 hover:text-blue-900 font-semibold">
                                                                Edit
                                                            </Link>
                                                            <button onClick={() => handleDelete(pr.id)} className="text-red-600 hover:text-red-900 font-semibold">
                                                                Hapus
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
