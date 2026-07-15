import ExportDropdown from '@/Components/ExportDropdown';
import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Users, Plus, Search, Edit, Trash2, Eye, Building, Phone, User, Store, FileText, Wrench, X, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Index({ providers }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewProvider, setPreviewProvider] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: '',
        address: '',
        phone: '',
        pic_name: '',
        pic_phone: '',
        notes: '',
    });

    const providerTypes = [
        'BMHP',
        'Alat'
    ];

    const filteredProviders = useMemo(() => {
        return providers.filter(provider => 
            provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (provider.type && provider.type.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [providers, searchTerm]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingProvider(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (provider) => {
        setIsEditMode(true);
        setEditingProvider(provider);
        clearErrors();
        setData({
            name: provider.name || '',
            type: provider.type || '',
            address: provider.address || '',
            phone: provider.phone || '',
            pic_name: provider.pic_name || '',
            pic_phone: provider.pic_phone || '',
            notes: provider.notes || '',
        });
        setIsModalOpen(true);
    };

    const openPreviewModal = (provider) => {
        setPreviewProvider(provider);
        setIsPreviewModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Penyedia?',
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
                destroy(route('providers.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Data penyedia berhasil dihapus.',
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
                    text: isEditMode ? 'Data penyedia berhasil diperbarui.' : 'Data penyedia berhasil ditambahkan.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    customClass: { popup: 'rounded-2xl' }
                });
            },
        };

        if (isEditMode) {
            put(route('providers.update', editingProvider.id), options);
        } else {
            post(route('providers.store'), options);
        }
    };

    const getProviderIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'bengkel': return <Wrench className="w-5 h-5 text-orange-600" />;
            case 'toko sparepart': return <Store className="w-5 h-5 text-blue-600" />;
            case 'bmhp': return <FileText className="w-5 h-5 text-teal-600" />;
            case 'alat': return <Wrench className="w-5 h-5 text-indigo-600" />;
            case 'asuransi': return <ShieldCheck className="w-5 h-5 text-green-600" />;
            default: return <Building className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Data Penyedia</h2>}
        >
            <Head title="Data Penyedia" />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Store className="w-6 h-6 text-blue-600" />
                            Daftar Penyedia (Provider)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Kelola data bengkel, toko sparepart, dealer, BMHP, dan asuransi.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-5 h-5" /> Tambah Penyedia
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
                                placeholder="Cari nama atau jenis penyedia..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            Total Data: <span className="text-gray-900 font-bold">{filteredProviders.length}</span>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Nama Penyedia & Jenis</th>
                                    <th className="px-6 py-4">Kontak & Alamat</th>
                                    <th className="px-6 py-4">Penanggung Jawab (PIC)</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProviders.length > 0 ? filteredProviders.map((provider) => (
                                    <tr 
                                        key={provider.id} 
                                        onClick={() => openPreviewModal(provider)}
                                        className="bg-white border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                                    {getProviderIcon(provider.type)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base">{provider.name}</p>
                                                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded mt-1 border border-indigo-100">
                                                        {provider.type || 'Lainnya'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-gray-700">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="font-medium">{provider.phone || '-'}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 max-w-[200px] truncate" title={provider.address}>
                                                    {provider.address || 'Alamat tidak tersedia'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-gray-700">
                                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="font-semibold">{provider.pic_name || '-'}</span>
                                                </div>
                                                {provider.pic_phone && (
                                                    <div className="text-xs text-gray-500">
                                                        HP: {provider.pic_phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => openEditModal(provider)} 
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(provider.id)} 
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
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data penyedia yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL FORM (Tambah/Edit) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start pt-10 pb-10 px-4 bg-gray-900/50 backdrop-blur-sm custom-scrollbar">
                        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all my-auto">
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10 rounded-t-3xl">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Store className="w-6 h-6 text-blue-600"/>
                                        {isEditMode ? 'Edit Data Penyedia' : 'Tambah Penyedia Baru'}
                                    </h3>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="name" value="Nama Penyedia" required />
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
                                            <InputLabel htmlFor="type" value="Jenis Penyedia" />
                                            <select
                                                id="type"
                                                name="type"
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                            >
                                                <option value="">-- Pilih Jenis --</option>
                                                {providerTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.type} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="phone" value="No. Telepon / Kantor" />
                                            <TextInput
                                                id="phone"
                                                type="text"
                                                name="phone"
                                                value={data.phone}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('phone', e.target.value)}
                                            />
                                            <InputError message={errors.phone} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="address" value="Alamat Lengkap" />
                                            <textarea
                                                id="address"
                                                name="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                rows="3"
                                            ></textarea>
                                            <InputError message={errors.address} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                                            <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-600"/>
                                                Kontak Penanggung Jawab (PIC)
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <InputLabel htmlFor="pic_name" value="Nama PIC" />
                                                    <TextInput
                                                        id="pic_name"
                                                        type="text"
                                                        name="pic_name"
                                                        value={data.pic_name}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => setData('pic_name', e.target.value)}
                                                    />
                                                    <InputError message={errors.pic_name} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel htmlFor="pic_phone" value="No HP / WA PIC" />
                                                    <TextInput
                                                        id="pic_phone"
                                                        type="text"
                                                        name="pic_phone"
                                                        value={data.pic_phone}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => setData('pic_phone', e.target.value)}
                                                    />
                                                    <InputError message={errors.pic_phone} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="notes" value="Catatan Tambahan (Opsional)" />
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                                rows="2"
                                            ></textarea>
                                            <InputError message={errors.notes} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3">Batal</SecondaryButton>
                                    <div className="flex items-center gap-3">
                                <ExportDropdown pdfRoute={route('providers.export.pdf')} excelRoute={route('providers.export.excel')} />
                                <PrimaryButton disabled={processing} className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700">
                                        {isEditMode ? 'Simpan Perubahan' : 'Tambahkan'}
                                    </PrimaryButton>
                            </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL PREVIEW (Lihat Detail) */}
                {isPreviewModalOpen && previewProvider && (
                    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl transform transition-all">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-blue-600"/>
                                    Detail Penyedia
                                </h3>
                                <button type="button" onClick={() => setIsPreviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                        {getProviderIcon(previewProvider.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900">{previewProvider.name}</h4>
                                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200 mt-1">
                                            {previewProvider.type || 'Lainnya'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <p className="text-sm text-gray-500 font-medium">No. Telepon:</p>
                                        <p className="text-sm font-semibold text-gray-900">{previewProvider.phone || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <p className="text-sm text-gray-500 font-medium">Alamat:</p>
                                        <p className="text-sm font-semibold text-gray-900">{previewProvider.address || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <p className="text-sm text-gray-500 font-medium">PIC / P. Jawab:</p>
                                        <p className="text-sm font-semibold text-gray-900">{previewProvider.pic_name || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <p className="text-sm text-gray-500 font-medium">Kontak PIC:</p>
                                        <p className="text-sm font-semibold text-gray-900">{previewProvider.pic_phone || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <p className="text-sm text-gray-500 font-medium">Catatan:</p>
                                        <p className="text-sm font-medium text-gray-700 p-3 bg-gray-50 rounded-xl whitespace-pre-wrap">{previewProvider.notes || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
