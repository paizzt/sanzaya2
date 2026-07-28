import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Check, X, Search, Database, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import CustomSelect from '@/Components/CustomSelect';

export default function Index({ auth, unmapped, mappings, masterOutlets }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOutlets, setSelectedOutlets] = useState({});

    useEffect(() => {
        const initial = {};
        unmapped.forEach((item, idx) => {
            if (item.suggested_outlet_id) {
                initial[idx] = item.suggested_outlet_id;
            }
        });
        setSelectedOutlets(initial);
    }, [unmapped]);

    const handleConfirm = (rawName, outletId) => {
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

    const filteredUnmapped = unmapped.filter(item => 
        item.raw_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pemetaan Outlet</h2>}
        >
            <Head title="Pemetaan Outlet" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <div className="flex items-center">
                        <button 
                            onClick={() => router.get(route('outlets.index'))}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-5 h-5" /> Kembali ke Data Outlet
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl p-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-indigo-600" />
                                    Outlet Belum Terpetakan ({unmapped.length})
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Nama dari spreadsheet yang tidak cocok dengan master data.</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari nama typo..."
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
                                        <th className="px-6 py-4 font-bold rounded-tl-2xl">Nama Typo (Spreadsheet)</th>
                                        <th className="px-6 py-4 font-bold">Saran Master Outlet</th>
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
                                                <button 
                                                    onClick={() => {
                                                        const val = selectedOutlets[idx];
                                                        if (!val) {
                                                            Swal.fire('Pilih outlet dulu', '', 'warning');
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
                            Outlet Sudah Terpetakan ({mappings.length})
                        </h3>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold rounded-tl-2xl">Nama Typo (Spreadsheet)</th>
                                        <th className="px-6 py-4 font-bold">Master Outlet</th>
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
                                                {mapping.outlet?.name}
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
