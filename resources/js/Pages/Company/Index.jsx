import ExportDropdown from '@/Components/ExportDropdown';
import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Building, Upload, Save, Building2, MapPin, Plus, Edit, Trash2, X, Target } from 'lucide-react';
import Swal from 'sweetalert2';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

const formatCurrencyInput = (value) => {
    if (!value && value !== 0) return '';
    
    // Convert to string and take only the integer part if it has decimals (like "1000.00" from DB)
    let stringValue = value.toString().split('.')[0];
    
    let valStr = stringValue.replace(/[^0-9]/g, '');
    if (!valStr) return '';
    return 'Rp ' + parseInt(valStr, 10).toLocaleString('id-ID');
};

const parseCurrencyInput = (value) => {
    if (!value) return '';
    return value.toString().replace(/[^0-9]/g, '');
};

export default function Index({ auth, companies, companyTargets = [], is_super_admin }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const logoInputRef = useRef(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        radius: 300,
        logo: null,
    });

    const [targetModalOpen, setTargetModalOpen] = useState(false);
    const [currentTargetId, setCurrentTargetId] = useState(null);
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const { data: targetData, setData: setTargetData, post: postTarget, put: putTarget, delete: destroyTarget, processing: targetProcessing, errors: targetErrors, reset: resetTarget } = useForm({
        name: '',
        monthly_target: '',
        annual_target: '',
        company_ids: []
    });

    const openTargetModal = (target = null) => {
        if (target) {
            setIsEditingTarget(true);
            setCurrentTargetId(target.id);
            setTargetData({
                name: target.name,
                monthly_target: target.monthly_target ? parseInt(target.monthly_target, 10).toString() : '',
                annual_target: target.annual_target ? parseInt(target.annual_target, 10).toString() : '',
                company_ids: target.companies ? target.companies.map(c => c.id) : []
            });
        } else {
            setIsEditingTarget(false);
            setCurrentTargetId(null);
            resetTarget();
        }
    };

    const submitTarget = (e) => {
        e.preventDefault();
        const routeName = isEditingTarget ? route('company-targets.update', currentTargetId) : route('company-targets.store');
        
        postTarget(routeName, {
            preserveScroll: true,
            onSuccess: () => {
                resetTarget();
                setIsEditingTarget(false);
                setCurrentTargetId(null);
                Swal.fire({ title: 'Berhasil!', text: 'Target grup berhasil disimpan.', icon: 'success', customClass: { popup: 'rounded-2xl' } });
            }
        });
    };

    const handleDeleteTarget = (id) => {
        Swal.fire({
            title: 'Hapus Grup Target?',
            text: 'Data target ini akan dihapus.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                destroyTarget(route('company-targets.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Target berhasil dihapus.', 'success');
                        if (currentTargetId === id) {
                            resetTarget();
                            setIsEditingTarget(false);
                            setCurrentTargetId(null);
                        }
                    }
                });
            }
        });
    };

    const openModal = (company = null) => {
        if (company) {
            setIsEditing(true);
            setCurrentId(company.id);
            setData({
                name: company.name,
                address: company.address || '',
                latitude: company.latitude || '',
                longitude: company.longitude || '',
                radius: company.radius || 300,
                logo: null,
            });
            setLogoPreview(company.logo ? `/storage/${company.logo}` : null);
        } else {
            setIsEditing(false);
            setCurrentId(null);
            reset();
            setLogoPreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setLogoPreview(null);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Using post for update because of multipart/form-data file upload in Laravel
            post(route('company.update', currentId), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Data perusahaan berhasil diperbarui.',
                        icon: 'success',
                        confirmButtonColor: '#3b82f6',
                    });
                },
            });
        } else {
            post(route('company.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Perusahaan baru berhasil ditambahkan.',
                        icon: 'success',
                        confirmButtonColor: '#3b82f6',
                    });
                },
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data perusahaan ini akan dihapus secara permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('company.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Data perusahaan berhasil dihapus.', 'success');
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Data Perusahaan</h2>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className="w-full">
                            <ExportDropdown pdfRoute={route('company.export.pdf')} excelRoute={route('company.export.excel')} className="w-full justify-center" />
                        </div>
                        {is_super_admin && (
                            <PrimaryButton onClick={() => setTargetModalOpen(true)} className="w-full justify-center h-[42px] whitespace-nowrap bg-blue-600 hover:bg-blue-700">
                                <Target className="w-4 h-4 mr-2" />
                                Target
                            </PrimaryButton>
                        )}
                        <PrimaryButton onClick={() => openModal()} className="w-full justify-center h-[42px] whitespace-nowrap">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Data Perusahaan" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            {companies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {companies.map((company) => (
                                        <div key={company.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                                            <div className="p-6 flex-1 flex flex-col items-center text-center">
                                                <div className="w-24 h-24 mb-4 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50 shadow-inner">
                                                    {company.logo ? (
                                                        <img src={`/storage/${company.logo}`} alt={company.name} className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <Building2 className="w-10 h-10 text-gray-300" />
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-1">{company.name}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                                    {company.address || <span className="italic text-gray-400">Belum ada alamat</span>}
                                                </p>
                                                {company.latitude && company.longitude && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>Radius: {company.radius || 300}m</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end gap-2">
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => openModal(company)}
                                                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors gap-1"
                                                    >
                                                        <Edit className="w-4 h-4" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(company.id)}
                                                        className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors gap-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 px-4">
                                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Perusahaan</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mb-6">Tambahkan profil perusahaan Anda untuk menggunakannya dalam manajemen pengguna dan dokumen lainnya.</p>
                                    <button
                                        onClick={() => openModal()}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white tracking-widest hover:bg-blue-700 transition ease-in-out duration-150 shadow-sm"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Tambah Perusahaan Pertama
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 border-b pb-4 gap-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {isEditing ? 'Edit Data Perusahaan' : 'Tambah Perusahaan Baru'}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo Perusahaan
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className={`w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 transition-all ${logoPreview ? 'border-blue-300' : 'border-gray-300 hover:border-blue-400'}`}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <span className="text-xs text-gray-500">Belum ada logo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Pilih Gambar
                                    </button>
                                    <p className="mt-2 text-xs text-gray-500">Maksimal ukuran 2MB. Format JPG, PNG.</p>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    <InputError message={errors.logo} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Nama Perusahaan */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Perusahaan
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Alamat */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Alamat
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={4}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                            </div>
                            <InputError message={errors.address} className="mt-2" />
                        </div>

                        {/* Lokasi */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude
                                </label>
                                <input
                                    id="latitude"
                                    type="text"
                                    value={data.latitude}
                                    onChange={(e) => setData('latitude', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Contoh: -6.200000"
                                />
                                <InputError message={errors.latitude} className="mt-2" />
                            </div>
                            <div>
                                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude
                                </label>
                                <input
                                    id="longitude"
                                    type="text"
                                    value={data.longitude}
                                    onChange={(e) => setData('longitude', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Contoh: 106.816666"
                                />
                                <InputError message={errors.longitude} className="mt-2" />
                            </div>
                            <div>
                                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
                                    Radius (Meter)
                                </label>
                                <input
                                    id="radius"
                                    type="number"
                                    min="1"
                                    value={data.radius}
                                    onChange={(e) => setData('radius', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <InputError message={errors.radius} className="mt-2" />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 shrink-0"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Target Edit Modal */}
            <Modal show={targetModalOpen} onClose={() => setTargetModalOpen(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="text-xl font-bold text-gray-800">Atur Target Perusahaan</h3>
                        <button type="button" onClick={() => setTargetModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {!isEditingTarget ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-gray-700">Daftar Grup Target</h4>
                                <PrimaryButton onClick={() => openTargetModal({})} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah
                                </PrimaryButton>
                            </div>
                            
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {companyTargets.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Belum ada grup target perusahaan. Buat target baru untuk mengelompokkan PT.</p>
                                ) : (
                                    companyTargets.map(target => (
                                        <div key={target.id} className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50">
                                            <div>
                                                <h5 className="font-bold text-lg text-gray-900">{target.name}</h5>
                                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                    <p>Bulanan: <span className="font-medium text-gray-800">{formatCurrencyInput(target.monthly_target)}</span></p>
                                                    <p>Tahunan: <span className="font-medium text-gray-800">{formatCurrencyInput(target.annual_target)}</span></p>
                                                    <div className="mt-2 text-xs">
                                                        <span className="font-semibold">PT Gabungan: </span> 
                                                        {target.companies && target.companies.length > 0 ? (
                                                            target.companies.map(c => c.name).join(', ')
                                                        ) : (
                                                            <span className="italic text-gray-400">Belum ada PT tergabung</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openTargetModal(target)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteTarget(target.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <form onSubmit={submitTarget}>
                            <h4 className="font-semibold text-gray-700 mb-4">{currentTargetId ? 'Edit Target' : 'Buat Target Baru'}</h4>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel value="Nama Grup Target" className="mb-2" />
                                    <TextInput 
                                        type="text" 
                                        className="block w-full rounded-xl bg-gray-50 border-gray-200" 
                                        value={targetData.name} 
                                        onChange={e => setTargetData('name', e.target.value)}
                                        placeholder="Misal: Grup Sanzaya"
                                        required
                                    />
                                    <InputError message={targetErrors.name} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Target Bulanan" className="mb-2" />
                                        <TextInput 
                                            type="text" 
                                            className="block w-full rounded-xl bg-gray-50 border-gray-200" 
                                            value={formatCurrencyInput(targetData.monthly_target)} 
                                            onChange={e => setTargetData('monthly_target', parseCurrencyInput(e.target.value))}
                                            placeholder="Rp 0"
                                        />
                                        <InputError message={targetErrors.monthly_target} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Target Tahunan" className="mb-2" />
                                        <TextInput 
                                            type="text" 
                                            className="block w-full rounded-xl bg-gray-50 border-gray-200" 
                                            value={formatCurrencyInput(targetData.annual_target)} 
                                            onChange={e => setTargetData('annual_target', parseCurrencyInput(e.target.value))}
                                            placeholder="Rp 0"
                                        />
                                        <InputError message={targetErrors.annual_target} className="mt-2" />
                                    </div>
                                </div>
                                
                                <div>
                                    <InputLabel value="Pilih PT yang Digabungkan (Bisa lebih dari 1)" className="mb-2" />
                                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 max-h-48 overflow-y-auto space-y-2">
                                        {companies.map(company => (
                                            <label key={company.id} className="flex items-center space-x-3 bg-white p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                                    checked={targetData.company_ids.includes(company.id)}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked 
                                                            ? [...targetData.company_ids, company.id]
                                                            : targetData.company_ids.filter(id => id !== company.id);
                                                        setTargetData('company_ids', newIds);
                                                    }}
                                                />
                                                <span className="text-gray-700 font-medium">{company.name}</span>
                                            </label>
                                        ))}
                                        {companies.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada data perusahaan.</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsEditingTarget(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                    Batal
                                </button>
                                <PrimaryButton type="submit" disabled={targetProcessing} className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {targetProcessing ? 'Menyimpan...' : 'Simpan'}
                                </PrimaryButton>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
