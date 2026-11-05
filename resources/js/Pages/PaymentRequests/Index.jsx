import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import CustomSelect from '@/Components/CustomSelect';
import Pagination from '@/Components/Pagination';
import { Eye, FileText, Edit, Trash2, Plus, Filter, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
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
            return { text: 'DI PROSES', color: 'text-white font-bold', bg: 'bg-amber-500 text-white' };
        case 'approved':
            return { text: 'DI SETUJUI', color: 'text-white font-bold', bg: 'bg-blue-600 text-white' };
        case 'paid':
            return { text: 'SELESAI', color: 'text-white font-bold', bg: 'bg-emerald-600 text-white' };
        case 'rejected':
            return { text: 'DI TOLAK', color: 'text-white font-bold', bg: 'bg-rose-600 text-white' };
        case 'draft':
            return { text: 'REVISI', color: 'text-white font-bold', bg: 'bg-gray-600 text-white' };
        default:
            return { text: 'REVISI', color: 'text-white font-bold', bg: 'bg-gray-600 text-white' };
    }
};

const renderCategoryBadge = (category, purpose = '') => {
    if (!category) return null;
    const catLower = category.toLowerCase().trim();
    const purpLower = (purpose || '').toLowerCase().trim();

    // Jangan tampilkan jika isi category sama persis dengan purpose (duplikat/data lama) atau kategori umum
    if (catLower === purpLower || catLower === 'pengajuan umum' || catLower === 'umum') {
        return null;
    }

    if (catLower.includes('support')) {
        return (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-600 text-white">
                Support
            </span>
        );
    }
    if (catLower.includes('entertain')) {
        return (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-purple-600 text-white">
                Entertaint
            </span>
        );
    }
    if (catLower.includes('purchasing')) {
        return (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-600 text-white">
                Purchasing
            </span>
        );
    }

    return null;
};

