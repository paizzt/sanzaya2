import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Building, Upload, Save, Building2, MapPin, Plus, Edit, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

export default function Index({ auth, companies }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const logoInputRef = useRef(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        address: '',
        logo: null,
    });

    const openModal = (company = null) => {
        if (company) {
            setIsEditing(true);
            setCurrentId(company.id);
            setData({
                name: company.name,
                address: company.address || '',
                logo: null,
            });
            setLogoPreview(company.logo ? `/storage/${company.logo}` : null);
        } else {
            setIsEditing(false);
            setCurrentId(null);
            reset();
            setLogoPreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setLogoPreview(null);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Using post for update because of multipart/form-data file upload in Laravel
            post(route('company.update', currentId), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Data perusahaan berhasil diperbarui.',
                        icon: 'success',
                        confirmButtonColor: '#3b82f6',
                    });
                },
            });
        } else {
            post(route('company.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Perusahaan baru berhasil ditambahkan.',
                        icon: 'success',
                        confirmButtonColor: '#3b82f6',
                    });
                },
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data perusahaan ini akan dihapus secara permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('company.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Data perusahaan berhasil dihapus.', 'success');
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Data Perusahaan</h2>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 gap-2 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Perusahaan
                    </button>
                </div>
            }
        >
            <Head title="Data Perusahaan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            {companies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {companies.map((company) => (
                                        <div key={company.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                                            <div className="p-6 flex-1 flex flex-col items-center text-center">
                                                <div className="w-24 h-24 mb-4 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50 shadow-inner">
                                                    {company.logo ? (
                                                        <img src={`/storage/${company.logo}`} alt={company.name} className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <Building2 className="w-10 h-10 text-gray-300" />
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-1">{company.name}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {company.address || <span className="italic text-gray-400">Belum ada alamat</span>}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 px-6 py-3 border-t flex justify-between">
                                                <button
                                                    onClick={() => openModal(company)}
                                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors gap-1"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company.id)}
                                                    className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 px-4">
                                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Perusahaan</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mb-6">Tambahkan profil perusahaan Anda untuk menggunakannya dalam manajemen pengguna dan dokumen lainnya.</p>
                                    <button
                                        onClick={() => openModal()}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white tracking-widest hover:bg-blue-700 transition ease-in-out duration-150 shadow-sm"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Tambah Perusahaan Pertama
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {isEditing ? 'Edit Data Perusahaan' : 'Tambah Perusahaan Baru'}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo Perusahaan
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className={`w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 transition-all ${logoPreview ? 'border-blue-300' : 'border-gray-300 hover:border-blue-400'}`}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <span className="text-xs text-gray-500">Belum ada logo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Pilih Gambar
                                    </button>
                                    <p className="mt-2 text-xs text-gray-500">Maksimal ukuran 2MB. Format JPG, PNG.</p>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    <InputError message={errors.logo} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Nama Perusahaan */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Perusahaan
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Masukkan nama perusahaan"
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Alamat */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Alamat
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={4}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Masukkan alamat lengkap perusahaan"
                                />
                            </div>
                            <InputError message={errors.address} className="mt-2" />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 gap-2 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
