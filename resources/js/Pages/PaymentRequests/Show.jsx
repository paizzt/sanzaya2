import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import ExportDropdown from '@/Components/ExportDropdown';
import { Eye, ExternalLink, X, FileText, Download, AlertTriangle, AlertCircle, Edit, Send, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
};

export default function Show({ auth, paymentRequest, completeness, canApprove, canReject, canEdit, canSubmit, isApprovalView = false }) {
    const pageAuth = usePage().props.auth;
    const currentAuth = auth || pageAuth;
    const canDownloadPdf = currentAuth?.can_download_pdf !== undefined
        ? Boolean(currentAuth.can_download_pdf)
        : (currentAuth?.active_feature_names 
            ? currentAuth.active_feature_names.some(n => typeof n === 'string' && n.toLowerCase().trim() === 'unduh pdf')
            : true);
    const [selectedImage, setSelectedImage] = useState(null);
    const { post, processing } = useForm();
    const latestRevision = paymentRequest.latest_revision || 
        (paymentRequest.approvals && [...paymentRequest.approvals].reverse().find(a => a.action === 'returned'));

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

    const handleRevise = () => {
        Swal.fire({
            title: 'Minta Revisi',
            input: 'textarea',
            inputLabel: 'Catatan Revisi',
            inputPlaceholder: 'Masukkan bagian yang perlu direvisi...',
            inputAttributes: {
                'aria-label': 'Catatan Revisi'
            },
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Minta Revisi',
            cancelButtonText: 'Batal',
            preConfirm: (notes) => {
                if (!notes) {
                    Swal.showValidationMessage('Catatan revisi wajib diisi!');
                }
                return notes;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('payment-requests.revise', paymentRequest.id), {
                    data: { notes: result.value }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Detail Pengajuan - ${paymentRequest.reference_number}`} />

            <div className="py-2">
                <div className="space-y-6">

                    {/* Action Bar */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => window.history.back()}
                                className="p-2.5 bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-gray-100 flex-shrink-0"
                                title="Kembali"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                            </button>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Detail Pengajuan: {paymentRequest.reference_number}
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                            <span className="text-gray-600 font-medium">Status Pengajuan:</span>
                            {(() => {
                                const getStatusBadge = (status) => {
                                    switch (status) {
                                        case 'waiting_ga':
                                        case 'waiting_supervisor':
                                            return { text: 'DI PROSES', color: 'bg-amber-500 text-white' };
                                        case 'approved':
                                            return { text: 'DI SETUJUI', color: 'bg-blue-600 text-white' };
                                        case 'paid':
                                            return { text: 'SELESAI', color: 'bg-emerald-600 text-white' };
                                        case 'rejected':
                                            return { text: 'DI TOLAK', color: 'bg-rose-600 text-white' };
                                        case 'draft':
                                            return latestRevision
                                                ? { text: 'PERLU REVISI', color: 'bg-amber-600 text-white' }
                                                : { text: 'DRAFT', color: 'bg-gray-600 text-white' };
                                        default:
                                            return { text: 'DRAFT', color: 'bg-gray-600 text-white' };
                                    }
                                };
                                const badge = getStatusBadge(paymentRequest.workflow_status);
                                return (
                                    <span className={`px-3 py-1 rounded-xl text-xs font-bold shadow-xs ${badge.color}`}>
                                        {badge.text}
                                    </span>
                                );
                            })()}
                        </div>
                        {canDownloadPdf && (
                            <ExportDropdown 
                                pdfRoute={route('payment-requests.pdf', paymentRequest.id)}
                                trigger={
                                    <button 
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Cetak PDF
                                    </button>
                                }
                            />
                        )}
                    </div>
                    
                    {/* Notice Banner Revisi dari Finance */}
                    {paymentRequest.workflow_status === 'draft' && latestRevision && (
                        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm shrink-0 mt-0.5">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-bold text-amber-950">
                                                Pengajuan Perlu Direvisi
                                            </h3>
                                            <span className="text-xs bg-amber-200/80 text-amber-900 font-semibold px-2.5 py-0.5 rounded-full">
                                                {latestRevision.acted_at ? dayjs(latestRevision.acted_at).format('DD MMMM YYYY HH:mm') : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-amber-800 mt-0.5">
                                            Diminta oleh: <span className="font-semibold">{latestRevision.approver?.name || 'Finance'}</span>
                                            {latestRevision.approver?.division?.name ? ` (${latestRevision.approver.division.name})` : ''}
                                        </p>
                                        <div className="mt-3 p-3.5 bg-white/95 rounded-xl border border-amber-200 shadow-2xs">
                                            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                                                Catatan Revisi dari Finance:
                                            </span>
                                            <p className="text-sm font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                                                {latestRevision.notes}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {(canEdit || !isApprovalView) && (
                                    <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                                        <Link
                                            href={route(isApprovalView ? 'payment-approvals.edit' : 'payment-requests.edit', paymentRequest.id)}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition active:scale-98"
                                        >
                                            <Edit size={16} /> Edit & Perbaiki
                                        </Link>
                                        {completeness?.is_complete && (
                                            <button
                                                type="button"
                                                onClick={() => handleAction('payment-requests.submit')}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition active:scale-98"
                                            >
                                                <Send size={16} /> Kirim Pengajuan
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                            
                            {/* Informasi Pengajuan */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Informasi Pengajuan</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs">Perusahaan / PT</span>
                                        <span className="font-semibold text-gray-900">{paymentRequest.company_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Kategori</span>
                                        <span className="font-semibold text-gray-900">{paymentRequest.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Tujuan Pembayaran</span>
                                        <span className="font-semibold text-gray-900">{paymentRequest.purpose}</span>
                                    </div>
                                    {paymentRequest.project_or_outlet && paymentRequest.project_or_outlet !== '-' && (
                                        <div>
                                            <span className="text-gray-500 block text-xs">
                                                {paymentRequest.category?.toLowerCase().includes('purchasing') ? 'Nama RS / DINKES' : 'Nama Outlet'}
                                            </span>
                                            <span className="font-semibold text-gray-900">{paymentRequest.project_or_outlet}</span>
                                        </div>
                                    )}
                                    {paymentRequest.invoice_reference && (
                                        <div>
                                            <span className="text-gray-500 block text-xs">No. Pesanan / Klikkan</span>
                                            <span className="font-semibold text-gray-900">{paymentRequest.invoice_reference}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 block text-xs">Nomor Surat</span>
                                        <span className="font-semibold text-gray-900">{paymentRequest.letter_number || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Batas Waktu Bayar</span>
                                        <span className="font-semibold text-red-600">
                                            {paymentRequest.payment_deadline ? dayjs(paymentRequest.payment_deadline).format('DD MMMM YYYY') : '-'}
                                        </span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="text-gray-500 block text-xs">Keterangan</span>
                                        <span className="font-semibold text-gray-900 whitespace-pre-line">
                                            {paymentRequest.notes || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Rekening Pembayaran */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Metode & Rekening Pembayaran</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs">Metode Pembayaran</span>
                                        <span className="font-semibold text-gray-900">{paymentRequest.payment_method}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Penerima Pembayaran</span>
                                        <span className="font-semibold text-gray-900">{paymentRequest.recipient_name}</span>
                                    </div>
                                    {paymentRequest.payment_method !== 'Tunai' && (
                                        <>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Bank / E-Wallet</span>
                                                <span className="font-semibold text-gray-900">{paymentRequest.bank_or_wallet || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Nomor Rekening / QRIS</span>
                                                <span className="font-bold text-indigo-600 text-base">{paymentRequest.account_number || '-'}</span>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="text-gray-500 block text-xs">Atas Nama Rekening</span>
                                                <span className="font-semibold text-gray-900">{paymentRequest.account_name || '-'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Rincian Anggaran */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold border-b pb-2 mb-4">Rincian Anggaran</h3>
                                <div className="overflow-x-auto">
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
                                </div>

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
                            {(isApprovalView || canEdit || canSubmit || canApprove || canReject || paymentRequest.workflow_status === 'draft') && (
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Aksi</h3>
                                    <div className="space-y-3">
                                        {(canEdit || !isApprovalView) && (paymentRequest.workflow_status === 'draft' || paymentRequest.workflow_status === 'waiting_ga') && (
                                            <Link 
                                                href={route(isApprovalView ? 'payment-approvals.edit' : 'payment-requests.edit', paymentRequest.id)}
                                                className="w-full block"
                                            >
                                                <SecondaryButton className="w-full justify-center">
                                                    Edit Pengajuan
                                                </SecondaryButton>
                                            </Link>
                                        )}
                                        {paymentRequest.workflow_status === 'draft' && (canSubmit || !isApprovalView) && (
                                            <PrimaryButton 
                                                className="w-full justify-center"
                                                disabled={!completeness?.is_complete}
                                                onClick={() => handleAction('payment-requests.submit')}
                                            >
                                                Kirim Pengajuan
                                            </PrimaryButton>
                                        )}
                                        
                                        {isApprovalView && (canApprove || canReject) && (
                                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                                                {canApprove && (
                                                    <button 
                                                        onClick={handleApprove}
                                                        disabled={processing}
                                                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-500 focus:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 cursor-pointer"
                                                    >
                                                        Setujui
                                                    </button>
                                                )}
                                                {canReject && (
                                                    <button 
                                                        onClick={handleRevise}
                                                        disabled={processing}
                                                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-amber-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-amber-400 focus:bg-amber-400 active:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition ease-in-out duration-150 cursor-pointer"
                                                    >
                                                        Revisi
                                                    </button>
                                                )}
                                                {canReject && (
                                                    <button 
                                                        onClick={handleReject}
                                                        disabled={processing}
                                                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 focus:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 cursor-pointer"
                                                    >
                                                        Tolak
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Riwayat Persetujuan */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Riwayat Persetujuan</h3>
                                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                    
                                    {/* Step: Dibuat Oleh */}
                                    <div className="relative">
                                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xs"></div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Dibuat Oleh</span>
                                            <span className="text-gray-900 font-semibold text-sm">{paymentRequest.requester?.name || '-'}</span>
                                            <span className="text-xs text-gray-500">
                                                {paymentRequest.created_at ? dayjs(paymentRequest.created_at).format('DD MMM YYYY, HH:mm') : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dynamic Approval Steps */}
                                    {paymentRequest.approvals && paymentRequest.approvals.length > 0 ? (
                                        paymentRequest.approvals.map((app, idx) => {
                                            let badgeColor = 'bg-gray-100 text-gray-700';
                                            let dotColor = 'bg-gray-400';
                                            let actionText = app.action;

                                            if (app.action === 'returned') {
                                                badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                                                dotColor = 'bg-amber-500';
                                                actionText = 'Diminta Revisi';
                                            } else if (app.action === 'approved') {
                                                badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
                                                dotColor = 'bg-emerald-500';
                                                actionText = 'Disetujui';
                                            } else if (app.action === 'rejected') {
                                                badgeColor = 'bg-rose-100 text-rose-800 border border-rose-300';
                                                dotColor = 'bg-rose-500';
                                                actionText = 'Ditolak';
                                            } else if (app.action === 'resubmitted') {
                                                badgeColor = 'bg-blue-100 text-blue-800 border border-blue-300';
                                                dotColor = 'bg-blue-500';
                                                actionText = 'Diajukan Kembali';
                                            }

                                            return (
                                                <div key={app.id || idx} className="relative">
                                                    <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full ${dotColor} border-2 border-white shadow-xs`}></div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                                                                {actionText}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {app.acted_at ? dayjs(app.acted_at).format('DD MMM YYYY, HH:mm') : '-'}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-900 font-semibold text-sm mt-0.5">
                                                            {app.approver?.name || 'Otorisator'}
                                                            {app.approver?.division?.name ? ` (${app.approver.division.name})` : ''}
                                                        </span>
                                                        {app.notes && (
                                                            <div className={`mt-1.5 p-2.5 rounded-lg text-xs whitespace-pre-line ${
                                                                app.action === 'returned' 
                                                                    ? 'bg-amber-50 border border-amber-200 text-amber-900 font-medium' 
                                                                    : 'bg-gray-50 border border-gray-100 text-gray-700'
                                                            }`}>
                                                                <span className="font-bold block text-[10px] uppercase mb-0.5">
                                                                    {app.action === 'returned' ? 'Catatan Revisi:' : 'Catatan:'}
                                                                </span>
                                                                {app.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        paymentRequest.finance_verified_at ? (
                                            <div className="relative">
                                                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Disetujui (Finance)</span>
                                                    <span className="text-gray-900 font-semibold text-sm">Finance</span>
                                                    <span className="text-xs text-gray-500">
                                                        {dayjs(paymentRequest.finance_verified_at).format('DD MMM YYYY, HH:mm')}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : null
                                    )}

                                    {/* Step: Status Saat Ini jika masih Menunggu */}
                                    {paymentRequest.workflow_status === 'waiting_ga' && (
                                        <div className="relative">
                                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-amber-400 animate-pulse border-2 border-white shadow-xs"></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Status Terkini</span>
                                                <span className="text-gray-800 font-semibold text-sm">Menunggu Persetujuan Finance</span>
                                            </div>
                                        </div>
                                    )}
                                    {paymentRequest.workflow_status === 'waiting_supervisor' && (
                                        <div className="relative">
                                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-amber-400 animate-pulse border-2 border-white shadow-xs"></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Status Terkini</span>
                                                <span className="text-gray-800 font-semibold text-sm">Menunggu Persetujuan Atasan</span>
                                            </div>
                                        </div>
                                    )}
                                    {paymentRequest.workflow_status === 'draft' && (
                                        <div className="relative">
                                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow-xs"></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status Terkini</span>
                                                <span className="text-gray-800 font-semibold text-sm">
                                                    {latestRevision ? 'Menunggu Perbaikan Pengajuan' : 'Draft Pengajuan'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {paymentRequest.workflow_status === 'paid' && (
                                        <div className="relative">
                                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs"></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Pembayaran Selesai</span>
                                                <span className="text-xs text-gray-500">
                                                    {paymentRequest.paid_at ? dayjs(paymentRequest.paid_at).format('DD MMM YYYY, HH:mm') : 'Sudah Dibayarkan'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lampiran Tambahan */}
                            {(() => {
                                const attachments = paymentRequest.attachments || [];
                                if (attachments.length === 0) return null;
                                return (
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between border-b pb-2 mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                Lampiran Tambahan ({attachments.length})
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {attachments.map((att, idx) => {
                                                const rawUrl = att.file_path.startsWith('http') ? att.file_path : `/storage/${att.file_path}`;
                                                const imgUrl = rawUrl.includes('i.ibb.co') ? `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}` : rawUrl;
                                                const ext = (att.original_name ? att.original_name.split('.').pop() : (att.file_path.split('.').pop() || '')).toUpperCase();
                                                const isImg = att.attachment_type === 'Lampiran Foto' || ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'BMP'].includes(ext);
                                                const isPdf = ext === 'PDF';
                                                const isSheet = ['XLS', 'XLSX', 'CSV'].includes(ext);
                                                const isDoc = ['DOC', 'DOCX'].includes(ext);

                                                if (isImg) {
                                                    return (
                                                        <div key={att.id || idx} className="group border rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between hover:shadow-md transition">
                                                            <div 
                                                                onClick={() => setSelectedImage(imgUrl)}
                                                                className="cursor-pointer overflow-hidden bg-gray-100 h-44 flex items-center justify-center relative"
                                                            >
                                                                <img 
                                                                    src={imgUrl} 
                                                                    alt={att.original_name || `Lampiran ${idx + 1}`} 
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://placehold.co/400x300/f1f5f9/64748b?text=Foto+Gagal+Dimuat';
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium text-xs">
                                                                    <Eye className="w-4 h-4" /> Perbesar
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-white border-t flex items-center justify-between gap-2">
                                                                <span className="text-xs font-semibold text-gray-700 truncate" title={att.original_name}>
                                                                    {att.original_name || `Foto ${idx + 1}`}
                                                                </span>
                                                                <a 
                                                                    href={imgUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg shrink-0 transition flex items-center gap-1"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" /> Buka
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Document File Card
                                                return (
                                                    <div key={att.id || idx} className="border rounded-xl overflow-hidden bg-white hover:border-indigo-300 flex flex-col justify-between hover:shadow-md transition p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? 'bg-red-50 text-red-600' : (isSheet ? 'bg-emerald-50 text-emerald-700' : (isDoc ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-600'))}`}>
                                                                <FileText className="w-6 h-6" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isPdf ? 'bg-red-600 text-white' : (isSheet ? 'bg-emerald-600 text-white' : (isDoc ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'))}`}>
                                                                        {ext || 'FILE'}
                                                                    </span>
                                                                    {att.file_size ? (
                                                                        <span className="text-[11px] text-gray-400">
                                                                            {(att.file_size / 1024).toFixed(0)} KB
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                                <p className="text-sm font-semibold text-gray-800 truncate" title={att.original_name}>
                                                                    {att.original_name || `Berkas ${idx + 1}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-3 border-t flex items-center justify-end">
                                                            <a 
                                                                href={att.id ? route('payment-requests.attachments.download', att.id) : rawUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                download={att.original_name || true}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition shadow-sm"
                                                            >
                                                                <Download className="w-3.5 h-3.5" /> Buka / Unduh
                                                            </a>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Preview Gambar */}
            <Modal show={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="2xl">
                <div className="relative bg-black rounded-xl overflow-hidden p-2">
                    <button 
                        onClick={() => setSelectedImage(null)} 
                        className="absolute top-4 right-4 p-2 bg-black/60 text-white hover:bg-black/80 rounded-full transition z-10"
                        title="Tutup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {selectedImage && (
                        <div className="flex items-center justify-center min-h-[300px] max-h-[85vh] p-2">
                            <img src={selectedImage} alt="Lampiran" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
