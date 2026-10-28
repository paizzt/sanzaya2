import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CurrencyInput from '@/Components/CurrencyInput';
import Swal from 'sweetalert2';
import axios from 'axios';
import { 
    DollarSign, 
    Users, 
    FileText, 
    Download, 
    Plus, 
    Sparkles, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    Eye, 
    TrendingUp, 
    TrendingDown, 
    ShieldCheck, 
    Wallet, 
    Building2, 
    X, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Calendar,
    Printer,
    FileSpreadsheet
} from 'lucide-react';

const MONTHS = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

export default function Index({ auth, payrolls = [], summary = {}, users = [], companies = [], divisions = [], filters = {} }) {
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [companyId, setCompanyId] = useState(filters.company_id || '');
    const [divisionId, setDivisionId] = useState(filters.division_id || '');
    const [search, setSearch] = useState(filters.search || '');

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [previewPayroll, setPreviewPayroll] = useState(null);
    const [userAttendance, setUserAttendance] = useState(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    // Form
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user_id: '',
        period_month: month,
        period_year: year,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'published',
        notes: '',

        // Penerimaan
        gaji_pokok: '',
        operasional: '',
        tunjangan_jabatan: '',
        thr: '',
        lembur: '',

        // Potongan
        bpjs_kesehatan_persen: '1.0',
        bpjs_kesehatan: '',
        bpjs_ketenagakerjaan_persen: '2.0',
        bpjs_ketenagakerjaan: '',
        pajak: '',
        piutang: '',
        potongan_absen: '',
        potongan_lainnya: '',

        // BPJS Perusahaan
        bpjs_kesehatan_perusahaan_persen: '4.0',
        bpjs_kesehatan_perusahaan: '',
        bpjs_ketenagakerjaan_perusahaan_persen: '4.24',
        bpjs_ketenagakerjaan_perusahaan: '',
    });

    // Helper formatter
    const formatRp = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(val))}`;
    };

    // Apply Filter
    const applyFilter = (newMonth = month, newYear = year, newCompany = companyId, newDivision = divisionId, newSearch = search) => {
        router.get(route('salaries.index'), {
            month: newMonth,
            year: newYear,
            company_id: newCompany,
            division_id: newDivision,
            search: newSearch
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Live Calculations for Modal Form
    const computedTotals = useMemo(() => {
        const gajiPokok = parseFloat(data.gaji_pokok) || 0;
        const operasional = parseFloat(data.operasional) || 0;
        const tunjanganJabatan = parseFloat(data.tunjangan_jabatan) || 0;
        const thr = parseFloat(data.thr) || 0;
        const lembur = parseFloat(data.lembur) || 0;

        const totalPenerimaan = gajiPokok + operasional + tunjanganJabatan + thr + lembur;

        // Auto BPJS deductions based on percentage unless explicitly overridden
        const kesPercent = parseFloat(data.bpjs_kesehatan_persen) || 0;
        const tkPercent = parseFloat(data.bpjs_ketenagakerjaan_persen) || 0;
        const kesCoPercent = parseFloat(data.bpjs_kesehatan_perusahaan_persen) || 0;
        const tkCoPercent = parseFloat(data.bpjs_ketenagakerjaan_perusahaan_persen) || 0;

        const bpjsKes = data.bpjs_kesehatan !== '' ? parseFloat(data.bpjs_kesehatan) || 0 : Math.round((gajiPokok * kesPercent) / 100);
        const bpjsTk = data.bpjs_ketenagakerjaan !== '' ? parseFloat(data.bpjs_ketenagakerjaan) || 0 : Math.round((gajiPokok * tkPercent) / 100);

        const bpjsKesCo = data.bpjs_kesehatan_perusahaan !== '' ? parseFloat(data.bpjs_kesehatan_perusahaan) || 0 : Math.round((gajiPokok * kesCoPercent) / 100);
        const bpjsTkCo = data.bpjs_ketenagakerjaan_perusahaan !== '' ? parseFloat(data.bpjs_ketenagakerjaan_perusahaan) || 0 : Math.round((gajiPokok * tkCoPercent) / 100);

        const pajak = parseFloat(data.pajak) || 0;
        const piutang = parseFloat(data.piutang) || 0;
        const potonganAbsen = parseFloat(data.potongan_absen) || 0;
        const potonganLain = parseFloat(data.potongan_lainnya) || 0;

        const totalPotongan = bpjsKes + bpjsTk + pajak + piutang + potonganAbsen + potonganLain;
        const totalBpjsPerusahaan = bpjsKesCo + bpjsTkCo;
        const totalDiterima = Math.max(0, totalPenerimaan - totalPotongan);

        return {
            totalPenerimaan,
            bpjsKes,
            bpjsTk,
            bpjsKesCo,
            bpjsTkCo,
            totalPotongan,
            totalBpjsPerusahaan,
            totalDiterima,
        };
    }, [data]);

    // Handle User Selection in Form
    const handleUserChange = (selectedUserId) => {
        setData('user_id', selectedUserId);
        setUserAttendance(null);

        if (!selectedUserId) return;

        const selected = users.find(u => String(u.id) === String(selectedUserId));
        if (selected) {
            const baseSalary = selected.salary || '';
            const operasional = selected.operational_allowance || '';

            setData(prev => {
                const gaji = parseFloat(baseSalary) || 0;
                const kesPct = parseFloat(prev.bpjs_kesehatan_persen) || 1.0;
                const tkPct = parseFloat(prev.bpjs_ketenagakerjaan_persen) || 2.0;
                const kesCoPct = parseFloat(prev.bpjs_kesehatan_perusahaan_persen) || 4.0;
                const tkCoPct = parseFloat(prev.bpjs_ketenagakerjaan_perusahaan_persen) || 4.24;

                return {
                    ...prev,
                    user_id: selectedUserId,
                    gaji_pokok: baseSalary,
                    operasional: operasional,
                    bpjs_kesehatan: gaji ? Math.round((gaji * kesPct) / 100) : '',
                    bpjs_ketenagakerjaan: gaji ? Math.round((gaji * tkPct) / 100) : '',
                    bpjs_kesehatan_perusahaan: gaji ? Math.round((gaji * kesCoPct) / 100) : '',
                    bpjs_ketenagakerjaan_perusahaan: gaji ? Math.round((gaji * tkCoPct) / 100) : '',
                };
            });

            // Fetch attendance summary
            fetchAttendanceSummary(selectedUserId, data.period_month, data.period_year);
        }
    };

    // Fetch user attendance summary
    const fetchAttendanceSummary = (userId, m, y) => {
        setLoadingAttendance(true);
        axios.get(route('salaries.user-summary'), {
            params: { user_id: userId, month: m, year: y }
        }).then(res => {
            setUserAttendance(res.data.attendance_count);
        }).catch(() => {
            setUserAttendance(null);
        }).finally(() => {
            setLoadingAttendance(false);
        });
    };

    // Open Form to Add
    const openAddModal = () => {
        clearErrors();
        setEditingPayroll(null);
        setUserAttendance(null);
        reset({
            user_id: '',
            period_month: month,
            period_year: year,
            payment_date: new Date().toISOString().split('T')[0],
            status: 'published',
            notes: '',
            gaji_pokok: '',
            operasional: '',
            tunjangan_jabatan: '',
            thr: '',
            lembur: '',
            bpjs_kesehatan_persen: '1.0',
            bpjs_kesehatan: '',
            bpjs_ketenagakerjaan_persen: '2.0',
            bpjs_ketenagakerjaan: '',
            pajak: '',
            piutang: '',
            potongan_absen: '',
            potongan_lainnya: '',
            bpjs_kesehatan_perusahaan_persen: '4.0',
            bpjs_kesehatan_perusahaan: '',
            bpjs_ketenagakerjaan_perusahaan_persen: '4.24',
            bpjs_ketenagakerjaan_perusahaan: '',
        });
        setIsFormOpen(true);
    };

    // Open Form to Edit
    const openEditModal = (p) => {
        clearErrors();
        setEditingPayroll(p);
        setUserAttendance(null);
        setData({
            user_id: p.user_id,
            period_month: p.period_month,
            period_year: p.period_year,
            payment_date: p.payment_date || new Date().toISOString().split('T')[0],
            status: p.status || 'published',
            notes: p.notes || '',

            gaji_pokok: p.gaji_pokok || '',
            operasional: p.operasional || '',
            tunjangan_jabatan: p.tunjangan_jabatan || '',
            thr: p.thr || '',
            lembur: p.lembur || '',

            bpjs_kesehatan_persen: p.bpjs_kesehatan_persen || '1.0',
            bpjs_kesehatan: p.bpjs_kesehatan || '',
            bpjs_ketenagakerjaan_persen: p.bpjs_ketenagakerjaan_persen || '2.0',
            bpjs_ketenagakerjaan: p.bpjs_ketenagakerjaan || '',
            pajak: p.pajak || '',
            piutang: p.piutang || '',
            potongan_absen: p.potongan_absen || '',
            potongan_lainnya: p.potongan_lainnya || '',

            bpjs_kesehatan_perusahaan_persen: p.bpjs_kesehatan_perusahaan_persen || '4.0',
            bpjs_kesehatan_perusahaan: p.bpjs_kesehatan_perusahaan || '',
            bpjs_ketenagakerjaan_perusahaan_persen: p.bpjs_ketenagakerjaan_perusahaan_persen || '4.24',
            bpjs_ketenagakerjaan_perusahaan: p.bpjs_ketenagakerjaan_perusahaan || '',
        });
        setIsFormOpen(true);
        fetchAttendanceSummary(p.user_id, p.period_month, p.period_year);
    };

    // Submit Form (Add or Edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        // Fill calculated values before submit if empty
        const payload = {
            ...data,
            bpjs_kesehatan: data.bpjs_kesehatan !== '' ? data.bpjs_kesehatan : computedTotals.bpjsKes,
            bpjs_ketenagakerjaan: data.bpjs_ketenagakerjaan !== '' ? data.bpjs_ketenagakerjaan : computedTotals.bpjsTk,
            bpjs_kesehatan_perusahaan: data.bpjs_kesehatan_perusahaan !== '' ? data.bpjs_kesehatan_perusahaan : computedTotals.bpjsKesCo,
            bpjs_ketenagakerjaan_perusahaan: data.bpjs_ketenagakerjaan_perusahaan !== '' ? data.bpjs_ketenagakerjaan_perusahaan : computedTotals.bpjsTkCo,
        };

        if (editingPayroll) {
            router.post(route('salaries.update', editingPayroll.id), payload, {
                onSuccess: () => {
                    setIsFormOpen(false);
                }
            });
        } else {
            router.post(route('salaries.store'), payload, {
                onSuccess: () => {
                    setIsFormOpen(false);
                }
            });
        }
    };

    // Batch Generate Payrolls for all active users
    const handleBatchGenerate = () => {
        const monthLabel = MONTHS.find(m => m.value === Number(month))?.label || month;
        Swal.fire({
            title: `Generate Gaji ${monthLabel} ${year}?`,
            text: `Sistem akan otomatis membuat/memperbarui data gaji seluruh karyawan aktif berdasarkan Gaji Pokok & Operasional dari Data Pengguna.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, Generate Semua',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((res) => {
            if (res.isConfirmed) {
                router.post(route('salaries.generate'), {
                    month: month,
                    year: year,
                    company_id: companyId,
                });
            }
        });
    };

    // Delete Payroll
    const handleDelete = (p) => {
        Swal.fire({
            title: 'Hapus Data Gaji?',
            text: `Data gaji untuk ${p.user?.name} pada periode ${MONTHS.find(m => m.value === p.period_month)?.label} ${p.period_year} akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('salaries.destroy', p.id));
            }
        });
    };

    const currentMonthLabel = MONTHS.find(m => m.value === Number(month))?.label || month;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Gaji" />

            <div className="space-y-6">
                {/* Page Title & Action Buttons (In-page, not in header) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div>
                        <h2 className="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
                            Manajemen Gaji Karyawan
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Kelola komponen penerimaan, potongan BPJS, pajak, dan cetak slip gaji karyawan.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleBatchGenerate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                            title="Generate gaji semua karyawan untuk bulan ini"
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                            Generate Massal
                        </button>
                        <a
                            href={route('salaries.export.pdf', { month, year, company_id: companyId })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                            title="Ekspor Rekap PDF"
                        >
                            <Download className="w-4 h-4 text-white" />
                            PDF
                        </a>
                        <a
                            href={route('salaries.export.excel', { month, year, company_id: companyId })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                            title="Ekspor Rekap Excel"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-white" />
                            Excel
                        </a>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Gaji
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-500 font-semibold text-xs sm:text-sm mr-1">
                        <Filter className="w-4 h-4 text-blue-600" />
                        Filter:
                    </div>

                    {/* Month */}
                    <div className="w-36">
                        <select
                            value={month}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setMonth(val);
                                applyFilter(val, year, companyId, divisionId, search);
                            }}
                            className="w-full text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-2"
                        >
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year */}
                    <div className="w-28">
                        <select
                            value={year}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setYear(val);
                                applyFilter(month, val, companyId, divisionId, search);
                            }}
                            className="w-full text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-2"
                        >
                            {[2024, 2025, 2026, 2027, 2028].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Company */}
                    <div className="w-44">
                        <select
                            value={companyId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCompanyId(val);
                                applyFilter(month, year, val, divisionId, search);
                            }}
                            className="w-full text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-2"
                        >
                            <option value="">Semua Perusahaan</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Division */}
                    <div className="w-40">
                        <select
                            value={divisionId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setDivisionId(val);
                                applyFilter(month, year, companyId, val, search);
                            }}
                            className="w-full text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-2"
                        >
                            <option value="">Semua Divisi</option>
                            {divisions.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama karyawan / NIK..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    applyFilter(month, year, companyId, divisionId, search);
                                }
                            }}
                            className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Karyawan</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 mt-2">{summary.total_karyawan || 0}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Periode {currentMonthLabel} {year}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Penerimaan</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-sm sm:text-lg font-black text-gray-900 mt-2">{formatRp(summary.total_penerimaan)}</p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Total Gaji Kotor</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Potongan</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-sm sm:text-lg font-black text-rose-600 mt-2">{formatRp(summary.total_potongan)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">BPJS, Pajak, Absen dll</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">BPJS Perusahaan</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-sm sm:text-lg font-black text-indigo-600 mt-2">{formatRp(summary.total_bpjs_perusahaan)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Ditanggung Kantor</p>
                    </div>

                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider">Gaji Bersih (THP)</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-800 text-white flex items-center justify-center">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-base sm:text-xl font-black text-white mt-2">{formatRp(summary.total_diterima)}</p>
                        <p className="text-[10px] text-blue-100 mt-0.5">Total Diterima Karyawan</p>
                    </div>
                </div>

                {/* Payroll Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-extrabold text-gray-900 text-base">Daftar Penggajian Karyawan</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Menampilkan data penggajian bulan {currentMonthLabel} {year}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                            {payrolls.length} Karyawan
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase tracking-wider font-bold text-[10px]">
                                    <th className="py-3.5 px-4 text-center w-12">No</th>
                                    <th className="py-3.5 px-4 min-w-[180px]">Karyawan</th>
                                    <th className="py-3.5 px-4 text-right min-w-[120px]">Gaji Pokok</th>
                                    <th className="py-3.5 px-4 text-right min-w-[110px]">Operasional</th>
                                    <th className="py-3.5 px-4 text-right min-w-[120px]">Penerimaan Lain</th>
                                    <th className="py-3.5 px-4 text-right font-black text-gray-700 min-w-[120px]">Total Penerimaan</th>
                                    <th className="py-3.5 px-4 text-right min-w-[110px]">BPJS Karyawan</th>
                                    <th className="py-3.5 px-4 text-right min-w-[110px]">Potongan Lain</th>
                                    <th className="py-3.5 px-4 text-right font-black text-rose-600 min-w-[110px]">Total Potongan</th>
                                    <th className="py-3.5 px-4 text-right min-w-[110px]">BPJS Kantor</th>
                                    <th className="py-3.5 px-4 text-right font-black text-emerald-600 min-w-[130px]">Gaji Diterima (THP)</th>
                                    <th className="py-3.5 px-4 text-center w-24">Status</th>
                                    <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <DollarSign className="w-12 h-12 text-gray-300 stroke-1 mb-2" />
                                                <p className="font-semibold text-gray-600">Belum ada data gaji untuk periode ini</p>
                                                <p className="text-xs text-gray-400 mt-1">Klik tombol "Buat Gaji" atau "Generate Massal" untuk membuat data penggajian.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payrolls.map((p, idx) => {
                                        const otherEarnings = (p.tunjangan_jabatan || 0) + (p.thr || 0) + (p.lembur || 0);
                                        const employeeBpjs = (p.bpjs_kesehatan || 0) + (p.bpjs_ketenagakerjaan || 0);
                                        const otherDeductions = (p.pajak || 0) + (p.piutang || 0) + (p.potongan_absen || 0) + (p.potongan_lainnya || 0);

                                        return (
                                            <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                                                <td className="py-3.5 px-4 text-center text-gray-400 font-medium">{idx + 1}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-gray-900">{p.user?.name ?? '-'}</div>
                                                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                        <span>{p.user?.employee_id || p.user?.nik || '-'}</span>
                                                        <span>&bull;</span>
                                                        <span className="text-blue-600 font-medium">{p.user?.division?.name || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-semibold text-gray-800">{formatRp(p.gaji_pokok)}</td>
                                                <td className="py-3.5 px-4 text-right font-medium text-gray-700">{formatRp(p.operasional)}</td>
                                                <td className="py-3.5 px-4 text-right text-gray-600">
                                                    {otherEarnings > 0 ? (
                                                        <span className="font-semibold text-indigo-600" title={`Jabatan: ${formatRp(p.tunjangan_jabatan)}, THR: ${formatRp(p.thr)}, Lembur: ${formatRp(p.lembur)}`}>
                                                            {formatRp(otherEarnings)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-extrabold text-gray-900 bg-gray-50">
                                                    {formatRp(p.total_penerimaan)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right text-rose-600 font-medium">
                                                    {employeeBpjs > 0 ? formatRp(employeeBpjs) : '-'}
                                                </td>
                                                <td className="py-3.5 px-4 text-right text-rose-600 font-medium">
                                                    {otherDeductions > 0 ? formatRp(otherDeductions) : '-'}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-bold text-rose-600 bg-rose-50">
                                                    {formatRp(p.total_potongan)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right text-indigo-600 font-medium">
                                                    {formatRp(p.total_bpjs_perusahaan)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-black text-emerald-600 bg-emerald-50 text-sm">
                                                    {formatRp(p.total_diterima)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                        p.status === 'paid' ? 'bg-emerald-600 text-white shadow-sm' :
                                                        p.status === 'published' ? 'bg-blue-600 text-white shadow-sm' :
                                                        'bg-gray-600 text-white shadow-sm'
                                                    }`}>
                                                        {p.status === 'paid' ? 'Dibayarkan' : p.status === 'published' ? 'Publik' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => setPreviewPayroll(p)}
                                                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
                                                            title="Lihat Slip Gaji"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <a
                                                            href={route('salaries.slip.pdf', p.id)}
                                                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all"
                                                            title="Unduh PDF Slip"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
                                                        <button
                                                            onClick={() => openEditModal(p)}
                                                            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition-all"
                                                            title="Edit Gaji"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p)}
                                                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all"
                                                            title="Hapus Gaji"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal: Tambah / Edit Gaji */}
            <Modal show={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="3xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-lg">
                                    {editingPayroll ? 'Edit Data Gaji Karyawan' : 'Input Data Gaji Baru'}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Gaji Pokok & Operasional tersinkronisasi otomatis dengan Data Pengguna.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-5 space-y-6 max-h-[75vh] overflow-y-auto pr-1">

                        {/* Employee & Period Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <div>
                                <InputLabel value="Karyawan *" />
                                {editingPayroll ? (
                                    <div className="mt-1 p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 text-sm">
                                        {editingPayroll.user?.name}
                                    </div>
                                ) : (
                                    <select
                                        value={data.user_id}
                                        onChange={(e) => handleUserChange(e.target.value)}
                                        className="mt-1 w-full text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-2.5"
                                        required
                                    >
                                        <option value="">-- Pilih Karyawan --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} {u.division?.name ? `(${u.division.name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <InputError message={errors.user_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Periode Bulan & Tahun *" />
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <select
                                        value={data.period_month}
                                        onChange={(e) => {
                                            const m = parseInt(e.target.value);
                                            setData('period_month', m);
                                            if (data.user_id) fetchAttendanceSummary(data.user_id, m, data.period_year);
                                        }}
                                        className="w-full text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-2.5"
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={data.period_year}
                                        onChange={(e) => {
                                            const y = parseInt(e.target.value);
                                            setData('period_year', y);
                                            if (data.user_id) fetchAttendanceSummary(data.user_id, data.period_month, y);
                                        }}
                                        className="w-full text-xs font-semibold rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-2.5"
                                    >
                                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Tanggal Pembayaran" />
                                <TextInput
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                />
                            </div>
                        </div>

                        {/* Attendance helper badge if available */}
                        {userAttendance && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex flex-wrap items-center justify-between text-xs text-blue-900 gap-2">
                                <div className="flex items-center gap-2 font-bold">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    Rekap Absensi Bulan Ini:
                                </div>
                                <div className="flex items-center gap-3 font-semibold text-[11px]">
                                    <span className="text-emerald-700">Hadir: <strong>{userAttendance.hadir}</strong></span>
                                    <span className="text-amber-700">Terlambat: <strong>{userAttendance.terlambat}</strong></span>
                                    <span className="text-blue-700">Izin: <strong>{userAttendance.izin}</strong></span>
                                    <span className="text-purple-700">Sakit: <strong>{userAttendance.sakit}</strong></span>
                                    <span className="text-rose-700">Absen: <strong>{userAttendance.absen}</strong></span>
                                </div>
                            </div>
                        )}

                        {/* SECTION 1: PENERIMAAN */}
                        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-blue-50 pb-2">
                                <h4 className="font-extrabold text-blue-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                    1. Penerimaan
                                </h4>
                                <span className="text-xs font-black text-blue-700">
                                    Subtotal: {formatRp(computedTotals.totalPenerimaan)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel value="Gaji Pokok (Rp) *" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.gaji_pokok}
                                        onChange={(val) => {
                                            setData('gaji_pokok', val);
                                        }}
                                        placeholder="0"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400 mt-0.5">Tersinkron ke Data Pengguna</p>
                                </div>

                                <div>
                                    <InputLabel value="Operasional (Rp)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.operasional}
                                        onChange={(val) => setData('operasional', val)}
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-0.5">Tersinkron ke Data Pengguna</p>
                                </div>

                                <div>
                                    <InputLabel value="Tunjangan Jabatan (Rp)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.tunjangan_jabatan}
                                        onChange={(val) => setData('tunjangan_jabatan', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="THR (Rp)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.thr}
                                        onChange={(val) => setData('thr', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Lembur (Rp)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.lembur}
                                        onChange={(val) => setData('lembur', val)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: POTONGAN */}
                        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-rose-50 pb-2">
                                <h4 className="font-extrabold text-rose-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                                    <TrendingDown className="w-4 h-4 text-rose-600" />
                                    2. Potongan
                                </h4>
                                <span className="text-xs font-black text-rose-700">
                                    Subtotal: {formatRp(computedTotals.totalPotongan)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {/* BPJS Kesehatan */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="Iuran BPJS Kesehatan" />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={data.bpjs_kesehatan_persen}
                                                onChange={(e) => {
                                                    const pct = e.target.value;
                                                    setData('bpjs_kesehatan_persen', pct);
                                                    if (data.gaji_pokok) {
                                                        const val = Math.round((parseFloat(data.gaji_pokok) * parseFloat(pct || 0)) / 100);
                                                        setData(prev => ({ ...prev, bpjs_kesehatan_persen: pct, bpjs_kesehatan: val }));
                                                    }
                                                }}
                                                className="w-14 text-[11px] font-bold py-0.5 px-1 rounded-lg border-gray-300 text-right"
                                                title="Persentase BPJS Kesehatan Karyawan"
                                            />
                                            <span className="text-[11px] font-bold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full text-rose-700"
                                        value={data.bpjs_kesehatan !== '' ? data.bpjs_kesehatan : computedTotals.bpjsKes}
                                        onChange={(val) => setData('bpjs_kesehatan', val)}
                                        placeholder="0"
                                    />
                                </div>

                                {/* BPJS Ketenagakerjaan */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="Iuran BPJS TK" />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={data.bpjs_ketenagakerjaan_persen}
                                                onChange={(e) => {
                                                    const pct = e.target.value;
                                                    setData('bpjs_ketenagakerjaan_persen', pct);
                                                    if (data.gaji_pokok) {
                                                        const val = Math.round((parseFloat(data.gaji_pokok) * parseFloat(pct || 0)) / 100);
                                                        setData(prev => ({ ...prev, bpjs_ketenagakerjaan_persen: pct, bpjs_ketenagakerjaan: val }));
                                                    }
                                                }}
                                                className="w-14 text-[11px] font-bold py-0.5 px-1 rounded-lg border-gray-300 text-right"
                                                title="Persentase BPJS Ketenagakerjaan Karyawan"
                                            />
                                            <span className="text-[11px] font-bold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full text-rose-700"
                                        value={data.bpjs_ketenagakerjaan !== '' ? data.bpjs_ketenagakerjaan : computedTotals.bpjsTk}
                                        onChange={(val) => setData('bpjs_ketenagakerjaan', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Pajak (PPh 21)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full text-rose-700"
                                        value={data.pajak}
                                        onChange={(val) => setData('pajak', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Piutang / Pinjaman" />
                                    <CurrencyInput
                                        className="mt-1 block w-full text-rose-700"
                                        value={data.piutang}
                                        onChange={(val) => setData('piutang', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Potongan Absen" />
                                    <CurrencyInput
                                        className="mt-1 block w-full text-rose-700"
                                        value={data.potongan_absen}
                                        onChange={(val) => setData('potongan_absen', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Potongan Lainnya" />
                                    <CurrencyInput
                                        className="mt-1 block w-full text-rose-700"
                                        value={data.potongan_lainnya}
                                        onChange={(val) => setData('potongan_lainnya', val)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: BPJS PERUSAHAAN */}
                        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-indigo-50 pb-2">
                                <h4 className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                    3. BPJS yang Dibayarkan Perusahaan
                                </h4>
                                <span className="text-xs font-black text-indigo-700">
                                    Subtotal: {formatRp(computedTotals.totalBpjsPerusahaan)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="BPJS Kesehatan Perusahaan" />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={data.bpjs_kesehatan_perusahaan_persen}
                                                onChange={(e) => {
                                                    const pct = e.target.value;
                                                    setData('bpjs_kesehatan_perusahaan_persen', pct);
                                                    if (data.gaji_pokok) {
                                                        const val = Math.round((parseFloat(data.gaji_pokok) * parseFloat(pct || 0)) / 100);
                                                        setData(prev => ({ ...prev, bpjs_kesehatan_perusahaan_persen: pct, bpjs_kesehatan_perusahaan: val }));
                                                    }
                                                }}
                                                className="w-14 text-[11px] font-bold py-0.5 px-1 rounded-lg border-gray-300 text-right"
                                            />
                                            <span className="text-[11px] font-bold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full text-indigo-700"
                                        value={data.bpjs_kesehatan_perusahaan !== '' ? data.bpjs_kesehatan_perusahaan : computedTotals.bpjsKesCo}
                                        onChange={(val) => setData('bpjs_kesehatan_perusahaan', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="BPJS Ketenagakerjaan Perusahaan" />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.bpjs_ketenagakerjaan_perusahaan_persen}
                                                onChange={(e) => {
                                                    const pct = e.target.value;
                                                    setData('bpjs_ketenagakerjaan_perusahaan_persen', pct);
                                                    if (data.gaji_pokok) {
                                                        const val = Math.round((parseFloat(data.gaji_pokok) * parseFloat(pct || 0)) / 100);
                                                        setData(prev => ({ ...prev, bpjs_ketenagakerjaan_perusahaan_persen: pct, bpjs_ketenagakerjaan_perusahaan: val }));
                                                    }
                                                }}
                                                className="w-14 text-[11px] font-bold py-0.5 px-1 rounded-lg border-gray-300 text-right"
                                            />
                                            <span className="text-[11px] font-bold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full text-indigo-700"
                                        value={data.bpjs_ketenagakerjaan_perusahaan !== '' ? data.bpjs_ketenagakerjaan_perusahaan : computedTotals.bpjsTkCo}
                                        onChange={(val) => setData('bpjs_ketenagakerjaan_perusahaan', val)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TOTAL DITERIMA & STATUS */}
                        <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">
                                    Total Yang Diterima (Take Home Pay)
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                                    {formatRp(computedTotals.totalDiterima)}
                                </span>
                            </div>

                            <div className="w-full sm:w-44">
                                <InputLabel value="Status Slip" />
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 w-full text-xs font-bold rounded-xl border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 py-2"
                                >
                                    <option value="published">Publik (Terlihat Karyawan)</option>
                                    <option value="paid">Dibayarkan</option>
                                    <option value="draft">Draft (Draf Rahasia)</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel value="Catatan Penggajian (Opsional)" />
                            <TextInput
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Contoh: Termasuk lembur project akhir bulan..."
                                className="mt-1 block w-full text-xs"
                            />
                        </div>

                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Menyimpan...' : editingPayroll ? 'Simpan Perubahan' : 'Buat Slip Gaji'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Preview Slip Gaji */}
            <Modal show={!!previewPayroll} onClose={() => setPreviewPayroll(null)} maxWidth="2xl">
                {previewPayroll && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Pratinjau Slip Gaji
                            </h3>
                            <button
                                onClick={() => setPreviewPayroll(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Slip Design Mockup */}
                        <div className="mt-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm text-xs space-y-4">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                    <h4 className="font-extrabold text-blue-900 text-sm uppercase">
                                        {previewPayroll.company?.name || previewPayroll.user?.company?.name || 'SANZAYA GROUP'}
                                    </h4>
                                    <p className="text-[11px] text-gray-500">
                                        {previewPayroll.company?.address || 'Kalimantan Timur, Indonesia'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-gray-900 text-sm block">SLIP GAJI</span>
                                    <span className="text-blue-600 font-bold">
                                        {MONTHS.find(m => m.value === previewPayroll.period_month)?.label} {previewPayroll.period_year}
                                    </span>
                                </div>
                            </div>

                            {/* Employee info */}
                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Nama Karyawan</span>
                                    <span className="font-bold text-gray-900">{previewPayroll.user?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Jabatan / Divisi</span>
                                    <span className="font-bold text-gray-900">
                                        {previewPayroll.user?.position?.name || '-'} / {previewPayroll.user?.division?.name || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">NIK / ID</span>
                                    <span className="font-bold text-gray-900">
                                        {previewPayroll.user?.employee_id || previewPayroll.user?.nik || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Tanggal Bayar</span>
                                    <span className="font-bold text-gray-900">{previewPayroll.payment_date || '-'}</span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-extrabold text-blue-900 border-b border-blue-100 pb-1 mb-2 uppercase text-[11px]">
                                        Penerimaan
                                    </h5>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between"><span>Gaji Pokok:</span><strong className="text-gray-900">{formatRp(previewPayroll.gaji_pokok)}</strong></div>
                                        <div className="flex justify-between"><span>Operasional:</span><strong className="text-gray-900">{formatRp(previewPayroll.operasional)}</strong></div>
                                        <div className="flex justify-between"><span>T. Jabatan:</span><strong className="text-gray-900">{formatRp(previewPayroll.tunjangan_jabatan)}</strong></div>
                                        <div className="flex justify-between"><span>THR:</span><strong className="text-gray-900">{formatRp(previewPayroll.thr)}</strong></div>
                                        <div className="flex justify-between"><span>Lembur:</span><strong className="text-gray-900">{formatRp(previewPayroll.lembur)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-blue-900">
                                            <span>Total Penerimaan:</span>
                                            <span>{formatRp(previewPayroll.total_penerimaan)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-extrabold text-rose-900 border-b border-rose-100 pb-1 mb-2 uppercase text-[11px]">
                                        Potongan
                                    </h5>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between"><span>BPJS Kesehatan ({previewPayroll.bpjs_kesehatan_persen}%):</span><strong className="text-rose-600">{formatRp(previewPayroll.bpjs_kesehatan)}</strong></div>
                                        <div className="flex justify-between"><span>BPJS TK ({previewPayroll.bpjs_ketenagakerjaan_persen}%):</span><strong className="text-rose-600">{formatRp(previewPayroll.bpjs_ketenagakerjaan)}</strong></div>
                                        <div className="flex justify-between"><span>Pajak (PPh 21):</span><strong className="text-rose-600">{formatRp(previewPayroll.pajak)}</strong></div>
                                        <div className="flex justify-between"><span>Piutang:</span><strong className="text-rose-600">{formatRp(previewPayroll.piutang)}</strong></div>
                                        <div className="flex justify-between"><span>Pot. Absen:</span><strong className="text-rose-600">{formatRp(previewPayroll.potongan_absen)}</strong></div>
                                        <div className="flex justify-between"><span>Lainnya:</span><strong className="text-rose-600">{formatRp(previewPayroll.potongan_lainnya)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-rose-700">
                                            <span>Total Potongan:</span>
                                            <span>{formatRp(previewPayroll.total_potongan)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BPJS Kantor */}
                            <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl text-[11px] text-indigo-900 flex justify-between items-center">
                                <span>BPJS yang Dibayarkan Perusahaan (Kes {previewPayroll.bpjs_kesehatan_perusahaan_persen}% + TK {previewPayroll.bpjs_ketenagakerjaan_perusahaan_persen}%):</span>
                                <strong className="font-bold">{formatRp(previewPayroll.total_bpjs_perusahaan)}</strong>
                            </div>

                            {/* Net Pay */}
                            <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-xl flex justify-between items-center">
                                <span className="font-extrabold text-emerald-900 uppercase">Gaji Diterima (THP):</span>
                                <span className="text-lg font-black text-emerald-700">{formatRp(previewPayroll.total_diterima)}</span>
                            </div>

                            <p className="text-[10px] text-center text-gray-400 pt-2 border-t border-gray-100">
                                Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
                            </p>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <a
                                href={route('salaries.slip.pdf', previewPayroll.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Unduh PDF
                            </a>
                            <button
                                onClick={() => setPreviewPayroll(null)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