export default function Index({ auth, paymentRequests, summary, filters, companies = [], isApprovalView = false }) {
    const pageAuth = usePage().props.auth;
    const currentAuth = auth || pageAuth;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deadline, setDeadline] = useState(filters.deadline || '');
    const [nominal, setNominal] = useState(filters.nominal || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [companyFilter, setCompanyFilter] = useState(filters.company || '');
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    
    const activeFilterCount = [companyFilter, status, nominal, categoryFilter, deadline].filter(Boolean).length;
    
    const storageKey = isApprovalView ? 'payment_approvals_pt' : 'payment_requests_pt';

    useEffect(() => {
        setCompanyFilter(filters.company || '');
    }, [filters.company]);

    useEffect(() => {
        // If neither URL nor session provided a company filter, check localStorage fallback
        if (!filters.company) {
            const savedPt = localStorage.getItem(storageKey);
            if (savedPt && companies.some(c => (typeof c === 'object' ? c.name : c) === savedPt)) {
                setCompanyFilter(savedPt);
                const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
                router.get(route(routeName), { ...filters, company: savedPt }, { preserveState: true, replace: true });
            }
        } else {
            localStorage.setItem(storageKey, filters.company);
        }
    }, []);
    
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

    const companyOptions = [
        { value: '', label: 'Semua PT' },
        ...(companies || []).map(comp => {
            const name = typeof comp === 'object' ? (comp.name || comp.label) : comp;
            return { value: name, label: name };
        })
    ];

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (companyFilter) {
            localStorage.setItem(storageKey, companyFilter);
        } else {
            localStorage.removeItem(storageKey);
        }
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { search, status, deadline, nominal, category: categoryFilter, company: companyFilter }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDeadline('');
        setNominal('');
        setCategoryFilter('');
        setCompanyFilter('');
        localStorage.removeItem(storageKey);
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { company: '', reset: 1 }, { preserveState: true });
    };

    const handleFilterCard = (newStatus, newDeadline = '') => {
        setStatus(newStatus);
        setDeadline(newDeadline);
        const routeName = isApprovalView ? 'payment-approvals.index' : 'payment-requests.index';
        router.get(route(routeName), { search, status: newStatus, deadline: newDeadline, nominal, category: categoryFilter, company: companyFilter }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{pageTitle}</h2>}
        >
            <Head title={pageTitle} />

            <div className="py-2">
                <div className="">
                    {/* Dashboard Summary Cards */}
                    {!isApprovalView ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                            <div 
                                onClick={() => handleFilterCard('')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    status === '' && deadline === '' ? 'ring-2 ring-blue-400 border-blue-500' : 'border-gray-100 border-l-4 border-l-blue-500'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Total Pengajuan</p>
                                <p className="text-xl sm:text-3xl font-black text-gray-800 mt-0.5">{summary?.total || 0}</p>
                            </div>
                            <div 
                                onClick={() => handleFilterCard('pending')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    status === 'pending' ? 'ring-2 ring-amber-400 border-amber-500' : 'border-gray-100 border-l-4 border-l-amber-500'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Menunggu</p>
                                <p className="text-xl sm:text-3xl font-black text-amber-600 mt-0.5">{summary?.waiting_approval || 0}</p>
                            </div>
                            <div 
                                onClick={() => handleFilterCard('paid')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    status === 'paid' ? 'ring-2 ring-emerald-400 border-emerald-500' : 'border-gray-100 border-l-4 border-l-emerald-500'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Dibayar</p>
                                <p className="text-xl sm:text-3xl font-black text-emerald-600 mt-0.5">{summary?.paid || 0}</p>
                            </div>
                            <div 
                                onClick={() => handleFilterCard('draft')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    status === 'draft' ? 'ring-2 ring-gray-400 border-gray-500' : 'border-gray-100 border-l-4 border-l-gray-400'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Revisi</p>
                                <p className="text-xl sm:text-3xl font-black text-gray-700 mt-0.5">{summary?.draft || 0}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                            <div 
                                onClick={() => handleFilterCard('')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    status === '' && deadline === '' ? 'ring-2 ring-blue-400 border-blue-500' : 'border-gray-100 border-l-4 border-l-blue-500'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Total Persetujuan</p>
                                <p className="text-xl sm:text-3xl font-black text-gray-800 mt-0.5">{summary?.waiting_approval || 0}</p>
                            </div>
                            <div 
                                onClick={() => handleFilterCard('unprocessed')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    status === 'unprocessed' ? 'ring-2 ring-amber-400 border-amber-500' : 'border-gray-100 border-l-4 border-l-amber-500'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Belum Diproses</p>
                                <p className="text-xl sm:text-3xl font-black text-amber-600 mt-0.5">{summary?.unprocessed || 0}</p>
                            </div>
                            <div 
                                onClick={() => handleFilterCard('draft')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    status === 'draft' ? 'ring-2 ring-gray-400 border-gray-500' : 'border-gray-100 border-l-4 border-l-gray-400'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Revisi</p>
                                <p className="text-xl sm:text-3xl font-black text-gray-700 mt-0.5">{summary?.draft || 0}</p>
                            </div>
                            <div 
                                onClick={() => handleFilterCard('', 'nearing')} 
                                className={`bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    deadline === 'nearing' ? 'ring-2 ring-orange-400 border-orange-500' : 'border-gray-100 border-l-4 border-l-orange-500'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Dekat Tempo</p>
                                <p className="text-xl sm:text-3xl font-black text-orange-600 mt-0.5">{summary?.nearing_deadline || 0}</p>
                            </div>
                            <div 
                                onClick={() => handleFilterCard('', 'overdue')} 
                                className={`col-span-2 sm:col-span-1 bg-white p-3 sm:p-4 rounded-2xl shadow-xs border cursor-pointer hover:bg-gray-50 transition active:scale-[0.98] ${
                                    deadline === 'overdue' ? 'ring-2 ring-red-400 border-red-500' : 'border-gray-100 border-l-4 border-l-red-500'
                                }`}
                            >
                                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase truncate">Lewat Tempo</p>
                                <p className="text-xl sm:text-3xl font-black text-rose-600 mt-0.5">{summary?.overdue || 0}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-visible shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 rounded-2xl p-3.5 sm:p-6">
                        {/* Mobile Header: Title & Buat Baru */}
                        <div className="flex items-center justify-between gap-2 mb-4 lg:hidden pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">{pageTitle}</h3>
                                <p className="text-[11px] text-gray-500">Kelola dan pantau status pengajuan</p>
                            </div>
                            {!isApprovalView && (
                                <Link href={route('payment-requests.create')}>
                                    <PrimaryButton className="py-1.5 px-3 text-xs font-bold flex items-center gap-1 shadow-sm rounded-xl">
                                        <Plus size={14} /> Buat Baru
                                    </PrimaryButton>
                                </Link>
                            )}
                        </div>

                        {/* Search and Filters Section */}
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-5 gap-3">
                            <form onSubmit={handleSearch} className="w-full lg:max-w-5xl space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <TextInput
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="block w-full text-sm pl-3 pr-8 py-2 rounded-xl"
                                            placeholder="Cari perihal, nomor, penerima..."
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => { setSearch(''); router.get(route(isApprovalView ? 'payment-approvals.index' : 'payment-requests.index'), { ...filters, search: '' }, { preserveState: true }); }}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Mobile Filter Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                                        className={`lg:hidden px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 ${
                                            activeFilterCount > 0 || showMobileFilter
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Filter size={14} />
                                        <span>Filter</span>
                                        {activeFilterCount > 0 && (
                                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                        {showMobileFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>

                                    {/* Desktop Submit Button */}
                                    <div className="hidden lg:flex items-center gap-2">
                                        <PrimaryButton type="submit" className="py-2 px-4 rounded-xl text-xs font-bold">
                                            Filter
                                        </PrimaryButton>
                                        {(search || status || nominal || categoryFilter || deadline || companyFilter) && (
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition text-center"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Filter Controls (Collapsible on Mobile, Inline on Desktop) */}
                                <div className={`${showMobileFilter ? 'grid' : 'hidden lg:flex'} grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 pt-1`}>
                                    <div className="col-span-1 lg:w-44">
                                        <CustomSelect 
                                            value={companyFilter}
                                            onChange={(val) => {
                                                setCompanyFilter(val);
                                                if (val) {
                                                    localStorage.setItem(storageKey, val);
                                                } else {
                                                    localStorage.removeItem(storageKey);
                                                }
                                            }}
                                            options={companyOptions}
                                        />
                                    </div>
                                    <div className="col-span-1 lg:w-36">
                                        <CustomSelect 
                                            value={status}
                                            onChange={(val) => setStatus(val)}
                                            options={statusOptions}
                                        />
                                    </div>
                                    <div className="col-span-1 lg:w-40">
                                        <CustomSelect 
                                            value={nominal}
                                            onChange={(val) => setNominal(val)}
                                            options={nominalOptions}
                                        />
                                    </div>
                                    <div className="col-span-1 lg:w-36">
                                        <CustomSelect 
                                            value={categoryFilter}
                                            onChange={(val) => setCategoryFilter(val)}
                                            options={categoryFilterOptions}
                                        />
                                    </div>

                                    {/* Mobile Submit/Reset Buttons */}
                                    <div className="col-span-2 flex items-center gap-2 lg:hidden pt-1">
                                        <PrimaryButton type="submit" className="flex-1 justify-center py-2 text-xs font-bold rounded-xl">
                                            Terapkan Filter
                                        </PrimaryButton>
                                        {(search || status || nominal || categoryFilter || deadline || companyFilter) && (
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition text-center"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>

                            {/* Desktop Buat Baru Button */}
                            {!isApprovalView && (
                                <Link href={route('payment-requests.create')} className="hidden lg:block shrink-0">
                                    <PrimaryButton className="rounded-xl flex items-center gap-1.5 font-bold shadow-sm">
                                        <Plus size={15} /> Buat Baru
                                    </PrimaryButton>
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
                                            className="bg-white border border-gray-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-blue-400 cursor-pointer transition active:scale-[0.99] space-y-2.5"
                                        >
                                            {/* Top row: Date + Category Badge on left, Status Badge on right */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                                        <Calendar size={13} className="text-gray-400 shrink-0" />
                                                        {pr.submission_date ? dayjs(pr.submission_date).format('DD MMM YYYY') : '-'}
                                                    </span>
                                                    {renderCategoryBadge(pr.category, pr.purpose)}
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.bg} shrink-0 shadow-xs`}>
                                                    {badge.text}
                                                </span>
                                            </div>

                                            {/* Tujuan Pembayaran */}
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Perihal / Tujuan</div>
                                                <div className="text-sm font-bold text-gray-900 leading-snug mt-0.5 break-words line-clamp-2">
                                                    {pr.purpose || '-'}
                                                </div>
                                            </div>

                                            {/* Requester & Recipient Box */}
                                            <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 text-xs">
                                                <div className="min-w-0">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pengaju</span>
                                                    <span className="font-bold text-gray-800 block truncate">{pr.requester?.name || '-'}</span>
                                                    <span className="text-[11px] text-gray-500 block truncate">{pr.division?.name || '-'}</span>
                                                    {pr.company_name && (
                                                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded truncate max-w-full">
                                                            {pr.company_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="border-l border-gray-200/80 pl-2.5 min-w-0">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Penerima</span>
                                                    <span className="font-bold text-gray-800 block break-words line-clamp-2">{pr.recipient_name || '-'}</span>
                                                </div>
                                            </div>

                                            {!isApprovalView && pr.notes && (
                                                <div className="text-xs text-gray-600 bg-blue-50/50 border border-blue-100/60 rounded-xl px-2.5 py-1.5 line-clamp-2">
                                                    <span className="font-bold text-blue-900">Catatan:</span> {pr.notes}
                                                </div>
                                            )}

                                            {/* Bottom: Total & Actions */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Grand Total</span>
                                                    <span className="text-base font-black text-blue-600 block">
                                                        {formatCurrency(pr.grand_total)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <Link
                                                        href={route(isApprovalView ? 'payment-approvals.show' : 'payment-requests.show', pr.id)}
                                                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye size={14} /> Detail
                                                    </Link>
                                                    {canDownloadPdf && (
                                                        <a
                                                            href={route('payment-requests.pdf', pr.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                                                            title="Unduh PDF"
                                                        >
                                                            <FileText size={15} />
                                                        </a>
                                                    )}
                                                    {isSuperAdmin && (
                                                        <>
                                                            <Link
                                                                href={route(isApprovalView ? 'payment-approvals.edit' : 'payment-requests.edit', pr.id)}
                                                                className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                                                                title="Edit"
                                                            >
                                                                <Edit size={15} />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(pr.id)}
                                                                className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={15} />
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
                                                        {renderCategoryBadge(pr.category, pr.purpose)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900">{pr.requester?.name}</div>
                                                        <div className="text-xs text-gray-500">{pr.division?.name}</div>
                                                        {pr.company_name && (
                                                            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">
                                                                {pr.company_name}
                                                            </span>
                                                        )}
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
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg} whitespace-nowrap shadow-xs`}>
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
