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
import SearchableSelect from '@/Components/SearchableSelect';
import Swal from 'sweetalert2';

export default function Index({ auth, items, outlets, companies, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [filterSearch, setFilterSearch] = useState(filters?.search || '');
    const [filterPt, setFilterPt] = useState(filters?.pt || '');
    const [filterYear, setFilterYear] = useState(filters?.year || '');

    const applyFilter = () => {
        router.get(route('receivables.index'), {
            search: filterSearch,
            pt: filterPt,
            year: filterYear
        }, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        setFilterSearch('');
        setFilterPt('');
        setFilterYear('');
        router.get(route('receivables.index'));
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        nama_pt: '',
        nama_outlet: '',
        details: [{ year: new Date().getFullYear().toString(), amount: '' }]
    });

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                id: item.id,
                nama_pt: item.nama_pt || '',
                nama_outlet: item.nama_outlet || '',
                details: item.details && item.details.length > 0 ? item.details : [{ year: new Date().getFullYear().toString(), amount: '' }]
            });
        } else {
            setEditingItem(null);
            reset();
            setData('details', [{ year: new Date().getFullYear().toString(), amount: '' }]);
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

    // Generate year options from 2020 to 2030
    const yearOptions = Array.from({ length: 11 }, (_, i) => {
        const y = (2020 + i).toString();
        return { value: y, label: y };
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Data Piutang</h2>}
        >
            <Head title="Data Piutang" />

            <div className="pb-12 pt-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
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

                            <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-end">
                                <div className="w-full md:w-1/3">
                                    <InputLabel value="Cari Outlet" />
                                    <TextInput 
                                        type="text" 
                                        className="w-full mt-1" 
                                        placeholder="Nama Outlet..." 
                                        value={filterSearch} 
                                        onChange={e => setFilterSearch(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && applyFilter()}
                                    />
                                </div>
                                <div className="w-full md:w-1/4">
                                    <InputLabel value="Filter PT" />
                                    <div className="mt-1">
                                        <SearchableSelect 
                                            options={companies ? companies.map(c => ({ value: c.name, label: c.name })) : []}
                                            value={filterPt}
                                            onChange={val => setFilterPt(val)}
                                            placeholder="Semua PT"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-1/4">
                                    <InputLabel value="Filter Tahun" />
                                    <div className="mt-1">
                                        <SearchableSelect 
                                            options={yearOptions}
                                            value={filterYear}
                                            onChange={val => setFilterYear(val)}
                                            placeholder="Semua Tahun"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <PrimaryButton onClick={applyFilter} type="button">Filter</PrimaryButton>
                                    <SecondaryButton onClick={resetFilter} type="button">Reset</SecondaryButton>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama PT</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Outlet</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal Piutang</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Piutang</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.length > 0 ? items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_pt}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.nama_outlet}</td>
                                                <td className="px-6 py-4">
                                                    {item.details && item.details.map((d, i) => (
                                                        <div key={i} className="text-sm font-semibold mb-1">
                                                            {d.year}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.details && item.details.map((d, i) => (
                                                        <div key={i} className="text-sm mb-1">
                                                            Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((parseFloat(d.amount) || 0) / 100)}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                                                    Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((parseFloat(item.total) || 0) / 100)}
                                                </td>
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
                            <InputLabel htmlFor="nama_pt" value="Nama PT (Perusahaan)" />
                            <SearchableSelect
                                options={companies ? companies.map(c => ({ value: c.name, label: c.name })) : []}
                                value={data.nama_pt}
                                onChange={val => setData('nama_pt', val)}
                                placeholder="Pilih PT..."
                            />
                            <InputError message={errors.nama_pt} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="nama_outlet" value="Nama Outlet" />
                            <SearchableSelect
                                options={outlets ? outlets.map(o => ({ value: o.name, label: o.name })) : []}
                                value={data.nama_outlet}
                                onChange={val => setData('nama_outlet', val)}
                                placeholder="Pilih Outlet..."
                            />
                            <InputError message={errors.nama_outlet} className="mt-2" />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-700">Daftar Piutang per Tahun</h4>
                                <button type="button" onClick={() => setData('details', [...data.details, { year: new Date().getFullYear().toString(), amount: '' }])} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Tambah Tahun
                                </button>
                            </div>

                            {data.details.map((detail, index) => (
                                <div key={index} className="flex items-center gap-4 mb-3">
                                    <div className="w-1/3">
                                        <TextInput
                                            type="number"
                                            className="w-full"
                                            placeholder="Tahun (cth: 2023)"
                                            value={detail.year}
                                            onChange={e => {
                                                const newDetails = [...data.details];
                                                newDetails[index].year = e.target.value;
                                                setData('details', newDetails);
                                            }}
                                        />
                                    </div>
                                    <div className="w-full flex-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">Rp</span>
                                            </div>
                                            <TextInput
                                                type="text"
                                                className="w-full pl-9 font-mono text-right"
                                                placeholder="0,00"
                                                value={detail.amount ? new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(detail.amount) / 100) : ''}
                                                onChange={e => {
                                                    const rawValue = e.target.value.replace(/\D/g, '');
                                                    const newDetails = [...data.details];
                                                    newDetails[index].amount = rawValue;
                                                    setData('details', newDetails);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {data.details.length > 1 && (
                                        <button type="button" onClick={() => {
                                            const newDetails = data.details.filter((_, i) => i !== index);
                                            setData('details', newDetails);
                                        }} className="text-red-500 hover:text-red-700 p-2">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Total Piutang:</span>
                                <span className="text-xl font-bold text-green-700">
                                    Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((data.details.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)) / 100)}
                                </span>
                            </div>
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
