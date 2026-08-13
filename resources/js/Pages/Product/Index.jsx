import ExportDropdown from '@/Components/ExportDropdown';
import CustomSelect from '@/Components/CustomSelect';
import SearchableSelect from '@/Components/SearchableSelect';
import ClientPagination from '@/Components/ClientPagination';
import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Fuse from 'fuse.js';
import { 
    Plus, Search, Edit, Trash2, Box, Eye, CheckCircle, XCircle, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Index({ products }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        manufacturer: '',
        code: '',
        price: '',
        description: '',
        is_active: true,
        jenis: '',
        link: '',
        registration_no: '',
        qty: '',
        unit: '',
        tkdn: '',
        hna: '',
    });

    const fuse = useMemo(() => new Fuse(products, {
        keys: [
            'name', 
            'manufacturer',
            'code',
            'registration_no'
        ],
        threshold: 0.3,
        ignoreLocation: true
    }), [products]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (searchTerm) {
            result = fuse.search(searchTerm).map(result => result.item);
        }
        return result;
    }, [fuse, searchTerm, products]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingProduct(null);
        reset();
        setData('is_active', true);
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEditMode(true);
        setEditingProduct(product);
        clearErrors();
        setData({
            name: product.name || '',
            manufacturer: product.manufacturer || '',
            code: product.code || '',
            price: product.price || '',
            description: product.description || '',
            is_active: product.is_active,
            jenis: product.jenis || '',
            link: product.link || '',
            registration_no: product.registration_no || '',
            qty: product.qty || '',
            unit: product.unit || '',
            tkdn: product.tkdn || '',
            hna: product.hna || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Produk?',
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
                destroy(route('products.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Data produk berhasil dihapus.',
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
                reset();
                Swal.fire({
                    title: 'Berhasil!',
                    text: isEditMode ? 'Data produk berhasil diperbarui.' : 'Data produk berhasil ditambahkan.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    customClass: { popup: 'rounded-2xl' }
                });
            },
        };

        if (isEditMode) {
            put(route('products.update', editingProduct.id), options);
        } else {
            post(route('products.store'), options);
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Data Produk</h2>}
        >
            <Head title="Data Produk" />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Box className="w-6 h-6 text-blue-600" />
                            Daftar Produk
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Kelola data inventaris produk perusahaan.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-5 h-5" /> Tambah Produk
                    </button>
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
                                placeholder="Cari nama atau kode produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            Total Data: <span className="text-gray-900 font-bold">{filteredProducts.length}</span>
                        </div>
                    </div>
                    
                    {filteredProducts.length > 0 && (
                        <div className="mb-4 mt-2">
                            <ClientPagination 
                                total={filteredProducts.length} 
                                itemsPerPage={itemsPerPage} 
                                currentPage={currentPage} 
                                onPageChange={setCurrentPage} 
                            />
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Brand</th>
                                    <th className="px-6 py-4">Produk</th>
                                    <th className="px-6 py-4">Satuan</th>
                                    <th className="px-6 py-4">NIE</th>
                                    <th className="px-6 py-4 text-right">Harga</th>
                                    <th className="px-6 py-4 text-right">Harga + PPN</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                                    <tr 
                                        key={product.id} 
                                        className="bg-white border-b border-gray-50 hover:bg-blue-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{product.manufacturer || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600">{product.unit || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600 font-medium">{product.registration_no || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-gray-900 font-medium">{formatRupiah(product.hna || 0)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-gray-900 font-bold">{formatRupiah(product.price)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => openEditModal(product)} 
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product.id)} 
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
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
                                            Tidak ada data produk yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredProducts.length > 0 && (
                        <div className="mt-4 border-t">
                            <ClientPagination 
                                total={filteredProducts.length} 
                                itemsPerPage={itemsPerPage} 
                                currentPage={currentPage} 
                                onPageChange={setCurrentPage} 
                            />
                        </div>
                    )}
                </div>

                {/* MODAL FORM (Tambah/Edit) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start pt-10 pb-10 px-4 bg-gray-900/50 backdrop-blur-sm custom-scrollbar">
                        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all my-auto">
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-3xl">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Box className="w-6 h-6 text-blue-600"/>
                                        {isEditMode ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                                    </h3>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="manufacturer" value="Brand" />
                                            <TextInput
                                                id="manufacturer"
                                                type="text"
                                                name="manufacturer"
                                                value={data.manufacturer}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('manufacturer', e.target.value)}
                                            />
                                            <InputError message={errors.manufacturer} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="name" value="Produk" required />
                                            <TextInput
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={data.name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="unit" value="Satuan" />
                                            <TextInput
                                                id="unit"
                                                type="text"
                                                name="unit"
                                                value={data.unit}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('unit', e.target.value)}
                                            />
                                            <InputError message={errors.unit} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="registration_no" value="NIE" />
                                            <TextInput
                                                id="registration_no"
                                                type="text"
                                                name="registration_no"
                                                value={data.registration_no}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('registration_no', e.target.value)}
                                            />
                                            <InputError message={errors.registration_no} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="hna" value="Harga" />
                                            <TextInput
                                                id="hna"
                                                type="number"
                                                name="hna"
                                                value={data.hna}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('hna', e.target.value)}
                                            />
                                            <InputError message={errors.hna} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="price" value="Harga + PPN" required />
                                            <TextInput
                                                id="price"
                                                type="number"
                                                name="price"
                                                value={data.price}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('price', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.price} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2 flex items-center">
                                            <input
                                                id="is_active"
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">
                                                Produk Aktif (bisa digunakan/dijual)
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3">Batal</SecondaryButton>
                                    <div className="flex items-center gap-3">
                                <ExportDropdown pdfRoute={route('products.export.pdf')} excelRoute={route('products.export.excel')} />
                                <PrimaryButton disabled={processing} className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700">
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </PrimaryButton>
                            </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
