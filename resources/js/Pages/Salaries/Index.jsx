import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
    X, 
    Clock, 
    ChevronDown,
    Settings,
    RefreshCw,
    CalendarCheck
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

export default function Index({
    auth,
    payrolls = [],
    summary = {},
    users = [],
    companies = [],
    divisions = [],
    payrollSettings = {},
    filters = {}
}) {
    const [month, setMonth] = useState(Number(filters.month) || new Date().getMonth() + 1);
    const [year, setYear] = useState(Number(filters.year) || new Date().getFullYear());
    const [companyId, setCompanyId] = useState(filters.company_id || '');
    const [divisionId, setDivisionId] = useState(filters.division_id || '');
    const [search, setSearch] = useState(filters.search || '');

    const defaultRates = {
        tarif_potongan_terlambat: Number(payrollSettings?.tarif_potongan_terlambat ?? 20000),
        tarif_lembur_weekday_pertama: Number(payrollSettings?.tarif_lembur_weekday_pertama ?? 30000),
        tarif_lembur_weekday_berikutnya: Number(payrollSettings?.tarif_lembur_weekday_berikutnya ?? 20000),
        tarif_lembur_sabtu: Number(payrollSettings?.tarif_lembur_sabtu ?? 20000),
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [previewPayroll, setPreviewPayroll] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [userAttendance, setUserAttendance] = useState(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [month, year, companyId, divisionId, search]);

    const settingsForm = useForm({
        tarif_potongan_terlambat: defaultRates.tarif_potongan_terlambat,
        tarif_lembur_weekday_pertama: defaultRates.tarif_lembur_weekday_pertama,
        tarif_lembur_weekday_berikutnya: defaultRates.tarif_lembur_weekday_berikutnya,
        tarif_lembur_sabtu: defaultRates.tarif_lembur_sabtu,
        month: month,
        year: year,
        sync_existing: true,
    });

    const { data, setData, processing, errors, reset, clearErrors } = useForm({
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

        jumlah_terlambat: 0,
        tarif_potongan_terlambat: defaultRates.tarif_potongan_terlambat,
        jumlah_lembur_weekday_pertama: 0,
        tarif_lembur_weekday_pertama: defaultRates.tarif_lembur_weekday_pertama,
        jumlah_jam_lembur_weekday_berikutnya: 0,
        tarif_lembur_weekday_berikutnya: defaultRates.tarif_lembur_weekday_berikutnya,
        jumlah_jam_lembur_sabtu: 0,
        tarif_lembur_sabtu: defaultRates.tarif_lembur_sabtu,

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

    const formatRp = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(val))}`;
    };

    const updateOvertimeAndLateFields = (updates) => {
        setData(prev => {
            const next = { ...prev, ...updates };
            const jmlTerlambat = Math.max(0, parseInt(next.jumlah_terlambat) || 0);
            const tarifTerlambat = Math.max(0, parseFloat(next.tarif_potongan_terlambat) || 0);
            const potTerlambat = Math.round(jmlTerlambat * tarifTerlambat);

            const jmlWk1 = Math.max(0, parseInt(next.jumlah_lembur_weekday_pertama) || 0);
            const tarifWk1 = Math.max(0, parseFloat(next.tarif_lembur_weekday_pertama) || 0);
            const jmlWkNext = Math.max(0, parseInt(next.jumlah_jam_lembur_weekday_berikutnya) || 0);
            const tarifWkNext = Math.max(0, parseFloat(next.tarif_lembur_weekday_berikutnya) || 0);
            const jmlSabtu = Math.max(0, parseInt(next.jumlah_jam_lembur_sabtu) || 0);
            const tarifSabtu = Math.max(0, parseFloat(next.tarif_lembur_sabtu) || 0);

            const totalLembur = Math.round((jmlWk1 * tarifWk1) + (jmlWkNext * tarifWkNext) + (jmlSabtu * tarifSabtu));

            return {
                ...next,
                potongan_absen: potTerlambat,
                lembur: totalLembur,
            };
        });
    };

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
        const sisaOperasional = Math.max(0, operasional - potonganAbsen);

        const subLemburWk1 = (parseInt(data.jumlah_lembur_weekday_pertama) || 0) * (parseFloat(data.tarif_lembur_weekday_pertama) || 0);
        const subLemburWkNext = (parseInt(data.jumlah_jam_lembur_weekday_berikutnya) || 0) * (parseFloat(data.tarif_lembur_weekday_berikutnya) || 0);
        const subLemburSabtu = (parseInt(data.jumlah_jam_lembur_sabtu) || 0) * (parseFloat(data.tarif_lembur_sabtu) || 0);

        return {
            totalPenerimaan,
            bpjsKes,
            bpjsTk,
            bpjsKesCo,
            bpjsTkCo,
            totalPotongan,
            totalBpjsPerusahaan,
            totalDiterima,
            sisaOperasional,
            subLemburWk1,
            subLemburWkNext,
            subLemburSabtu,
        };
    }, [data]);

    const fetchAttendanceSummary = (userId, m, y, autoApplyToForm = false) => {
        if (!userId) return;
        setLoadingAttendance(true);
        axios.get(route('salaries.user-summary'), {
            params: { user_id: userId, month: m, year: y }
        }).then(res => {
            const att = res.data.attendance_count;
            setUserAttendance(att);
            if (autoApplyToForm && att) {
                setData(prev => {
                    const tarifTerlambat = parseFloat(prev.tarif_potongan_terlambat) || defaultRates.tarif_potongan_terlambat;
                    const tarifWk1 = parseFloat(prev.tarif_lembur_weekday_pertama) || defaultRates.tarif_lembur_weekday_pertama;
                    const tarifWkNext = parseFloat(prev.tarif_lembur_weekday_berikutnya) || defaultRates.tarif_lembur_weekday_berikutnya;
                    const tarifSabtu = parseFloat(prev.tarif_lembur_sabtu) || defaultRates.tarif_lembur_sabtu;

                    const jmlTerlambat = att.jumlah_terlambat ?? att.terlambat ?? 0;
                    const jmlWk1 = att.jumlah_lembur_weekday_pertama ?? 0;
                    const jmlWkNext = att.jumlah_jam_lembur_weekday_berikutnya ?? 0;
                    const jmlSabtu = att.jumlah_jam_lembur_sabtu ?? 0;

                    const potTerlambat = Math.round(jmlTerlambat * tarifTerlambat);
                    const totalLembur = Math.round((jmlWk1 * tarifWk1) + (jmlWkNext * tarifWkNext) + (jmlSabtu * tarifSabtu));

                    return {
                        ...prev,
                        jumlah_terlambat: jmlTerlambat,
                        jumlah_lembur_weekday_pertama: jmlWk1,
                        jumlah_jam_lembur_weekday_berikutnya: jmlWkNext,
                        jumlah_jam_lembur_sabtu: jmlSabtu,
                        potongan_absen: potTerlambat,
                        lembur: totalLembur,
                    };
                });
            }
        }).catch(() => {
            setUserAttendance(null);
        }).finally(() => {
            setLoadingAttendance(false);
        });
    };

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

            fetchAttendanceSummary(selectedUserId, data.period_month, data.period_year, true);
        }
    };

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
            jumlah_terlambat: 0,
            tarif_potongan_terlambat: defaultRates.tarif_potongan_terlambat,
            jumlah_lembur_weekday_pertama: 0,
            tarif_lembur_weekday_pertama: defaultRates.tarif_lembur_weekday_pertama,
            jumlah_jam_lembur_weekday_berikutnya: 0,
            tarif_lembur_weekday_berikutnya: defaultRates.tarif_lembur_weekday_berikutnya,
            jumlah_jam_lembur_sabtu: 0,
            tarif_lembur_sabtu: defaultRates.tarif_lembur_sabtu,
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

    const openEditModal = (p) => {
        clearErrors();
        setEditingPayroll(p);
        setUserAttendance(null);
        setData({
            user_id: p.user_id,
            period_month: p.period_month,
            period_year: p.period_year,
            payment_date: p.payment_date ? String(p.payment_date).slice(0, 10) : new Date().toISOString().split('T')[0],
            status: p.status || 'published',
            notes: p.notes || '',

            gaji_pokok: p.gaji_pokok || '',
            operasional: p.operasional || '',
            tunjangan_jabatan: p.tunjangan_jabatan || '',
            thr: p.thr || '',
            lembur: p.lembur || '',

            jumlah_terlambat: p.jumlah_terlambat ?? 0,
            tarif_potongan_terlambat: p.tarif_potongan_terlambat ?? defaultRates.tarif_potongan_terlambat,
            jumlah_lembur_weekday_pertama: p.jumlah_lembur_weekday_pertama ?? 0,
            tarif_lembur_weekday_pertama: p.tarif_lembur_weekday_pertama ?? defaultRates.tarif_lembur_weekday_pertama,
            jumlah_jam_lembur_weekday_berikutnya: p.jumlah_jam_lembur_weekday_berikutnya ?? 0,
            tarif_lembur_weekday_berikutnya: p.tarif_lembur_weekday_berikutnya ?? defaultRates.tarif_lembur_weekday_berikutnya,
            jumlah_jam_lembur_sabtu: p.jumlah_jam_lembur_sabtu ?? 0,
            tarif_lembur_sabtu: p.tarif_lembur_sabtu ?? defaultRates.tarif_lembur_sabtu,

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
        fetchAttendanceSummary(p.user_id, p.period_month, p.period_year, false);
    };

    const openSettingsModal = () => {
        settingsForm.setData({
            tarif_potongan_terlambat: defaultRates.tarif_potongan_terlambat,
            tarif_lembur_weekday_pertama: defaultRates.tarif_lembur_weekday_pertama,
            tarif_lembur_weekday_berikutnya: defaultRates.tarif_lembur_weekday_berikutnya,
            tarif_lembur_sabtu: defaultRates.tarif_lembur_sabtu,
            month: month,
            year: year,
            sync_existing: true,
        });
        setIsSettingsOpen(true);
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('salaries.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSettingsOpen(false);
            }
        });
    };

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

    const handleBatchGenerate = () => {
        const monthLabel = MONTHS.find(m => m.value === Number(month))?.label || month;
        Swal.fire({
            title: `Generate Gaji ${monthLabel} ${year}?`,
            text: `Data gaji, lembur, dan keterlambatan akan disinkronkan otomatis dari Data Pengguna & Rekap Absensi.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Generate',
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

    const handleDelete = (p) => {
        Swal.fire({
            title: 'Hapus Data Gaji?',
            text: `Data gaji ${p.user?.name} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Hapus',
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-3 sm:gap-3.5 hover:shadow-md transition-all">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Total Karyawan</p>
                            <h4 className="text-base sm:text-lg font-black text-gray-900 truncate">{summary.total_karyawan || 0}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-3 sm:gap-3.5 hover:shadow-md transition-all">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Total Penerimaan</p>
                            <h4 className="text-sm sm:text-base font-black text-gray-900 truncate">{formatRp(summary.total_penerimaan)}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-3 sm:gap-3.5 hover:shadow-md transition-all">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Total Potongan</p>
                            <h4 className="text-sm sm:text-base font-black text-red-600 truncate">{formatRp(summary.total_potongan)}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-3 sm:gap-3.5 hover:shadow-md transition-all">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">BPJS Kantor</p>
                            <h4 className="text-sm sm:text-base font-black text-indigo-600 truncate">{formatRp(summary.total_bpjs_perusahaan)}</h4>
                        </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-3 sm:gap-3.5 hover:shadow-md transition-all">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Gaji Bersih</p>
                            <h4 className="text-sm sm:text-base font-black text-emerald-700 truncate">{formatRp(summary.total_diterima)}</h4>
                        </div>
                    </div>
                </div>

                {/* Page Heading & Actions Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                            Penggajian {currentMonthLabel} {year}
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            Kelola rekapitulasi gaji, tunjangan, lembur, dan potongan karyawan
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <ExportDropdown
                            pdfRoute={route('salaries.export.pdf', { month, year, company_id: companyId })}
                            excelRoute={route('salaries.export.excel', { month, year, company_id: companyId })}
                        />
                        <Link
                            href={route('absensi.rekap', { month, year })}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <CalendarCheck className="w-4 h-4 text-blue-600" />
                            Absensi
                        </Link>
                        <button
                            type="button"
                            onClick={openSettingsModal}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-amber-500 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm"
                        >
                            <Settings className="w-4 h-4" />
                            Tarif
                        </button>
                        <button
                            type="button"
                            onClick={handleBatchGenerate}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate
                        </button>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah
                        </button>
                    </div>
                </div>

                {/* Main Card: Filter + Table + Pagination */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-gray-50/70">
                        <div className="relative">
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

                    {/* Mobile Card List for Payrolls */}
                    <div className="block md:hidden divide-y divide-gray-100">
                        {paginatedPayrolls.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Belum ada data gaji pada periode {currentMonthLabel} {year}.
                            </div>
                        ) : (
                            paginatedPayrolls.map((p) => {
                                const isExpanded = expandedId === p.id;
                                const jmlTerlambat = Number(p.jumlah_terlambat || 0);
                                return (
                                    <div key={p.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                        {/* Header: Name, NIK, Position, Status Badge */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{p.user?.name ?? '-'}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {p.user?.position?.name || 'Karyawan'} • {p.user?.division?.name || '-'}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {p.user?.employee_id || p.user?.nik || '-'}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                p.status === 'paid' ? 'bg-emerald-600 text-white' :
                                                p.status === 'published' ? 'bg-blue-600 text-white' :
                                                'bg-gray-600 text-white'
                                            }`}>
                                                {p.status === 'paid' ? 'Dibayar' : p.status === 'published' ? 'Publik' : 'Draft'}
                                            </span>
                                        </div>

                                        {/* Financial Summary Box */}
                                        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block font-medium">Gaji Pokok</span>
                                                    <span className="font-bold text-gray-800">{formatRp(p.gaji_pokok)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block font-medium">Operasional</span>
                                                    <span className="font-bold text-gray-800">{formatRp(p.operasional)}</span>
                                                    {p.potongan_absen > 0 && (
                                                        <span className="text-[10px] text-red-600 block">
                                                            Telat {jmlTerlambat}x (-{formatRp(p.potongan_absen)})
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block font-medium">Lembur</span>
                                                    <span className="font-bold text-blue-600">{formatRp(p.lembur)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block font-medium">Total Potongan</span>
                                                    <span className="font-bold text-red-600">{formatRp(p.total_potongan)}</span>
                                                </div>
                                            </div>

                                            {/* Gaji Bersih Row */}
                                            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-600">Gaji Bersih (THP):</span>
                                                <span className="text-base font-extrabold text-emerald-600">{formatRp(p.total_diterima)}</span>
                                            </div>
                                        </div>

                                        {/* Action Toolbar on Mobile */}
                                        <div className="flex items-center justify-between gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <span>{isExpanded ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewPayroll(p)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Lihat Slip"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={route('salaries.slip.pdf', p.id)}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Unduh PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(p)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(p)}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Mobile Detail */}
                                        {isExpanded && (
                                            <div className="pt-2 space-y-3">
                                                <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-2.5 text-xs">
                                                    <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60">
                                                        <span className="font-bold text-blue-900">Rincian Lengkap Penggajian</span>
                                                        <Link
                                                            href={route('absensi.rekap', { month: p.period_month, year: p.period_year, user_id: p.user_id })}
                                                            className="text-[11px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded transition-colors"
                                                        >
                                                            Buka Absensi
                                                        </Link>
                                                    </div>

                                                    {/* Penerimaan Sub-card */}
                                                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-gray-100">
                                                        <div className="font-bold text-gray-800 flex justify-between border-b border-gray-100 pb-1">
                                                            <span>Total Penerimaan</span>
                                                            <span className="text-blue-600">{formatRp(p.total_penerimaan)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-600"><span>Gaji Pokok:</span><strong>{formatRp(p.gaji_pokok)}</strong></div>
                                                        <div className="flex justify-between text-gray-600"><span>Operasional:</span><strong>{formatRp(p.operasional)}</strong></div>
                                                        <div className="flex justify-between text-gray-600"><span>T. Jabatan:</span><strong>{formatRp(p.tunjangan_jabatan)}</strong></div>
                                                        <div className="flex justify-between text-gray-600"><span>THR:</span><strong>{formatRp(p.thr)}</strong></div>
                                                        <div className="flex justify-between text-blue-700">
                                                            <span>Lembur ({p.jumlah_lembur_weekday_pertama || 0}x 20:00, +{p.jumlah_jam_lembur_weekday_berikutnya || 0}j, Sabtu {p.jumlah_jam_lembur_sabtu || 0}j):</span>
                                                            <strong>{formatRp(p.lembur)}</strong>
                                                        </div>
                                                    </div>

                                                    {/* Potongan Sub-card */}
                                                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-gray-100">
                                                        <div className="font-bold text-gray-800 flex justify-between border-b border-gray-100 pb-1">
                                                            <span>Total Potongan</span>
                                                            <span className="text-red-600">{formatRp(p.total_potongan)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-600"><span>BPJS Kes ({p.bpjs_kesehatan_persen}%):</span><strong>{formatRp(p.bpjs_kesehatan)}</strong></div>
                                                        <div className="flex justify-between text-gray-600"><span>BPJS TK ({p.bpjs_ketenagakerjaan_persen}%):</span><strong>{formatRp(p.bpjs_ketenagakerjaan)}</strong></div>
                                                        <div className="flex justify-between text-gray-600"><span>Pajak:</span><strong>{formatRp(p.pajak)}</strong></div>
                                                        <div className="flex justify-between text-gray-600"><span>Piutang:</span><strong>{formatRp(p.piutang)}</strong></div>
                                                        <div className="flex justify-between text-red-600">
                                                            <span>Terlambat ({p.jumlah_terlambat || 0}x):</span>
                                                            <strong>{formatRp(p.potongan_absen)}</strong>
                                                        </div>
                                                        <div className="flex justify-between text-emerald-700 font-semibold">
                                                            <span>Sisa Operasional:</span>
                                                            <strong>{formatRp(Math.max(0, (p.operasional || 0) - (p.potongan_absen || 0)))}</strong>
                                                        </div>
                                                    </div>

                                                    {/* BPJS Kantor Sub-card */}
                                                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-gray-100">
                                                        <div className="font-bold text-gray-800 flex justify-between border-b border-gray-100 pb-1">
                                                            <span>BPJS Ditanggung Kantor</span>
                                                            <span className="text-indigo-600">{formatRp(p.total_bpjs_perusahaan)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-600"><span>BPJS Kes ({p.bpjs_kesehatan_perusahaan_persen}%):</span><strong>{formatRp(p.bpjs_kesehatan_perusahaan)}</strong></div>
                                                        <div className="flex justify-between text-gray-600"><span>BPJS TK ({p.bpjs_ketenagakerjaan_perusahaan_persen}%):</span><strong>{formatRp(p.bpjs_ketenagakerjaan_perusahaan)}</strong></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop Table for Payrolls */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3.5">Karyawan</th>
                                    <th className="px-5 py-3.5">Divisi</th>
                                    <th className="px-5 py-3.5 text-right">Gaji Pokok</th>
                                    <th className="px-5 py-3.5 text-right">Operasional</th>
                                    <th className="px-5 py-3.5 text-right">Lembur</th>
                                    <th className="px-5 py-3.5 text-right">Potongan</th>
                                    <th className="px-5 py-3.5 text-right">Bersih (THP)</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-10 text-center text-gray-500">
                                            Belum ada data gaji pada periode {currentMonthLabel} {year}.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPayrolls.map((p) => {
                                        const isExpanded = expandedId === p.id;
                                        const jmlTerlambat = Number(p.jumlah_terlambat || 0);
                                        return (
                                            <>
                                                <tr 
                                                    key={p.id} 
                                                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                                    className={`border-b border-gray-100 transition-colors cursor-pointer ${
                                                        isExpanded ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <span>{p.user?.name ?? '-'}</span>
                                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-normal">
                                                            {p.user?.employee_id || p.user?.nik || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-gray-600">
                                                        <div className="font-medium text-gray-800">{p.user?.position?.name || 'Karyawan'}</div>
                                                        <div>{p.user?.division?.name || '-'}</div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-medium text-gray-900 whitespace-nowrap">
                                                        {formatRp(p.gaji_pokok)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{formatRp(p.operasional)}</div>
                                                        {p.potongan_absen > 0 && (
                                                            <div className="text-[11px] text-red-600">
                                                                Terlambat {jmlTerlambat}x (-{formatRp(p.potongan_absen)})
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-medium text-blue-600 whitespace-nowrap">
                                                        {formatRp(p.lembur)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-medium text-red-600 whitespace-nowrap">
                                                        {formatRp(p.total_potongan)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                        {formatRp(p.total_diterima)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            p.status === 'paid' ? 'bg-emerald-600 text-white' :
                                                            p.status === 'published' ? 'bg-blue-600 text-white' :
                                                            'bg-gray-600 text-white'
                                                        }`}>
                                                            {p.status === 'paid' ? 'Dibayar' : p.status === 'published' ? 'Publik' : 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewPayroll(p)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                title="Lihat"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <a
                                                                href={route('salaries.slip.pdf', p.id)}
                                                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                                                title="Unduh"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(p)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(p)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr key={`${p.id}-detail`} className="bg-gray-50 border-b border-gray-100">
                                                        <td colSpan="9" className="p-4">
                                                            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                                    <div className="text-xs font-bold text-gray-800">
                                                                        {p.user?.name} &bull; {MONTHS.find(m => m.value === p.period_month)?.label} {p.period_year}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Link
                                                                            href={route('absensi.rekap', { month: p.period_month, year: p.period_year, user_id: p.user_id })}
                                                                            className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold"
                                                                        >
                                                                            Absensi
                                                                        </Link>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditModal(p)}
                                                                            className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                                                    <div className="bg-gray-50 p-3 rounded-xl space-y-1.5">
                                                                        <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex justify-between">
                                                                            <span>Penerimaan</span>
                                                                            <span className="text-blue-600">{formatRp(p.total_penerimaan)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between"><span>Gaji Pokok:</span><strong>{formatRp(p.gaji_pokok)}</strong></div>
                                                                        <div className="flex justify-between"><span>Operasional:</span><strong>{formatRp(p.operasional)}</strong></div>
                                                                        <div className="flex justify-between"><span>T. Jabatan:</span><strong>{formatRp(p.tunjangan_jabatan)}</strong></div>
                                                                        <div className="flex justify-between"><span>THR:</span><strong>{formatRp(p.thr)}</strong></div>
                                                                        <div className="flex justify-between text-blue-700">
                                                                            <span>Lembur ({p.jumlah_lembur_weekday_pertama || 0}x 20:00, +{p.jumlah_jam_lembur_weekday_berikutnya || 0}j, Sabtu {p.jumlah_jam_lembur_sabtu || 0}j):</span>
                                                                            <strong>{formatRp(p.lembur)}</strong>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-gray-50 p-3 rounded-xl space-y-1.5">
                                                                        <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex justify-between">
                                                                            <span>Potongan</span>
                                                                            <span className="text-red-600">{formatRp(p.total_potongan)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between"><span>BPJS Kes ({p.bpjs_kesehatan_persen}%):</span><strong>{formatRp(p.bpjs_kesehatan)}</strong></div>
                                                                        <div className="flex justify-between"><span>BPJS TK ({p.bpjs_ketenagakerjaan_persen}%):</span><strong>{formatRp(p.bpjs_ketenagakerjaan)}</strong></div>
                                                                        <div className="flex justify-between"><span>Pajak:</span><strong>{formatRp(p.pajak)}</strong></div>
                                                                        <div className="flex justify-between"><span>Piutang:</span><strong>{formatRp(p.piutang)}</strong></div>
                                                                        <div className="flex justify-between text-red-600">
                                                                            <span>Terlambat ({p.jumlah_terlambat || 0}x):</span>
                                                                            <strong>{formatRp(p.potongan_absen)}</strong>
                                                                        </div>
                                                                        <div className="flex justify-between text-emerald-700 font-semibold">
                                                                            <span>Sisa Operasional:</span>
                                                                            <strong>{formatRp(Math.max(0, (p.operasional || 0) - (p.potongan_absen || 0)))}</strong>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col justify-between">
                                                                        <div className="space-y-1">
                                                                            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 flex justify-between">
                                                                                <span>BPJS Kantor</span>
                                                                                <span className="text-indigo-600">{formatRp(p.total_bpjs_perusahaan)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between"><span>BPJS Kes ({p.bpjs_kesehatan_perusahaan_persen}%):</span><strong>{formatRp(p.bpjs_kesehatan_perusahaan)}</strong></div>
                                                                            <div className="flex justify-between"><span>BPJS TK ({p.bpjs_ketenagakerjaan_perusahaan_persen}%):</span><strong>{formatRp(p.bpjs_ketenagakerjaan_perusahaan)}</strong></div>
                                                                        </div>
                                                                        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                                                            <span className="font-bold text-gray-800">Gaji Bersih:</span>
                                                                            <span className="text-base font-bold text-emerald-600">{formatRp(p.total_diterima)}</span>
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

            {/* Modal: Pengaturan Tarif Lembur & Keterlambatan */}
            <Modal show={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} maxWidth="lg">
                <form onSubmit={handleSaveSettings} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-base">
                            Atur Tarif Lembur & Keterlambatan
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        <div>
                            <InputLabel value="Potongan Operasional per Terlambat (Rp)" />
                            <CurrencyInput
                                className="mt-1 block w-full"
                                value={settingsForm.data.tarif_potongan_terlambat}
                                onChange={(val) => settingsForm.setData('tarif_potongan_terlambat', val)}
                                placeholder="20000"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Lembur Sen–Jum Jam 20:00 Pertama (Rp)" />
                                <CurrencyInput
                                    className="mt-1 block w-full"
                                    value={settingsForm.data.tarif_lembur_weekday_pertama}
                                    onChange={(val) => settingsForm.setData('tarif_lembur_weekday_pertama', val)}
                                    placeholder="30000"
                                />
                            </div>

                            <div>
                                <InputLabel value="Lembur Sen–Jum Jam Berikutnya s/d 12:00 (Rp)" />
                                <CurrencyInput
                                    className="mt-1 block w-full"
                                    value={settingsForm.data.tarif_lembur_weekday_berikutnya}
                                    onChange={(val) => settingsForm.setData('tarif_lembur_weekday_berikutnya', val)}
                                    placeholder="20000"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Lembur Sabtu Mulai Jam 14:00 / Jam 2 (Rp/Jam)" />
                            <CurrencyInput
                                className="mt-1 block w-full"
                                value={settingsForm.data.tarif_lembur_sabtu}
                                onChange={(val) => settingsForm.setData('tarif_lembur_sabtu', val)}
                                placeholder="20000"
                            />
                        </div>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer text-xs text-gray-700">
                            <input
                                type="checkbox"
                                checked={settingsForm.data.sync_existing}
                                onChange={(e) => settingsForm.setData('sync_existing', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Sinkronkan semua gaji periode {currentMonthLabel} {year} dengan Rekap Absensi</span>
                        </label>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setIsSettingsOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={settingsForm.processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Tambah / Edit Gaji */}
            <Modal show={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="3xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-base">
                            {editingPayroll ? 'Edit Gaji Karyawan' : 'Tambah Gaji Karyawan'}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 max-h-[72vh] overflow-y-auto pr-1 custom-scrollbar">
                        {/* Employee & Period Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                            <div>
                                <InputLabel value="Karyawan *" />
                                {editingPayroll ? (
                                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl font-semibold text-gray-900 text-sm">
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
                                <InputLabel value="Periode *" />
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <CustomSelect
                                        value={data.period_month}
                                        onChange={(val) => {
                                            const m = parseInt(val);
                                            setData('period_month', m);
                                            if (data.user_id) fetchAttendanceSummary(data.user_id, m, data.period_year, !editingPayroll);
                                        }}
                                        options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                                    />
                                    <CustomSelect
                                        value={data.period_year}
                                        onChange={(val) => {
                                            const y = parseInt(val);
                                            setData('period_year', y);
                                            if (data.user_id) fetchAttendanceSummary(data.user_id, data.period_month, y, !editingPayroll);
                                        }}
                                        options={[2024, 2025, 2026, 2027, 2028].map(y => ({ value: y, label: String(y) }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Tanggal Bayar" />
                                <div className="mt-1">
                                    <CustomDatePicker
                                        value={data.payment_date}
                                        onChange={(val) => setData('payment_date', val)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lembur & Keterlambatan (Terhubung Rekap Absensi) */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                <div className="text-xs font-bold text-gray-800 flex items-center gap-2">
                                    <span>Lembur & Keterlambatan (Rekap Absensi)</span>
                                    {userAttendance && (
                                        <span className="font-normal text-gray-500">
                                            &bull; Hadir: {userAttendance.hadir} | Terlambat: {userAttendance.terlambat}x | Lembur: {userAttendance.lembur_hari ?? 0} hari
                                        </span>
                                    )}
                                </div>
                                {data.user_id && (
                                    <button
                                        type="button"
                                        disabled={loadingAttendance}
                                        onClick={() => fetchAttendanceSummary(data.user_id, data.period_month, data.period_year, true)}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${loadingAttendance ? 'animate-spin' : ''}`} />
                                        Sinkron
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Keterlambatan */}
                                <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-800">
                                        <span>Keterlambatan (Potong Operasional)</span>
                                        <span className="text-red-600">-{formatRp(data.potongan_absen)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <InputLabel value="Jumlah (Kali)" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.jumlah_terlambat}
                                                onChange={(e) => updateOvertimeAndLateFields({ jumlah_terlambat: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Potongan (Rp)" />
                                            <CurrencyInput
                                                className="mt-1 block w-full"
                                                value={data.tarif_potongan_terlambat}
                                                onChange={(val) => updateOvertimeAndLateFields({ tarif_potongan_terlambat: val })}
                                                placeholder="20000"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                                        <span>Sisa Operasional:</span>
                                        <strong className="text-emerald-600">{formatRp(computedTotals.sisaOperasional)}</strong>
                                    </div>
                                </div>

                                {/* Lembur */}
                                <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-800">
                                        <span>Rincian Lembur</span>
                                        <span className="text-blue-600">+{formatRp(data.lembur)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <InputLabel value="Sen–Jum 20:00 (Kali)" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.jumlah_lembur_weekday_pertama}
                                                onChange={(e) => updateOvertimeAndLateFields({ jumlah_lembur_weekday_pertama: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Tarif 20:00 (Rp)" />
                                            <CurrencyInput
                                                className="mt-1 block w-full"
                                                value={data.tarif_lembur_weekday_pertama}
                                                onChange={(val) => updateOvertimeAndLateFields({ tarif_lembur_weekday_pertama: val })}
                                                placeholder="30000"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Jam Berikutnya (Jam)" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.jumlah_jam_lembur_weekday_berikutnya}
                                                onChange={(e) => updateOvertimeAndLateFields({ jumlah_jam_lembur_weekday_berikutnya: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Tarif Berikutnya (Rp)" />
                                            <CurrencyInput
                                                className="mt-1 block w-full"
                                                value={data.tarif_lembur_weekday_berikutnya}
                                                onChange={(val) => updateOvertimeAndLateFields({ tarif_lembur_weekday_berikutnya: val })}
                                                placeholder="20000"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Sabtu >14:00 (Jam)" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.jumlah_jam_lembur_sabtu}
                                                onChange={(e) => updateOvertimeAndLateFields({ jumlah_jam_lembur_sabtu: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Tarif Sabtu (Rp)" />
                                            <CurrencyInput
                                                className="mt-1 block w-full"
                                                value={data.tarif_lembur_sabtu}
                                                onChange={(val) => updateOvertimeAndLateFields({ tarif_lembur_sabtu: val })}
                                                placeholder="20000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 1. Penerimaan */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h4 className="font-bold text-gray-800 text-xs uppercase">1. Penerimaan</h4>
                                <span className="text-xs font-bold text-blue-600">{formatRp(computedTotals.totalPenerimaan)}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel value="Gaji Pokok (Rp) *" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.gaji_pokok}
                                        onChange={(val) => setData('gaji_pokok', val)}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Operasional (Rp)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.operasional}
                                        onChange={(val) => setData('operasional', val)}
                                        placeholder="0"
                                    />
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
                                    <InputLabel value="Total Lembur (Rp)" />
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.lembur}
                                        onChange={(val) => setData('lembur', val)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Potongan */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h4 className="font-bold text-gray-800 text-xs uppercase">2. Potongan</h4>
                                <span className="text-xs font-bold text-red-600">{formatRp(computedTotals.totalPotongan)}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="BPJS Kesehatan" />
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
                                                className="w-12 text-xs py-0.5 px-1 rounded border-gray-300 text-right"
                                            />
                                            <span className="text-xs text-gray-500">%</span>
                                        </div>
                                    </div>
                                    <CurrencyInput
                                        className="mt-1 block w-full"
                                        value={data.bpjs_kesehatan !== '' ? data.bpjs_kesehatan : computedTotals.bpjsKes}
                                        onChange={(val) => setData('bpjs_kesehatan', val)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="BPJS TK" />
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
                                                className="w-12 text-xs py-0.5 px-1 rounded border-gray-300 text-right"
                                            />
                                            <span className="text-xs text-gray-500">%</span>
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
                                    <InputLabel value="Potongan Terlambat" />
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

                        {/* 3. BPJS Perusahaan */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h4 className="font-bold text-gray-800 text-xs uppercase">3. BPJS Perusahaan</h4>
                                <span className="text-xs font-bold text-indigo-600">{formatRp(computedTotals.totalBpjsPerusahaan)}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="BPJS Kesehatan Kantor" />
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
                                                className="w-12 text-xs py-0.5 px-1 rounded border-gray-300 text-right"
                                            />
                                            <span className="text-xs text-gray-500">%</span>
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
                                        <InputLabel value="BPJS TK Kantor" />
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
                                                className="w-12 text-xs py-0.5 px-1 rounded border-gray-300 text-right"
                                            />
                                            <span className="text-xs text-gray-500">%</span>
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

                        {/* THP & Status */}
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div>
                                <span className="text-xs font-bold text-emerald-800 uppercase block">Gaji Bersih (THP)</span>
                                <span className="text-xl font-bold text-emerald-700">{formatRp(computedTotals.totalDiterima)}</span>
                            </div>

                            <div className="w-full sm:w-48">
                                <CustomSelect
                                    value={data.status}
                                    onChange={(val) => setData('status', val)}
                                    options={[
                                        { value: 'published', label: 'Publik' },
                                        { value: 'paid', label: 'Dibayarkan' },
                                        { value: 'draft', label: 'Draft' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Catatan (Opsional)" />
                            <TextInput
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Catatan..."
                                className="mt-1 block w-full text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setIsFormOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Preview Slip Gaji */}
            <Modal show={!!previewPayroll} onClose={() => setPreviewPayroll(null)} maxWidth="xl">
                {previewPayroll && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-base">Slip Gaji</h3>
                            <button
                                onClick={() => setPreviewPayroll(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl text-xs space-y-3">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm uppercase">
                                        {previewPayroll.company?.name || previewPayroll.user?.company?.name || 'SANZAYA'}
                                    </h4>
                                    <p className="text-gray-500">{previewPayroll.user?.name}</p>
                                </div>
                                <div className="text-right font-semibold text-blue-600">
                                    {MONTHS.find(m => m.value === previewPayroll.period_month)?.label} {previewPayroll.period_year}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="font-bold text-gray-800 border-b border-gray-100 pb-1">Penerimaan</div>
                                    <div className="flex justify-between"><span>Gaji Pokok:</span><strong>{formatRp(previewPayroll.gaji_pokok)}</strong></div>
                                    <div className="flex justify-between"><span>Operasional:</span><strong>{formatRp(previewPayroll.operasional)}</strong></div>
                                    <div className="flex justify-between"><span>T. Jabatan:</span><strong>{formatRp(previewPayroll.tunjangan_jabatan)}</strong></div>
                                    <div className="flex justify-between"><span>THR:</span><strong>{formatRp(previewPayroll.thr)}</strong></div>
                                    <div className="flex justify-between"><span>Lembur:</span><strong>{formatRp(previewPayroll.lembur)}</strong></div>
                                    <div className="flex justify-between border-t border-gray-100 pt-1 font-bold text-blue-600">
                                        <span>Total:</span><span>{formatRp(previewPayroll.total_penerimaan)}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-bold text-gray-800 border-b border-gray-100 pb-1">Potongan</div>
                                    <div className="flex justify-between"><span>BPJS Kes:</span><strong>{formatRp(previewPayroll.bpjs_kesehatan)}</strong></div>
                                    <div className="flex justify-between"><span>BPJS TK:</span><strong>{formatRp(previewPayroll.bpjs_ketenagakerjaan)}</strong></div>
                                    <div className="flex justify-between"><span>Pajak:</span><strong>{formatRp(previewPayroll.pajak)}</strong></div>
                                    <div className="flex justify-between"><span>Piutang:</span><strong>{formatRp(previewPayroll.piutang)}</strong></div>
                                    <div className="flex justify-between"><span>Terlambat ({previewPayroll.jumlah_terlambat || 0}x):</span><strong>{formatRp(previewPayroll.potongan_absen)}</strong></div>
                                    <div className="flex justify-between"><span>Lainnya:</span><strong>{formatRp(previewPayroll.potongan_lainnya)}</strong></div>
                                    <div className="flex justify-between border-t border-gray-100 pt-1 font-bold text-red-600">
                                        <span>Total:</span><span>{formatRp(previewPayroll.total_potongan)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center">
                                <span className="font-bold text-emerald-900">Gaji Bersih (THP):</span>
                                <span className="text-base font-bold text-emerald-700">{formatRp(previewPayroll.total_diterima)}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setPreviewPayroll(null)}>
                                Tutup
                            </SecondaryButton>
                            <a
                                href={route('salaries.slip.pdf', previewPayroll.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase"
                            >
                                <Download className="w-4 h-4" />
                                Unduh
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
