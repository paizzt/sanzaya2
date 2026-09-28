import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Check, X, Search, Database, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import CustomSelect from '@/Components/CustomSelect';

export default function Index({ auth, unmapped, mappings, masterProviders }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProviders, setSelectedProviders] = useState({});

    useEffect(() => {
        const initial = {};
        unmapped.forEach((item, idx) => {
            if (item.suggested_provider_id) {
                initial[idx] = item.suggested_provider_id;
            }
        });
        setSelectedProviders(initial);
    }, [unmapped]);

    const handleConfirm = (rawName, ProviderId) => {
        router.post(route('provider-mappings.store'), {
            raw_name: rawName,
            provider_id: ProviderId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Pemetaan Penyedia berhasil disimpan',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Pemetaan?',
            text: "Data yang dikembalikan ke status belum terpetakan",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('provider-mappings.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Pemetaan dihapus',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            toast: true,
                            position: 'top-end'
                        });
                    }
                });
            }
        });
    };

    const filteredUnmapped = unmapped.filter(item => 
        item.raw_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pemetaan Penyedia</h2>}
        >
            <Head title="Pemetaan Penyedia" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <div className="flex items-center">
                        <Link 
                            href={route('Providers.index')}
                            className="p-2.5 bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-gray-100 flex items-center justify-center w-fit"
                            title="Kembali ke Data Provider"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl p-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-indigo-600" />
                                    Provider Belum Terpetakan ({unmapped.length})
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Nama Provider dari berbagai sumber data yang tidak cocok dengan master data.</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-4 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold rounded-tl-2xl">Nama Typo / Asal Data</th>
                                        <th className="px-6 py-4 font-bold">Saran Master Penyedia</th>
                                        <th className="px-6 py-4 font-bold">Kecocokan</th>
                                        <th className="px-6 py-4 font-bold rounded-tr-2xl text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUnmapped.length > 0 ? filteredUnmapped.map((item, idx) => (
                                        <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-red-600">
                                                {item.raw_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="min-w-[200px]">
                                                    <CustomSelect 
                                                        value={selectedProviders[idx] || ''} 
                                                        onChange={(val) => setSelectedProviders(prev => ({ ...prev, [idx]: val }))} 
                                                        options={[
                                                            { value: '', label: 'Pilih Provider Benar...' },
                                                            ...masterProviders.map(mo => ({ value: mo.id, label: mo.name }))
                                                        ]}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    item.similarity >= 80 ? 'bg-green-100 text-green-800' : 
                                                    item.similarity >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.similarity}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => {
                                                        const val = selectedProviders[idx];
                                                        if (!val) {
                                                            Swal.fire('Pilih Provider dulu', '', 'warning');
                                                            return;
                                                        }
                                                        handleConfirm(item.raw_name, val);
                                                    }}
                                                    className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                                                >
                                                    <Check className="w-4 h-4" /> Konfirmasi
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                Semua Provider sudah terpetakan atau tidak ada data yang dicari.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            Provider Sudah Terpetakan ({mappings.length})
                        </h3>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold rounded-tl-2xl">Nama Typo / Asal Data</th>
                                        <th className="px-6 py-4 font-bold">Master Penyedia</th>
                                        <th className="px-6 py-4 font-bold rounded-tr-2xl text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mappings.length > 0 ? mappings.map((mapping) => (
                                        <tr key={mapping.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {mapping.raw_name}
                                            </td>
                                            <td className="px-6 py-4 text-green-600 font-medium">
                                                {mapping.Provider?.name}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(mapping.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Hapus Pemetaan"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                Belum ada data pemetaan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
