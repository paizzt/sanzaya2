import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Package, Plus, ChevronDown, ChevronRight, ChevronLeft, Edit, Trash2, Search, Link as LinkIcon, DollarSign, Store, Download, FileText, FileSpreadsheet, Share2, Truck, AlertCircle, ShoppingCart } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SearchableSelect from '@/Components/SearchableSelect';
import CustomSelect from '@/Components/CustomSelect';
import ExportDropdown from '@/Components/ExportDropdown';
import Swal from 'sweetalert2';

export default function Index({ auth, groupedItems, outlets, companies = [], filters, activeShares = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [detailFilters, setDetailFilters] = useState({ month: '', year: '', unit: '' });
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareModalFilters, setShareModalFilters] = useState({ month: '', year: '' });
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        outlet_name: '',
        month: '',
        year: '',
        item_name: '',
        company_name: '',
        unit: '',
        quantity: 0,
        description: '',
        price: 0,
        sent: 0,
        not_sent: 0,
        link: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('item-requirements.index'), { search }, { preserveState: true });
    };

    const openModal = (item = null) => {
        if (item) {
            setIsEditing(true);
            const [month, ...yearArr] = (item.month_year || '').split(' ');
            const year = yearArr.join(' ');
            setFormData({
                ...item,
                month: month || '',
                year: year || ''
            });
        } else {
            setIsEditing(false);
            setFormData({
                id: null,
                outlet_name: selectedOutlet || '',
                month: detailFilters.month || '',
                year: detailFilters.year || '',
                item_name: '',
                company_name: '',
                unit: '',
                quantity: 0,
                description: '',
                price: 0,
                sent: 0,
                not_sent: 0,
                link: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEditing 
            ? route('item-requirements.update', formData.id)
            : route('item-requirements.store');
        const method = isEditing ? 'put' : 'post';
        
        const dataToSubmit = {
            ...formData,
            month_year: `${formData.month} ${formData.year}`
        };

        router[method](url, dataToSubmit, {
            onSuccess: () => {
                setIsModalOpen(false);
                Swal.fire({ icon: 'success', title: 'Berhasil', text: isEditing ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan', timer: 1500 });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Data?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('item-requirements.destroy', id), {
                    onSuccess: () => Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Data berhasil dihapus', timer: 1500 })
                });
            }
        });
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleShareClick = () => {
        setIsShareModalOpen(true);
        setShareModalFilters({ month: detailFilters.month, year: detailFilters.year });
    };

    const copyShareLink = () => {
        const baseUrl = window.location.origin;
        let shareUrl = selectedOutlet 
            ? `${baseUrl}/shared/kebutuhan-barang?outlet=${encodeURIComponent(selectedOutlet)}`
            : `${baseUrl}/shared/kebutuhan-barang`;
            
        if (selectedOutlet) {
            if (shareModalFilters.month) shareUrl += `&month=${encodeURIComponent(shareModalFilters.month)}`;
            if (shareModalFilters.year) shareUrl += `&year=${encodeURIComponent(shareModalFilters.year)}`;
        }
            
        navigator.clipboard.writeText(shareUrl).then(() => {
            setIsShareModalOpen(false);
            Swal.fire({
                icon: 'success',
                title: 'Tersalin!',
                text: 'Link bagikan telah disalin ke clipboard.',
                timer: 2000,
                showConfirmButton: false
            });
        });
    };

    const handleToggleShare = (outletName, currentStatus) => {
        router.post(route('item-requirements.toggleShare'), {
            outlet_name: outletName,
            is_active: !currentStatus
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const currentOutletItems = selectedOutlet && groupedItems[selectedOutlet] ? groupedItems[selectedOutlet] : [];
    const filteredOutletItems = currentOutletItems.filter(item => {
        let monthMatch = true;
        let yearMatch = true;
        let unitMatch = true;

        if (detailFilters.month) {
            monthMatch = item.month_year.toLowerCase().includes(detailFilters.month.toLowerCase());
        }
        if (detailFilters.year) {
            yearMatch = item.month_year.includes(detailFilters.year);
        }
        if (detailFilters.unit) {
            unitMatch = (item.unit || '').toLowerCase().includes(detailFilters.unit.toLowerCase());
        }

        return monthMatch && yearMatch && unitMatch;
    });

    const statsItems = selectedOutlet ? filteredOutletItems : Object.values(groupedItems).flat();
    const totalBarang = statsItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalTerkirim = statsItems.reduce((sum, item) => sum + (Number(item.sent) || 0), 0);
    const totalBelumKirim = statsItems.reduce((sum, item) => sum + (Number(item.not_sent) || 0), 0);
    const totalHarga = statsItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pemenuhan Kebutuhan Barang</h2>}
        >
            <Head title="Kebutuhan Barang" />

            <div className="pb-6 pt-0 space-y-6 max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                {selectedOutlet && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Barang (Qty)</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalBarang}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Terkirim</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalTerkirim}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Belum Kirim</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalBelumKirim}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Harga</p>
                            <h4 className="text-xl sm:text-2xl font-bold text-gray-900">{formatRupiah(totalHarga)}</h4>
                        </div>
                    </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600" />
                            Daftar Kebutuhan
                        </h3>
                    </div>
                    
                    <div className="flex w-full lg:w-auto gap-2">
                        <form onSubmit={handleSearch} className="flex-1 lg:w-64 relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <TextInput 
                                type="text" 
                                className="w-full pl-10 rounded-xl text-sm" 
                                placeholder="Cari barang / outlet..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="hidden"></button>
                        </form>
                        
                        {selectedOutlet && (
                            <>
                                <button 
                                    onClick={() => handleToggleShare(selectedOutlet, activeShares[selectedOutlet] || false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors shadow-sm text-sm whitespace-nowrap ${
                                        activeShares[selectedOutlet] 
                                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    }`}
                                >
                                    {activeShares[selectedOutlet] ? 'Matikan Link' : 'Nyalakan Link'}
                                </button>

                                {activeShares[selectedOutlet] && (
                                    <button 
                                        onClick={handleShareClick}
                                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/30 text-sm whitespace-nowrap"
                                    >
                                        <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Bagikan</span>
                                    </button>
                                )}

                                <ExportDropdown 
                                    pdfRoute={route('item-requirements.export.pdf', selectedOutlet ? { outlet: selectedOutlet } : {})}
                                    excelRoute={route('item-requirements.export.excel', selectedOutlet ? { outlet: selectedOutlet } : {})} 
                                />
                            </>
                        )}

                        <button 
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 text-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah Data</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100">
                            Tidak ada data kebutuhan barang ditemukan.
                        </div>
                    ) : (
                        !selectedOutlet ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.keys(groupedItems).map((outlet) => (
                                    <button 
                                        key={outlet}
                                        onClick={() => setSelectedOutlet(outlet)}
                                        className="flex flex-col p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Store className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-800 line-clamp-2">{outlet}</h4>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                                                {groupedItems[outlet].length} Barang
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-visible">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 rounded-t-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => {
                                                setSelectedOutlet(null);
                                                setDetailFilters({ month: '', year: '', unit: '' });
                                            }}
                                            className="p-2 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <ChevronLeft className="w-5 h-5" /> Kembali
                                        </button>
                                        <h4 className="font-bold text-lg text-gray-800 hidden md:block">{selectedOutlet}</h4>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                                        {filteredOutletItems.length} Barang
                                    </span>
                                </div>
                                
                                <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'Semua Bulan' },
                                            { value: 'Januari', label: 'Januari' },
                                            { value: 'Februari', label: 'Februari' },
                                            { value: 'Maret', label: 'Maret' },
                                            { value: 'April', label: 'April' },
                                            { value: 'Mei', label: 'Mei' },
                                            { value: 'Juni', label: 'Juni' },
                                            { value: 'Juli', label: 'Juli' },
                                            { value: 'Agustus', label: 'Agustus' },
                                            { value: 'September', label: 'September' },
                                            { value: 'Oktober', label: 'Oktober' },
                                            { value: 'November', label: 'November' },
                                            { value: 'Desember', label: 'Desember' }
                                        ]}
                                        value={detailFilters.month}
                                        onChange={(val) => setDetailFilters({...detailFilters, month: val})}
                                        placeholder="Semua Bulan"
                                    />
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'Semua Tahun' },
                                            { value: '2024', label: '2024' },
                                            { value: '2025', label: '2025' },
                                            { value: '2026', label: '2026' },
                                            { value: '2027', label: '2027' },
                                            { value: '2028', label: '2028' },
                                            { value: '2029', label: '2029' },
                                            { value: '2030', label: '2030' }
                                        ]}
                                        value={detailFilters.year}
                                        onChange={(val) => setDetailFilters({...detailFilters, year: val})}
                                        placeholder="Semua Tahun"
                                    />
                                    <TextInput 
                                        type="text" 
                                        placeholder="Cari Satuan..."
                                        value={detailFilters.unit}
                                        onChange={(e) => setDetailFilters({...detailFilters, unit: e.target.value})}
                                        className="w-full rounded-xl sm:text-sm border-gray-300"
                                    />
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-100">
                                            <tr>
                                                <th className="px-3 py-3 w-10 text-center">No</th>
                                                <th className="px-3 py-3">Bulan Tahun</th>
                                                <th className="px-3 py-3">Nama Barang</th>
                                                <th className="px-3 py-3">Nama Perusahaan</th>
                                                <th className="px-3 py-3">Satuan</th>
                                                <th className="px-3 py-3 text-center">Qty</th>
                                                <th className="px-3 py-3">Keterangan</th>
                                                <th className="px-3 py-3 text-right">Harga</th>
                                                <th className="px-3 py-3 text-center">Terkirim</th>
                                                <th className="px-3 py-3 text-center">Belum</th>
                                                <th className="px-3 py-3 text-right">Total</th>
                                                <th className="px-3 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOutletItems.map((item, index) => (
                                                <tr key={item.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="px-3 py-2 text-center">{index + 1}</td>
                                                    <td className="px-3 py-2 text-sm">{item.month_year}</td>
                                                    <td className="px-3 py-2 text-sm font-semibold text-gray-900">{item.item_name}</td>
                                                    <td className="px-3 py-2 text-sm">{item.company_name}</td>
                                                    <td className="px-3 py-2 text-sm">{item.unit}</td>
                                                    <td className="px-3 py-2 text-sm text-center font-bold">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-sm">{item.description}</td>
                                                    <td className="px-3 py-2 text-sm text-right whitespace-nowrap">{formatRupiah(item.price)}</td>
                                                    <td className="px-3 py-2 text-sm text-center font-bold text-emerald-600">{item.sent}</td>
                                                    <td className="px-3 py-2 text-sm text-center font-bold text-red-500">{item.not_sent}</td>
                                                    <td className="px-3 py-2 text-sm text-right font-bold text-blue-600 whitespace-nowrap">{formatRupiah(item.total)}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {item.link && (
                                                                <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-lg" title="Buka Tautan">
                                                                    <LinkIcon className="w-4 h-4" />
                                                                </a>
                                                            )}
                                                            <button onClick={() => openModal(item)} className="text-amber-500 hover:text-amber-700 bg-amber-50 p-1.5 rounded-lg" title="Edit">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg" title="Hapus">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredOutletItems.length === 0 && (
                                                <tr>
                                                    <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                                                        Data tidak ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        {isEditing ? 'Edit Kebutuhan Barang' : 'Tambah Kebutuhan Barang'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!selectedOutlet && (
                            <div className="md:col-span-2">
                                <InputLabel value="Nama Outlet" />
                                <SearchableSelect
                                    options={outlets.map(o => ({ value: o, label: o }))}
                                    value={formData.outlet_name}
                                    onChange={(val) => setFormData({...formData, outlet_name: val})}
                                    placeholder="Cari nama outlet..."
                                    className="mt-1 block w-full"
                                />
                            </div>
                        )}
                        
                        {selectedOutlet && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                <InputLabel value="Bulan" />
                                <CustomSelect
                                    options={[
                                        { value: 'Januari', label: 'Januari' },
                                        { value: 'Februari', label: 'Februari' },
                                        { value: 'Maret', label: 'Maret' },
                                        { value: 'April', label: 'April' },
                                        { value: 'Mei', label: 'Mei' },
                                        { value: 'Juni', label: 'Juni' },
                                        { value: 'Juli', label: 'Juli' },
                                        { value: 'Agustus', label: 'Agustus' },
                                        { value: 'September', label: 'September' },
                                        { value: 'Oktober', label: 'Oktober' },
                                        { value: 'November', label: 'November' },
                                        { value: 'Desember', label: 'Desember' }
                                    ]}
                                    value={formData.month}
                                    onChange={(val) => setFormData({...formData, month: val})}
                                    placeholder="Pilih Bulan..."
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <InputLabel value="Tahun" />
                                <CustomSelect
                                    options={[
                                        { value: '2024', label: '2024' },
                                        { value: '2025', label: '2025' },
                                        { value: '2026', label: '2026' },
                                        { value: '2027', label: '2027' },
                                        { value: '2028', label: '2028' },
                                        { value: '2029', label: '2029' },
                                        { value: '2030', label: '2030' }
                                    ]}
                                    value={formData.year}
                                    onChange={(val) => setFormData({...formData, year: val})}
                                    placeholder="Pilih Tahun..."
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Nama Barang" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full rounded-xl"
                                    value={formData.item_name}
                                    onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Nama Perusahaan (Opsional)" />
                                <TextInput
                                    type="text"
                                    list="company-options"
                                    className="mt-1 block w-full rounded-xl"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                    placeholder="Contoh: PT. Abadi"
                                />
                                <datalist id="company-options">
                                    {companies.map((company, idx) => (
                                        <option key={idx} value={company} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Satuan" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full rounded-xl"
                                value={formData.unit}
                                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                placeholder="Contoh: Pcs, Box, Rim"
                            />
                        </div>

                        <div>
                            <InputLabel value="Qty" />
                            <TextInput
                                type="number"
                                className="mt-1 block w-full rounded-xl"
                                value={formData.quantity}
                                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                                required
                                min="0"
                            />
                        </div>

                        <div>
                            <InputLabel value="Harga Satuan (Rp)" />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                </div>
                                <TextInput
                                    type="number"
                                    className="block w-full pl-10 rounded-xl"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <InputLabel value="Total Harga (Otomatis)" />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                </div>
                                <TextInput
                                    type="number"
                                    className="block w-full pl-10 rounded-xl bg-gray-50 text-gray-500 font-bold"
                                    value={formData.quantity * formData.price}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Terkirim" />
                            <TextInput
                                type="number"
                                className="mt-1 block w-full rounded-xl"
                                value={formData.sent}
                                onChange={(e) => setFormData({...formData, sent: parseInt(e.target.value) || 0})}
                                required
                                min="0"
                            />
                        </div>

                        <div>
                            <InputLabel value="Belum Terkirim" />
                            <TextInput
                                type="number"
                                className="mt-1 block w-full rounded-xl"
                                value={formData.not_sent}
                                onChange={(e) => setFormData({...formData, not_sent: parseInt(e.target.value) || 0})}
                                required
                                min="0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Keterangan" />
                            <CustomSelect
                                options={[
                                    { value: 'BHMP', label: 'BHMP' },
                                    { value: 'ALAT', label: 'ALAT' }
                                ]}
                                value={formData.description}
                                onChange={(val) => setFormData({...formData, description: val})}
                                placeholder="Pilih Kategori..."
                                className="mt-1"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Tautan (Link) Beli / Bukti" />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                </div>
                                <TextInput
                                    type="url"
                                    className="block w-full pl-10 rounded-xl"
                                    value={formData.link}
                                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        </>
                    )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Batal</SecondaryButton>
                        {!selectedOutlet ? (
                            <PrimaryButton 
                                type="button" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    if(formData.outlet_name) {
                                        setSelectedOutlet(formData.outlet_name);
                                    } else {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Pilih Outlet',
                                            text: 'Silakan pilih outlet terlebih dahulu'
                                        });
                                    }
                                }}
                            >
                                Lanjut
                            </PrimaryButton>
                        ) : (
                            <PrimaryButton type="submit">Simpan Data</PrimaryButton>
                        )}
                    </div>
                </form>
            </Modal>
            <Modal show={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} maxWidth="md" className="overflow-visible">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Bagikan Link Live</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Bulan (Opsional)" />
                            <CustomSelect
                                options={[
                                    { value: '', label: 'Semua Bulan' },
                                    { value: 'Januari', label: 'Januari' },
                                    { value: 'Februari', label: 'Februari' },
                                    { value: 'Maret', label: 'Maret' },
                                    { value: 'April', label: 'April' },
                                    { value: 'Mei', label: 'Mei' },
                                    { value: 'Juni', label: 'Juni' },
                                    { value: 'Juli', label: 'Juli' },
                                    { value: 'Agustus', label: 'Agustus' },
                                    { value: 'September', label: 'September' },
                                    { value: 'Oktober', label: 'Oktober' },
                                    { value: 'November', label: 'November' },
                                    { value: 'Desember', label: 'Desember' }
                                ]}
                                value={shareModalFilters.month}
                                onChange={(val) => setShareModalFilters({...shareModalFilters, month: val})}
                                placeholder="Semua Bulan"
                            />
                        </div>

                        <div>
                            <InputLabel value="Tahun (Opsional)" />
                            <CustomSelect
                                options={[
                                    { value: '', label: 'Semua Tahun' },
                                    { value: '2024', label: '2024' },
                                    { value: '2025', label: '2025' },
                                    { value: '2026', label: '2026' },
                                    { value: '2027', label: '2027' },
                                    { value: '2028', label: '2028' },
                                    { value: '2029', label: '2029' },
                                    { value: '2030', label: '2030' }
                                ]}
                                value={shareModalFilters.year}
                                onChange={(val) => setShareModalFilters({...shareModalFilters, year: val})}
                                placeholder="Semua Tahun"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsShareModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton onClick={copyShareLink} className="bg-emerald-600 hover:bg-emerald-700">
                                Salin Link
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
