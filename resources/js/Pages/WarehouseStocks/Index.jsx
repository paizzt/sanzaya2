import ExportDropdown from '@/Components/ExportDropdown';
import ClientPagination from '@/Components/ClientPagination';
import React, { useState, useMemo } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Fuse from 'fuse.js';
import { 
    Plus, Search, Edit, Trash2, Box, X, Share2, Copy, CheckCircle, Info, DollarSign, Boxes
} from 'lucide-react';
import Swal from 'sweetalert2';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Index({ items, isShared, providers = [] }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState({
        code: true,
        name: true,
        category: true,
        quantity: true,
        unit: true,
        link: true
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        category: '',
        quantity: '',
        unit: '',
        minimum_stock: '',
        location: '',
        notes: '',
        link: '',
        incoming_date: '',
        po_date: '',
        provider_id: '',
        price: '',
    });

    const fuse = useMemo(() => new Fuse(items, {
        keys: [
            'name', 
            'code',
            'category',
            'link'
        ],
        threshold: 0.3,
        ignoreLocation: true
    }), [items]);

    const filteredItems = useMemo(() => {
        let result = items;
        if (searchTerm) {
            result = fuse.search(searchTerm).map(result => result.item);
        }
        return result;
    }, [fuse, searchTerm, items]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingItem(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditMode(true);
        setEditingItem(item);
        clearErrors();
        setData({
            name: item.name || '',
            code: item.code || '',
            category: item.category || '',
            quantity: item.quantity || '',
            unit: item.unit || '',
            minimum_stock: item.minimum_stock || '',
            notes: item.notes || '',
            link: item.link || '',
            incoming_date: item.incoming_date || '',
            po_date: item.po_date || '',
            provider_id: item.provider_id || '',
            price: item.price || '',
        });
        setIsModalOpen(true);
    };

    const openDetailModal = (item) => {
        setIsEditMode(true);
        setEditingItem(item);
        clearErrors();
        setData({
            name: item.name || '',
            code: item.code || '',
            category: item.category || '',
            quantity: item.quantity || '',
            unit: item.unit || '',
            minimum_stock: item.minimum_stock || '',
            notes: item.notes || '',
            link: item.link || '',
            incoming_date: item.incoming_date || '',
            po_date: item.po_date || '',
            provider_id: item.provider_id || '',
            price: item.price || '',
        });
        setIsDetailModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Stok?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('warehouse-stocks.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Data stok berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#3b82f6',
                            customClass: { popup: 'rounded-2xl' }
                        });
                    },
                });
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                setIsDetailModalOpen(false);
                reset();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data stok berhasil disimpan.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    customClass: { popup: 'rounded-2xl' }
                });
            },
        };

        if (isEditMode) {
            put(route('warehouse-stocks.update', editingItem.id), options);
        } else {
            post(route('warehouse-stocks.store'), options);
        }
    };

    const handleToggleShare = () => {
        router.post(route('warehouse-stocks.toggleShare'), {
            is_active: !isShared
        }, {
            preserveScroll: true,
        });
    };

    const copyToClipboard = () => {
        const activeCols = Object.entries(selectedColumns)
            .filter(([_, isActive]) => isActive)
            .map(([col]) => col)
            .join(',');
        const queryParams = activeCols ? `?cols=${activeCols}` : '';
        const publicUrl = window.location.origin + '/shared/stok-gudang' + queryParams;
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Data Stok Gudang</h2>}
        >
            <Head title="Stok Gudang" />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                    {/* Total Stok Barang */}
                    <div className="bg-white rounded-2xl py-6 px-4 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border-2 border-blue-400 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                            <Boxes className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Total Stok Barang</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {new Intl.NumberFormat('id-ID').format(
                                items.reduce((sum, item) => sum + (item.quantity || 0), 0)
                            )}
                        </h3>
                    </div>

                    {/* Total Nilai Gudang */}
                    <div className="bg-white rounded-2xl py-6 px-4 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border-2 border-green-500 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                            <span className="text-green-500 font-bold text-sm">Rp</span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Total Nilai Gudang</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                                items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
                            )}
                        </h3>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Box className="w-8 h-8 text-blue-600" />
                            Daftar Stok Gudang
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                            Kelola data inventaris dan stok barang di gudang.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <ExportDropdown pdfRoute={route('warehouse-stocks.export.pdf')} excelRoute={route('warehouse-stocks.export.excel')} />
                        <button 
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" /> Tambah Stok
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${isShared ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                <Share2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Berbagi Link Publik</h3>
                                <p className="text-sm text-gray-500">
                                    {isShared ? 'Link publik aktif dan dapat diakses oleh siapa saja.' : 'Link publik saat ini non-aktif.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {isShared && (
                                <button 
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors w-full sm:w-auto justify-center"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Tersalin!' : 'Salin Link'}
                                </button>
                            )}
                            <button 
                                onClick={handleToggleShare}
                                className={`px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors w-full sm:w-auto ${isShared ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                {isShared ? 'Matikan Link' : 'Aktifkan Link'}
                            </button>
                        </div>
                    </div>
                    {isShared && (
                        <div className="pt-4 border-t border-gray-100 mt-2">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Pilih kolom yang akan ditampilkan pada link publik:</p>
                            <div className="flex flex-wrap gap-4">
                                {Object.keys(selectedColumns).map(col => (
                                    <label key={col} className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                            checked={selectedColumns[col]}
                                            onChange={(e) => setSelectedColumns({...selectedColumns, [col]: e.target.checked})}
                                        />
                                        <span className="text-sm text-gray-600 capitalize">{
                                            col === 'code' ? 'Kode/SKU' :
                                            col === 'name' ? 'Nama Barang' :
                                            col === 'category' ? 'Kategori' :
                                            col === 'quantity' ? 'Stok' :
                                            col === 'unit' ? 'Satuan' :
                                            col === 'link' ? 'Link E-Katalog' : col
                                        }</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="relative w-full sm:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                placeholder="Cari nama, kode, link..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            Total Data: <span className="text-gray-900 font-bold">{filteredItems.length}</span>
                        </div>
                    </div>
                    


                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Kode/SKU</th>
                                    <th className="px-6 py-4">Nama Barang</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Harga</th>
                                    <th className="px-6 py-4">Stok</th>
                                    <th className="px-6 py-4">Satuan</th>
                                    <th className="px-6 py-4">Nilai</th>
                                    <th className="px-6 py-4">Link E-Katalog</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length > 0 ? filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                                    <tr 
                                        key={item.id} 
                                        onClick={() => openDetailModal(item)}
                                        className="bg-white border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600 font-medium">{item.code || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600">{item.category || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">
                                                {item.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price) : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-bold ${item.quantity <= item.minimum_stock ? 'text-red-600' : 'text-gray-900'}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600">{item.unit || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">
                                                {item.price && item.quantity ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price * item.quantity) : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.link ? (
                                                <a href={item.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline">Buka E-Katalog</a>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(item); }} 
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data stok yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredItems.length > 0 && (
                        <div className="mt-4 border-t">
                            <ClientPagination 
                                total={filteredItems.length} 
                                itemsPerPage={itemsPerPage} 
                                currentPage={currentPage} 
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage} 
                            />
                        </div>
                    )}
                </div>

                {/* MODAL FORM */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] overflow-y-auto flex justify-center items-start pt-10 pb-10 px-4 bg-gray-900/50 backdrop-blur-sm custom-scrollbar">
                        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all my-auto">
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-3xl">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Box className="w-6 h-6 text-blue-600"/>
                                        {isEditMode ? 'Edit Data Stok' : 'Tambah Stok Baru'}
                                    </h3>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="name" value="Nama Barang" required />
                                            <TextInput
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="code" value="Kode/SKU" />
                                            <TextInput
                                                id="code"
                                                type="text"
                                                value={data.code}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('code', e.target.value)}
                                            />
                                            <InputError message={errors.code} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="category" value="Kategori" />
                                            <TextInput
                                                id="category"
                                                type="text"
                                                value={data.category}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('category', e.target.value)}
                                            />
                                            <InputError message={errors.category} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="price" value="Harga Barang" />
                                            <div className="relative mt-1 rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                                </div>
                                                <TextInput
                                                    id="price"
                                                    type="number"
                                                    value={data.price}
                                                    className="block w-full pl-9"
                                                    onChange={(e) => setData('price', e.target.value)}
                                                />
                                            </div>
                                            <InputError message={errors.price} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="quantity" value="Jumlah Stok" required />
                                            <TextInput
                                                id="quantity"
                                                type="number"
                                                value={data.quantity}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('quantity', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.quantity} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="unit" value="Satuan" />
                                            <TextInput
                                                id="unit"
                                                type="text"
                                                value={data.unit}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('unit', e.target.value)}
                                            />
                                            <InputError message={errors.unit} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="minimum_stock" value="Batas Minimum Stok" />
                                            <TextInput
                                                id="minimum_stock"
                                                type="number"
                                                value={data.minimum_stock}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('minimum_stock', e.target.value)}
                                            />
                                            <InputError message={errors.minimum_stock} className="mt-2" />
                                        </div>



                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="link" value="Link E-Katalog (Opsional)" />
                                            <TextInput
                                                id="link"
                                                type="url"
                                                value={data.link}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('link', e.target.value)}
                                                placeholder="https://..."
                                            />
                                            <InputError message={errors.link} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="notes" value="Keterangan" />
                                            <textarea
                                                id="notes"
                                                value={data.notes}
                                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows="3"
                                            ></textarea>
                                            <InputError message={errors.notes} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3">Batal</SecondaryButton>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DETAIL MODAL */}
                {isDetailModalOpen && (
                    <div className="fixed inset-0 z-[100] overflow-y-auto flex justify-center items-start pt-10 pb-10 px-4 bg-gray-900/50 backdrop-blur-sm custom-scrollbar">
                        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all my-auto">
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-3xl">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Info className="w-6 h-6 text-green-600"/>
                                        Detail & Update Info Tambahan
                                    </h3>
                                    <button type="button" onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                        <h4 className="font-bold text-blue-900 text-lg mb-1">{editingItem?.name}</h4>
                                        <p className="text-blue-700 text-sm">SKU: {editingItem?.code || '-'}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                        <h5 className="font-semibold text-gray-800 border-b pb-2 mb-3">Informasi Utama</h5>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="block text-gray-500">Kategori</span>
                                                <span className="font-medium text-gray-900">{editingItem?.category || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500">Lokasi</span>
                                                <span className="font-medium text-gray-900">{editingItem?.location || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500">Harga Barang</span>
                                                <span className="font-medium text-gray-900">
                                                    {editingItem?.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(editingItem.price) : '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500">Jumlah Stok</span>
                                                <span className="font-medium text-gray-900">{editingItem?.quantity} {editingItem?.unit}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500">Total Nilai</span>
                                                <span className="font-bold text-green-700">
                                                    {editingItem?.price && editingItem?.quantity ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(editingItem.price * editingItem.quantity) : '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500">Stok Minimum</span>
                                                <span className="font-medium text-gray-900">{editingItem?.minimum_stock} {editingItem?.unit}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="block text-gray-500">Keterangan / Catatan</span>
                                                <span className="font-medium text-gray-900 whitespace-pre-wrap">{editingItem?.notes || '-'}</span>
                                            </div>
                                            {editingItem?.link && (
                                                <div className="col-span-2">
                                                    <span className="block text-gray-500">Link E-Katalog</span>
                                                    <a href={editingItem.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{editingItem.link}</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h5 className="font-semibold text-gray-800 mb-4">Informasi Tambahan</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="incoming_date" value="Tanggal Barang Masuk" />
                                                <TextInput
                                                    id="incoming_date"
                                                    type="date"
                                                    value={data.incoming_date}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('incoming_date', e.target.value)}
                                                />
                                                <InputError message={errors.incoming_date} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="po_date" value="Tanggal PO" />
                                                <TextInput
                                                    id="po_date"
                                                    type="date"
                                                    value={data.po_date}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('po_date', e.target.value)}
                                                />
                                                <InputError message={errors.po_date} className="mt-2" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="provider_id" value="Nama Penyedia" />
                                                <select
                                                    id="provider_id"
                                                    value={data.provider_id}
                                                    onChange={(e) => setData('provider_id', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                >
                                                    <option value="">Pilih Penyedia</option>
                                                    {providers.map(provider => (
                                                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.provider_id} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                                    <SecondaryButton type="button" onClick={() => setIsDetailModalOpen(false)} className="rounded-xl px-6 py-3">Tutup</SecondaryButton>
                                    <PrimaryButton disabled={processing} className="bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-900">
                                        {processing ? 'Menyimpan...' : 'Update Detail'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
