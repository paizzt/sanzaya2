import ExportDropdown from '@/Components/ExportDropdown';
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { ClipboardList, Plus, Edit, Trash2, Filter, DollarSign, Package, Stethoscope, RefreshCw } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CustomDatePicker from '@/Components/CustomDatePicker';
import SearchableSelect from '@/Components/SearchableSelect';
import MultiSelect from '@/Components/MultiSelect';
import NumberInput from '@/Components/NumberInput';
import CurrencyInput from '@/Components/CurrencyInput';
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Index({ auth, items, sales, outlets, companies, filters, summary, chartData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [filterData, setFilterData] = useState({
        bulan: filters?.bulan ? (Array.isArray(filters.bulan) ? filters.bulan : [filters.bulan]) : [],
        tahun: filters?.tahun || '',
        company_id: filters?.company_id || '',
        jenis_barang: filters?.jenis_barang || '',
        outlet_id: filters?.outlet_id || '',
        nama_sales: filters?.nama_sales || '',
    });

    const monthOptions = [
        { value: '1', label: 'Januari' },
        { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Mei' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' },
    ];

    const currentYear = new Date().getFullYear();
    const yearOptions = [
        { value: '', label: 'Semua Tahun' },
        ...Array.from({ length: 10 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }))
    ];

    const getQueryString = () => {
        const params = new URLSearchParams();
        Object.entries(filterData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(val => params.append(`${key}[]`, val));
            } else if (value !== '') {
                params.append(key, value);
            }
        });
        return params.toString();
    };
    const handleFilter = (e) => {
        if(e) e.preventDefault();
        router.get(route('logistic-reports.index'), filterData, { preserveState: true, replace: true });
    };

    const applyFilter = (key, value) => {
        const newFilters = { ...filterData, [key]: value };
        setFilterData(newFilters);
        router.get(route('logistic-reports.index'), newFilters, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        const cleared = { bulan: [], tahun: '', company_id: '', jenis_barang: '', outlet_id: '', nama_sales: '' };
        setFilterData(cleared);
        router.get(route('logistic-reports.index'), cleared, { preserveState: true, replace: true });
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    };

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        tanggal: getTodayDate(),
        company_id: '',
        outlet_id: '',
        jenis_pelanggan: '',
        nama_sales: '',
        no_faktur: '',
        id_paket: '',
        brand: '',
        nama_produk: '',
        qty: '',
        satuan: '',
        hna: '',
        subtotal: '',
        ppn_percentage: '11',
        ppn: '',
        total: '',
        grand_total: '',
        jenis_barang: '' 
    });

    // Kalkulasi otomatis
    useEffect(() => {
        const q = parseFloat(data.qty) || 0;
        const h = parseFloat(data.hna) || 0;
        const sub = q * h;
        
        if (sub !== parseFloat(data.subtotal)) {
            setData(current => ({ ...current, subtotal: sub }));
        }
    }, [data.qty, data.hna]);

    useEffect(() => {
        if (data.subtotal === '' && data.ppn_percentage === '') return;
        
        const subtotal = parseFloat(data.subtotal) || 0;
        const ppn_percent = parseFloat(data.ppn_percentage) || 0;
        const p = subtotal * (ppn_percent / 100); 
        const tot = subtotal + p;
        
        if (p !== parseFloat(data.ppn) || tot !== parseFloat(data.total)) {
            setData(current => ({ ...current, ppn: p, total: tot }));
        }
    }, [data.subtotal, data.ppn_percentage]);

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            
            let ppnPercent = 11;
            if (item.subtotal > 0 && item.ppn !== null) {
                ppnPercent = Math.round((item.ppn / item.subtotal) * 100);
            }
            
            setData({
                tanggal: item.tanggal || getTodayDate(),
                company_id: item.company_id || '',
                outlet_id: item.outlet_id || '',
                jenis_pelanggan: item.jenis_pelanggan || '',
                nama_sales: item.nama_sales || '',
                no_faktur: item.no_faktur || '',
                id_paket: item.id_paket || '',
                brand: item.brand || '',
                nama_produk: item.nama_produk || '',
                qty: item.qty || '',
                satuan: item.satuan || '',
                hna: item.hna || '',
                subtotal: item.subtotal || '',
                ppn_percentage: ppnPercent,
                ppn: item.ppn || '',
                total: item.total || '',
                grand_total: item.grand_total || '',
                jenis_barang: item.jenis_barang || '' 
            });
        } else {
            setEditingItem(null);
            reset();
            setTimeout(() => {
                setData(current => ({
                    ...current,
                    tanggal: getTodayDate(),
                    ppn_percentage: 11
                }));
            }, 0);
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingItem(null);
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (editingItem) {
            put(route('logistic-reports.update', editingItem.id), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Data laporan berhasil diperbarui.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                },
            });
        } else {
            post(route('logistic-reports.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Data laporan baru berhasil ditambahkan.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                },
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('logistic-reports.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Terhapus!',
                            text: 'Data berhasil dihapus.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan Logistik</h2>}
        >
            <Head title="Laporan Logistik" />

            <div className="pb-12 pt-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div 
                            onClick={() => applyFilter('jenis_barang', '')}
                            className={`bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${filterData.jenis_barang === '' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                            <div className="p-3 bg-blue-100 rounded-full mb-3">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="text-gray-500 text-sm font-medium">Total Transaksi</h4>
                            <p className="text-2xl font-bold text-gray-900">{summary?.total_transaksi || 0}</p>
                        </div>
                        <div 
                            onClick={() => applyFilter('jenis_barang', '')}
                            className={`bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${filterData.jenis_barang === '' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}
                        >
                            <div className="p-3 bg-green-100 rounded-full mb-3 flex items-center justify-center w-12 h-12">
                                <span className="font-bold text-green-600 text-lg">Rp</span>
                            </div>
                            <h4 className="text-gray-500 text-sm font-medium">Total Pendapatan</h4>
                            <p className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary?.total_pendapatan || 0)}
                            </p>
                        </div>
                        <div 
                            onClick={() => applyFilter('jenis_barang', 'BMHP')}
                            className={`bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${filterData.jenis_barang === 'BMHP' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
                        >
                            <div className="p-3 bg-indigo-100 rounded-full mb-3">
                                <Stethoscope className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h4 className="text-gray-500 text-sm font-medium">Pendapatan BMHP</h4>
                            <p className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary?.pendapatan_bmhp || 0)}
                            </p>
                        </div>
                        <div 
                            onClick={() => applyFilter('jenis_barang', 'ALAT')}
                            className={`bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${filterData.jenis_barang === 'ALAT' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}
                        >
                            <div className="p-3 bg-orange-100 rounded-full mb-3">
                                <Package className="w-6 h-6 text-orange-600" />
                            </div>
                            <h4 className="text-gray-500 text-sm font-medium">Pendapatan ALAT</h4>
                            <p className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary?.pendapatan_alat || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <span className="font-bold text-green-500 text-lg px-1">Rp</span> Grafik Pendapatan
                        </h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="tanggal" />
                                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                                    <RechartsTooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)} />
                                    <Legend />
                                    <Bar dataKey="total" name="Total Pendapatan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            {/* Filter Form */}
                            <form onSubmit={handleFilter} className="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 items-end">
                                <div className="w-full md:w-40">
                                    <InputLabel value="Bulan" className="mb-1" />
                                    <MultiSelect 
                                        options={monthOptions} 
                                        value={filterData.bulan} 
                                        onChange={val => setFilterData({...filterData, bulan: val})} 
                                        placeholder="Pilih Bulan" 
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <InputLabel value="Tahun" className="mb-1" />
                                    <SearchableSelect 
                                        options={yearOptions} 
                                        value={filterData.tahun} 
                                        onChange={val => setFilterData({...filterData, tahun: val})} 
                                        placeholder="Pilih Tahun" 
                                    />
                                </div>
                                <div className="w-full md:flex-1 min-w-[200px]">
                                    <InputLabel value="Nama PT" className="mb-1" />
                                    <SearchableSelect 
                                        options={[{value:'', label:'Semua PT'}, ...(companies || []).map(c => ({ value: c.id.toString(), label: c.name }))]} 
                                        value={filterData.company_id} 
                                        onChange={val => setFilterData({...filterData, company_id: val})} 
                                        placeholder="Pilih PT" 
                                    />
                                </div>
                                <div className="w-full md:w-40">
                                    <InputLabel value="Jenis Barang" className="mb-1" />
                                    <SearchableSelect 
                                        options={[
                                            {value: '', label: 'Semua Jenis'},
                                            {value: 'BMHP', label: 'BMHP'},
                                            {value: 'ALAT', label: 'ALAT'}
                                        ]} 
                                        value={filterData.jenis_barang} 
                                        onChange={val => setFilterData({...filterData, jenis_barang: val})} 
                                        placeholder="Pilih Jenis" 
                                    />
                                </div>
                                <div className="w-full md:flex-1 min-w-[200px]">
                                    <InputLabel value="Pelanggan" className="mb-1" />
                                    <SearchableSelect 
                                        options={[{value:'', label:'Semua Pelanggan'}, ...(outlets || []).map(o => ({ value: o.id.toString(), label: o.name }))]} 
                                        value={filterData.outlet_id} 
                                        onChange={val => setFilterData({...filterData, outlet_id: val})} 
                                        placeholder="Pilih Pelanggan" 
                                    />
                                </div>
                                <div className="w-full md:flex-1 min-w-[200px]">
                                    <InputLabel value="Nama Sales" className="mb-1" />
                                    <SearchableSelect 
                                        options={[{value:'', label:'Semua Sales'}, ...(sales || []).map(s => ({ value: s.name, label: s.name }))]} 
                                        value={filterData.nama_sales} 
                                        onChange={val => setFilterData({...filterData, nama_sales: val})} 
                                        placeholder="Pilih Sales" 
                                    />
                                </div>
                                <div className="w-full md:w-auto flex items-center gap-2 h-11">
                                    <PrimaryButton type="submit" className="w-full md:w-auto justify-center h-full">
                                        <Filter className="w-4 h-4 mr-2" /> Filter
                                    </PrimaryButton>
                                    <SecondaryButton type="button" onClick={resetFilter} className="px-3 h-full" title="Reset">
                                        <RefreshCw className="w-4 h-4" />
                                    </SecondaryButton>
                                </div>
                            </form>
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-500" />
                                    Data Laporan Logistik
                                </h3>
                                <div className="flex items-center gap-3">
                                <ExportDropdown 
                                    pdfRoute={`${route('logistic-reports.export.pdf')}?${new URLSearchParams(Object.entries(filterData).filter(([_, v]) => v !== '')).toString()}`} 
                                    excelRoute={`${route('logistic-reports.export.excel')}?${new URLSearchParams(Object.entries(filterData).filter(([_, v]) => v !== '')).toString()}`} 
                                    availableColumns={['No', 'Nama PT', 'Pelanggan', 'Jenis', 'Tanggal', 'Sales Name', 'No Faktur', 'ID PAKET', 'BRAND', 'Nama Produk', 'Qty', 'Satuan', 'HNA', 'Subtotal', 'PPN', 'Total', 'Grand Total', 'Jenis Brg']}
                                />
                                <PrimaryButton onClick={() => openModal()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Data
                                </PrimaryButton>
                            </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Brg</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(items.data || items).length > 0 ? (items.data || items).map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words min-w-[150px]">{item.outlet ? item.outlet.name : '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.jenis_barang}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words min-w-[120px]">{item.nama_sales}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words min-w-[200px]" title={item.nama_produk}>{item.nama_produk}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.qty} {item.satuan}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.grand_total ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.grand_total) : ''}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-900 mr-4">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                    Belum ada data laporan logistik.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {items.data && items.links && items.links.length > 3 && (
                                <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Menampilkan <span className="font-medium">{items.from}</span> - <span className="font-medium">{items.to}</span> dari <span className="font-medium">{items.total}</span> data
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                {items.links.map((link, index) => {
                                                    let label = link.label;
                                                    if (label.includes('Previous')) label = '« Previous';
                                                    if (label.includes('Next')) label = 'Next »';
                                                    return link.url ? (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            preserveState
                                                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                                                link.active
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 focus:z-20'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            } ${index === 0 ? 'rounded-l-md' : ''} ${index === items.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                            dangerouslySetInnerHTML={{ __html: label }}
                                                        />
                                                    ) : (
                                                        <span
                                                            key={index}
                                                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium text-gray-400 bg-white cursor-not-allowed ${index === 0 ? 'rounded-l-md' : ''} ${index === items.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                            dangerouslySetInnerHTML={{ __html: label }}
                                                        />
                                                    );
                                                })}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="4xl">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingItem ? 'Edit Data Logistik' : 'Tambah Data Logistik'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <InputLabel htmlFor="company_id" value="Nama PT" />
                            <SearchableSelect
                                options={companies ? companies.map(c => ({ value: c.id.toString(), label: c.name })) : []}
                                value={data.company_id ? data.company_id.toString() : ''}
                                onChange={val => setData('company_id', val)}
                                placeholder="Pilih PT / Perusahaan"
                            />
                            <InputError message={errors.company_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="outlet_id" value="Pelanggan" />
                            <SearchableSelect
                                options={outlets ? outlets.map(o => ({ value: o.id.toString(), label: o.name })) : []}
                                value={data.outlet_id ? data.outlet_id.toString() : ''}
                                onChange={val => setData('outlet_id', val)}
                                placeholder="Pilih Pelanggan / Outlet"
                            />
                            <InputError message={errors.outlet_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="jenis_pelanggan" value="Jenis Pelanggan" />
                            <SearchableSelect
                                options={[
                                    {value: 'DINAS KESEHATAN', label: 'DINAS KESEHATAN'},
                                    {value: 'REKANAN', label: 'REKANAN'},
                                    {value: 'RS NEGERI', label: 'RS NEGERI'},
                                    {value: 'RS SWASTA', label: 'RS SWASTA'}
                                ]}
                                value={data.jenis_pelanggan}
                                onChange={val => setData('jenis_pelanggan', val)}
                                placeholder="Pilih Jenis"
                            />
                            <InputError message={errors.jenis_pelanggan} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal" />
                            <CustomDatePicker value={data.tanggal} onChange={val => setData('tanggal', val)} />
                            <InputError message={errors.tanggal} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="nama_sales" value="Nama Sales" />
                            <SearchableSelect
                                options={sales ? sales.map(s => ({ value: s.name, label: s.name })) : []}
                                value={data.nama_sales}
                                onChange={val => setData('nama_sales', val)}
                                placeholder="Pilih Sales"
                            />
                            <InputError message={errors.nama_sales} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="no_faktur" value="No Faktur" />
                            <TextInput id="no_faktur" className="mt-1 block w-full" value={data.no_faktur} onChange={e => setData('no_faktur', e.target.value)} />
                            <InputError message={errors.no_faktur} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="id_paket" value="ID PAKET" />
                            <TextInput id="id_paket" className="mt-1 block w-full" value={data.id_paket} onChange={e => setData('id_paket', e.target.value)} />
                            <InputError message={errors.id_paket} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="brand" value="BRAND" />
                            <TextInput id="brand" className="mt-1 block w-full" value={data.brand} onChange={e => setData('brand', e.target.value)} />
                            <InputError message={errors.brand} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="nama_produk" value="Nama Produk" />
                            <TextInput id="nama_produk" className="mt-1 block w-full" value={data.nama_produk} onChange={e => setData('nama_produk', e.target.value)} />
                            <InputError message={errors.nama_produk} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="qty" value="Qty" />
                            <NumberInput id="qty" className="mt-1 block w-full" value={data.qty} onChange={val => setData('qty', val)} />
                            <InputError message={errors.qty} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="satuan" value="Satuan" />
                            <TextInput id="satuan" className="mt-1 block w-full" value={data.satuan} onChange={e => setData('satuan', e.target.value)} />
                            <InputError message={errors.satuan} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="jenis_barang" value="Jenis (BMHP/ALAT)" />
                            <SearchableSelect
                                options={[{value: 'BMHP', label: 'BMHP'}, {value: 'ALAT', label: 'ALAT'}]}
                                value={data.jenis_barang}
                                onChange={val => setData('jenis_barang', val)}
                                placeholder="Pilih Jenis"
                            />
                            <InputError message={errors.jenis_barang} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="hna" value="HNA (Rp)" />
                            <CurrencyInput id="hna" className="mt-1 block w-full" value={data.hna} onChange={val => setData('hna', val)} />
                            <InputError message={errors.hna} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel value="Subtotal" />
                            <div className="mt-1 block w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm font-semibold text-gray-700">
                                {data.subtotal ? `Rp ${Number(data.subtotal).toLocaleString('id-ID')}` : 'Rp 0'}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-1/3">
                                <InputLabel htmlFor="ppn_percentage" value="PPN (%)" />
                                <TextInput id="ppn_percentage" type="number" step="any" className="mt-1 block w-full" value={data.ppn_percentage} onChange={e => setData('ppn_percentage', e.target.value)} />
                            </div>
                            <div className="w-2/3">
                                <InputLabel htmlFor="ppn" value="PPN (Rp)" />
                                <CurrencyInput id="ppn" className="mt-1 block w-full bg-gray-100" readOnly value={data.ppn} onChange={val => setData('ppn', val)} />
                                <InputError message={errors.ppn} className="mt-2" />
                            </div>
                        </div>
                        
                        <div>
                            <InputLabel value="Total" />
                            <div className="mt-1 block w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm font-semibold text-gray-700">
                                {data.total ? `Rp ${Number(data.total).toLocaleString('id-ID')}` : 'Rp 0'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
