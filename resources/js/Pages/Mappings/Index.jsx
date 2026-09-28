import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Check, X, Search, Database, ArrowLeft, Store, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import CustomSelect from '@/Components/CustomSelect';

export default function Index({ auth, unmappedOutlets, outletMappings, masterOutlets, unmappedProviders, providerMappings, masterProviders }) {
    const [activeTab, setActiveTab] = useState('outlet');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOutlets, setSelectedOutlets] = useState({});
    const [selectedProviders, setSelectedProviders] = useState({});

    useEffect(() => {
        const initial = {};
        unmappedOutlets.forEach((item, idx) => {
            if (item.suggested_outlet_id) {
                initial[idx] = item.suggested_outlet_id;
            }
        });
        setSelectedOutlets(initial);
    }, [unmappedOutlets]);

    const handleConfirmOutlet = (rawName, outletId) => {
        router.post(route('outlet-mappings.store'), {
            raw_name: rawName,
            outlet_id: outletId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Pemetaan outlet berhasil disimpan',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        });
    };

    const handleIgnoreOutlet = (rawName) => {
        Swal.fire({
            title: 'Abaikan Typo?',
            text: `Apakah Anda yakin ingin mengabaikan typo "${rawName}"? Ini tidak akan dipetakan ke manapun.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Abaikan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('outlet-mappings.store'), {
                    raw_name: rawName,
                    outlet_id: null,
                    is_ignored: true
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Diabaikan!',
                            text: 'Nama berhasil diabaikan.',
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

    const handleDeleteOutlet = (id) => {
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
                router.delete(route('outlet-mappings.destroy', id), {
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

    const handleConfirmProvider = (rawName, providerId) => {
        router.post(route('provider-mappings.store'), {
            raw_name: rawName,
            provider_id: providerId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Pemetaan penyedia berhasil disimpan',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        });
    };

    const handleIgnoreProvider = (rawName) => {
        Swal.fire({
            title: 'Abaikan Typo?',
            text: `Apakah Anda yakin ingin mengabaikan typo "${rawName}"? Ini tidak akan dipetakan ke manapun.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Abaikan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('provider-mappings.store'), {
                    raw_name: rawName,
                    provider_id: null,
                    is_ignored: true
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Diabaikan!',
                            text: 'Nama penyedia berhasil diabaikan.',
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

    const handleDeleteProvider = (id) => {
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

    const filteredUnmappedOutlets = unmappedOutlets.filter(item => 
        item.raw_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUnmappedProviders = unmappedProviders.filter(item => 
        item.raw_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pemetaan Data</h2>}
        >
            <Head title="Pemetaan Data" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-full sm:w-fit overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('outlet')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                activeTab === 'outlet' 
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Store className="w-4 h-4" />
                            Pemetaan Outlet
                        </button>
                        <button
                            onClick={() => setActiveTab('provider')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                activeTab === 'provider' 
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Truck className="w-4 h-4" />
                            Pemetaan Penyedia
                        </button>
                    </div>

                    {activeTab === 'outlet' && (
                        <>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl p-6 border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Database className="w-5 h-5 text-indigo-600" />
                                            Outlet Belum Terpetakan ({unmappedOutlets.length})
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Nama outlet dari berbagai sumber data yang tidak cocok dengan master data.</p>
                                    </div>
                                    <div className="relative w-full md:w-64">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-sm"
                                            placeholder="Cari..."
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
                                                <th className="px-6 py-4 font-bold">Saran Master Outlet</th>
                                                <th className="px-6 py-4 font-bold">Kecocokan</th>
                                                <th className="px-6 py-4 font-bold rounded-tr-2xl text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUnmappedOutlets.length > 0 ? filteredUnmappedOutlets.map((item, idx) => (
                                                <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-red-600">
                                                        {item.raw_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="min-w-[200px]">
                                                            <CustomSelect 
                                                                value={selectedOutlets[idx] || ''} 
                                                                onChange={(val) => setSelectedOutlets(prev => ({ ...prev, [idx]: val }))} 
                                                                options={[
                                                                    { value: '', label: 'Pilih Outlet Benar...' },
                                                                    ...masterOutlets.map(mo => ({ value: mo.id, label: mo.name }))
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
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => {
                                                                    const val = selectedOutlets[idx];
                                                                    if (!val) {
                                                                        Swal.fire('Pilih outlet dulu', '', 'warning');
                                                                        return;
                                                                    }
                                                                    handleConfirmOutlet(item.raw_name, val);
                                                                }}
                                                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                                                            >
                                                                <Check className="w-4 h-4" /> Konfirmasi
                                                            </button>
                                                            <button 
                                                                onClick={() => handleIgnoreOutlet(item.raw_name)}
                                                                className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                                title="Abaikan Typo Ini"
                                                            >
                                                                <X className="w-4 h-4" /> Tidak
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                        Semua outlet sudah terpetakan atau tidak ada data yang dicari.
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
                                    Outlet Sudah Terpetakan ({outletMappings.length})
                                </h3>

                                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 font-bold rounded-tl-2xl">Nama Typo / Asal Data</th>
                                                <th className="px-6 py-4 font-bold">Master Outlet</th>
                                                <th className="px-6 py-4 font-bold rounded-tr-2xl text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {outletMappings.length > 0 ? outletMappings.map((mapping) => (
                                                <tr key={mapping.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {mapping.raw_name}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">
                                                        {mapping.is_ignored ? (
                                                            <span className="text-gray-400 italic text-xs bg-gray-100 px-2 py-1 rounded">Diabaikan</span>
                                                        ) : (
                                                            <span className="text-green-600">{mapping.outlet?.name || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleDeleteOutlet(mapping.id)}
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
                                                        Belum ada data pemetaan outlet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'provider' && (
                        <>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl p-6 border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Database className="w-5 h-5 text-indigo-600" />
                                            Penyedia Belum Terpetakan ({unmappedProviders.length})
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Nama penyedia dari berbagai sumber data yang tidak cocok dengan master data.</p>
                                    </div>
                                    <div className="relative w-full md:w-64">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-sm"
                                            placeholder="Cari..."
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
                                                <th className="px-6 py-4 font-bold">Pilih Master Penyedia</th>
                                                <th className="px-6 py-4 font-bold rounded-tr-2xl text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUnmappedProviders.length > 0 ? filteredUnmappedProviders.map((item, idx) => (
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
                                                                    { value: '', label: 'Pilih Penyedia Benar...' },
                                                                    ...masterProviders.map(mp => ({ value: mp.id, label: mp.name }))
                                                                ]}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => {
                                                                    const val = selectedProviders[idx];
                                                                    if (!val) {
                                                                        Swal.fire('Pilih penyedia dulu', '', 'warning');
                                                                        return;
                                                                    }
                                                                    handleConfirmProvider(item.raw_name, val);
                                                                }}
                                                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                                                            >
                                                                <Check className="w-4 h-4" /> Konfirmasi
                                                            </button>
                                                            <button 
                                                                onClick={() => handleIgnoreProvider(item.raw_name)}
                                                                className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                                title="Abaikan Typo Ini"
                                                            >
                                                                <X className="w-4 h-4" /> Tidak
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                        Semua penyedia sudah terpetakan atau tidak ada data yang dicari.
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
                                    Penyedia Sudah Terpetakan ({providerMappings.length})
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
                                            {providerMappings.length > 0 ? providerMappings.map((mapping) => (
                                                <tr key={mapping.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {mapping.raw_name}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">
                                                        {mapping.is_ignored ? (
                                                            <span className="text-gray-400 italic text-xs bg-gray-100 px-2 py-1 rounded">Diabaikan</span>
                                                        ) : (
                                                            <span className="text-green-600">{mapping.provider?.name || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleDeleteProvider(mapping.id)}
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
                                                        Belum ada data pemetaan penyedia.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
