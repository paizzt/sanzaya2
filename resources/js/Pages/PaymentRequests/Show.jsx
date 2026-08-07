import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Swal from 'sweetalert2';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
};

export default function Show({ auth, paymentRequest, completeness, canApprove, canReject }) {
    const { post, processing } = useForm();

    const handleAction = (actionRoute) => {
        Swal.fire({
            title: 'Kirim Pengajuan?',
            text: "Apakah Anda yakin ingin mengirim pengajuan ini? Data tidak dapat diubah setelah dikirim.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Kirim',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                post(route(actionRoute, paymentRequest.id));
            }
        });
    };

    const handleApprove = () => {
        Swal.fire({
            title: 'Setujui Pengajuan?',
            text: "Apakah Anda yakin ingin menyetujui pengajuan ini?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('payment-requests.approve', paymentRequest.id));
            }
        });
    };

    const handleReject = () => {
        Swal.fire({
            title: 'Tolak Pengajuan',
            input: 'textarea',
            inputLabel: 'Alasan Penolakan',
            inputPlaceholder: 'Masukkan alasan penolakan...',
            inputAttributes: {
                'aria-label': 'Alasan Penolakan'
            },
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            preConfirm: (notes) => {
                if (!notes) {
                    Swal.showValidationMessage('Alasan penolakan wajib diisi!');
                }
                return notes;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('payment-requests.reject', paymentRequest.id), {
                    data: { notes: result.value }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Detail Pengajuan: {paymentRequest.reference_number}
                    </h2>
                    <div className="flex items-center space-x-3">
                        <Link 
                            href={route('payment-requests.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                        >
                            Kembali
                        </Link>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {paymentRequest.workflow_status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <a 
                            href={route('payment-requests.pdf', paymentRequest.id)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Cetak PDF
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Detail Pengajuan - ${paymentRequest.reference_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Status Kelengkapan */}
                    {!completeness.is_complete && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                            <h3 className="text-red-800 font-bold mb-2">BELUM LENGKAP - TIDAK DAPAT DIAJUKAN</h3>
                            <ul className="list-disc list-inside text-sm text-red-700">
                                {completeness.missing.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                        </div>
                    )}
                    {completeness.is_complete && paymentRequest.workflow_status === 'draft' && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm">
                            <h3 className="text-green-800 font-bold">LENGKAP - DAPAT DIAJUKAN</h3>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Kolom Kiri: Informasi */}
                        <div className="md:col-span-2 space-y-6">
                            
                            {/* Rincian Anggaran */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold border-b pb-2 mb-4">Rincian Anggaran</h3>
                                <table className="w-full text-sm text-left mb-6">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-3 py-2">Uraian</th>
                                            <th className="px-3 py-2 text-center">Qty</th>
                                            <th className="px-3 py-2 text-right">Harga Satuan</th>
                                            <th className="px-3 py-2 text-right">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paymentRequest.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2">{item.description}</td>
                                                <td className="px-3 py-2 text-center">{item.quantity} {item.unit}</td>
                                                <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end border-t pt-4">
                                    <div className="w-64 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold">{formatCurrency(paymentRequest.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">PPN ({paymentRequest.vat_status})</span>
                                            <span className="font-semibold">{formatCurrency(paymentRequest.vat_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                            <span>Grand Total</span>
                                            <span className="text-indigo-600">{formatCurrency(paymentRequest.grand_total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Aksi & Timeline */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold border-b pb-2 mb-4">Aksi</h3>
                                <div className="space-y-3">
                                    {paymentRequest.workflow_status === 'draft' && (
                                        <>
                                            <Link href={route('payment-requests.edit', paymentRequest.id)}>
                                                <SecondaryButton className="w-full justify-center">Edit Pengajuan</SecondaryButton>
                                            </Link>
                                            <PrimaryButton 
                                                className="w-full justify-center" 
                                                disabled={!completeness.is_complete}
                                                onClick={() => handleAction('payment-requests.submit')}
                                            >
                                                Kirim
                                            </PrimaryButton>
                                        </>
                                    )}
                                    
                                    {(canApprove || canReject) && (
                                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                                            {canApprove && (
                                                <button 
                                                    onClick={handleApprove}
                                                    disabled={processing}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-500 focus:bg-emerald-500 active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                >
                                                    Setujui
                                                </button>
                                            )}
                                            {canReject && (
                                                <button 
                                                    onClick={handleReject}
                                                    disabled={processing}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 focus:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                >
                                                    Tolak
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
