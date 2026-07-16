import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, BookOpen, Trash2, FolderOpen } from 'lucide-react';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, divisions }) {
    const [showModal, setShowModal] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('sops.divisions.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Devisi SOP berhasil ditambahkan',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-2xl' }
                });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Devisi?',
            text: "Semua SOP di dalam devisi ini juga akan terhapus. Lanjutkan?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                import('@inertiajs/react').then(({ router }) => {
                    router.delete(route('sops.divisions.destroy', id), {
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Terhapus',
                                text: 'Devisi SOP berhasil dihapus',
                                timer: 1500,
                                showConfirmButton: false,
                                customClass: { popup: 'rounded-2xl' }
                            });
                        }
                    });
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen SOP" />

            <div className="py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            Manajemen SOP
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                            Kelola Standard Operating Procedure (SOP) perusahaan berdasarkan Devisi.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Devisi
                    </button>
                </div>

                {divisions.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FolderOpen className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada Devisi</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Mulai dengan menambahkan Devisi baru untuk mengelompokkan SOP Anda.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Devisi Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {divisions.map((division) => (
                            <div key={division.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                            <FolderOpen className="w-6 h-6" />
                                        </div>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); handleDelete(division.id); }}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Hapus Devisi"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{division.name}</h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        {division.sops_count} Pekerjaan (SOP)
                                    </p>
                                    <Link
                                        href={route('sops.show', division.id)}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                    >
                                        Lihat SOP
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Tambah Devisi SOP
                    </h2>

                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="Nama Devisi" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Marketing, HRD, IT, dll"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
