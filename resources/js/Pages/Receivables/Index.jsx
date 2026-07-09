import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Wallet, Plus, Edit, Trash2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Swal from 'sweetalert2';

export default function Index({ auth, items }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        nama_outlet: '',
        tahun_1: '',
        tahun_2: '',
        tahun_3: '',
        tahun_4: '',
        total_sanzaya: '',
        ruma_1: '',
        ruma_2: '',
        ruma_3: '',
        total_ruma: '',
        total_gabungan: ''
    });

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                id: item.id,
                nama_outlet: item.nama_outlet || '',
                tahun_1: item.tahun_1 || '',
                tahun_2: item.tahun_2 || '',
                tahun_3: item.tahun_3 || '',
                tahun_4: item.tahun_4 || '',
                total_sanzaya: item.total_sanzaya || '',
                ruma_1: item.ruma_1 || '',
                ruma_2: item.ruma_2 || '',
                ruma_3: item.ruma_3 || '',
                total_ruma: item.total_ruma || '',
                total_gabungan: item.total_gabungan || ''
            });
        } else {
            setEditingItem(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingItem(null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('receivables.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data piutang berhasil disimpan',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
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
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('receivables.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Terhapus',
                            text: 'Data berhasil dihapus.',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Data Piutang</h2>}
        >
            <Head title="Data Piutang" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-blue-500" />
                                    Data Piutang
                                </h3>
                                <PrimaryButton onClick={() => openModal()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Data
                                </PrimaryButton>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Outlet</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun 1</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun 2</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun 3</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sanzaya</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gabungan</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.length > 0 ? items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_outlet}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.tahun_1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.tahun_2}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.tahun_3}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{item.total_sanzaya}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">{item.total_gabungan}</td>
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
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                    Belum ada data piutang.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingItem ? 'Edit Data Piutang' : 'Tambah Data Piutang'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96 overflow-y-auto pr-2">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="nama_outlet" value="Nama Outlet" />
                            <TextInput id="nama_outlet" type="text" className="mt-1 block w-full" value={data.nama_outlet} onChange={e => setData('nama_outlet', e.target.value)} />
                            <InputError message={errors.nama_outlet} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tahun_1" value="Tahun 1" />
                            <TextInput id="tahun_1" type="number" step="any" className="mt-1 block w-full" value={data.tahun_1} onChange={e => setData('tahun_1', e.target.value)} />
                            <InputError message={errors.tahun_1} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tahun_2" value="Tahun 2" />
                            <TextInput id="tahun_2" type="number" step="any" className="mt-1 block w-full" value={data.tahun_2} onChange={e => setData('tahun_2', e.target.value)} />
                            <InputError message={errors.tahun_2} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tahun_3" value="Tahun 3" />
                            <TextInput id="tahun_3" type="number" step="any" className="mt-1 block w-full" value={data.tahun_3} onChange={e => setData('tahun_3', e.target.value)} />
                            <InputError message={errors.tahun_3} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tahun_4" value="Tahun 4" />
                            <TextInput id="tahun_4" type="number" step="any" className="mt-1 block w-full" value={data.tahun_4} onChange={e => setData('tahun_4', e.target.value)} />
                            <InputError message={errors.tahun_4} className="mt-2" />
                        </div>

                        <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <InputLabel htmlFor="total_sanzaya" value="Total Sanzaya" />
                            <TextInput id="total_sanzaya" type="number" step="any" className="mt-1 block w-full bg-white" value={data.total_sanzaya} onChange={e => setData('total_sanzaya', e.target.value)} />
                            <InputError message={errors.total_sanzaya} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="ruma_1" value="Ruma 1" />
                            <TextInput id="ruma_1" type="number" step="any" className="mt-1 block w-full" value={data.ruma_1} onChange={e => setData('ruma_1', e.target.value)} />
                            <InputError message={errors.ruma_1} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="ruma_2" value="Ruma 2" />
                            <TextInput id="ruma_2" type="number" step="any" className="mt-1 block w-full" value={data.ruma_2} onChange={e => setData('ruma_2', e.target.value)} />
                            <InputError message={errors.ruma_2} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="ruma_3" value="Ruma 3" />
                            <TextInput id="ruma_3" type="number" step="any" className="mt-1 block w-full" value={data.ruma_3} onChange={e => setData('ruma_3', e.target.value)} />
                            <InputError message={errors.ruma_3} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="total_ruma" value="Total Ruma" />
                            <TextInput id="total_ruma" type="number" step="any" className="mt-1 block w-full" value={data.total_ruma} onChange={e => setData('total_ruma', e.target.value)} />
                            <InputError message={errors.total_ruma} className="mt-2" />
                        </div>

                        <div className="md:col-span-2 bg-green-50 p-3 rounded-lg border border-green-100 mt-2">
                            <InputLabel htmlFor="total_gabungan" value="Total Gabungan" />
                            <TextInput id="total_gabungan" type="number" step="any" className="mt-1 block w-full bg-white font-bold" value={data.total_gabungan} onChange={e => setData('total_gabungan', e.target.value)} />
                            <InputError message={errors.total_gabungan} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
