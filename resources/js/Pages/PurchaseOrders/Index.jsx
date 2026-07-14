import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CustomDatePicker from '@/Components/CustomDatePicker';
import Swal from 'sweetalert2';

export default function Index({ auth, items }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        tanggal: '',
        nama_outlet: '',
        nama_produk: '',
        jumlah: '',
        satuan: '',
        total_faktur: '',
        terkirim: '',
        belum_terkirim: '',
        persen_terpenuhi: '',
        persen_belum_terpenuhi: '',
        keterangan: ''
    });

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                id: item.id,
                tanggal: item.tanggal || '',
                nama_outlet: item.nama_outlet || '',
                nama_produk: item.nama_produk || '',
                jumlah: item.jumlah || '',
                satuan: item.satuan || '',
                total_faktur: item.total_faktur || '',
                terkirim: item.terkirim || '',
                belum_terkirim: item.belum_terkirim || '',
                persen_terpenuhi: item.persen_terpenuhi || '',
                persen_belum_terpenuhi: item.persen_belum_terpenuhi || '',
                keterangan: item.keterangan || ''
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
        post(route('purchase-orders.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data surat pesanan berhasil disimpan',
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
                router.delete(route('purchase-orders.destroy', id), {
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Surat Pesanan</h2>}
        >
            <Head title="Surat Pesanan" />

            <div className="pb-12 pt-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Data Surat Pesanan
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Outlet</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Faktur</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.length > 0 ? items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_outlet}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_produk}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.jumlah}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.satuan}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.total_faktur}</td>
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
                                                    Belum ada data surat pesanan.
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
                        {editingItem ? 'Edit Data Surat Pesanan' : 'Tambah Data Surat Pesanan'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96 overflow-y-auto pr-2">
                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal" />
                            <CustomDatePicker value={data.tanggal} onChange={val => setData('tanggal', val)} />
                            <InputError message={errors.tanggal} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="nama_outlet" value="Nama Outlet" />
                            <TextInput id="nama_outlet" type="text" className="mt-1 block w-full" value={data.nama_outlet} onChange={e => setData('nama_outlet', e.target.value)} />
                            <InputError message={errors.nama_outlet} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nama_produk" value="Nama Produk" />
                            <TextInput id="nama_produk" type="text" className="mt-1 block w-full" value={data.nama_produk} onChange={e => setData('nama_produk', e.target.value)} />
                            <InputError message={errors.nama_produk} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="jumlah" value="Jumlah" />
                            <TextInput id="jumlah" type="number" className="mt-1 block w-full" value={data.jumlah} onChange={e => setData('jumlah', e.target.value)} />
                            <InputError message={errors.jumlah} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="satuan" value="Satuan" />
                            <TextInput id="satuan" type="text" className="mt-1 block w-full" value={data.satuan} onChange={e => setData('satuan', e.target.value)} />
                            <InputError message={errors.satuan} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="total_faktur" value="Total Faktur" />
                            <TextInput id="total_faktur" type="number" step="any" className="mt-1 block w-full" value={data.total_faktur} onChange={e => setData('total_faktur', e.target.value)} />
                            <InputError message={errors.total_faktur} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="terkirim" value="Terkirim" />
                            <TextInput id="terkirim" type="number" className="mt-1 block w-full" value={data.terkirim} onChange={e => setData('terkirim', e.target.value)} />
                            <InputError message={errors.terkirim} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="belum_terkirim" value="Belum Terkirim" />
                            <TextInput id="belum_terkirim" type="number" className="mt-1 block w-full" value={data.belum_terkirim} onChange={e => setData('belum_terkirim', e.target.value)} />
                            <InputError message={errors.belum_terkirim} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="persen_terpenuhi" value="Persen Terpenuhi (%)" />
                            <TextInput id="persen_terpenuhi" type="number" step="any" className="mt-1 block w-full" value={data.persen_terpenuhi} onChange={e => setData('persen_terpenuhi', e.target.value)} />
                            <InputError message={errors.persen_terpenuhi} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="persen_belum_terpenuhi" value="Persen Belum Terpenuhi (%)" />
                            <TextInput id="persen_belum_terpenuhi" type="number" step="any" className="mt-1 block w-full" value={data.persen_belum_terpenuhi} onChange={e => setData('persen_belum_terpenuhi', e.target.value)} />
                            <InputError message={errors.persen_belum_terpenuhi} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="keterangan" value="Keterangan" />
                            <TextInput id="keterangan" type="text" className="mt-1 block w-full" value={data.keterangan} onChange={e => setData('keterangan', e.target.value)} />
                            <InputError message={errors.keterangan} className="mt-2" />
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
