import ExportDropdown from '@/Components/ExportDropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Store, Plus, Edit, Trash2, X, Save, MapPin, Phone, User as UserIcon, Building, Briefcase, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import CustomSelect from '@/Components/CustomSelect';

export default function Index({ outlets, areas }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingOutlet, setEditingOutlet] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCity, setFilterCity] = useState('');

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredOutlets.map(o => o.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        Swal.fire({
            title: 'Hapus Outlet Terpilih?',
            text: `Anda akan menghapus ${selectedIds.length} outlet secara permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('outlets.bulkDestroy'), {
                    ids: selectedIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                    }
                });
            }
        });
    };

    const handleDeleteMapping = (mappingId, rawName) => {
        Swal.fire({
            title: 'Hapus Pemetaan?',
            text: `Typo "${rawName}" akan dihapus dari outlet ini.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('outlet-mappings.destroy', mappingId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setEditingOutlet(prev => ({
                            ...prev,
                            mappings: prev.mappings.filter(m => m.id !== mappingId)
                        }));
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

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        type: '',
        marketing_area_id: '',
        pic_name: '',
        pic_position: '',
        phone: '',
    });

    useEffect(() => {
        if (flash.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', customClass: { popup: 'rounded-2xl' } });
            setIsModalOpen(false);
            reset();
        }
        if (flash.error) {
            Swal.fire({ title: 'Gagal!', text: flash.error, icon: 'error', customClass: { popup: 'rounded-2xl' } });
        }
    }, [flash]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingOutlet(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (outlet) => {
        setIsEditMode(true);
        setEditingOutlet(outlet);
        setData({
            name: outlet.name || '',
            type: outlet.type || '',
            marketing_area_id: outlet.marketing_area_id || '',
            pic_name: outlet.pic_name || '',
            pic_position: outlet.pic_position || '',
            phone: outlet.phone || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Outlet?',
            text: "Data outlet ini akan dihapus secara permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('outlets.destroy', id), { preserveScroll: true });
            }
        });
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('outlets.update', editingOutlet.id), { preserveScroll: true });
        } else {
            post(route('outlets.store'), { preserveScroll: true });
        }
    };

    const types = [...new Set(outlets.map(o => o.type).filter(Boolean))].sort();
    const cities = [...new Set(outlets.map(o => (o.city || o.marketing_area?.name || '').toUpperCase()).filter(Boolean))].sort();

    const filteredOutlets = outlets.filter(outlet => {
        const outletCity = outlet.city || outlet.marketing_area?.name || '';
        const matchSearch = outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            outletCity.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType ? outlet.type === filterType : true;
        const matchCity = filterCity ? outletCity.toUpperCase() === filterCity : true;
        return matchSearch && matchType && matchCity;
    });

    const totalOutlet = outlets.length;
    const totalRS = outlets.filter(o => o.type === 'RS').length;
    const totalDinkes = outlets.filter(o => o.type === 'DINKES').length;
    const totalKlinik = outlets.filter(o => o.type === 'KLINIK').length;

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Data Outlet</h2>}
        >
            <Head title="Data Outlet" />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Cards Statistik */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Outlet</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalOutlet}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                            <Building className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Rumah Sakit (RS)</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalRS}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Dinas Kesehatan</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalDinkes}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Klinik</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalKlinik}</h4>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-center gap-4 mb-6">
                    <div className="shrink-0">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Store className="w-6 h-6 text-blue-600" />
                            Daftar Outlet
                        </h3>
                    </div>
                    <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 w-full 2xl:w-auto justify-end">
                        <div className="relative w-full md:w-56 shrink-0">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari nama atau kota..."
                                className="w-full pl-9 pr-4 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-40 shrink-0 relative z-20">
                            <CustomSelect
                                value={filterType}
                                onChange={setFilterType}
                                options={[
                                    { value: '', label: 'Semua Jenis' },
                                    ...types.map(t => ({ value: t, label: t }))
                                ]}
                            />
                        </div>
                        <div className="w-full md:w-40 shrink-0 relative z-10">
                            <CustomSelect
                                value={filterCity}
                                onChange={setFilterCity}
                                options={[
                                    { value: '', label: 'Semua Kota' },
                                    ...cities.map(c => ({ value: c, label: c }))
                                ]}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                            <div className="flex items-center gap-3">
                                <ExportDropdown pdfRoute={route('outlets.export.pdf')} excelRoute={route('outlets.export.excel')} />
                                <button 
                                onClick={() => router.get(route('outlet-mappings.index'))}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30 whitespace-nowrap text-sm"
                            >
                                <Store className="w-4 h-4" /> Pemetaan
                            </button>
                            {selectedIds.length > 0 && (
                                <button 
                                    onClick={handleBulkDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-red-500/30 whitespace-nowrap text-sm"
                                >
                                    <Trash2 className="w-4 h-4" /> Hapus ({selectedIds.length})
                                </button>
                            )}
                            <button 
                                onClick={openCreateModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap text-sm"
                            >
                                <Plus className="w-4 h-4" /> Tambah
                            </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center">
                                        <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredOutlets.length && filteredOutlets.length > 0} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                                    </th>
                                    <th className="px-6 py-4">Nama Outlet</th>
                                    <th className="px-6 py-4">Jenis</th>
                                    <th className="px-6 py-4">Kota/Kabupaten</th>
                                    <th className="px-6 py-4">Data PIC</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOutlets.map((outlet) => (
                                    <tr key={outlet.id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <input type="checkbox" checked={selectedIds.includes(outlet.id)} onChange={() => handleSelectOne(outlet.id)} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {outlet.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200">
                                                {outlet.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-700">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                {outlet.city || outlet.marketing_area?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {outlet.pic_name ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                                                        <UserIcon className="w-3 h-3 text-gray-400" /> {outlet.pic_name}
                                                    </span>
                                                    {outlet.pic_position && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Briefcase className="w-3 h-3 text-gray-400" /> {outlet.pic_position}
                                                        </span>
                                                    )}
                                                    {outlet.phone && (
                                                        <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                                            <Phone className="w-3 h-3" /> {outlet.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Tidak ada data PIC</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openEditModal(outlet)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit Outlet"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(outlet.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus Outlet"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {outlets.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">Belum ada data outlet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL FORM */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {isEditMode ? <Edit className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-blue-600"/>}
                                    {isEditMode ? 'Edit Outlet' : 'Tambah Outlet Baru'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={submitForm} className="p-6">
                                <div className="space-y-6">
                                    {/* Data Utama */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2"><Store className="w-4 h-4"/> Informasi Utama</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel value="Nama Outlet *" />
                                                <TextInput className="mt-1 block w-full" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Contoh: RSUD Kota..." />
                                                <InputError message={errors.name} className="mt-1" />
                                            </div>
                                            <div>
                                                <InputLabel value="Jenis Outlet *" />
                                                <CustomSelect 
                                                    value={data.type} 
                                                    onChange={value => setData('type', value)} 
                                                    options={[
                                                        { value: '', label: '-- Pilih Jenis --' },
                                                        { value: 'RS', label: 'Rumah Sakit (RS)' },
                                                        { value: 'DINKES', label: 'Dinas Kesehatan (DINKES)' },
                                                        { value: 'KLINIK', label: 'Klinik' },
                                                        { value: 'APOTEK', label: 'Apotek' },
                                                        { value: 'LAINNYA', label: 'Lainnya' }
                                                    ]}
                                                />
                                                <InputError message={errors.type} className="mt-1" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputLabel value="Kota / Kabupaten *" />
                                                <div className="relative mt-1">
                                                    <CustomSelect 
                                                        value={data.marketing_area_id} 
                                                        onChange={value => setData('marketing_area_id', value)} 
                                                        options={[
                                                            { value: '', label: '-- Pilih Kota/Kabupaten --' },
                                                            ...areas.map(area => ({ value: area.id, label: area.name.toUpperCase() }))
                                                        ]}
                                                        icon={MapPin}
                                                    />
                                                </div>
                                                <InputError message={errors.marketing_area_id} className="mt-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data PIC */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Data PIC (Opsional)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <InputLabel value="Nama PIC" />
                                                <TextInput className="mt-1 block w-full" value={data.pic_name} onChange={e => setData('pic_name', e.target.value)} placeholder="Contoh: dr. Budi Santoso" />
                                                <InputError message={errors.pic_name} className="mt-1" />
                                            </div>
                                            <div>
                                                <InputLabel value="Jabatan PIC" />
                                                <TextInput className="mt-1 block w-full" value={data.pic_position} onChange={e => setData('pic_position', e.target.value)} placeholder="Contoh: Kepala Pengadaan" />
                                                <InputError message={errors.pic_position} className="mt-1" />
                                            </div>
                                            <div>
                                                <InputLabel value="No. HP / WhatsApp" />
                                                <TextInput className="mt-1 block w-full" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="Contoh: 081234567890" />
                                                <InputError message={errors.phone} className="mt-1" />
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Data Pemetaan Nama */}
                                {isEditMode && editingOutlet?.mappings?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Store className="w-4 h-4" /> Daftar Typo yang Dipetakan ke Outlet ini:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {editingOutlet.mappings.map(m => (
                                                <span key={m.id} className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 pl-3 pr-1 py-1 rounded-lg text-sm font-medium">
                                                    {m.raw_name}
                                                    <button type="button" onClick={() => handleDeleteMapping(m.id, m.raw_name)} className="p-0.5 hover:bg-green-200 rounded text-green-600 hover:text-green-800 transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {isEditMode && (!editingOutlet?.mappings || editingOutlet.mappings.length === 0) && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 italic">Belum ada nama typo yang dipetakan ke outlet ini.</p>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3">Batal</SecondaryButton>
                                    <PrimaryButton disabled={processing} className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700">
                                        <Save className="w-4 h-4 mr-2" /> {isEditMode ? 'Simpan Perubahan' : 'Buat Outlet'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
