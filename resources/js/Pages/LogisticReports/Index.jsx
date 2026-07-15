import ExportDropdown from '@/Components/ExportDropdown';
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CustomDatePicker from '@/Components/CustomDatePicker';
import SearchableSelect from '@/Components/SearchableSelect';
import Swal from 'sweetalert2';

export default function Index({ auth, items, sales, outlets }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        tanggal: '',
        nama_sales: '',
        nama_outlet: '',
        nama_produk: '',
        total_sales: ''
    });

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                id: item.id,
                tanggal: item.tanggal || '',
                nama_sales: item.nama_sales || '',
                nama_outlet: item.nama_outlet || '',
                nama_produk: item.nama_produk || '',
                total_sales: item.total_sales || ''
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
        post(route('logistic-reports.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data laporan logistik berhasil disimpan',
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
                router.delete(route('logistic-reports.destroy', id), {
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan Logistik</h2>}
        >
            <Head title="Laporan Logistik" />

            <div className="pb-12 pt-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-500" />
                                    Data Laporan Logistik
                                </h3>
                                <div className="flex items-center gap-3">
                                <ExportDropdown pdfRoute={route('logistic-reports.export.pdf')} excelRoute={route('logistic-reports.export.excel')} />
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sales</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Outlet</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.length > 0 ? items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_sales}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_outlet}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_produk}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.total_sales}</td>
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
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                    Belum ada data laporan logistik.
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

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="3xl">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingItem ? 'Edit Data Logistik' : 'Tambah Data Logistik'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal" />
                            <div className="mt-1">
                                <CustomDatePicker
                                    value={data.tanggal}
                                    onChange={val => setData('tanggal', val)}
                                />
                            </div>
                            <InputError message={errors.tanggal} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="nama_sales" value="Nama Sales" />
                            <div className="mt-1">
                                <SearchableSelect
                                    options={sales ? sales.map(s => ({ value: s.name, label: s.name })) : []}
                                    value={data.nama_sales}
                                    onChange={val => setData('nama_sales', val)}
                                    placeholder="Pilih Sales"
                                />
                            </div>
                            <InputError message={errors.nama_sales} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nama_outlet" value="Nama Outlet" />
                            <div className="mt-1">
                                <SearchableSelect
                                    options={outlets ? outlets.map(o => ({ value: o.name, label: o.name })) : []}
                                    value={data.nama_outlet}
                                    onChange={val => setData('nama_outlet', val)}
                                    placeholder="Pilih Outlet"
                                />
                            </div>
                            <InputError message={errors.nama_outlet} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nama_produk" value="Nama Produk" />
                            <TextInput
                                id="nama_produk"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.nama_produk}
                                onChange={e => setData('nama_produk', e.target.value)}
                            />
                            <InputError message={errors.nama_produk} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="total_sales" value="Total" />
                            <TextInput
                                id="total_sales"
                                type="number"
                                step="any"
                                className="mt-1 block w-full"
                                value={data.total_sales}
                                onChange={e => setData('total_sales', e.target.value)}
                            />
                            <InputError message={errors.total_sales} className="mt-2" />
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
