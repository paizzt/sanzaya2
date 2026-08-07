import ExportDropdown from '@/Components/ExportDropdown';
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { CreditCard, Plus, Edit, Trash2, TrendingUp, User as UserIcon, Database, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';
import Swal from 'sweetalert2';

export default function Index({ auth, items, providers, summary }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        provider_id: '',
        nominal: ''
    });

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                id: item.id,
                provider_id: item.provider_id || '',
                nominal: item.nominal || ''
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
        post(route('payables.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data hutang berhasil disimpan',
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
                router.delete(route('payables.destroy', id), {
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

    const chartData = Object.entries(summary?.hutang_detail || {}).map(([name, val]) => ({
        name: name,
        TotalHutang: val
    }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Data Hutang</h2>}
        >
            <Head title="Data Hutang" />

            <div className="pb-12 pt-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {summary && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0 flex-1 pr-4">
                                            <p className="text-sm font-semibold text-gray-500 truncate">Total Nominal</p>
                                            <h4 className="text-xl font-bold text-orange-700 mt-1 truncate" title={summary.total_nominal}>
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary.total_nominal)}
                                            </h4>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded-2xl">
                                            <TrendingUp className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">Total akumulasi nominal hutang</p>
                                </div>
                                
                                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0 flex-1 pr-4">
                                            <p className="text-sm font-semibold text-gray-500 truncate">Total Penyedia</p>
                                            <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summary.total_penyedia}>
                                                {summary.total_penyedia}
                                            </h4>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-2xl">
                                            <UserIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">Jumlah penyedia berbeda</p>
                                </div>

                                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0 flex-1 pr-4">
                                            <p className="text-sm font-semibold text-gray-500 truncate">Total Data</p>
                                            <h4 className="text-xl font-bold text-gray-900 mt-1 truncate" title={summary.total_data}>
                                                {summary.total_data}
                                            </h4>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-2xl">
                                            <Database className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">Jumlah baris data hutang tercatat</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-6">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-orange-600"/> Top 10 Hutang Penyedia</h4>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => `Rp ${val / 1000000}M`} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                            <RechartsTooltip cursor={{ fill: '#f9fafb' }} formatter={(val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)} />
                                            <Bar dataKey="TotalHutang" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                    Data Hutang
                                </h3>
                                <div className="flex items-center gap-3">
                                <ExportDropdown pdfRoute={route('payables.export.pdf')} excelRoute={route('payables.export.excel')} />
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Penyedia</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.length > 0 ? items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.provider ? item.provider.name : '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">
                                                    Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((parseFloat(item.nominal) || 0) / 100)}
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
                                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                                    Belum ada data hutang.
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

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="sm">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingItem ? 'Edit Data Hutang' : 'Tambah Data Hutang'}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <InputLabel htmlFor="provider_id" value="Nama Penyedia" />
                            <div className="mt-1">
                                <SearchableSelect
                                    options={providers ? providers.map(p => ({ value: p.id.toString(), label: p.name })) : []}
                                    value={data.provider_id ? data.provider_id.toString() : ''}
                                    onChange={val => setData('provider_id', val)}
                                    placeholder="Pilih Penyedia"
                                />
                            </div>
                            <InputError message={errors.provider_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nominal" value="Nominal" />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                </div>
                                <TextInput 
                                    id="nominal" 
                                    type="text" 
                                    className="block w-full pl-9 font-mono text-right" 
                                    placeholder="0,00"
                                    value={data.nominal ? new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(data.nominal) / 100) : ''} 
                                    onChange={e => {
                                        const rawValue = e.target.value.replace(/\D/g, '');
                                        setData('nominal', rawValue);
                                    }} 
                                />
                            </div>
                            <InputError message={errors.nominal} className="mt-2" />
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
