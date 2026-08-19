import React, { useState } from 'react';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { 
    ArrowLeft, Plus, Search, Edit, Trash2, Store, Phone, MapPin, User, MessageCircle, Package, ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Show({ provider, products, filters }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        price: '',
        description: '',
        is_active: true,
        link: '',
        provider_id: provider.id,
        registration_no: '',
        qty: '',
        unit: '',
        tkdn: '',
        hna: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('providers.show', provider.id), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setEditingProduct(null);
        clearErrors();
        reset();
        setData('provider_id', provider.id);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEditMode(true);
        setEditingProduct(product);
        clearErrors();
        setData({
            name: product.name || '',
            code: product.code || '',
            price: product.price || '',
            description: product.description || '',
            is_active: product.is_active,
            link: product.link || '',
            provider_id: provider.id,
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
            title: 'Hapus Data Barang?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            shape: 'rounded-xl'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('provider-products.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Data barang telah dihapus.', 'success');
                    },
                });
            }
        });
    };

    const submit = (e) => {
        e.preventDefault();
        
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: isEditMode ? 'Data barang berhasil diperbarui!' : 'Data barang berhasil ditambahkan!',
                    timer: 1500,
                    showConfirmButton: false
                });
            },
        };

        if (isEditMode) {
            put(route('provider-products.update', editingProduct.id), options);
        } else {
            post(route('provider-products.store'), options);
        }
    };

    const getWaLink = (phone) => {
        if (!phone) return null;
        let formatted = phone.toString().replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            formatted = '62' + formatted.substring(1);
        }
        return `https://wa.me/${formatted}`;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Detail Penyedia - ${provider.name}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('providers.index')}
                            className="p-2.5 bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-gray-100 flex items-center justify-center w-fit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                                Detail Penyedia
                            </h2>
                            <p className="text-sm text-gray-500">
                                Kelola informasi dan daftar barang dari penyedia ini
                            </p>
                        </div>
                    </div>

                    {/* Provider Info Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left: Main Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <Store className="w-8 h-8 text-indigo-600"/>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{provider.name}</h3>
                                            {provider.type && (
                                                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200 mt-2">
                                                    {provider.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Alamat</p>
                                                <p className="text-base text-gray-900">{provider.address || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">No. Telepon / Kantor</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-base text-gray-900">{provider.phone || '-'}</p>
                                                    {provider.phone && (
                                                        <a href={getWaLink(provider.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Hubungi via WhatsApp">
                                                            <MessageCircle className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">PIC / Penanggung Jawab</p>
                                                <p className="text-base text-gray-900">{provider.pic_name || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Kontak PIC</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-base text-gray-900">{provider.pic_phone || '-'}</p>
                                                    {provider.pic_phone && (
                                                        <a href={getWaLink(provider.pic_phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Hubungi via WhatsApp">
                                                            <MessageCircle className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right: Notes & Stats */}
                                <div className="w-full md:w-1/3 md:border-l md:border-gray-100 md:pl-8 flex flex-col gap-6">
                                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                                        <h4 className="text-sm font-semibold text-blue-800 mb-2">Total Barang</h4>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-extrabold text-blue-600">{products.total || 0}</span>
                                            <span className="text-blue-700 text-sm mb-1 font-medium">Item</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Catatan:</p>
                                        <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                                            {provider.notes || <span className="text-gray-400 italic">Tidak ada catatan.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Package className="w-6 h-6 text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-900">
                                    Daftar Barang
                                </h3>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="pl-10 w-full md:w-64 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    />
                                </div>
                                <button 
                                    onClick={openAddModal}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Barang
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Nama Barang & Kode</th>
                                        <th className="px-6 py-4 font-semibold">No. Registrasi</th>
                                        <th className="px-6 py-4 font-semibold text-center">TKDN</th>
                                        <th className="px-6 py-4 font-semibold text-center">Jumlah & Satuan</th>
                                        <th className="px-6 py-4 font-semibold text-right">Harga + PPN</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.length > 0 ? products.data.map((product) => (
                                        <tr key={product.id} className="bg-white border-b border-gray-50 hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{product.code || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-700">{product.registration_no || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-medium text-gray-700">{product.tkdn ? `${product.tkdn}%` : '-'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {product.qty !== null && product.unit ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                                        {product.qty} {product.unit}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-bold text-gray-900">
                                                    Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    product.is_active 
                                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {product.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {product.link && (
                                                        <a 
                                                            href={product.link.startsWith('http') ? product.link : `https://${product.link}`}
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                                                            title="Buka Link E-Katalog"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button 
                                                        onClick={() => openEditModal(product)} 
                                                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                                                        title="Edit Barang"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)} 
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                                        title="Hapus Barang"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-900">Tidak ada barang</p>
                                                    <p className="text-sm mt-1">Penyedia ini belum memiliki barang atau pencarian tidak ditemukan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={products.links} from={products.from} to={products.to} total={products.total} />
                    </div>
                </div>

                {/* MODAL FOR ADD/EDIT PRODUCT */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className={`p-2 rounded-xl ${isEditMode ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {isEditMode ? <Edit className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                                    </div>
                                    {isEditMode ? 'Edit Data Barang' : 'Tambah Data Barang Baru'}
                                </h3>
                            </div>
                            
                            <form onSubmit={submit} className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="name" value="Nama Barang" required />
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
                                            <InputLabel htmlFor="registration_no" value="No. Registrasi" />
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
                                            <InputLabel htmlFor="qty" value="Jumlah" />
                                            <TextInput
                                                id="qty"
                                                type="number"
                                                name="qty"
                                                value={data.qty}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('qty', e.target.value)}
                                            />
                                            <InputError message={errors.qty} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="unit" value="Satuan (Pcs, Box, dll)" />
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
                                            <InputLabel htmlFor="tkdn" value="TKDN (%)" />
                                            <TextInput
                                                id="tkdn"
                                                type="number"
                                                step="0.01"
                                                name="tkdn"
                                                value={data.tkdn}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('tkdn', e.target.value)}
                                            />
                                            <InputError message={errors.tkdn} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="hna" value="HNA (Harga Netto Apotek)" />
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

                                        <div>
                                            <InputLabel htmlFor="link" value="Link" />
                                            <TextInput
                                                id="link"
                                                type="url"
                                                name="link"
                                                value={data.link}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('link', e.target.value)}
                                                />
                                            <InputError message={errors.link} className="mt-2" />
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

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10 rounded-b-3xl flex justify-end gap-3">
                                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3">Batal</SecondaryButton>
                                    <PrimaryButton disabled={processing} className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700">
                                        {processing ? 'Menyimpan...' : 'Simpan'}
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
