import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import CustomSelect from '@/Components/CustomSelect';
import CustomDatePicker from '@/Components/CustomDatePicker';
import CurrencyInput from '@/Components/CurrencyInput';
import ExportDropdown from '@/Components/ExportDropdown';
import ClientPagination from '@/Components/ClientPagination';
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
    Edit, 
    Trash2, 
    Eye, 
    TrendingUp, 
    TrendingDown, 
    ShieldCheck, 
    Wallet, 
    Building, 
    X, 
    Clock, 
    ChevronDown
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
    const [month, setMonth] = useState(Number(filters.month) || new Date().getMonth() + 1);
    const [year, setYear] = useState(Number(filters.year) || new Date().getFullYear());
    const [companyId, setCompanyId] = useState(filters.company_id || '');
    const [divisionId, setDivisionId] = useState(filters.division_id || '');
    const [search, setSearch] = useState(filters.search || '');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Modals & Expansion
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [previewPayroll, setPreviewPayroll] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [userAttendance, setUserAttendance] = useState(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [month, year, companyId, divisionId, search]);

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
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#9ca3af',
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
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('salaries.destroy', p.id));
            }
        });
    };

    const currentMonthLabel = MONTHS.find(m => m.value === Number(month))?.label || month;
    const paginatedPayrolls = payrolls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Manajemen Gaji</h2>}
        >
            <Head title="Manajemen Gaji" />

            <div className="pb-6 pt-0 space-y-6">
                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Total Karyawan</p>
                            <h4 className="text-xl font-bold text-gray-900 truncate">{summary.total_karyawan || 0}</h4>
                            <p className="text-[11px] text-gray-400">Periode {currentMonthLabel} {year}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Total Penerimaan</p>
                            <h4 className="text-base font-bold text-gray-900 truncate">{formatRp(summary.total_penerimaan)}</h4>
                            <p className="text-[11px] text-emerald-600 font-medium">Gaji Kotor</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Total Potongan</p>
                            <h4 className="text-base font-bold text-red-600 truncate">{formatRp(summary.total_potongan)}</h4>
                            <p className="text-[11px] text-gray-400">BPJS, Pajak, Absen</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">BPJS Perusahaan</p>
                            <h4 className="text-base font-bold text-indigo-600 truncate">{formatRp(summary.total_bpjs_perusahaan)}</h4>
                            <p className="text-[11px] text-gray-400">Ditanggung Kantor</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-emerald-200 bg-emerald-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-emerald-700 font-semibold">Gaji Bersih (THP)</p>
                            <h4 className="text-base font-extrabold text-emerald-700 truncate">{formatRp(summary.total_diterima)}</h4>
                            <p className="text-[11px] text-emerald-600">Total Diterima</p>
                        </div>
                    </div>
                </div>

                {/* Page Heading & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-blue-600" />
                            Daftar Penggajian Karyawan
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                            Kelola komponen penerimaan, potongan BPJS, pajak, dan cetak slip gaji karyawan.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <ExportDropdown
                            pdfRoute={route('salaries.export.pdf', { month, year, company_id: companyId })}
                            excelRoute={route('salaries.export.excel', { month, year, company_id: companyId })}
                        />
                        <button
                            onClick={handleBatchGenerate}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                            title="Generate gaji semua karyawan untuk bulan ini"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate Massal
                        </button>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Gaji
                        </button>
                    </div>
                </div>

                {/* Main Card: Filter + Table + Pagination */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-4 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-gray-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
                            {/* Search */}
                            <div className="relative sm:col-span-2 lg:col-span-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari nama / NIK..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilter(month, year, companyId, divisionId, search);
                                        }
                                    }}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {/* Month */}
                            <div>
                                <CustomSelect
                                    value={month}
                                    onChange={(val) => {
                                        const m = parseInt(val);
                                        setMonth(m);
                                        applyFilter(m, year, companyId, divisionId, search);
                                    }}
                                    options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                                />
                            </div>

                            {/* Year */}
                            <div>
                                <CustomSelect
                                    value={year}
                                    onChange={(val) => {
                                        const y = parseInt(val);
                                        setYear(y);
                                        applyFilter(month, y, companyId, divisionId, search);
                                    }}
                                    options={[2024, 2025, 2026, 2027, 2028].map(y => ({ value: y, label: String(y) }))}
                                />
                            </div>

                            {/* Company */}
                            <div>
                                <CustomSelect
                                    value={companyId}
                                    onChange={(val) => {
                                        setCompanyId(val);
                                        applyFilter(month, year, val, divisionId, search);
                                    }}
                                    options={[
                                        { value: '', label: 'Semua Perusahaan' },
                                        ...companies.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                />
                            </div>

                            {/* Division */}
                            <div>
                                <CustomSelect
                                    value={divisionId}
                                    onChange={(val) => {
                                        setDivisionId(val);
                                        applyFilter(month, year, companyId, val, search);
                                    }}
                                    options={[
                                        { value: '', label: 'Semua Divisi' },
                                        ...divisions.map(d => ({ value: d.id, label: d.name }))
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm shrink-0 text-center">
                            Total Data: <span className="text-gray-900 font-bold">{payrolls.length}</span>
                        </div>
                    </div>

                    {/* Payroll Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Nama Karyawan</th>
                                    <th className="px-6 py-4">Jabatan & Divisi</th>
                                    <th className="px-6 py-4 text-right">Gaji Pokok</th>
                                    <th className="px-6 py-4 text-right">Operasional</th>
                                    <th className="px-6 py-4 text-right">Total Potongan</th>
                                    <th className="px-6 py-4 text-right">Gaji Bersih (THP)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            Belum ada data gaji untuk periode {currentMonthLabel} {year}. Klik tombol "Buat Gaji" atau "Generate Massal".
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPayrolls.map((p) => {
                                        const isExpanded = expandedId === p.id;
                                        return (
                                            <>
                                                <tr 
                                                    key={p.id} 
                                                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                                    className={`border-b border-gray-50 transition-colors cursor-pointer ${
                                                        isExpanded ? 'bg-blue-50/60' : 'bg-white hover:bg-blue-50'
                                                    }`}
                                                >
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                                {(p.user?.name || 'K').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-900 font-semibold flex items-center gap-1.5">
                                                                    {p.user?.name ?? '-'}
                                                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                                                                </div>
                                                                <div className="text-xs text-gray-500 font-normal">
                                                                    {p.user?.employee_id || p.user?.nik || '-'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-700">{p.user?.position?.name || 'Karyawan'}</span>
                                                            <span className="text-xs text-gray-500">{p.user?.division?.name || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900 whitespace-nowrap">
                                                        {formatRp(p.gaji_pokok)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900 whitespace-nowrap">
                                                        {formatRp(p.operasional)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-red-600 whitespace-nowrap">
                                                        {formatRp(p.total_potongan)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                        {formatRp(p.total_diterima)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                            p.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            p.status === 'published' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                            {p.status === 'paid' ? 'Dibayarkan' : p.status === 'published' ? 'Publik' : 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewPayroll(p)}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Lihat Slip Gaji"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <a
                                                                href={route('salaries.slip.pdf', p.id)}
                                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Unduh Slip PDF"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(p)}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit Gaji"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(p)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus Gaji"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Detail Row ketika baris diklik */}
                                                {isExpanded && (
                                                    <tr key={`${p.id}-detail`} className="bg-gray-50/70 border-b border-gray-100">
                                                        <td colSpan="8" className="p-4 sm:p-6">
                                                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
                                                                    <div>
                                                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                                                                            Rincian Lengkap Penggajian
                                                                        </span>
                                                                        <h4 className="text-base font-bold text-gray-900 mt-0.5">
                                                                            {p.user?.name} &bull; Periode {MONTHS.find(m => m.value === p.period_month)?.label} {p.period_year}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                                            Tanggal Pembayaran: <strong>{p.payment_date || '-'}</strong>
                                                                            {p.notes && <span className="ml-2">&bull; Catatan: {p.notes}</span>}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* 3 Kolom Breakdown */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                                                    {/* 1. Penerimaan */}
                                                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2">
                                                                        <h5 className="font-bold text-gray-800 border-b border-gray-200 pb-2 uppercase text-xs flex items-center justify-between">
                                                                            <span>1. Penerimaan</span>
                                                                            <span className="text-blue-600 font-bold">{formatRp(p.total_penerimaan)}</span>
                                                                        </h5>
                                                                        <div className="space-y-1.5 text-gray-600">
                                                                            <div className="flex justify-between">
                                                                                <span>Gaji Pokok:</span>
                                                                                <strong className="text-gray-900">{formatRp(p.gaji_pokok)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Operasional:</span>
                                                                                <strong className="text-gray-900">{formatRp(p.operasional)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Tunjangan Jabatan:</span>
                                                                                <strong className="text-gray-900">{formatRp(p.tunjangan_jabatan)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>THR:</span>
                                                                                <strong className="text-gray-900">{formatRp(p.thr)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Lembur:</span>
                                                                                <strong className="text-gray-900">{formatRp(p.lembur)}</strong>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* 2. Potongan */}
                                                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2">
                                                                        <h5 className="font-bold text-gray-800 border-b border-gray-200 pb-2 uppercase text-xs flex items-center justify-between">
                                                                            <span>2. Potongan</span>
                                                                            <span className="text-red-600 font-bold">{formatRp(p.total_potongan)}</span>
                                                                        </h5>
                                                                        <div className="space-y-1.5 text-gray-600">
                                                                            <div className="flex justify-between">
                                                                                <span>BPJS Kesehatan ({p.bpjs_kesehatan_persen}%):</span>
                                                                                <strong className="text-red-600">{formatRp(p.bpjs_kesehatan)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>BPJS TK ({p.bpjs_ketenagakerjaan_persen}%):</span>
                                                                                <strong className="text-red-600">{formatRp(p.bpjs_ketenagakerjaan)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Pajak (PPh 21):</span>
                                                                                <strong className="text-red-600">{formatRp(p.pajak)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Piutang / Kasbon:</span>
                                                                                <strong className="text-red-600">{formatRp(p.piutang)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Potongan Absen:</span>
                                                                                <strong className="text-red-600">{formatRp(p.potongan_absen)}</strong>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Potongan Lainnya:</span>
                                                                                <strong className="text-red-600">{formatRp(p.potongan_lainnya)}</strong>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* 3. BPJS Perusahaan & THP */}
                                                                    <div className="space-y-3">
                                                                        <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl space-y-1.5">
                                                                            <h5 className="font-bold text-indigo-900 border-b border-indigo-100 pb-1.5 uppercase text-xs flex items-center justify-between">
                                                                                <span>BPJS Dibayar Kantor</span>
                                                                                <span className="text-indigo-700 font-bold">{formatRp(p.total_bpjs_perusahaan)}</span>
                                                                            </h5>
                                                                            <div className="text-xs space-y-1 text-indigo-900">
                                                                                <div className="flex justify-between">
                                                                                    <span>BPJS Kes ({p.bpjs_kesehatan_perusahaan_persen}%):</span>
                                                                                    <strong>{formatRp(p.bpjs_kesehatan_perusahaan)}</strong>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>BPJS TK ({p.bpjs_ketenagakerjaan_perusahaan_persen}%):</span>
                                                                                    <strong>{formatRp(p.bpjs_ketenagakerjaan_perusahaan)}</strong>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
                                                                            <span className="text-[11px] font-bold text-emerald-800 uppercase block tracking-wider">
                                                                                Gaji Bersih Diterima (THP):
                                                                            </span>
                                                                            <span className="text-xl font-bold text-emerald-700 block mt-1">
                                                                                {formatRp(p.total_diterima)}
                                                                            </span>
                                                                            {p.terbilang && (
                                                                                <span className="text-[11px] text-gray-500 italic block mt-1">
                                                                                    Terbilang: {p.terbilang}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {payrolls.length > 0 && (
                        <div className="border-t border-gray-100">
                            <ClientPagination
                                total={payrolls.length}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                                alwaysShow={true}
                            />
                        </div>
                    )}
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
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {editingPayroll ? 'Edit Data Gaji Karyawan' : 'Input Data Gaji Baru'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Gaji Pokok & Operasional tersinkronisasi otomatis dengan Data Pengguna.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        {/* Employee & Period Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div>
                                <InputLabel value="Karyawan *" />
                                {editingPayroll ? (
                                    <div className="mt-1 p-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-900 text-sm">
                                        {editingPayroll.user?.name}
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <CustomSelect
                                            value={data.user_id}
                                            onChange={(val) => handleUserChange(val)}
                                            options={users.map(u => ({
                                                value: u.id,
                                                label: `${u.name}${u.division?.name ? ` (${u.division.name})` : ''}`
                                            }))}
                                            placeholder="-- Pilih Karyawan --"
                                        />
                                    </div>
                                )}
                                <InputError message={errors.user_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Periode Bulan & Tahun *" />
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <CustomSelect
                                        value={data.period_month}
                                        onChange={(val) => {
                                            const m = parseInt(val);
                                            setData('period_month', m);
                                            if (data.user_id) fetchAttendanceSummary(data.user_id, m, data.period_year);
                                        }}
                                        options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                                    />
                                    <CustomSelect
                                        value={data.period_year}
                                        onChange={(val) => {
                                            const y = parseInt(val);
                                            setData('period_year', y);
                                            if (data.user_id) fetchAttendanceSummary(data.user_id, data.period_month, y);
                                        }}
                                        options={[2024, 2025, 2026, 2027, 2028].map(y => ({ value: y, label: String(y) }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Tanggal Pembayaran" />
                                <div className="mt-1">
                                    <CustomDatePicker
                                        value={data.payment_date}
                                        onChange={(val) => setData('payment_date', val)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Attendance helper badge if available */}
                        {userAttendance && (
                            <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl flex flex-wrap items-center justify-between text-xs text-blue-900 gap-2">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    Rekap Absensi Bulan Ini:
                                </div>
                                <div className="flex items-center gap-3 font-medium">
                                    <span className="text-emerald-700">Hadir: <strong>{userAttendance.hadir}</strong></span>
                                    <span className="text-amber-700">Terlambat: <strong>{userAttendance.terlambat}</strong></span>
                                    <span className="text-blue-700">Izin: <strong>{userAttendance.izin}</strong></span>
                                    <span className="text-purple-700">Sakit: <strong>{userAttendance.sakit}</strong></span>
                                    <span className="text-red-600">Absen: <strong>{userAttendance.absen}</strong></span>
                                </div>
                            </div>
                        )}

                        {/* SECTION 1: PENERIMAAN */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                    1. Penerimaan
                                </h4>
                                <span className="text-xs font-bold text-blue-600">
                                    Subtotal: {formatRp(computedTotals.totalPenerimaan)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel value="Gaji Pokok (Rp) *" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.gaji_pokok}
                                        onChange={(val) => setData('gaji_pokok', val)}
                                        placeholder="0"
                                        required
                                    />
                                    <p className="text-[11px] text-gray-400 mt-0.5">Tersinkron ke Data Pengguna</p>
                                </div>

                                <div>
                                    <InputLabel value="Operasional (Rp)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.operasional}
                                        onChange={(val) => setData('operasional', val)}
                                        placeholder="0"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-0.5">Tersinkron ke Data Pengguna</p>
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
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                    2. Potongan
                                </h4>
                                <span className="text-xs font-bold text-red-600">
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
                                                className="w-14 text-xs font-semibold py-0.5 px-1.5 rounded-lg border-gray-300 text-right"
                                            />
                                            <span className="text-xs font-semibold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full"
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
                                                className="w-14 text-xs font-semibold py-0.5 px-1.5 rounded-lg border-gray-300 text-right"
                                            />
                                            <span className="text-xs font-semibold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.bpjs_ketenagakerjaan !== '' ? data.bpjs_ketenagakerjaan : computedTotals.bpjsTk}
                                        onChange={(val) => setData('bpjs_ketenagakerjaan', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Pajak (PPh 21)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.pajak}
                                        onChange={(val) => setData('pajak', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Piutang / Pinjaman" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.piutang}
                                        onChange={(val) => setData('piutang', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Potongan Absen" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.potongan_absen}
                                        onChange={(val) => setData('potongan_absen', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Potongan Lainnya" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.potongan_lainnya}
                                        onChange={(val) => setData('potongan_lainnya', val)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: BPJS PERUSAHAAN */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                    3. BPJS yang Dibayarkan Perusahaan
                                </h4>
                                <span className="text-xs font-bold text-indigo-600">
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
                                                className="w-14 text-xs font-semibold py-0.5 px-1.5 rounded-lg border-gray-300 text-right"
                                            />
                                            <span className="text-xs font-semibold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full"
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
                                                className="w-14 text-xs font-semibold py-0.5 px-1.5 rounded-lg border-gray-300 text-right"
                                            />
                                            <span className="text-xs font-semibold text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.bpjs_ketenagakerjaan_perusahaan !== '' ? data.bpjs_ketenagakerjaan_perusahaan : computedTotals.bpjsTkCo}
                                        onChange={(val) => setData('bpjs_ketenagakerjaan_perusahaan', val)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TOTAL DITERIMA & STATUS */}
                        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                                    Total Yang Diterima (Take Home Pay)
                                </span>
                                <span className="text-2xl font-extrabold text-emerald-700">
                                    {formatRp(computedTotals.totalDiterima)}
                                </span>
                            </div>

                            <div className="w-full sm:w-56">
                                <InputLabel value="Status Slip" />
                                <div className="mt-1">
                                    <CustomSelect
                                        value={data.status}
                                        onChange={(val) => setData('status', val)}
                                        options={[
                                            { value: 'published', label: 'Publik (Terlihat Karyawan)' },
                                            { value: 'paid', label: 'Dibayarkan' },
                                            { value: 'draft', label: 'Draft (Rahasia)' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel value="Catatan Penggajian (Opsional)" />
                            <TextInput
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Contoh: Termasuk lembur project akhir bulan..."
                                className="mt-1 block w-full text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl px-5 py-2.5">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : editingPayroll ? 'Simpan Perubahan' : 'Buat Slip Gaji'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Preview Slip Gaji */}
            <Modal show={!!previewPayroll} onClose={() => setPreviewPayroll(null)} maxWidth="2xl">
                {previewPayroll && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Pratinjau Slip Gaji
                            </h3>
                            <button
                                onClick={() => setPreviewPayroll(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm text-xs space-y-4">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm uppercase">
                                        {previewPayroll.company?.name || previewPayroll.user?.company?.name || 'SANZAYA GROUP'}
                                    </h4>
                                    <p className="text-[11px] text-gray-500">
                                        {previewPayroll.company?.address || 'Indonesia'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gray-900 text-sm block">SLIP GAJI</span>
                                    <span className="text-blue-600 font-semibold">
                                        {MONTHS.find(m => m.value === previewPayroll.period_month)?.label} {previewPayroll.period_year}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Nama Karyawan</span>
                                    <span className="font-semibold text-gray-900">{previewPayroll.user?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Jabatan / Divisi</span>
                                    <span className="font-semibold text-gray-900">
                                        {previewPayroll.user?.position?.name || '-'} / {previewPayroll.user?.division?.name || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">NIK / ID</span>
                                    <span className="font-semibold text-gray-900">
                                        {previewPayroll.user?.employee_id || previewPayroll.user?.nik || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Tanggal Bayar</span>
                                    <span className="font-semibold text-gray-900">{previewPayroll.payment_date || '-'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase text-[11px]">
                                        Penerimaan
                                    </h5>
                                    <div className="space-y-1.5 text-gray-600">
                                        <div className="flex justify-between"><span>Gaji Pokok:</span><strong className="text-gray-900">{formatRp(previewPayroll.gaji_pokok)}</strong></div>
                                        <div className="flex justify-between"><span>Operasional:</span><strong className="text-gray-900">{formatRp(previewPayroll.operasional)}</strong></div>
                                        <div className="flex justify-between"><span>T. Jabatan:</span><strong className="text-gray-900">{formatRp(previewPayroll.tunjangan_jabatan)}</strong></div>
                                        <div className="flex justify-between"><span>THR:</span><strong className="text-gray-900">{formatRp(previewPayroll.thr)}</strong></div>
                                        <div className="flex justify-between"><span>Lembur:</span><strong className="text-gray-900">{formatRp(previewPayroll.lembur)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-blue-600">
                                            <span>Total Penerimaan:</span>
                                            <span>{formatRp(previewPayroll.total_penerimaan)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase text-[11px]">
                                        Potongan
                                    </h5>
                                    <div className="space-y-1.5 text-gray-600">
                                        <div className="flex justify-between"><span>BPJS Kesehatan ({previewPayroll.bpjs_kesehatan_persen}%):</span><strong className="text-red-600">{formatRp(previewPayroll.bpjs_kesehatan)}</strong></div>
                                        <div className="flex justify-between"><span>BPJS TK ({previewPayroll.bpjs_ketenagakerjaan_persen}%):</span><strong className="text-red-600">{formatRp(previewPayroll.bpjs_ketenagakerjaan)}</strong></div>
                                        <div className="flex justify-between"><span>Pajak (PPh 21):</span><strong className="text-red-600">{formatRp(previewPayroll.pajak)}</strong></div>
                                        <div className="flex justify-between"><span>Piutang:</span><strong className="text-red-600">{formatRp(previewPayroll.piutang)}</strong></div>
                                        <div className="flex justify-between"><span>Pot. Absen:</span><strong className="text-red-600">{formatRp(previewPayroll.potongan_absen)}</strong></div>
                                        <div className="flex justify-between"><span>Lainnya:</span><strong className="text-red-600">{formatRp(previewPayroll.potongan_lainnya)}</strong></div>
                                        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-red-600">
                                            <span>Total Potongan:</span>
                                            <span>{formatRp(previewPayroll.total_potongan)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-[11px] text-indigo-900 flex justify-between items-center">
                                <span>BPJS yang Dibayarkan Perusahaan (Kes {previewPayroll.bpjs_kesehatan_perusahaan_persen}% + TK {previewPayroll.bpjs_ketenagakerjaan_perusahaan_persen}%):</span>
                                <strong className="font-bold">{formatRp(previewPayroll.total_bpjs_perusahaan)}</strong>
                            </div>

                            <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex justify-between items-center">
                                <span className="font-bold text-emerald-900 uppercase">Gaji Diterima (THP):</span>
                                <span className="text-lg font-extrabold text-emerald-700">{formatRp(previewPayroll.total_diterima)}</span>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setPreviewPayroll(null)} className="rounded-xl px-4 py-2">
                                Tutup
                            </SecondaryButton>
                            <a
                                href={route('salaries.slip.pdf', previewPayroll.id)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md"
                            >
                                <Download className="w-4 h-4" />
                                Unduh PDF
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
