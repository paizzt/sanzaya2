import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportDropdown from '@/Components/ExportDropdown';
import Modal from '@/Components/Modal';
import { Head, usePage, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Package, ShoppingCart, CreditCard, Search, TrendingUp, Activity, Store, BarChart2, MapPin, Calendar, User as UserIcon, Store as StoreIcon, Database, Download, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import CustomSelect from '@/Components/CustomSelect';
import SearchableSelect from '@/Components/SearchableSelect';
import { ErrorBoundary } from '@/Components/ErrorBoundary';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Index({ tab, search, salesFilter, outletFilter, monthFilter, ptFilter, salesNames, outletNames, ptNames, reportData, summary, summaryPesanan, summaryPiutang, summaryHutang }) {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', type: '', data: null });
    const [selectedSales, setSelectedSales] = useState(salesFilter || '');
    const [selectedOutlet, setSelectedOutlet] = useState(outletFilter || '');
    const [selectedMonth, setSelectedMonth] = useState(monthFilter || '');
    const [selectedPt, setSelectedPt] = useState(ptFilter || '');
    const [isSearchExpanded, setIsSearchExpanded] = useState(!!search);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const tabDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Prevent closing if clicking inside the PDF preview modal
                if (!event.target.closest('#modal') && !event.target.closest('[role="dialog"]')) {
                    setIsDownloadOpen(false);
                }
            }
            if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target)) {
                setIsTabDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const parseRpToNumber = (str) => {
        if (!str) return 0;
        return parseInt(str.toString().replace(/[^0-9]/g, ''), 10) || 0;
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#8dd1e1'];

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const handleSearch = (e) => {
        e.preventDefault();
        const filters = { tab: tab, search: searchTerm, month_filter: selectedMonth };
        if (tab === 'logistik') {
            filters.sales_filter = selectedSales;
            filters.outlet_filter = selectedOutlet;
            filters.pt_filter = selectedPt;
        } else if (tab === 'pesanan' || tab === 'piutang') {
            filters.outlet_filter = selectedOutlet;
        }
        router.get(route('reports.index'), filters, { preserveState: true });
    };

    const handleTabChange = (newTab) => {
        router.get(route('reports.index'), { tab: newTab, search: '', sales_filter: '', outlet_filter: '', month_filter: '', pt_filter: '' }, { preserveState: true });
        setSearchTerm('');
        setSelectedSales('');
        setSelectedOutlet('');
        setSelectedMonth('');
        setSelectedPt('');
    };

    // Chart Renderers
    const renderLogistikChart = () => {
        if (!summary?.penjualan_detail || Object.keys(summary.penjualan_detail).length === 0) return null;
        const data = Object.entries(summary.penjualan_detail).map(([name, val]) => ({
            name: name,
            Penjualan: parseRpToNumber(val)
        }));

        return (
            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-600"/> Top 10 Penjualan per Sales</h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} angle={-45} textAnchor="end" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => `Rp ${val / 1000000}M`} />
                            <RechartsTooltip cursor={{ fill: '#f9fafb' }} formatter={(val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)} />
                            <Bar dataKey="Penjualan" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderPesananChart = () => {
        if (!summaryPesanan) return null;
        
        const terkirim = parseFloat((summaryPesanan.total_terkirim || '0').replace('%', ''));
        const belum = parseFloat((summaryPesanan.total_belum_terkirim || '0').replace('%', ''));
        
        if (terkirim === 0 && belum === 0) return null;

        const pieData = [
            { name: 'Terkirim', value: terkirim, color: '#10b981' }, // emerald-500
            { name: 'Belum Terkirim', value: belum, color: '#ef4444' } // red-500
        ];

        const barData = Object.entries(summaryPesanan.faktur_detail || {}).map(([name, val]) => ({
            name: name,
            TotalFaktur: parseRpToNumber(val)
        }));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 col-span-1">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-emerald-600"/> Status Pengiriman</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(val) => `${val}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 col-span-1 lg:col-span-2">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-600"/> Top 10 Faktur per Outlet</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} angle={-15} textAnchor="end" />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => `Rp ${val / 1000000}M`} />
                                <RechartsTooltip cursor={{ fill: '#f9fafb' }} formatter={(val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)} />
                                <Bar dataKey="TotalFaktur" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderPiutangChart = () => {
        if (!summaryPiutang?.gabungan_detail || Object.keys(summaryPiutang.gabungan_detail).length === 0) return null;
        
        const data = Object.entries(summaryPiutang.gabungan_detail).map(([name, val]) => ({
            name: name,
            TotalPiutang: parseRpToNumber(val)
        }));

        return (
            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600"/> Top 10 Total Piutang Outlet</h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} angle={-15} textAnchor="end" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => `Rp ${val / 1000000}M`} />
                            <RechartsTooltip cursor={{ fill: '#f9fafb' }} formatter={(val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)} />
                            <Bar dataKey="TotalPiutang" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderHutangChart = () => {
        if (!summaryHutang?.hutang_detail || Object.keys(summaryHutang.hutang_detail).length === 0) return null;
        
        const data = Object.entries(summaryHutang.hutang_detail).map(([name, val]) => ({
            name: name,
            TotalHutang: parseRpToNumber(val)
        }));

        return (
            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-orange-600"/> Top 10 Hutang Penyedia</h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => `Rp ${val / 1000000}M`} />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <RechartsTooltip cursor={{ fill: '#f9fafb' }} formatter={(val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)} />
                            <Bar dataKey="TotalHutang" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // ... renderLogistikTable ...
    const renderLogistikTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Nama Sales</th>
                        <th className="px-6 py-4">Outlet</th>
                        <th className="px-6 py-4">Produk</th>
                        <th className="px-6 py-4 text-right">Total (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.data.map((row) => (
                        <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap"><Calendar className="w-3 h-3 inline mr-1 text-gray-400"/> {row.tanggal}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900"><UserIcon className="w-3 h-3 inline mr-1 text-gray-400"/> {row.nama_sales}</td>
                            <td className="px-6 py-4"><MapPin className="w-3 h-3 inline mr-1 text-gray-400"/> {row.pelanggan || '-'}</td>
                            <td className="px-6 py-4">{row.nama_produk || '-'}</td>
                            <td className="px-6 py-4 text-right font-bold text-blue-600">{row.total ? 'Rp ' + parseRpToNumber(row.total).toLocaleString('id-ID') : '-'}</td>
                        </tr>
                    ))}
                    {reportData.data.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Data laporan logistik kosong atau tidak ditemukan.</td></tr>}
                </tbody>
            </table>
        </div>
    );

    const renderPesananTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Outlet</th>
                        <th className="px-6 py-4">Produk</th>
                        <th className="px-6 py-4 text-right">Jml</th>
                        <th className="px-6 py-4">Satuan</th>
                        <th className="px-6 py-4 text-right">T.Faktur</th>
                        <th className="px-6 py-4">Status Pengiriman</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.data.map((row) => (
                        <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap"><Calendar className="w-3 h-3 inline mr-1 text-gray-400"/> {row.tanggal}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900"><MapPin className="w-3 h-3 inline mr-1 text-gray-400"/> {row.nama_outlet}</td>
                            <td className="px-6 py-4">{row.nama_produk}</td>
                            <td className="px-6 py-4 text-right">{row.jumlah}</td>
                            <td className="px-6 py-4">{row.satuan}</td>
                            <td className="px-6 py-4 text-right font-bold text-emerald-600">{row.total_faktur}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1 text-xs">
                                    <span className="text-emerald-600">Terkirim: {row.terkirim} ({row.persen_terpenuhi})</span>
                                    <span className="text-red-500">Belum: {row.belum_terkirim} ({row.persen_belum_terpenuhi})</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {reportData.data.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Data surat pesanan kosong atau tidak ditemukan.</td></tr>}
                </tbody>
            </table>
        </div>
    );

    const renderPiutangTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4" rowSpan="2">Outlet</th>
                        <th className="px-6 py-3 text-center border-b border-gray-100 bg-blue-50/50" colSpan="4">Sanzaya</th>
                        <th className="px-6 py-3 text-center border-b border-gray-100 bg-purple-50/50" colSpan="4">Ruma</th>
                        <th className="px-6 py-4 text-right font-bold" rowSpan="2">Total Gabungan</th>
                    </tr>
                    <tr>
                        <th className="px-4 py-2 bg-blue-50/50">Tahun 1</th>
                        <th className="px-4 py-2 bg-blue-50/50">Tahun 2</th>
                        <th className="px-4 py-2 bg-blue-50/50">Tahun 3</th>
                        <th className="px-4 py-2 text-right bg-blue-100/50 font-bold">Total</th>
                        <th className="px-4 py-2 bg-purple-50/50">Ruma 1</th>
                        <th className="px-4 py-2 bg-purple-50/50">Ruma 2</th>
                        <th className="px-4 py-2 bg-purple-50/50">Ruma 3</th>
                        <th className="px-4 py-2 text-right bg-purple-100/50 font-bold">Total Ruma</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.data.map((row) => (
                        <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900"><MapPin className="w-3 h-3 inline mr-1 text-gray-400"/> {row.nama_outlet}</td>
                            <td className="px-4 py-3">{row.tahun_1}</td>
                            <td className="px-4 py-3">{row.tahun_2}</td>
                            <td className="px-4 py-3">{row.tahun_3}</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700 bg-blue-50/30">{row.total_sanzaya}</td>
                            <td className="px-4 py-3">{row.ruma_1}</td>
                            <td className="px-4 py-3">{row.ruma_2}</td>
                            <td className="px-4 py-3">{row.ruma_3}</td>
                            <td className="px-4 py-3 text-right font-bold text-purple-700 bg-purple-50/30">{row.total_ruma}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900 bg-gray-50">{row.total_gabungan}</td>
                        </tr>
                    ))}
                    {reportData.data.length === 0 && <tr><td colSpan="10" className="px-6 py-8 text-center text-gray-500">Data piutang kosong atau tidak ditemukan.</td></tr>}
                </tbody>
            </table>
        </div>
    );

    const renderHutangTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 w-16 text-center">No</th>
                        <th className="px-6 py-4">Nama Penyedia</th>
                        <th className="px-6 py-4 text-right">Nominal (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.data.map((row) => (
                        <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4 text-center font-medium text-gray-900">{row.no}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">{row.nama_penyedia}</td>
                            <td className="px-6 py-4 text-right font-bold text-orange-600">{row.nominal}</td>
                        </tr>
                    ))}
                    {reportData.data.length === 0 && <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">Data hutang kosong atau tidak ditemukan.</td></tr>}
                </tbody>
            </table>
        </div>
    );

    return (
        <ErrorBoundary>
            <AuthenticatedLayout
                user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Dashboard Laporan</h2>}
        >
            <Head title="Dashboard Laporan" />

            <div className="pb-6 pt-0 space-y-6 max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <BarChart2 className="w-6 h-6 text-blue-600" />
                            Data Laporan Tersinkronisasi
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Menampilkan data yang telah ditarik dari Google Spreadsheet.</p>
                    </div>
                    
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Unduh PDF
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDownloadOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDownloadOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                                <ExportDropdown isReportDashboard={true} pdfRoute={route('reports.pdf', { tab: tab, period: '1_hari' })} trigger={<a href="#" onClick={(e) => { e.preventDefault(); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-50 last:border-b-0">1 Hari</a>} />
                                <ExportDropdown isReportDashboard={true} pdfRoute={route('reports.pdf', { tab: tab, period: '1_minggu' })} trigger={<a href="#" onClick={(e) => { e.preventDefault(); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-50 last:border-b-0">1 Minggu</a>} />
                                <ExportDropdown isReportDashboard={true} pdfRoute={route('reports.pdf', { tab: tab, period: '1_bulan' })} trigger={<a href="#" onClick={(e) => { e.preventDefault(); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-50 last:border-b-0">1 Bulan</a>} />
                                <ExportDropdown isReportDashboard={true} pdfRoute={route('reports.pdf', { tab: tab, period: '1_tahun' })} trigger={<a href="#" onClick={(e) => { e.preventDefault(); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">1 Tahun</a>} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                {tab === 'logistik' && summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Total Penjualan', type: 'penjualan', data: summary.penjualan_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Penjualan</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summary.total_penjualan}>{summary.total_penjualan}</h4>
                                </div>
                                <div className="p-3 bg-green-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Total akumulasi dari kolom Total (Rp)</p>
                        </div>
                        
                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Total Pesanan', type: 'pesanan', data: summary.pesanan_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Pesanan</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summary.total_pesanan}>{summary.total_pesanan}</h4>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Jumlah baris transaksi tercatat</p>
                        </div>

                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Top Outlet', type: 'outlet', data: summary.outlet_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Top Outlet</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summary.top_outlet}>{summary.top_outlet}</h4>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-2xl">
                                    <Store className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Outlet paling sering memesan</p>
                        </div>

                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Top Produk', type: 'produk', data: summary.produk_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Top Produk</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summary.top_produk}>{summary.top_produk}</h4>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <Package className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Produk paling sering muncul di data</p>
                        </div>
                    </div>
                )}

                {tab === 'pesanan' && summaryPesanan && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Total Faktur', type: 'faktur', data: summaryPesanan.faktur_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Faktur</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summaryPesanan.total_faktur}>{summaryPesanan.total_faktur}</h4>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Total akumulasi dari Total Faktur</p>
                        </div>
                        
                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Barang Terkirim', type: 'terkirim', data: summaryPesanan.terkirim_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Barang Terkirim</p>
                                    <h4 className="text-xl font-bold text-emerald-600 mt-1 truncate" title={summaryPesanan.total_terkirim}>{summaryPesanan.total_terkirim}</h4>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-2xl">
                                    <ShoppingCart className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Persentase barang yang berhasil terkirim</p>
                        </div>

                        <div onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Belum Terkirim</p>
                                    <h4 className="text-xl font-bold text-red-600 mt-1 truncate" title={summaryPesanan.total_belum_terkirim}>{summaryPesanan.total_belum_terkirim}</h4>
                                </div>
                                <div className="p-3 bg-red-50 rounded-2xl">
                                    <Activity className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Persentase barang yang belum terkirim</p>
                        </div>

                        <div onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Surat</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summaryPesanan.total_pesanan}>{summaryPesanan.total_pesanan}</h4>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <Store className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Jumlah baris surat pesanan tercatat</p>
                        </div>
                    </div>
                )}

                {tab === 'piutang' && summaryPiutang && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Total Piutang (Gabungan)', type: 'gabungan', data: summaryPiutang.gabungan_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Piutang (Gabungan)</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summaryPiutang.total_gabungan}>{summaryPiutang.total_gabungan}</h4>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-2xl">
                                    <CreditCard className="w-6 h-6 text-gray-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Total keseluruhan piutang</p>
                        </div>
                        
                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Piutang Sanzaya', type: 'sanzaya', data: summaryPiutang.sanzaya_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Piutang Sanzaya</p>
                                    <h4 className="text-xl font-bold text-blue-700 mt-1 truncate" title={summaryPiutang.total_sanzaya}>{summaryPiutang.total_sanzaya}</h4>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Total piutang bagian Sanzaya</p>
                        </div>

                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Piutang Ruma', type: 'ruma', data: summaryPiutang.ruma_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Piutang Ruma</p>
                                    <h4 className="text-xl font-bold text-purple-700 mt-1 truncate" title={summaryPiutang.total_ruma}>{summaryPiutang.total_ruma}</h4>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Total piutang bagian Ruma</p>
                        </div>

                        <div onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Data Piutang</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summaryPiutang.total_outlet}>{summaryPiutang.total_outlet}</h4>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <Store className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Jumlah baris data piutang tercatat</p>
                        </div>
                    </div>
                )}

                {tab === 'hutang' && summaryHutang && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                        <div onClick={() => setDetailModal({ isOpen: true, title: 'Total Nominal', type: 'hutang', data: summaryHutang.hutang_detail })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Nominal</p>
                                    <h4 className="text-xl font-bold text-orange-700 mt-1 truncate" title={summaryHutang.total_nominal}>{summaryHutang.total_nominal}</h4>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Total akumulasi nominal hutang</p>
                        </div>
                        
                        <div onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Penyedia</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summaryHutang.total_penyedia}>{summaryHutang.total_penyedia}</h4>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <UserIcon className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Jumlah penyedia berbeda</p>
                        </div>

                        <div onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="text-sm font-semibold text-gray-500 truncate">Total Data</p>
                                    <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summaryHutang.total_data}>{summaryHutang.total_data}</h4>
                                </div>
                                <div className="p-3 bg-green-50 rounded-2xl">
                                    <Database className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Jumlah baris data hutang tercatat</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <div className="relative w-full lg:w-auto" ref={tabDropdownRef}>
                        <button
                            onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                            className="flex items-center justify-between w-full lg:w-44 xl:w-48 gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition-colors shadow-sm text-sm border border-blue-100"
                        >
                            <div className="flex items-center gap-2">
                                {tab === 'logistik' && <><Package className="w-4 h-4" /> Logistik</>}
                                {tab === 'pesanan' && <><ShoppingCart className="w-4 h-4" /> Surat Pesanan</>}
                                {tab === 'piutang' && <><CreditCard className="w-4 h-4" /> Data Piutang</>}
                                {tab === 'hutang' && <><CreditCard className="w-4 h-4" /> Data Hutang</>}
                                {!['logistik', 'pesanan', 'piutang', 'hutang'].includes(tab) && <><BarChart2 className="w-4 h-4" /> Pilih Laporan</>}
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isTabDropdownOpen && (
                            <div className="absolute left-0 mt-2 w-full lg:w-44 xl:w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40 overflow-hidden">
                                <button 
                                    onClick={() => { handleTabChange('logistik'); setIsTabDropdownOpen(false); }} 
                                    className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-50 ${tab==='logistik' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                                >
                                    <Package className="w-4 h-4" /> Logistik
                                </button>
                                <button 
                                    onClick={() => { handleTabChange('pesanan'); setIsTabDropdownOpen(false); }} 
                                    className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-50 ${tab==='pesanan' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'}`}
                                >
                                    <ShoppingCart className="w-4 h-4" /> Surat Pesanan
                                </button>
                                <button 
                                    onClick={() => { handleTabChange('piutang'); setIsTabDropdownOpen(false); }} 
                                    className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-50 ${tab==='piutang' ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'}`}
                                >
                                    <CreditCard className="w-4 h-4" /> Data Piutang
                                </button>
                                <button 
                                    onClick={() => { handleTabChange('hutang'); setIsTabDropdownOpen(false); }} 
                                    className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${tab==='hutang' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'}`}
                                >
                                    <CreditCard className="w-4 h-4" /> Data Hutang
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <form onSubmit={handleSearch} className="w-full lg:w-auto flex flex-col md:flex-row gap-2 md:gap-3 flex-wrap">
                        <div className="w-full md:w-11 lg:w-11 md:hover:w-36 lg:hover:w-36 xl:hover:w-40 transition-all duration-300 ease-in-out group z-20">
                            <CustomSelect
                                value={selectedMonth}
                                onChange={(value) => {
                                    setSelectedMonth(value);
                                    const filters = { tab: tab, search: searchTerm, month_filter: value };
                                    if (tab === 'logistik') {
                                        filters.sales_filter = selectedSales;
                                        filters.outlet_filter = selectedOutlet;
                                        filters.pt_filter = selectedPt;
                                    } else if (tab === 'pesanan' || tab === 'piutang') {
                                        filters.outlet_filter = selectedOutlet;
                                    }
                                    router.get(route('reports.index'), filters, { preserveState: true });
                                }}
                                options={[
                                    { value: '', label: 'Semua Bulan' },
                                    ...months.map(m => ({ value: m, label: m }))
                                ]}
                                icon={Calendar}
                                compact={true}
                            />
                        </div>
                        
                        {tab === 'logistik' && (
                            <>
                                <div className="w-full md:w-11 lg:w-11 md:hover:w-36 lg:hover:w-40 xl:hover:w-44 transition-all duration-300 ease-in-out group z-10">
                                    <SearchableSelect
                                        value={selectedPt}
                                        onChange={(value) => {
                                            setSelectedPt(value);
                                            router.get(route('reports.index'), { tab: tab, search: searchTerm, sales_filter: selectedSales, outlet_filter: selectedOutlet, pt_filter: value, month_filter: selectedMonth }, { preserveState: true });
                                        }}
                                        options={[
                                            { value: '', label: 'Semua PT' },
                                            ...(Array.isArray(ptNames) ? ptNames : Object.values(ptNames || {})).map(name => ({ value: name, label: name }))
                                        ]}
                                        icon={Package}
                                        compact={true}
                                    />
                                </div>
                                <div className="w-full md:w-11 lg:w-11 md:hover:w-36 lg:hover:w-40 xl:hover:w-44 transition-all duration-300 ease-in-out group z-10">
                                    <SearchableSelect
                                        value={selectedSales}
                                        onChange={(value) => {
                                            setSelectedSales(value);
                                            router.get(route('reports.index'), { tab: tab, search: searchTerm, sales_filter: value, outlet_filter: selectedOutlet, pt_filter: selectedPt, month_filter: selectedMonth }, { preserveState: true });
                                        }}
                                        options={[
                                            { value: '', label: 'Semua Sales' },
                                            ...(Array.isArray(salesNames) ? salesNames : Object.values(salesNames || {})).map(name => ({ value: name, label: name }))
                                        ]}
                                        icon={UserIcon}
                                        compact={true}
                                    />
                                </div>
                            </>
                        )}

                        {['logistik', 'pesanan', 'piutang'].includes(tab) && (
                            <div className="w-full md:w-11 lg:w-11 md:hover:w-36 lg:hover:w-40 xl:hover:w-44 transition-all duration-300 ease-in-out group z-10">
                                <SearchableSelect
                                    value={selectedOutlet}
                                    onChange={(value) => {
                                        setSelectedOutlet(value);
                                        const filters = { tab: tab, search: searchTerm, outlet_filter: value, month_filter: selectedMonth };
                                        if (tab === 'logistik') {
                                            filters.sales_filter = selectedSales;
                                            filters.pt_filter = selectedPt;
                                        }
                                        router.get(route('reports.index'), filters, { preserveState: true });
                                    }}
                                    options={[
                                        { value: '', label: 'Semua Outlet' },
                                        ...(Array.isArray(outletNames) ? outletNames : Object.values(outletNames || {})).map(name => ({ value: name, label: name }))
                                    ]}
                                    icon={MapPin}
                                    compact={true}
                                />
                            </div>
                        )}
                        <div className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-full md:w-40 lg:w-48 xl:w-56' : 'w-10'} z-0`}>
                            {isSearchExpanded ? (
                                <>
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <TextInput 
                                        type="text" 
                                        className="w-full pl-10 rounded-xl" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onBlur={() => {
                                            if (!searchTerm) setIsSearchExpanded(false);
                                        }}
                                        autoFocus
                                    />
                                </>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => setIsSearchExpanded(true)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200 transition-colors"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="hidden"></button>
                    </form>
                </div>

                {/* Charts Area */}
                {tab === 'logistik' && renderLogistikChart()}
                {tab === 'pesanan' && renderPesananChart()}
                {tab === 'piutang' && renderPiutangChart()}
                {tab === 'hutang' && renderHutangChart()}

                <div id="data-table-container" className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        {tab === 'logistik' && renderLogistikTable()}
                        {tab === 'pesanan' && renderPesananTable()}
                        {tab === 'piutang' && renderPiutangTable()}
                        {tab === 'hutang' && renderHutangTable()}
                    </div>
                    
                    {/* Pagination */}
                    {reportData.links && reportData.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Menampilkan <span className="font-medium text-gray-900">{reportData.from || 0}</span> - <span className="font-medium text-gray-900">{reportData.to || 0}</span> dari <span className="font-medium text-gray-900">{reportData.total}</span> data
                            </span>
                            <div className="flex gap-1">
                                {reportData.links.map((link, index) => (
                                    link.url ? (
                                        <Link 
                                            key={index} 
                                            href={link.url} 
                                            className={`px-3 py-1 text-sm rounded-lg border ${link.active ? 'bg-blue-50 text-blue-600 border-blue-200 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={index} className="px-3 py-1 text-sm rounded-lg border bg-gray-50 text-gray-400 border-gray-100" dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                                    </div>
                </div>
                            {/* Detail Modal */}
                <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ ...detailModal, isOpen: false })} maxWidth="md">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-800">Detail {detailModal.title}</h3>
                            <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {!detailModal.data || Object.keys(detailModal.data).length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Tidak ada detail data yang tersedia.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider px-3 pb-2 border-b border-gray-100">
                                        <span>{detailModal.type === 'penjualan' || detailModal.type === 'pesanan' ? 'Nama Sales' : (detailModal.type === 'outlet' ? 'Nama Outlet' : 'Nama Produk')}</span>
                                        <span>{detailModal.type === 'penjualan' ? 'Total (Rp)' : 'Jumlah'}</span>
                                    </div>
                                    {Object.entries(detailModal.data).map(([key, value], idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate" title={key}>{key}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 shrink-0 whitespace-nowrap">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            </AuthenticatedLayout>
        </ErrorBoundary>
    );
}
