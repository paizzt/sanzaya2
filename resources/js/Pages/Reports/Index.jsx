import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportDropdown from '@/Components/ExportDropdown';
import Modal from '@/Components/Modal';
import { Head, usePage, router, Link } from '@inertiajs/react';

import { Package, ShoppingCart, CreditCard, Search, TrendingUp, Activity, Store, BarChart2, MapPin, Calendar, User as UserIcon, Database, Download, ChevronDown, ChevronLeft, ChevronRight, PieChart, Table } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import CustomSelect from '@/Components/CustomSelect';
import MultiSelect from '@/Components/MultiSelect';
import { ErrorBoundary } from '@/Components/ErrorBoundary';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const truncateAxisLabel = (label, maxLen = 16) => {
    const str = String(label ?? '');
    return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
};

const formatAxisRp = (value) => {
    const num = Number(value) || 0;
    const abs = Math.abs(num);
    if (abs >= 1000000000) {
        return 'Rp ' + (num / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M';
    }
    if (abs >= 1000000) {
        return 'Rp ' + (num / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
    }
    if (abs >= 1000) {
        return 'Rp ' + (num / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' Rb';
    }
    return 'Rp ' + num.toLocaleString('id-ID');
};

const formatCompactRp = (value) => {
    const num = Number(value) || 0;
    const abs = Math.abs(num);
    if (abs >= 1000000000) {
        const m = num / 1000000000;
        return 'Rp ' + (Math.abs(m) >= 10 ? m.toFixed(1) : m.toFixed(2)).replace('.', ',') + ' M';
    }
    if (abs >= 1000000) {
        const jt = num / 1000000;
        return 'Rp ' + (Math.abs(jt) >= 10 ? jt.toFixed(1) : jt.toFixed(2)).replace('.', ',') + ' Jt';
    }
    if (abs >= 1000) {
        return 'Rp ' + (num / 1000).toFixed(0) + ' Rb';
    }
    return 'Rp ' + num.toLocaleString('id-ID');
};

const DesktopDetailView = ({ isDesktop, detailModal, onClose, renderDetailContent, children }) => {
    const detailRef = useRef(null);

    useEffect(() => {
        if (isDesktop && detailModal.isOpen && detailRef.current) {
            detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isDesktop, detailModal.isOpen]);

    if (isDesktop && detailModal.isOpen) {
        return (
            <div ref={detailRef} className="scroll-mt-24 space-y-6">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 mb-5 border-b border-gray-100 pb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 bg-white text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-gray-200 shrink-0"
                            title="Kembali"
                            aria-label="Tutup detail"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5" aria-hidden="true">
                                <path d="m12 19-7-7 7-7"></path>
                                <path d="M19 12H5"></path>
                            </svg>
                        </button>
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-800 min-w-0 break-words">Detail {detailModal.title}</h3>
                    </div>
                    <div className="custom-scrollbar max-h-[75vh] overflow-y-auto pr-1 sm:pr-2">
                        {renderDetailContent()}
                    </div>
                </div>
                {children}
            </div>
        );
    }
    return <>{children}</>;
};

export default function Index({ tab = 'logistik', is_super_admin, global_target_value, global_annual_target_value, search, salesFilter, outletFilter, monthFilter, ptFilter, keteranganFilter, salesNames = [], outletNames = [], ptNames = [], keteranganNames = [], months: propMonths, reportData = { data: [] }, summary, summaryPesanan, summaryPiutang, summaryHutang }) {
    const reportRows = Array.isArray(reportData)
        ? reportData
        : (Array.isArray(reportData?.data) ? reportData.data : []);
    const authUser = usePage().props.auth.user;
    const isSalesLocked = !!authUser.spreadsheet_sales_name;
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', type: '', data: null });
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
    const [bulanView, setBulanView] = useState('chart'); // 'chart' | 'table'
    const [chartFormat, setChartFormat] = useState('compact'); // 'compact' | 'full'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setIsDesktop(window.innerWidth >= 768);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const [selectedSales, setSelectedSales] = useState(salesFilter || '');
    const [selectedOutlet, setSelectedOutlet] = useState(outletFilter || '');
    const [selectedMonth, setSelectedMonth] = useState(monthFilter || '');
    const [selectedPt, setSelectedPt] = useState(ptFilter ? ptFilter.split(',') : []);
    const [selectedKeterangan, setSelectedKeterangan] = useState(keteranganFilter || '');
    const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
    const tabDropdownRef = useRef(null);

    useEffect(() => {
        setSearchTerm(search || '');
    }, [search]);

    useEffect(() => {
        setSelectedMonth(monthFilter || '');
    }, [monthFilter]);

    useEffect(() => {
        setSelectedPt(ptFilter ? ptFilter.split(',') : []);
    }, [ptFilter]);

    useEffect(() => {
        setSelectedSales(salesFilter || '');
    }, [salesFilter]);

    useEffect(() => {
        setSelectedOutlet(outletFilter || '');
    }, [outletFilter]);

    useEffect(() => {
        setSelectedKeterangan(keteranganFilter || '');
    }, [keteranganFilter]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target)) {
                setIsTabDropdownOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsTabDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const parseRpToNumber = (str) => {
        if (!str) return 0;
        if (typeof str === 'number') return str;
        let s = str.toString().trim();
        if (/^-?\d+\.\d{1,2}$/.test(s)) return parseFloat(s);
        return parseFloat(s.replace(/Rp/gi, '').replace(/\./g, '').replace(/,/g, '.').replace(/ /g, '')) || 0;
    };

    const months = (propMonths && Array.isArray(propMonths) && propMonths.length > 0)
        ? propMonths
        : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const handleSearch = (e) => {
        e.preventDefault();
        const filters = { tab: tab, search: searchTerm, month_filter: selectedMonth };
        if (tab === 'logistik') {
            filters.sales_filter = selectedSales;
            filters.outlet_filter = selectedOutlet;
            filters.pt_filter = selectedPt.length > 0 ? selectedPt.join(',') : '';
        } else if (tab === 'pesanan') {
            filters.outlet_filter = selectedOutlet;
            filters.keterangan_filter = selectedKeterangan;
        } else if (tab === 'piutang') {
            filters.outlet_filter = selectedOutlet;
        }
        router.get(route('reports.index'), filters, { preserveState: true });
    };

    const handleTabChange = (newTab) => {
        router.get(route('reports.index'), { tab: newTab, search: '', sales_filter: '', outlet_filter: '', month_filter: '', pt_filter: '', keterangan_filter: '' }, { preserveState: true });
        setSearchTerm('');
        setSelectedSales('');
        setSelectedOutlet('');
        setSelectedMonth('');
        setSelectedPt([]);
        setSelectedKeterangan('');
    };

    const getPdfRouteArgs = () => {
        const args = { tab: tab, period: selectedMonth ? '1_bulan' : '1_tahun' };
        if (selectedSales) args.sales_filter = selectedSales;
        if (selectedOutlet) args.outlet_filter = selectedOutlet;
        if (selectedMonth) args.month_filter = selectedMonth;
        if (selectedPt && selectedPt.length > 0) args.pt_filter = selectedPt.join(',');
        if (selectedKeterangan) args.keterangan_filter = selectedKeterangan;
        if (searchTerm) args.search = searchTerm;
        return args;
    };

    const getProgressBg = (capaianStr) => {
        let perc = parseFloat((capaianStr || '0').replace(',', '.').replace('%', ''));
        if (isNaN(perc)) perc = 0;
        const fillPerc = Math.min(Math.max(perc, 0), 100);

        let color = '';
        if (perc < 34) {
            color = 'rgba(239, 68, 68, 0.2)';
        } else if (perc < 67) {
            color = 'rgba(234, 179, 8, 0.25)';
        } else {
            color = 'rgba(34, 197, 94, 0.2)';
        }

        return `linear-gradient(to right, ${color} ${fillPerc}%, transparent ${fillPerc}%)`;
    };

    const handleCardKeyDown = (e, onActivate) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onActivate();
        }
    };

    const renderDetailContent = () => (
        <>
            {!detailModal.data || Object.keys(detailModal.data).length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                    Tidak ada detail data yang tersedia.
                </div>
            ) : (
                <div className="space-y-3">
                    {(() => {
                        let totalValue = null;
                        if (detailModal.type === 'penjualan') totalValue = summary?.total_penjualan;
                        else if (detailModal.type === 'target') totalValue = detailModal.title === 'Target Bulanan' ? summary?.total_penjualan_bulan_ini : summary?.total_penjualan;
                        else if (detailModal.type === 'outlet') totalValue = summary?.total_outlet || summary?.total_penjualan;
                        else if (detailModal.type === 'produk') totalValue = summary?.total_produk || summary?.total_penjualan;
                        else if (detailModal.type === 'pesanan') totalValue = summary?.total_pesanan;
                        else if (detailModal.type === 'faktur') totalValue = summaryPesanan?.total_faktur;
                        else if (detailModal.type === 'terkirim') totalValue = summaryPesanan?.total_terkirim;
                        else if (detailModal.type === 'belum_terkirim') totalValue = summaryPesanan?.total_belum_terkirim;
                        else if (detailModal.type === 'total_surat') totalValue = summaryPesanan?.total_pesanan;
                        else if (detailModal.type === 'gabungan') totalValue = summaryPiutang?.total_gabungan;
                        else if (detailModal.type === 'sanzaya') totalValue = summaryPiutang?.total_sanzaya;
                        else if (detailModal.type === 'ruma') totalValue = summaryPiutang?.total_ruma;
                        else if (detailModal.type === 'hutang') totalValue = summaryHutang?.total_nominal;

                        if (totalValue) {
                            return (
                                <div className="flex flex-wrap justify-between items-center p-3.5 sm:p-4 mb-2 bg-blue-50/80 rounded-xl border border-blue-100 gap-2">
                                    <span className="font-bold text-blue-900 text-xs sm:text-base shrink-0">Total Keseluruhan</span>
                                    <span className="font-bold text-blue-700 text-sm sm:text-lg text-right break-words tabular-nums">{totalValue}</span>
                                </div>
                            );
                        }
                        return null;
                    })()}
                    {(() => {
                        let ptData = null;
                        let ptTitle = 'Berdasarkan PT';
                        if (detailModal.type === 'penjualan') {
                            ptData = summary?.pt_penjualan_detail;
                            ptTitle = 'Berdasarkan PT';
                        } else if (detailModal.type === 'target' && detailModal.title === 'Target Bulanan') {
                            ptData = summary?.pt_penjualan_bulan_ini || summary?.pt_penjualan_detail;
                            ptTitle = 'Total Penjualan per PT (Bulan Ini)';
                        } else if (detailModal.type === 'target' && detailModal.title === 'Target Tahunan') {
                            ptData = summary?.pt_penjualan_tahunan || summary?.pt_penjualan_detail;
                            ptTitle = 'Total Penjualan per PT (Tahunan)';
                        }

                        if (!ptData || Object.keys(ptData).length === 0) return null;

                        return (
                            <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">{ptTitle}</h4>
                                <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider px-3 pb-2 border-b border-gray-100">
                                    <span>Nama PT</span>
                                    <span>Total (Rp)</span>
                                </div>
                                <div className="space-y-2.5 mt-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                                    {Object.entries(ptData || {}).map(([key, value], idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl border border-indigo-100 transition-colors gap-1.5 sm:gap-3">
                                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-snug" title={key}>{key}</div>
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0 text-right tabular-nums pl-7 sm:pl-0">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                    {(() => {
                        let salesData = null;
                        let salesTitle = 'Berdasarkan Sales';
                        if (detailModal.type === 'target' && detailModal.title === 'Target Bulanan') {
                            salesData = summary?.sales_penjualan_bulan_ini || summary?.penjualan_detail;
                            salesTitle = 'Total Penjualan per Sales (Bulan Ini)';
                        } else if (detailModal.type === 'target' && detailModal.title === 'Target Tahunan') {
                            salesData = summary?.sales_penjualan_tahunan || summary?.penjualan_detail;
                            salesTitle = 'Total Penjualan per Sales (Tahunan)';
                        }

                        if (!salesData || Object.keys(salesData).length === 0) return null;

                        return (
                            <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">{salesTitle}</h4>
                                <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider px-3 pb-2 border-b border-gray-100">
                                    <span>Nama Sales</span>
                                    <span>Total (Rp)</span>
                                </div>
                                <div className="space-y-2.5 mt-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                                    {Object.entries(salesData || {}).map(([key, value], idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-blue-50/30 hover:bg-blue-50/60 rounded-xl border border-blue-100 transition-colors gap-1.5 sm:gap-3">
                                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-snug" title={key}>{key}</div>
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0 text-right tabular-nums pl-7 sm:pl-0">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <div>
                        {detailModal.type === 'penjualan' && (
                            <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">Berdasarkan Sales</h4>
                        )}
                        {detailModal.type === 'target' && (
                            <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">Rincian Target &amp; Capaian</h4>
                        )}
                        {detailModal.type === 'outlet' && (
                            <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">Peringkat Outlet Teratas</h4>
                        )}
                        {detailModal.type === 'produk' && (
                            <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">Peringkat Produk Terlaris</h4>
                        )}
                        {(detailModal.type === 'capaian' || detailModal.type === 'capaian_tahunan') && (
                            <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">Capaian per PT</h4>
                        )}
                        <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider px-3 pb-2 border-b border-gray-100 gap-2">
                            <span>{['faktur', 'terkirim', 'belum_terkirim', 'total_surat', 'gabungan', 'sanzaya', 'ruma', 'hutang'].includes(detailModal.type) ? 'Nama Outlet / Penyedia' : (['penjualan', 'pesanan'].includes(detailModal.type) ? 'Nama Sales' : (['target'].includes(detailModal.type) ? 'Nama PT / Sales' : (['outlet'].includes(detailModal.type) ? 'Nama Outlet' : (['produk'].includes(detailModal.type) ? 'Nama Produk' : (['capaian_tahunan', 'capaian'].includes(detailModal.type) ? 'Nama PT' : 'Nama')))))}</span>
                            <span className="text-right">{['penjualan', 'faktur'].includes(detailModal.type) ? 'Total (Rp)' : (['target'].includes(detailModal.type) ? 'Realisasi (% Capaian)' : (['capaian', 'capaian_tahunan'].includes(detailModal.type) ? 'Capaian' : 'Nilai'))}</span>
                        </div>
                        <div className="space-y-2.5 mt-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                            {detailModal.type === 'outlet' || detailModal.type === 'produk' ? (
                                Object.entries(detailModal?.data || {}).map(([key, value], idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-4 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-100 pb-3 mb-3 gap-2">
                                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                                <div className={`w-6 h-6 rounded-full ${detailModal.type === 'outlet' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'} flex items-center justify-center text-xs font-bold shrink-0`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="font-bold text-gray-800 text-xs sm:text-sm break-words leading-snug">{key}</h5>
                                                    {detailModal.type === 'produk' && typeof value === 'object' && value?.qty !== undefined && (
                                                        <p className="text-[11px] text-gray-500 mt-0.5 break-words">
                                                            Qty: <span className="font-semibold text-gray-700">{Number(value?.qty || 0).toLocaleString('id-ID')} {value?.satuan || ''}</span>
                                                            {value?.count && <span className="ml-2 text-gray-400">({value.count} transaksi)</span>}
                                                        </p>
                                                    )}
                                                    {detailModal.type === 'outlet' && typeof value === 'object' && value?.count && (
                                                        <p className="text-[11px] text-gray-500 mt-0.5">{value.count} transaksi</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0 text-right tabular-nums pl-8 sm:pl-0">
                                                {typeof value === 'object' ? (value?.total_formatted || '-') : value}
                                            </span>
                                        </div>
                                        {typeof value === 'object' && (value?.pt || value?.bulan) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                                {value?.pt && Object.keys(value.pt).length > 0 && (
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Berdasarkan PT</p>
                                                        <div className="space-y-1">
                                                            {Object.entries(value.pt).map(([pt, val]) => (
                                                                <div key={pt} className="flex justify-between gap-2 text-[11px] sm:text-xs">
                                                                    <span className="text-gray-600 truncate min-w-0" title={pt}>{pt}</span>
                                                                    <span className="font-semibold text-gray-800 shrink-0 tabular-nums">{val}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {value?.bulan && Object.keys(value.bulan).length > 0 && (
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Berdasarkan Bulan</p>
                                                        <div className="space-y-1">
                                                            {Object.entries(value.bulan).map(([bln, val]) => (
                                                                <div key={bln} className="flex justify-between gap-2 text-[11px] sm:text-xs">
                                                                    <span className="text-gray-600 truncate min-w-0" title={bln}>{bln}</span>
                                                                    <span className="font-semibold text-gray-800 shrink-0 tabular-nums">{val}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                Object.entries(detailModal?.data || {}).map(([key, value], idx) => {
                                    const displayVal = typeof value === 'string' && detailModal.type === 'target'
                                        ? value.replace(/\s*\/\s*Rp\s*[\d\.,]+\s*(\([^\)]+\))/, ' $1')
                                        : value;
                                    return (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50/70 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors gap-1.5 sm:gap-3">
                                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-snug" title={key}>{key}</div>
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0 text-right tabular-nums pl-7 sm:pl-0">{displayVal}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    // Chart Renderers
    const renderLogistikChart = () => {
        if (!summary) return null;

        const dataSales = summary.penjualan_detail && Object.keys(summary.penjualan_detail).length > 0 ? Object.entries(summary.penjualan_detail).map(([name, val]) => ({
            name: name,
            Penjualan: parseRpToNumber(val)
        })).slice(0, 10) : [];

        const dataBulan = summary.bulan_detail && Object.keys(summary.bulan_detail).length > 0 ? Object.entries(summary.bulan_detail).map(([name, val]) => ({
            name: name,
            Penjualan: parseRpToNumber(val)
        })) : [];

        const dataBrand = summary.brand_detail && Object.keys(summary.brand_detail).length > 0 ? Object.entries(summary.brand_detail).map(([name, val], index) => {
            const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
            return {
                name: name,
                Penjualan: parseRpToNumber(val),
                color: palette[index % palette.length]
            };
        }) : [];

        if (dataSales.length === 0 && dataBulan.length === 0 && dataBrand.length === 0) return null;

        const maxBulanPenjualan = dataBulan.length > 0 ? Math.max(...dataBulan.map(d => d.Penjualan), 1) : 1;

        const pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 11 },
                        boxWidth: 12,
                        padding: 10,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ' ' + new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.raw);
                        }
                    }
                }
            }
        };

        const bulanMinWidth = chartFormat === 'full'
            ? `${Math.max(dataBulan.length * 118, 760)}px`
            : (!isDesktop
                ? `${Math.max(dataBulan.length * 70, 560)}px`
                : (dataBulan.length > 8 ? `${Math.max(dataBulan.length * 76, 720)}px` : '100%'));

        return (
            <div className="flex flex-col gap-5 sm:gap-6 mb-6">
                {dataBulan.length > 0 && (
                    <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-gray-100 gap-2.5">
                            <h4 className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-2 min-w-0">
                                <TrendingUp className="w-5 h-5 text-indigo-600 shrink-0" />
                                <span className="truncate">Penjualan Per Bulan</span>
                            </h4>

                            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                                {bulanView === 'chart' && (
                                    <button
                                        type="button"
                                        onClick={() => setChartFormat(prev => prev === 'compact' ? 'full' : 'compact')}
                                        className="text-xs px-3 py-1.5 min-h-[36px] bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors border border-gray-200/80 whitespace-nowrap"
                                    >
                                        {chartFormat === 'compact' ? 'Label: Singkat (M/Jt)' : 'Label: Penuh (Rp)'}
                                    </button>
                                )}

                                <div className="inline-flex p-0.5 bg-gray-100 rounded-xl text-xs font-semibold border border-gray-200/60">
                                    <button
                                        type="button"
                                        onClick={() => setBulanView('chart')}
                                        className={`px-3 py-1.5 min-h-[34px] rounded-lg transition-all flex items-center gap-1.5 ${bulanView === 'chart' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        <BarChart2 className="w-3.5 h-3.5" /> Grafik
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBulanView('table')}
                                        className={`px-3 py-1.5 min-h-[34px] rounded-lg transition-all flex items-center gap-1.5 ${bulanView === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        <Table className="w-3.5 h-3.5" /> Rincian
                                    </button>
                                </div>
                            </div>
                        </div>

                        {bulanView === 'table' ? (
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider px-2 pb-1.5 border-b border-gray-100">
                                    <span>Bulan</span>
                                    <span>Total Penjualan</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                                    {dataBulan.map((item, idx) => {
                                        const percentOfMax = maxBulanPenjualan > 0 ? (item.Penjualan / maxBulanPenjualan) * 100 : 0;
                                        return (
                                            <div
                                                key={idx}
                                                className="p-3 rounded-2xl border bg-gray-50/70 hover:bg-gray-50 border-gray-100 transition-all"
                                            >
                                                <div className="flex justify-between items-center gap-2 mb-1.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-blue-100 text-blue-700">
                                                            {idx + 1}
                                                        </div>
                                                        <span className="font-bold text-xs sm:text-sm text-gray-800 truncate">{item.name}</span>
                                                    </div>
                                                    <span className="font-extrabold text-xs sm:text-sm text-blue-700 text-right tabular-nums shrink-0">
                                                        {'Rp ' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(item.Penjualan)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-blue-500"
                                                        style={{ width: `${percentOfMax}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                                <div className="h-64 sm:h-72 lg:h-80" style={{ minWidth: bulanMinWidth }}>
                                    <Bar
                                        plugins={[ChartDataLabels]}
                                        data={{
                                            labels: dataBulan.map(d => d.name),
                                            datasets: [{
                                                data: dataBulan.map(d => d.Penjualan),
                                                backgroundColor: '#3b82f6',
                                                borderRadius: 6,
                                                maxBarThickness: 56,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                datalabels: {
                                                    anchor: 'end',
                                                    align: 'top',
                                                    offset: 2,
                                                    color: '#1d4ed8',
                                                    font: { weight: 'bold', size: chartFormat === 'full' ? 9 : 10 },
                                                    formatter: function(value) {
                                                        if (!value || value === 0) return '';
                                                        if (chartFormat === 'compact') {
                                                            return formatCompactRp(value);
                                                        }
                                                        return 'Rp ' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
                                                    }
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function(context) {
                                                            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.raw);
                                                        }
                                                    }
                                                }
                                            },
                                            layout: {
                                                padding: { top: 30, left: 4, right: 8 }
                                            },
                                            scales: {
                                                x: {
                                                    grid: { display: false },
                                                    ticks: {
                                                        font: { size: !isDesktop ? 10 : 11 },
                                                        color: '#4b5563',
                                                        maxRotation: !isDesktop ? 40 : 0,
                                                        autoSkip: false
                                                    }
                                                },
                                                y: {
                                                    grid: { color: '#f0f0f0', drawBorder: false },
                                                    border: { display: false },
                                                    ticks: {
                                                        font: { size: !isDesktop ? 10 : 11 },
                                                        color: '#4b5563',
                                                        callback: formatAxisRp
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {(dataSales.length > 0 || dataBrand.length > 0) && (
                    <div className={`grid grid-cols-1 ${dataSales.length > 0 && dataBrand.length > 0 ? 'lg:grid-cols-2' : ''} gap-5 sm:gap-6`}>
                        {dataSales.length > 0 && (
                            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-w-0">
                                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-4 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-blue-600 shrink-0" />
                                    <span className="truncate">Top 10 Penjualan per Sales</span>
                                </h4>
                                <div className="h-80 sm:h-96 w-full flex items-center justify-center">
                                    <Pie
                                        data={{
                                            labels: dataSales.map(d => d.name),
                                            datasets: [{
                                                data: dataSales.map(d => d.Penjualan),
                                                backgroundColor: [
                                                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                                                    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
                                                ],
                                                borderWidth: 2,
                                                borderColor: '#ffffff'
                                            }]
                                        }}
                                        options={pieOptions}
                                    />
                                </div>
                            </div>
                        )}

                        {dataBrand.length > 0 && (
                            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-w-0">
                                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span className="truncate">Penjualan per Brand</span>
                                </h4>
                                <div className="h-80 sm:h-96 w-full flex items-center justify-center">
                                    <Pie
                                        data={{
                                            labels: dataBrand.map(d => d.name),
                                            datasets: [{
                                                data: dataBrand.map(d => d.Penjualan),
                                                backgroundColor: dataBrand.map(d => d.color),
                                                borderWidth: 0,
                                                hoverOffset: 4
                                            }]
                                        }}
                                        options={pieOptions}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderPesananChart = () => {
        if (!summaryPesanan) return null;

        const terkirim = parseFloat((summaryPesanan.total_terkirim || '0').replace('%', ''));
        const belum = parseFloat((summaryPesanan.total_belum_terkirim || '0').replace('%', ''));

        if (terkirim === 0 && belum === 0) return null;

        const pieData = [
            { name: 'Terkirim', value: terkirim, color: '#10b981' },
            { name: 'Belum Terkirim', value: belum, color: '#ef4444' }
        ];

        const barData = Object.entries(summaryPesanan.faktur_detail || {}).map(([name, val]) => ({
            name: name,
            TotalFaktur: parseRpToNumber(val)
        }));

        const pieOptionsPerc = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ' ' + context.raw + '%';
                        }
                    }
                }
            }
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            const idx = items?.[0]?.dataIndex;
                            return idx !== undefined && barData[idx] ? barData[idx].name : '';
                        },
                        label: function(context) {
                            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 10 },
                        color: '#4b5563',
                        maxRotation: 35,
                        callback: function(value) {
                            return truncateAxisLabel(this.getLabelForValue(value), 14);
                        }
                    }
                },
                y: {
                    grid: { color: '#f0f0f0', drawBorder: false },
                    border: { display: false },
                    ticks: {
                        font: { size: 10 },
                        color: '#4b5563',
                        callback: formatAxisRp
                    }
                }
            }
        };

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
                <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 col-span-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="truncate">Status Pengiriman</span>
                    </h4>
                    <div className="h-64 sm:h-72 w-full">
                        <Pie
                            data={{
                                labels: pieData.map(d => d.name),
                                datasets: [{
                                    data: pieData.map(d => d.value),
                                    backgroundColor: pieData.map(d => d.color),
                                    borderWidth: 0,
                                    hoverOffset: 4
                                }]
                            }}
                            options={pieOptionsPerc}
                        />
                    </div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 col-span-1 lg:col-span-2 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="truncate">Top 10 Faktur per Outlet</span>
                    </h4>
                    <div className="w-full overflow-x-auto custom-scrollbar pb-1">
                        <div className="h-64 sm:h-72" style={{ minWidth: !isDesktop && barData.length > 5 ? `${barData.length * 64}px` : '100%' }}>
                            <Bar
                                data={{
                                    labels: barData.map(d => d.name),
                                    datasets: [{
                                        data: barData.map(d => d.TotalFaktur),
                                        backgroundColor: '#0ea5e9',
                                        borderRadius: 4,
                                        maxBarThickness: 48,
                                    }]
                                }}
                                options={chartOptions}
                            />
                        </div>
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

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            const idx = items?.[0]?.dataIndex;
                            return idx !== undefined && data[idx] ? data[idx].name : '';
                        },
                        label: function(context) {
                            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 10 },
                        color: '#4b5563',
                        maxRotation: 35,
                        callback: function(value) {
                            return truncateAxisLabel(this.getLabelForValue(value), 14);
                        }
                    }
                },
                y: {
                    grid: { color: '#f0f0f0', drawBorder: false },
                    border: { display: false },
                    ticks: {
                        font: { size: 10 },
                        color: '#4b5563',
                        callback: formatAxisRp
                    }
                }
            }
        };

        return (
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6 min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="truncate">Top 10 Total Piutang Outlet</span>
                </h4>
                <div className="w-full overflow-x-auto custom-scrollbar pb-1">
                    <div className="h-72 sm:h-80" style={{ minWidth: !isDesktop && data.length > 5 ? `${data.length * 64}px` : '100%' }}>
                        <Bar
                            data={{
                                labels: data.map(d => d.name),
                                datasets: [{
                                    data: data.map(d => d.TotalPiutang),
                                    backgroundColor: '#6366f1',
                                    borderRadius: 4,
                                    maxBarThickness: 48,
                                }]
                            }}
                            options={chartOptions}
                        />
                    </div>
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

        const horizontalChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            const idx = items?.[0]?.dataIndex;
                            return idx !== undefined && data[idx] ? data[idx].name : '';
                        },
                        label: function(context) {
                            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#f0f0f0', drawBorder: false },
                    border: { display: false },
                    ticks: {
                        font: { size: 10 },
                        color: '#4b5563',
                        callback: formatAxisRp
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 10 },
                        color: '#4b5563',
                        callback: function(value) {
                            return truncateAxisLabel(this.getLabelForValue(value), isDesktop ? 24 : 14);
                        }
                    }
                }
            }
        };

        return (
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6 min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-600 shrink-0" />
                    <span className="truncate">Top 10 Hutang Penyedia</span>
                </h4>
                <div className="h-72 sm:h-80 w-full">
                    <Bar
                        data={{
                            labels: data.map(d => d.name),
                            datasets: [{
                                data: data.map(d => d.TotalHutang),
                                backgroundColor: '#f97316',
                                borderRadius: 4,
                                maxBarThickness: 28,
                            }]
                        }}
                        options={horizontalChartOptions}
                    />
                </div>
            </div>
        );
    };

    const getKeteranganBadge = (keterangan) => {
        if (!keterangan) return null;
        const ket = keterangan.toUpperCase().trim();
        let colorClass = "bg-gray-100 text-gray-800";
        if (ket === 'COMPLITE') colorClass = "bg-green-100 text-green-800";
        else if (ket === 'BELUM LENGKAP') colorClass = "bg-red-100 text-red-800";
        else if (ket === 'BELUM READY') colorClass = "bg-red-700 text-white font-bold";
        else if (ket === 'CANCEL') colorClass = "bg-gray-200 text-gray-700";
        else if (ket === 'PROSES PENGIRIMAN') colorClass = "bg-yellow-100 text-yellow-800";
        else if (ket === 'ID PAKET BELUM TERBIT') colorClass = "bg-blue-100 text-blue-800";
        else if (ket === 'TUNGGU PI') colorClass = "bg-blue-100 text-blue-800";
        else if (ket === 'TERKIRIM SEBAGIAN') colorClass = "bg-teal-100 text-teal-800";

        return <span className={`inline-block px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full ${colorClass}`}>{keterangan}</span>;
    };

    const renderLogistikTable = () => (
        <>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
                {reportRows.map((row) => {
                    const salesLabel = row.nama_sales || (row.nama_pt ? 'KANTOR ' + row.nama_pt : (row.sheet_name ? 'KANTOR ' + row.sheet_name : '-'));
                    const outletLabel = row.pelanggan || (row.nama_pt ? 'Non-Outlet (' + row.nama_pt + ')' : (row.sheet_name ? 'Non-Outlet (' + row.sheet_name + ')' : '-'));
                    const produkLabel = row.nama_produk || (row.no_faktur ? 'Faktur: ' + row.no_faktur : (row.nama_pt || row.sheet_name || '-'));
                    const totalLabel = row.total ? 'Rp ' + parseRpToNumber(row.total).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
                    return (
                        <div key={row.id} className="p-4 space-y-2 hover:bg-gray-50/70 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-gray-900 break-words flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                        <span>{outletLabel}</span>
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-blue-700 text-right tabular-nums shrink-0">{totalLabel}</span>
                            </div>
                            <p className="text-xs text-gray-700 break-words leading-relaxed bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                                {produkLabel}
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-0.5">
                                <span className="inline-flex items-center gap-1 font-medium text-gray-700 min-w-0 break-words">
                                    <UserIcon className="w-3 h-3 text-gray-400 shrink-0" /> {salesLabel}
                                </span>
                                <span className="inline-flex items-center gap-1 shrink-0">
                                    <Calendar className="w-3 h-3 text-gray-400 shrink-0" /> {row.tanggal || '-'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {reportRows.length === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-gray-500">
                        Data laporan logistik kosong atau tidak ditemukan.
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 xl:px-5 py-3.5 whitespace-nowrap">Tanggal</th>
                            <th className="px-4 xl:px-5 py-3.5">Nama Sales</th>
                            <th className="px-4 xl:px-5 py-3.5">Outlet</th>
                            <th className="px-4 xl:px-5 py-3.5">Produk</th>
                            <th className="px-4 xl:px-5 py-3.5 text-right whitespace-nowrap">Total (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows.map((row) => (
                            <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 xl:px-5 py-3.5 whitespace-nowrap text-xs xl:text-sm">
                                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> {row.tanggal}
                                </td>
                                <td className="px-4 xl:px-5 py-3.5 font-semibold text-gray-900 max-w-[180px] break-words">
                                    <UserIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> {row.nama_sales || (row.nama_pt ? 'KANTOR ' + row.nama_pt : (row.sheet_name ? 'KANTOR ' + row.sheet_name : '-'))}
                                </td>
                                <td className="px-4 xl:px-5 py-3.5 max-w-[220px] break-words">
                                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> {row.pelanggan || (row.nama_pt ? 'Non-Outlet (' + row.nama_pt + ')' : (row.sheet_name ? 'Non-Outlet (' + row.sheet_name + ')' : '-'))}
                                </td>
                                <td className="px-4 xl:px-5 py-3.5 max-w-[280px] break-words">
                                    {row.nama_produk || (row.no_faktur ? 'Faktur: ' + row.no_faktur : (row.nama_pt || row.sheet_name || '-'))}
                                </td>
                                <td className="px-4 xl:px-5 py-3.5 whitespace-nowrap text-right font-bold text-blue-600 tabular-nums">
                                    {row.total ? 'Rp ' + parseRpToNumber(row.total).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                </td>
                            </tr>
                        ))}
                        {reportRows.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    Data laporan logistik kosong atau tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderPesananTable = () => (
        <>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
                {reportRows.map((row) => (
                    <div key={row.id} className="p-4 space-y-2.5 hover:bg-gray-50/70 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-900 break-words flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                    <span>{row.nama_outlet || '-'}</span>
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5 break-words">
                                    {row.tanggal || '-'} {row.nomor_klikkan ? `• No. ${row.nomor_klikkan}` : ''}
                                </p>
                            </div>
                            <div className="shrink-0">{getKeteranganBadge(row.keterangan)}</div>
                        </div>

                        <p className="text-xs text-gray-800 font-medium break-words bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                            {row.nama_produk || '-'}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-white rounded-xl p-2 border border-gray-100">
                                <span className="text-gray-500 block">Jumlah &amp; Harga</span>
                                <span className="font-semibold text-gray-900 tabular-nums">
                                    {row.jumlah || 0} {row.satuan || ''} • {row.harga_faktur || '-'}
                                </span>
                            </div>
                            <div className="bg-emerald-50/50 rounded-xl p-2 border border-emerald-100">
                                <span className="text-gray-600 block">Total Faktur</span>
                                <span className="font-bold text-emerald-700 tabular-nums">{row.total_faktur || '-'}</span>
                            </div>
                            <div className="bg-white rounded-xl p-2 border border-gray-100">
                                <span className="text-gray-500 block">Terkirim ({row.persen_terpenuhi || '0%'})</span>
                                <span className="font-semibold text-emerald-700 tabular-nums">{row.terkirim || 0} • {row.nominal_sdh_kirim || '-'}</span>
                            </div>
                            <div className="bg-white rounded-xl p-2 border border-gray-100">
                                <span className="text-gray-500 block">Belum Kirim ({row.persen_belum_terpenuhi || '0%'})</span>
                                <span className="font-semibold text-red-600 tabular-nums">{row.belum_terkirim || 0} • {row.nominal_blm_kirim || '-'}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {reportRows.length === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-gray-500">
                        Data surat pesanan kosong atau tidak ditemukan.
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs xl:text-sm text-left text-gray-600 whitespace-nowrap">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3.5">TANGGAL</th>
                            <th className="px-4 py-3.5">NOMOR KLIKKAN</th>
                            <th className="px-4 py-3.5">NAMA PELANGGAN</th>
                            <th className="px-4 py-3.5">NAMA PRODUK</th>
                            <th className="px-4 py-3.5 text-right">JUMLAH</th>
                            <th className="px-4 py-3.5">SATUAN</th>
                            <th className="px-4 py-3.5 text-right">HARGA FAKTUR</th>
                            <th className="px-4 py-3.5 text-right">TOTAL FAKTUR</th>
                            <th className="px-4 py-3.5 text-center">TERKIRIM</th>
                            <th className="px-4 py-3.5 text-center">BELUM KIRIM</th>
                            <th className="px-4 py-3.5 text-right">NOMINAL SDH KIRIM</th>
                            <th className="px-4 py-3.5 text-right">NOMINAL BLM KIRIM</th>
                            <th className="px-4 py-3.5 text-center">% TERPENUHI</th>
                            <th className="px-4 py-3.5 text-center">% BELUM TERPENUHI</th>
                            <th className="px-4 py-3.5">KETERANGAN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows.map((row) => (
                            <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 py-3.5"><Calendar className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> {row.tanggal}</td>
                                <td className="px-4 py-3.5">{row.nomor_klikkan}</td>
                                <td className="px-4 py-3.5 font-semibold text-gray-900"><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> {row.nama_outlet}</td>
                                <td className="px-4 py-3.5 max-w-[260px] whitespace-normal break-words">{row.nama_produk}</td>
                                <td className="px-4 py-3.5 text-right tabular-nums">{row.jumlah}</td>
                                <td className="px-4 py-3.5">{row.satuan}</td>
                                <td className="px-4 py-3.5 text-right tabular-nums">{row.harga_faktur}</td>
                                <td className="px-4 py-3.5 text-right font-bold text-emerald-600 tabular-nums">{row.total_faktur}</td>
                                <td className="px-4 py-3.5 text-center tabular-nums">{row.terkirim}</td>
                                <td className="px-4 py-3.5 text-center tabular-nums">{row.belum_terkirim}</td>
                                <td className="px-4 py-3.5 text-right tabular-nums">{row.nominal_sdh_kirim}</td>
                                <td className="px-4 py-3.5 text-right tabular-nums">{row.nominal_blm_kirim}</td>
                                <td className="px-4 py-3.5 text-center text-emerald-600 tabular-nums">{row.persen_terpenuhi}</td>
                                <td className="px-4 py-3.5 text-center text-red-500 tabular-nums">{row.persen_belum_terpenuhi}</td>
                                <td className="px-4 py-3.5">{getKeteranganBadge(row.keterangan)}</td>
                            </tr>
                        ))}
                        {reportRows.length === 0 && (
                            <tr>
                                <td colSpan="15" className="px-6 py-10 text-center text-gray-500">
                                    Data surat pesanan kosong atau tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderPiutangTable = () => (
        <>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
                {reportRows.map((row) => (
                    <div key={row.id} className="p-4 space-y-2.5 hover:bg-gray-50/70 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900 break-words flex items-start gap-1.5 min-w-0 flex-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                <span>{row.nama_outlet || '-'}</span>
                            </p>
                            <div className="text-right shrink-0">
                                <span className="text-[10px] text-gray-500 block">Total Gabungan</span>
                                <span className="text-xs font-extrabold text-gray-900 tabular-nums">{row.total_gabungan || '-'}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-blue-50/40 rounded-xl p-2.5 border border-blue-100 space-y-1">
                                <span className="font-bold text-blue-800 block">Sanzaya</span>
                                <div className="flex justify-between gap-1 text-gray-600"><span>Thn 1:</span><span className="tabular-nums">{row.tahun_1 || '-'}</span></div>
                                <div className="flex justify-between gap-1 text-gray-600"><span>Thn 2:</span><span className="tabular-nums">{row.tahun_2 || '-'}</span></div>
                                <div className="flex justify-between gap-1 text-gray-600"><span>Thn 3:</span><span className="tabular-nums">{row.tahun_3 || '-'}</span></div>
                                <div className="flex justify-between gap-1 font-bold text-blue-700 border-t border-blue-100 pt-1"><span>Total:</span><span className="tabular-nums">{row.total_sanzaya || '-'}</span></div>
                            </div>
                            <div className="bg-indigo-50/40 rounded-xl p-2.5 border border-indigo-100 space-y-1">
                                <span className="font-bold text-indigo-800 block">Ruma</span>
                                <div className="flex justify-between gap-1 text-gray-600"><span>Ruma 1:</span><span className="tabular-nums">{row.ruma_1 || '-'}</span></div>
                                <div className="flex justify-between gap-1 text-gray-600"><span>Ruma 2:</span><span className="tabular-nums">{row.ruma_2 || '-'}</span></div>
                                <div className="flex justify-between gap-1 text-gray-600"><span>Ruma 3:</span><span className="tabular-nums">{row.ruma_3 || '-'}</span></div>
                                <div className="flex justify-between gap-1 font-bold text-indigo-700 border-t border-indigo-100 pt-1"><span>Total:</span><span className="tabular-nums">{row.total_ruma || '-'}</span></div>
                            </div>
                        </div>
                    </div>
                ))}
                {reportRows.length === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-gray-500">
                        Data piutang kosong atau tidak ditemukan.
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs xl:text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 xl:px-5 py-3.5" rowSpan="2">Outlet</th>
                            <th className="px-4 py-2.5 text-center border-b border-gray-100 bg-blue-50/50" colSpan="4">Sanzaya</th>
                            <th className="px-4 py-2.5 text-center border-b border-gray-100 bg-blue-50/50" colSpan="4">Ruma</th>
                            <th className="px-4 xl:px-5 py-3.5 text-right font-bold whitespace-nowrap" rowSpan="2">Total Gabungan</th>
                        </tr>
                        <tr>
                            <th className="px-3 py-2 bg-blue-50/50 whitespace-nowrap">Tahun 1</th>
                            <th className="px-3 py-2 bg-blue-50/50 whitespace-nowrap">Tahun 2</th>
                            <th className="px-3 py-2 bg-blue-50/50 whitespace-nowrap">Tahun 3</th>
                            <th className="px-3 py-2 text-right bg-blue-100/50 font-bold whitespace-nowrap">Total</th>
                            <th className="px-3 py-2 bg-blue-50/50 whitespace-nowrap">Ruma 1</th>
                            <th className="px-3 py-2 bg-blue-50/50 whitespace-nowrap">Ruma 2</th>
                            <th className="px-3 py-2 bg-blue-50/50 whitespace-nowrap">Ruma 3</th>
                            <th className="px-3 py-2 text-right bg-blue-100/50 font-bold whitespace-nowrap">Total Ruma</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows.map((row) => (
                            <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 xl:px-5 py-3.5 font-semibold text-gray-900 min-w-[180px] break-words"><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> {row.nama_outlet}</td>
                                <td className="px-3 py-3 whitespace-nowrap tabular-nums">{row.tahun_1}</td>
                                <td className="px-3 py-3 whitespace-nowrap tabular-nums">{row.tahun_2}</td>
                                <td className="px-3 py-3 whitespace-nowrap tabular-nums">{row.tahun_3}</td>
                                <td className="px-3 py-3 text-right font-bold text-blue-700 bg-blue-50/30 whitespace-nowrap tabular-nums">{row.total_sanzaya}</td>
                                <td className="px-3 py-3 whitespace-nowrap tabular-nums">{row.ruma_1}</td>
                                <td className="px-3 py-3 whitespace-nowrap tabular-nums">{row.ruma_2}</td>
                                <td className="px-3 py-3 whitespace-nowrap tabular-nums">{row.ruma_3}</td>
                                <td className="px-3 py-3 text-right font-bold text-blue-700 bg-blue-50/30 whitespace-nowrap tabular-nums">{row.total_ruma}</td>
                                <td className="px-4 xl:px-5 py-3.5 text-right font-bold text-gray-900 bg-gray-50 whitespace-nowrap tabular-nums">{row.total_gabungan}</td>
                            </tr>
                        ))}
                        {reportRows.length === 0 && (
                            <tr>
                                <td colSpan="10" className="px-6 py-10 text-center text-gray-500">
                                    Data piutang kosong atau tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderHutangTable = () => (
        <>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
                {reportRows.map((row) => (
                    <div key={row.id} className="p-4 flex items-start justify-between gap-3 hover:bg-gray-50/70 transition-colors">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold shrink-0">
                                {row.no}
                            </span>
                            <span className="text-xs font-semibold text-gray-900 break-words leading-snug">{row.nama_penyedia || '-'}</span>
                        </div>
                        <span className="text-xs font-bold text-orange-600 text-right tabular-nums shrink-0">{row.nominal || '-'}</span>
                    </div>
                ))}
                {reportRows.length === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-gray-500">
                        Data hutang kosong atau tidak ditemukan.
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 xl:px-6 py-3.5 w-16 text-center">No</th>
                            <th className="px-4 xl:px-6 py-3.5">Nama Penyedia</th>
                            <th className="px-4 xl:px-6 py-3.5 text-right whitespace-nowrap">Nominal (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows.map((row) => (
                            <tr key={row.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 xl:px-6 py-3.5 text-center font-medium text-gray-900 tabular-nums">{row.no}</td>
                                <td className="px-4 xl:px-6 py-3.5 font-semibold text-gray-900 break-words">{row.nama_penyedia}</td>
                                <td className="px-4 xl:px-6 py-3.5 text-right font-bold text-orange-600 whitespace-nowrap tabular-nums">{row.nominal}</td>
                            </tr>
                        ))}
                        {reportRows.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                                    Data hutang kosong atau tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    const isFiveControlBar = tab === 'logistik' && !isSalesLocked;
    const isFourControlBar = (tab === 'logistik' && isSalesLocked) || tab === 'pesanan';

    return (
        <ErrorBoundary>
            <AuthenticatedLayout
                user={usePage().props.auth.user}
                header={<h2 className="font-bold text-xl sm:text-2xl text-gray-800 leading-tight">Dashboard Laporan</h2>}
            >
                <Head title="Dashboard Laporan" />

                <div className="pb-6 pt-0 space-y-5 sm:space-y-6">

                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 min-w-0">
                                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
                                <span className="truncate">Data Laporan Tersinkronisasi</span>
                            </h3>
                        </div>

                        <div className="relative w-full sm:w-auto [&>div]:w-full sm:[&>div]:w-auto">
                            <ExportDropdown
                                isReportDashboard={true}
                                outletNames={outletNames}
                                pdfRoute={route('reports.pdf', getPdfRouteArgs())}
                                trigger={
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all min-h-[44px] whitespace-nowrap shrink-0"
                                    >
                                        <Download className="w-4 h-4 shrink-0" />
                                        Unduh PDF
                                    </button>
                                }
                            />
                        </div>
                    </div>

                    {/* Filter & Report Type Bar (Balanced Responsive Grid Across All Breakpoints) */}
                    <div className="bg-white p-3.5 sm:p-4 lg:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 relative z-30">
                        <form
                            onSubmit={handleSearch}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-12 gap-2.5 sm:gap-3 items-center"
                        >
                            {/* Pilihan Jenis Laporan */}
                            <div
                                className={`relative z-40 min-w-0 ${
                                    isFiveControlBar || isFourControlBar
                                        ? 'sm:col-span-1 lg:col-span-2 2xl:col-span-2'
                                        : 'sm:col-span-1 lg:col-span-3 2xl:col-span-3'
                                }`}
                                ref={tabDropdownRef}
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                                    aria-expanded={isTabDropdownOpen}
                                    className="flex items-center justify-between w-full gap-2 bg-blue-50 text-blue-700 px-3.5 py-2.5 min-h-[44px] rounded-xl font-bold hover:bg-blue-100 transition-colors shadow-sm text-sm border border-blue-200/70"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {tab === 'logistik' && <><Package className="w-4 h-4 shrink-0" /><span className="truncate">Logistik</span></>}
                                        {tab === 'pesanan' && <><ShoppingCart className="w-4 h-4 shrink-0" /><span className="truncate">Surat Pesanan</span></>}
                                        {tab === 'piutang' && <><CreditCard className="w-4 h-4 shrink-0" /><span className="truncate">Data Piutang</span></>}
                                        {tab === 'hutang' && <><CreditCard className="w-4 h-4 shrink-0" /><span className="truncate">Data Hutang</span></>}
                                        {!['logistik', 'pesanan', 'piutang', 'hutang'].includes(tab) && <><BarChart2 className="w-4 h-4 shrink-0" /><span className="truncate">Pilih Laporan</span></>}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTabDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-full min-w-[180px] bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => { handleTabChange('logistik'); setIsTabDropdownOpen(false); }}
                                            className={`flex items-center gap-2 w-full text-left px-4 py-2.5 min-h-[42px] text-sm font-medium transition-colors border-b border-gray-50 ${tab === 'logistik' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                                        >
                                            <Package className="w-4 h-4 shrink-0" /> Logistik
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { handleTabChange('pesanan'); setIsTabDropdownOpen(false); }}
                                            className={`flex items-center gap-2 w-full text-left px-4 py-2.5 min-h-[42px] text-sm font-medium transition-colors ${tab === 'pesanan' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'}`}
                                        >
                                            <ShoppingCart className="w-4 h-4 shrink-0" /> Surat Pesanan
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Filter Bulan */}
                            <div
                                className={`relative z-30 min-w-0 ${
                                    isFiveControlBar || isFourControlBar
                                        ? 'sm:col-span-1 lg:col-span-2 2xl:col-span-2'
                                        : 'sm:col-span-1 lg:col-span-3 2xl:col-span-3'
                                }`}
                            >
                                <CustomSelect
                                    value={selectedMonth}
                                    onChange={(value) => {
                                        setSelectedMonth(value);
                                        const filters = { tab: tab, search: searchTerm, month_filter: value };
                                        if (tab === 'logistik') {
                                            filters.sales_filter = selectedSales;
                                            filters.outlet_filter = selectedOutlet;
                                            filters.pt_filter = selectedPt.length > 0 ? selectedPt.join(',') : '';
                                        } else if (tab === 'pesanan') {
                                            filters.outlet_filter = selectedOutlet;
                                            filters.keterangan_filter = selectedKeterangan;
                                        } else if (tab === 'piutang') {
                                            filters.outlet_filter = selectedOutlet;
                                        }
                                        router.get(route('reports.index'), filters, { preserveState: true });
                                    }}
                                    options={[
                                        { value: '', label: 'Semua Bulan' },
                                        ...months.map(m => ({ value: m, label: m }))
                                    ]}
                                    icon={Calendar}
                                />
                            </div>

                            {/* Filter PT & Sales (Tab Logistik) */}
                            {tab === 'logistik' && (
                                <>
                                    <div
                                        className={`relative z-20 min-w-0 ${
                                            isFiveControlBar
                                                ? 'sm:col-span-1 lg:col-span-2 2xl:col-span-2'
                                                : 'sm:col-span-2 lg:col-span-2 2xl:col-span-3'
                                        }`}
                                    >
                                        <MultiSelect
                                            value={selectedPt}
                                            onChange={(value) => {
                                                setSelectedPt(value);
                                                router.get(route('reports.index'), { tab: tab, search: searchTerm, sales_filter: selectedSales, outlet_filter: selectedOutlet, pt_filter: value.length > 0 ? value.join(',') : '', month_filter: selectedMonth }, { preserveState: true });
                                            }}
                                            options={[
                                                ...(Array.isArray(ptNames) ? ptNames : Object.values(ptNames || {})).map(name => ({ value: name, label: name }))
                                            ]}
                                            icon={Package}
                                            placeholder="Semua PT"
                                        />
                                    </div>
                                    {!isSalesLocked && (
                                        <div className="relative z-10 min-w-0 sm:col-span-1 lg:col-span-2 2xl:col-span-2">
                                            <CustomSelect
                                                value={selectedSales}
                                                onChange={(value) => {
                                                    setSelectedSales(value);
                                                    router.get(route('reports.index'), { tab: tab, search: searchTerm, sales_filter: value, outlet_filter: selectedOutlet, pt_filter: selectedPt.length > 0 ? selectedPt.join(',') : '', month_filter: selectedMonth }, { preserveState: true });
                                                }}
                                                options={[
                                                    { value: '', label: 'Semua Sales' },
                                                    ...(Array.isArray(salesNames) ? salesNames : Object.values(salesNames || {})).map(name => ({ value: name, label: name }))
                                                ]}
                                                icon={UserIcon}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Filter Keterangan (Tab Pesanan) */}
                            {tab === 'pesanan' && (
                                <div className="relative z-10 min-w-0 sm:col-span-2 lg:col-span-2 2xl:col-span-3">
                                    <CustomSelect
                                        value={selectedKeterangan}
                                        onChange={(value) => {
                                            setSelectedKeterangan(value);
                                            router.get(route('reports.index'), { tab: tab, search: searchTerm, outlet_filter: selectedOutlet, month_filter: selectedMonth, keterangan_filter: value }, { preserveState: true });
                                        }}
                                        options={[
                                            { value: '', label: 'Semua Keterangan' },
                                            ...(Array.isArray(keteranganNames) ? keteranganNames : Object.values(keteranganNames || {})).map(name => ({ value: name, label: name }))
                                        ]}
                                        icon={Store}
                                    />
                                </div>
                            )}

                            {/* Pencarian + Tombol Cari */}
                            <div
                                className={`flex items-center gap-2 min-w-0 z-0 ${
                                    isFiveControlBar
                                        ? 'sm:col-span-2 lg:col-span-4 2xl:col-span-4'
                                        : (isFourControlBar
                                            ? 'sm:col-span-2 lg:col-span-6 2xl:col-span-5'
                                            : 'sm:col-span-2 lg:col-span-6 2xl:col-span-6')
                                }`}
                            >
                                <div className="relative flex-1 min-w-0">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <TextInput
                                        type="text"
                                        className="w-full min-h-[44px] pl-9 pr-3 rounded-xl text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Pencarian..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center font-bold text-sm shrink-0"
                                >
                                    Cari
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    {tab === 'logistik' && summary && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => ((summary.target_detail && Object.keys(summary.target_detail).length > 0) || (summary.pt_penjualan_bulan_ini && Object.keys(summary.pt_penjualan_bulan_ini).length > 0)) && setDetailModal({ isOpen: true, title: 'Target Bulanan', type: 'target', data: summary.target_detail || {} })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => ((summary.target_detail && Object.keys(summary.target_detail).length > 0) || (summary.pt_penjualan_bulan_ini && Object.keys(summary.pt_penjualan_bulan_ini).length > 0)) && setDetailModal({ isOpen: true, title: 'Target Bulanan', type: 'target', data: summary.target_detail || {} }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-0"
                                style={{ backgroundImage: getProgressBg(summary.capaian_target) }}
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <Activity className="w-24 h-24 text-blue-600" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-600 min-w-0">Penjualan Bulanan</p>
                                        <span className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded-full shadow-sm shrink-0 tabular-nums">
                                            {summary.capaian_target || '0%'}
                                        </span>
                                    </div>
                                    <div className="mt-2.5">
                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1">
                                            <span className="text-xs font-medium text-gray-500">Target:</span>
                                            <span className="text-xs sm:text-sm font-bold text-gray-700 tabular-nums">{summary.target_bulanan || 'Rp 0'}</span>
                                        </div>
                                        <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-extrabold text-blue-700 tabular-nums" title={summary.total_penjualan_bulan_ini || 'Rp 0'}>
                                            {summary.total_penjualan_bulan_ini || 'Rp 0'}
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => ((summary.target_tahunan_detail && Object.keys(summary.target_tahunan_detail).length > 0) || (summary.pt_penjualan_tahunan && Object.keys(summary.pt_penjualan_tahunan).length > 0)) && setDetailModal({ isOpen: true, title: 'Target Tahunan', type: 'target', data: summary.target_tahunan_detail || {} })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => ((summary.target_tahunan_detail && Object.keys(summary.target_tahunan_detail).length > 0) || (summary.pt_penjualan_tahunan && Object.keys(summary.pt_penjualan_tahunan).length > 0)) && setDetailModal({ isOpen: true, title: 'Target Tahunan', type: 'target', data: summary.target_tahunan_detail || {} }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-0"
                                style={{ backgroundImage: getProgressBg(summary.capaian_tahunan) }}
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <svg className="w-24 h-24 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-600 min-w-0">Penjualan Tahunan</p>
                                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full shadow-sm shrink-0 tabular-nums">
                                            {summary.capaian_tahunan || '0%'}
                                        </span>
                                    </div>
                                    <div className="mt-2.5">
                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1">
                                            <span className="text-xs font-medium text-gray-500">Target:</span>
                                            <span className="text-xs sm:text-sm font-bold text-gray-700 tabular-nums">{summary.target_tahunan || 'Rp 0'}</span>
                                        </div>
                                        <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-extrabold text-indigo-700 tabular-nums" title={summary.total_penjualan || 'Rp 0'}>
                                            {summary.total_penjualan || 'Rp 0'}
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Top Outlet', type: 'outlet', data: summary.outlet_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Top Outlet', type: 'outlet', data: summary.outlet_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <Store className="w-24 h-24 text-blue-600" />
                                </div>

                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Top Outlet</p>
                                    <h4 className="text-base sm:text-lg xl:text-base 2xl:text-lg leading-snug break-words font-bold text-gray-900 mt-1" title={summary.top_outlet}>{summary.top_outlet}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Outlet paling sering memesan</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Top Produk', type: 'produk', data: summary.produk_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Top Produk', type: 'produk', data: summary.produk_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <Package className="w-24 h-24 text-orange-600" />
                                </div>

                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Top Produk</p>
                                    <h4 className="text-base sm:text-lg xl:text-base 2xl:text-lg leading-snug break-words font-bold text-gray-900 mt-1" title={summary.top_produk}>{summary.top_produk}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Produk paling sering dipesan</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'pesanan' && summaryPesanan && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Total Faktur', type: 'faktur', data: summaryPesanan.faktur_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Total Faktur', type: 'faktur', data: summaryPesanan.faktur_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <TrendingUp className="w-24 h-24 text-emerald-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Faktur</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-gray-900 mt-1 tabular-nums" title={summaryPesanan.total_faktur}>{summaryPesanan.total_faktur}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Total akumulasi dari Total Faktur</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Barang Terkirim', type: 'terkirim', data: summaryPesanan.terkirim_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Barang Terkirim', type: 'terkirim', data: summaryPesanan.terkirim_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <ShoppingCart className="w-24 h-24 text-emerald-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Barang Terkirim</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-emerald-600 mt-1 tabular-nums" title={summaryPesanan.total_terkirim}>{summaryPesanan.total_terkirim}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Persentase barang yang berhasil terkirim</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Belum Terkirim', type: 'belum_terkirim', data: summaryPesanan.belum_terkirim_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Belum Terkirim', type: 'belum_terkirim', data: summaryPesanan.belum_terkirim_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <Activity className="w-24 h-24 text-red-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Belum Terkirim</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-red-600 mt-1 tabular-nums" title={summaryPesanan.total_belum_terkirim}>{summaryPesanan.total_belum_terkirim}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Persentase barang yang belum terkirim</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Total Surat', type: 'total_surat', data: summaryPesanan.pesanan_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Total Surat', type: 'total_surat', data: summaryPesanan.pesanan_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <Store className="w-24 h-24 text-blue-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Surat</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-gray-900 mt-1 tabular-nums" title={summaryPesanan.total_pesanan}>{summaryPesanan.total_pesanan}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Jumlah baris surat pesanan tercatat</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'piutang' && summaryPiutang && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Total Piutang (Gabungan)', type: 'gabungan', data: summaryPiutang.gabungan_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Total Piutang (Gabungan)', type: 'gabungan', data: summaryPiutang.gabungan_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <CreditCard className="w-24 h-24 text-gray-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Piutang (Gabungan)</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-gray-900 mt-1 tabular-nums" title={summaryPiutang.total_gabungan}>{summaryPiutang.total_gabungan}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Total keseluruhan piutang</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Piutang Sanzaya', type: 'sanzaya', data: summaryPiutang.sanzaya_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Piutang Sanzaya', type: 'sanzaya', data: summaryPiutang.sanzaya_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <TrendingUp className="w-24 h-24 text-blue-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Piutang Sanzaya</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-blue-700 mt-1 tabular-nums" title={summaryPiutang.total_sanzaya}>{summaryPiutang.total_sanzaya}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Total piutang bagian Sanzaya</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Piutang Ruma', type: 'ruma', data: summaryPiutang.ruma_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Piutang Ruma', type: 'ruma', data: summaryPiutang.ruma_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <TrendingUp className="w-24 h-24 text-blue-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Piutang Ruma</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-blue-700 mt-1 tabular-nums" title={summaryPiutang.total_ruma}>{summaryPiutang.total_ruma}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Total piutang bagian Ruma</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <Store className="w-24 h-24 text-orange-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Data Piutang</p>
                                    <h4 className="text-lg sm:text-xl xl:text-lg 2xl:text-xl leading-snug break-words font-bold text-gray-900 mt-1 tabular-nums" title={summaryPiutang.total_outlet}>{summaryPiutang.total_outlet}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Jumlah baris data piutang tercatat</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'hutang' && summaryHutang && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailModal({ isOpen: true, title: 'Total Nominal', type: 'hutang', data: summaryHutang.hutang_detail })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => setDetailModal({ isOpen: true, title: 'Total Nominal', type: 'hutang', data: summaryHutang.hutang_detail }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <TrendingUp className="w-24 h-24 text-orange-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Nominal</p>
                                    <h4 className="text-lg sm:text-xl leading-snug break-words font-bold text-orange-700 mt-1 tabular-nums" title={summaryHutang.total_nominal}>{summaryHutang.total_nominal}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Total akumulasi nominal hutang</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <UserIcon className="w-24 h-24 text-blue-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Penyedia</p>
                                    <h4 className="text-lg sm:text-xl leading-snug break-words font-bold text-gray-900 mt-1 tabular-nums" title={summaryHutang.total_penyedia}>{summaryHutang.total_penyedia}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Jumlah penyedia berbeda</p>
                                </div>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                onKeyDown={(e) => handleCardKeyDown(e, () => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))}
                                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 sm:col-span-2 lg:col-span-1"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none z-0">
                                    <Database className="w-24 h-24 text-green-600" />
                                </div>
                                <div className="relative z-10 mb-3">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Data</p>
                                    <h4 className="text-lg sm:text-xl leading-snug break-words font-bold text-gray-900 mt-1 tabular-nums" title={summaryHutang.total_data}>{summaryHutang.total_data}</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs text-gray-500">Jumlah baris data hutang tercatat</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DesktopDetailView
                        isDesktop={isDesktop}
                        detailModal={detailModal}
                        onClose={() => setDetailModal(prev => ({ ...prev, isOpen: false }))}
                        renderDetailContent={renderDetailContent}
                    >
                        {/* Charts Area */}
                        {tab === 'logistik' && renderLogistikChart()}
                        {tab === 'pesanan' && renderPesananChart()}
                        {tab === 'piutang' && renderPiutangChart()}
                        {tab === 'hutang' && renderHutangChart()}

                        <div id="data-table-container" className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                            {tab === 'logistik' && renderLogistikTable()}
                            {tab === 'pesanan' && renderPesananTable()}
                            {tab === 'piutang' && renderPiutangTable()}
                            {tab === 'hutang' && renderHutangTable()}

                            {/* Pagination */}
                            {reportData?.links && Array.isArray(reportData.links) && reportData.links.length > 3 && (
                                <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                                    <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                        Menampilkan <span className="font-semibold text-gray-900">{reportData.from || 0}</span> - <span className="font-semibold text-gray-900">{reportData.to || 0}</span> dari <span className="font-semibold text-gray-900">{reportData.total || reportRows.length}</span> data
                                    </span>
                                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                                        {reportData.links.map((link, index) => {
                                            const labelStr = String(link.label || '');
                                            const isPrev = index === 0 || /previous|&laquo;|«/i.test(labelStr);
                                            const isNext = index === reportData.links.length - 1 || /next|&raquo;|»/i.test(labelStr);
                                            const navTitle = isPrev ? 'Halaman sebelumnya' : isNext ? 'Halaman selanjutnya' : undefined;
                                            const content = isPrev ? <ChevronLeft className="w-4 h-4" /> : isNext ? <ChevronRight className="w-4 h-4" /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />;

                                            return link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    aria-label={navTitle}
                                                    title={navTitle}
                                                    className={`inline-flex items-center justify-center text-xs sm:text-sm rounded-xl border min-h-[38px] min-w-[38px] ${isPrev || isNext ? 'px-2.5' : 'px-3'} ${link.active ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    {content}
                                                </Link>
                                            ) : (
                                                <span
                                                    key={index}
                                                    aria-label={navTitle}
                                                    title={navTitle}
                                                    className={`inline-flex items-center justify-center text-xs sm:text-sm rounded-xl border min-h-[38px] min-w-[38px] bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed ${isPrev || isNext ? 'px-2.5' : 'px-3'}`}
                                                >
                                                    {content}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DesktopDetailView>
                </div>

                {/* Detail Modal (Hanya Mobile) */}
                {!isDesktop && (
                    <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ ...detailModal, isOpen: false })} maxWidth="md">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3.5">
                                <button
                                    type="button"
                                    onClick={() => setDetailModal({ ...detailModal, isOpen: false })}
                                    className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 bg-white text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-gray-200 shrink-0"
                                    title="Kembali"
                                    aria-label="Tutup detail"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5" aria-hidden="true">
                                        <path d="m12 19-7-7 7-7"></path>
                                        <path d="M19 12H5"></path>
                                    </svg>
                                </button>
                                <h3 className="text-lg font-bold text-gray-800 min-w-0 break-words">Detail {detailModal.title}</h3>
                            </div>

                            <div className="max-h-[68vh] overflow-y-auto pr-1 custom-scrollbar">
                                {renderDetailContent()}
                            </div>
                        </div>
                    </Modal>
                )}
            </AuthenticatedLayout>
        </ErrorBoundary>
    );
}
