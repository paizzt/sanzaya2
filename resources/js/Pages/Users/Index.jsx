import ExportDropdown from '@/Components/ExportDropdown';
import ClientPagination from '@/Components/ClientPagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Users, Plus, Edit, Trash2, X, Save, Lock, User, Briefcase, MapPin, Building, ShieldCheck, Mail, ToggleRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import CustomSelect from '@/Components/CustomSelect';
import CustomDatePicker from '@/Components/CustomDatePicker';
import CurrencyInput from '@/Components/CurrencyInput';

export default function Index({ users, divisions, positions, areas, roles, companies, featureToggles, userFeatures, spreadsheetSalesNames }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUser, setPreviewUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchUserTerm, setSearchUserTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
        division_id: '',
        position_id: '',
        marketing_areas: [],
        company_id: '',
        feature_toggles: [],
        spreadsheet_sales_name: '',
        monthly_target: '',
        
        // Employee Details
        nik: '',
        start_date: '',
        address: '',
        employee_id: '',
        phone: '',
        salary: '',
        operational_allowance: '',
        employment_status: '',
        education: '',
        emergency_contact: '',
        bpjs_kesehatan: '',
        bpjs_ketenagakerjaan: '',
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
        setEditingUser(null);
        reset();
        setData('feature_toggles', featureToggles.map(f => f.id));
        setSearchTerm('');
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditMode(true);
        setEditingUser(user);
        setSearchTerm('');
        
        const enabledFeatureIds = [];
        featureToggles.forEach(f => {
            if (userFeatures[user.id] && userFeatures[user.id][f.id]) {
                enabledFeatureIds.push(f.id);
            }
        });

        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
            division_id: user.division_id || '',
            position_id: user.position_id || '',
            marketing_areas: user.marketing_areas ? user.marketing_areas.map(a => a.id) : [],
            company_id: user.company_id || '',
            feature_toggles: enabledFeatureIds,
            spreadsheet_sales_name: user.spreadsheet_sales_name || '',
            monthly_target: user.monthly_target || '',
            
            // Employee Details
            nik: user.nik || '',
            start_date: user.start_date || '',
            address: user.address || '',
            employee_id: user.employee_id || '',
            phone: user.phone || '',
            salary: user.salary || '',
            operational_allowance: user.operational_allowance || '',
            employment_status: user.employment_status || '',
            education: user.education || '',
            emergency_contact: user.emergency_contact || '',
            bpjs_kesehatan: user.bpjs_kesehatan || '',
            bpjs_ketenagakerjaan: user.bpjs_ketenagakerjaan || '',
        });
        setIsModalOpen(true);
    };

    const openPreviewModal = (user) => {
        setPreviewUser(user);
        setIsPreviewModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Pengguna?',
            text: "Akun ini akan dihapus secara permanen dan tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('users.destroy', id), { preserveScroll: true });
            }
        });
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('users.update', editingUser.id), { preserveScroll: true });
        } else {
            post(route('users.store'), { preserveScroll: true });
        }
    };

    const toggleFeature = (featureId) => {
        const currentToggles = [...data.feature_toggles];
        if (currentToggles.includes(featureId)) {
            setData('feature_toggles', currentToggles.filter(id => id !== featureId));
        } else {
            setData('feature_toggles', [...currentToggles, featureId]);
        }
    };

    const toggleArea = (areaId) => {
        const currentAreas = [...data.marketing_areas];
        if (currentAreas.includes(areaId)) {
            setData('marketing_areas', currentAreas.filter(id => id !== areaId));
        } else {
            setData('marketing_areas', [...currentAreas, areaId]);
        }
    };

    const filteredAreas = areas.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchUserTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
        (user.roles && user.roles.length > 0 && user.roles[0].name.toLowerCase().includes(searchUserTerm.toLowerCase())) ||
        (user.company && user.company.name.toLowerCase().includes(searchUserTerm.toLowerCase()))
    );

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Manajemen Pengguna</h2>}
        >
            <Head title="Pengguna" />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-600" />
                            Daftar Karyawan & Admin
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Kelola akses, jabatan, divisi, PT, dan saklar fitur pengguna.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <input 
                                type="text"
                                value={searchUserTerm}
                                onChange={(e) => { setSearchUserTerm(e.target.value); setCurrentPage(1); }}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm text-sm px-4 py-2.5 w-full sm:w-64"
                            />
                        </div>
                        <ExportDropdown pdfRoute={route('users.export.pdf')} excelRoute={route('users.export.excel')} />
                                <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 w-full sm:w-auto whitespace-nowrap shrink-0"
                    >
                        <Plus className="w-5 h-5" /> Tambah Pengguna
                    </button>
                            </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Nama Lengkap</th>
                                    <th className="px-6 py-4">Kontak / Akun</th>
                                    <th className="px-6 py-4">Perusahaan & Role</th>
                                    <th className="px-6 py-4">Jabatan & Divisi</th>
                                    <th className="px-6 py-4">Area Marketing</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                                            <tr 
                                                key={user.id} 
                                                onClick={() => openPreviewModal(user)}
                                                className="bg-white border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-gray-900 font-medium">{user.email}</span>
                                                        {user.spreadsheet_sales_name && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 w-max">
                                                                Sales: {user.spreadsheet_sales_name}
                                                            </span>
                                                        )}
                                                        {user.monthly_target && (
                                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 w-max font-medium mt-1">
                                                                Target: Rp {new Intl.NumberFormat('id-ID').format(user.monthly_target)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        {user.company && (
                                                            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Building className="w-3 h-3"/> {user.company.name}</span>
                                                        )}
                                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200">
                                                            {user.roles && user.roles.length > 0 ? user.roles[0].name : 'Tidak ada role'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(!user.roles || (user.roles.length > 0 && user.roles[0].name !== 'Superadmin')) ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-700">{user.position?.name || '-'}</span>
                                                            <span className="text-xs text-gray-500">{user.division?.name || '-'}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">Semua Akses</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.marketing_areas && user.marketing_areas.length > 0 ? (
                                                            user.marketing_areas.map(area => (
                                                                <span key={area.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                                                                    {area.name}
                                                                </span>
                                                            ))
                                                        ) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit Pengguna"><Edit className="w-4 h-4" /></button>
                                                        {usePage().props.auth.user.id !== user.id && (
                                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus Pengguna"><Trash2 className="w-4 h-4" /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    Belum ada pengguna terdaftar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        
                    {filteredUsers.length > 0 && (
                        <ClientPagination 
                            total={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>

                {/* MODAL FORM */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start pt-10 pb-10 px-4 bg-gray-900/50 backdrop-blur-sm custom-scrollbar">
                        <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl transform transition-all my-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {isEditMode ? <Edit className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-blue-600"/>}
                                    {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={submitForm} className="p-6">
                                <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        
                                        {/* KOLOM 1 & 2: Data Akun & Pekerjaan */}
                                        <div className={`space-y-6 ${data.role && (data.role.toLowerCase() === 'marketing' || data.role.toLowerCase() === 'sales') ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Data Akun */}
                                                <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2"><User className="w-4 h-4"/> Data Akun</h4>
                                                <div>
                                                    <InputLabel value="Nama Lengkap *" />
                                                    <TextInput className="mt-1 block w-full" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                                    <InputError message={errors.name} className="mt-1" />
                                                </div>
                                                <div>
                                                    <InputLabel value="Username / Email *" />
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <TextInput type="text" className="mt-1 block w-full pl-9" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                                    </div>
                                                    <InputError message={errors.email} className="mt-1" />
                                                </div>
                                                <div>
                                                    <InputLabel value={isEditMode ? "Password (Kosongkan jika tidak diubah)" : "Password *"} />
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <TextInput type="text" className="mt-1 block w-full pl-9" value={data.password} onChange={e => setData('password', e.target.value)} required={!isEditMode} />
                                                    </div>
                                                    <InputError message={errors.password} className="mt-1" />
                                                </div>
                                                <div>
                                                    <InputLabel value="Perusahaan (PT)" />
                                                    <CustomSelect 
                                                        icon={Building}
                                                        value={data.company_id}
                                                        onChange={val => setData('company_id', val)}
                                                        options={companies.map(c => ({ value: c.id, label: c.name }))}
                                                        />
                                                    <InputError message={errors.company_id} className="mt-1" />
                                                </div>
                                            </div>

                                            {/* Data Pekerjaan */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Pekerjaan & Akses</h4>
                                                <div>
                                                    <InputLabel value="Akses (Role) *" />
                                                    <CustomSelect 
                                                        icon={ShieldCheck}
                                                        value={data.role}
                                                        onChange={val => setData('role', val)}
                                                        options={roles.map(r => ({ value: r.name, label: r.name }))}
                                                        />
                                                    <InputError message={errors.role} className="mt-1" />
                                                </div>
                                                
                                                <div>
                                                    <InputLabel value="Tautkan ke Nama Sales Spreadsheet (Opsional)" />
                                                    <CustomSelect 
                                                        value={data.spreadsheet_sales_name}
                                                        onChange={val => setData('spreadsheet_sales_name', val)}
                                                        options={spreadsheetSalesNames.map((name) => ({ value: name, label: name }))}
                                                        />
                                                    <InputError message={errors.spreadsheet_sales_name} className="mt-1" />
                                                    <p className="text-xs text-gray-500 mt-1">Pilih nama ini untuk mengaitkan akun dengan data logistik di spreadsheet.</p>
                                                </div>

                                                {data.role && data.role.toLowerCase() === 'sales' && (
                                                    <div>
                                                        <InputLabel value="Target Bulanan (Rp) (Opsional)" />
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">Rp</span>
                                                            <CurrencyInput 
                                                                className="mt-1 block w-full pl-9" 
                                                                value={data.monthly_target} 
                                                                onChange={val => setData('monthly_target', val)} 
                                                            />
                                                        </div>
                                                        <InputError message={errors.monthly_target} className="mt-1" />
                                                        <p className="text-xs text-gray-500 mt-1">Isi hanya angka, tanpa titik atau koma.</p>
                                                    </div>
                                                )}
                                                
                                                <>
                                                    <div>
                                                        <InputLabel value="Jabatan" />
                                                        <CustomSelect 
                                                            value={data.position_id}
                                                            onChange={val => setData('position_id', val)}
                                                            options={positions.map(p => ({ value: p.id, label: p.name }))}
                                                            />
                                                        <InputError message={errors.position_id} className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Divisi" />
                                                        <CustomSelect 
                                                            value={data.division_id}
                                                            onChange={val => setData('division_id', val)}
                                                            options={divisions.map(d => ({ value: d.id, label: d.name }))}
                                                            />
                                                        <InputError message={errors.division_id} className="mt-1" />
                                                    </div>
                                                </>
                                                </div>
                                            </div>

                                            {/* Data Pribadi & Karyawan */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                                {/* Kiri: Identitas Pribadi */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2"><User className="w-4 h-4"/> Data Pribadi</h4>
                                                    <div>
                                                        <InputLabel value="NIK (KTP)" />
                                                        <TextInput className="mt-1 block w-full" value={data.nik} onChange={e => setData('nik', e.target.value)} />
                                                        <InputError message={errors.nik} className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Alamat Domisili" />
                                                        <TextInput className="mt-1 block w-full" value={data.address} onChange={e => setData('address', e.target.value)} />
                                                        <InputError message={errors.address} className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Pendidikan Terakhir" />
                                                        <TextInput className="mt-1 block w-full" value={data.education} onChange={e => setData('education', e.target.value)} />
                                                        <InputError message={errors.education} className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="No. HP / WhatsApp" />
                                                        <TextInput className="mt-1 block w-full" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                                        <InputError message={errors.phone} className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Kontak Darurat (Nama & No HP)" />
                                                        <TextInput className="mt-1 block w-full" value={data.emergency_contact} onChange={e => setData('emergency_contact', e.target.value)} />
                                                        <InputError message={errors.emergency_contact} className="mt-1" />
                                                    </div>
                                                </div>

                                                {/* Kanan: Kepegawaian & Finansial */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Kepegawaian & Finansial</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <InputLabel value="No. Karyawan" />
                                                            <TextInput className="mt-1 block w-full" value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} />
                                                            <InputError message={errors.employee_id} className="mt-1" />
                                                        </div>
                                                        <div>
                                                            <InputLabel value="Tanggal Masuk" />
                                                            <div className="mt-1">
                                                                <CustomDatePicker value={data.start_date} onChange={val => setData('start_date', val)} />
                                                            </div>
                                                            <InputError message={errors.start_date} className="mt-1" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <InputLabel value="Status Karyawan" />
                                                        <CustomSelect 
                                                            value={data.employment_status} 
                                                            onChange={val => setData('employment_status', val)}
                                                            options={[
                                                                { value: 'PKWT', label: 'PKWT (Kontrak)' },
                                                                { value: 'PKWTT', label: 'PKWTT (Tetap)' },
                                                                { value: 'Probation', label: 'Probation' },
                                                            ]}
                                                            />
                                                        <InputError message={errors.employment_status} className="mt-1" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <InputLabel value="Gaji Pokok (Rp)" />
                                                            <CurrencyInput className="mt-1 block w-full" value={data.salary} onChange={val => setData('salary', val)} />
                                                            <InputError message={errors.salary} className="mt-1" />
                                                        </div>
                                                        <div>
                                                            <InputLabel value="Operasional (Rp)" />
                                                            <CurrencyInput className="mt-1 block w-full" value={data.operational_allowance} onChange={val => setData('operational_allowance', val)} />
                                                            <InputError message={errors.operational_allowance} className="mt-1" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <InputLabel value="BPJS Kesehatan" />
                                                            <TextInput className="mt-1 block w-full" value={data.bpjs_kesehatan} onChange={e => setData('bpjs_kesehatan', e.target.value)} />
                                                            <InputError message={errors.bpjs_kesehatan} className="mt-1" />
                                                        </div>
                                                        <div>
                                                            <InputLabel value="BPJS Ketenagakerjaan" />
                                                            <TextInput className="mt-1 block w-full" value={data.bpjs_ketenagakerjaan} onChange={e => setData('bpjs_ketenagakerjaan', e.target.value)} />
                                                            <InputError message={errors.bpjs_ketenagakerjaan} className="mt-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        {/* Saklar Fitur (Toggles) */}
                                        <div className="space-y-6 pt-6 border-t border-gray-100">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><ToggleRight className="w-5 h-5 text-indigo-500"/> Manajemen Akses Fitur</h4>
                                            
                                            {(() => {
                                                const groups = {
                                                    "Dashboard": [{ label: "Dashboard", db: "Dashboard" }],
                                                    "Absensi": [
                                                        { label: "Ambil Absensi", db: "Ambil Absensi" },
                                                        { label: "Izin/Sakit", db: "Izin / Sakit" }
                                                    ],
                                                    "Marketing": [
                                                        { label: "Form Marketing", db: "Form Marketing" },
                                                        { label: "Rekap Marketing", db: "Rekap Marketing" },
                                                        { label: "Cari Produk", db: "Cari Produk" }
                                                    ],
                                                    "Pengajuan": [
                                                        { label: "Form UC", db: "Menu Pengajuan UC" },
                                                        { label: "Riwayat UC", db: "Riwayat UC" },
                                                        { label: "Persetujuan UC", db: "Menu Persetujuan UC" },
                                                        { label: "Input BHP", db: "Menu Pengajuan BHP" },
                                                        { label: "Rekap BHP", db: "Rekap BHP" },
                                                        { label: "Pengajuan Pembayaran", db: "Menu Pengajuan Pembayaran" }
                                                    ],
                                                    "Finance": [
                                                        { label: "Data Hutang", db: "Data Hutang" },
                                                        { label: "Data Piutang", db: "Data Piutang" },
                                                        { label: "Persetujuan Pembayaran", db: "Persetujuan Pembayaran" }
                                                    ],
                                                    "Logistik": [
                                                        { label: "Laporan Logistik", db: "Laporan Logistik" },
                                                        { label: "Surat Pesanan", db: "Surat Pesanan" },
                                                        { label: "Data Penyedia", db: "Data Penyedia" },
                                                        { label: "Data Produk", db: "Data Produk" },
                                                        { label: "Kebutuhan Barang", db: "Kebutuhan Barang" },
                                                        { label: "Data Outlet", db: "Data Outlet" },
                                                        { label: "Pemetaan Outlet", db: "Pemetaan Outlet" }
                                                    ],
                                                    "Manajemen": [
                                                        { label: "Data Armada", db: "Data Armada" },
                                                        { label: "Data Perusahaan", db: "Data Perusahaan" },
                                                        { label: "Data Pengguna", db: "Data Pengguna" },
                                                        { label: "Manajemen SOP", db: "Manajemen SOP" },
                                                        { label: "Rekap Absensi", db: "Rekap Absensi" }
                                                    ],
                                                    "Sistem": [
                                                        { label: "Riwayat Perubahan", db: "Riwayat Perubahan" },
                                                        { label: "Notifikasi", db: "Notifikasi" },
                                                        { label: "Profil & Akun", db: "Profil & Akun" }
                                                    ],
                                                    "Spreadsheet": [
                                                        { label: "Data Laporan Tersinkronisasi", db: "Data Laporan Tersinkronisasi" },
                                                        { label: "Dashboard Laporan", db: "Dashboard Laporan" }
                                                    ]
                                                };

                                                const groupedFeatures = {};
                                                const usedIds = new Set();

                                                Object.keys(groups).forEach(groupName => {
                                                    groupedFeatures[groupName] = [];
                                                    groups[groupName].forEach(item => {
                                                        const f = featureToggles.find(x => x.name.toLowerCase() === item.db.toLowerCase());
                                                        if (f) {
                                                            groupedFeatures[groupName].push({ ...f, display_name: item.label });
                                                            usedIds.add(f.id);
                                                        }
                                                    });
                                                });

                                                // Fitur lainnya yang belum dikelompokkan
                                                const otherFeatures = featureToggles.filter(f => !usedIds.has(f.id));
                                                if (otherFeatures.length > 0) {
                                                    groupedFeatures["Lainnya"] = otherFeatures.map(f => ({ ...f, display_name: f.name }));
                                                }

                                                return Object.entries(groupedFeatures).map(([groupName, features]) => {
                                                    // Jangan sembunyikan grup Absensi dan Spreadsheet sesuai permintaan user
                                                    if (features.length === 0 && groupName !== "Spreadsheet" && groupName !== "Absensi") return null;
                                                    
                                                    return (
                                                        <div key={groupName} className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                            <h5 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                                                                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                                                                {groupName}
                                                            </h5>
                                                            {features.length > 0 ? (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {features.map(feature => {
                                                                        const isEnabled = data.feature_toggles.includes(feature.id);
                                                                        return (
                                                                            <div 
                                                                                key={feature.id} 
                                                                                onClick={() => toggleFeature(feature.id)}
                                                                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isEnabled ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-70 hover:opacity-100 hover:border-indigo-300'}`}
                                                                            >
                                                                                <span className={`text-sm font-medium ${isEnabled ? 'text-indigo-900' : 'text-gray-600'}`}>{feature.display_name}</span>
                                                                                <button type="button" className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                                                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-400 italic px-2">Belum ada menu / fitur untuk kategori {groupName}.</p>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    {/* KOLOM 3: Area Marketing (Multi Select Checkbox) */}
                                    {data.role && (data.role.toLowerCase() === 'marketing' || data.role.toLowerCase() === 'sales') && (
                                        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 flex flex-col h-full">
                                            <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                                                <MapPin className="w-4 h-4"/> Area Marketing 
                                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full ml-auto">{data.marketing_areas.length} Dipilih</span>
                                            </h4>
                                            <p className="text-xs text-gray-500 mb-3">Centang kota/kabupaten yang menjadi area kekuasaan pengguna ini.</p>
                                            
                                            <TextInput 
                                                type="text" 
                                                className="w-full text-sm mb-3"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />

                                            <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-2 space-y-1 custom-scrollbar">
                                                {filteredAreas.map(area => (
                                                    <label key={area.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                                            checked={data.marketing_areas.includes(area.id)}
                                                            onChange={() => toggleArea(area.id)}
                                                        />
                                                        <span className={`text-sm ${data.marketing_areas.includes(area.id) ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{area.name}</span>
                                                    </label>
                                                ))}
                                                {filteredAreas.length === 0 && (
                                                    <div className="text-center p-4 text-xs text-gray-500">Kota tidak ditemukan.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3">Batal</SecondaryButton>
                                    <PrimaryButton disabled={processing} className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700">
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL PREVIEW */}
                {isPreviewModalOpen && previewUser && (
                    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start pt-10 pb-10 px-4 bg-gray-900/50 backdrop-blur-sm custom-scrollbar">
                        <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl transform transition-all my-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600"/>
                                    Detail Karyawan
                                </h3>
                                <button type="button" onClick={() => setIsPreviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Kiri: Info Utama & Pekerjaan */}
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                                                    {previewUser.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-900">{previewUser.name}</h4>
                                                    <p className="text-sm text-gray-500">{previewUser.email}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Perusahaan (PT)</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.company?.name || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Role Sistem</p>
                                                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200 mt-1">
                                                        {previewUser.roles && previewUser.roles.length > 0 ? previewUser.roles[0].name : '-'}
                                                    </span>
                                                </div>
                                                {previewUser.roles && previewUser.roles.length > 0 && previewUser.roles[0].name !== 'Superadmin' && (
                                                    <>
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">Jabatan & Divisi</p>
                                                            <p className="font-semibold text-gray-800">{previewUser.position?.name || '-'} - {previewUser.division?.name || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">Area Marketing</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {previewUser.marketing_areas && previewUser.marketing_areas.length > 0 ? (
                                                                    previewUser.marketing_areas.map(area => (
                                                                        <span key={area.id} className="text-xs bg-white text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                                                                            {area.name}
                                                                        </span>
                                                                    ))
                                                                ) : '-'}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kanan: Data Pribadi & Kepegawaian */}
                                    <div className="space-y-6">
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <h4 className="font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-gray-500"/> Data Pribadi</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">NIK (KTP)</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.nik || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">No. HP / WhatsApp</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.phone || '-'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500 font-medium">Alamat Domisili</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.address || '-'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500 font-medium">Pendidikan Terakhir</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.education || '-'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500 font-medium">Kontak Darurat</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.emergency_contact || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <h4 className="font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-500"/> Kepegawaian</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">No. Karyawan</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.employee_id || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Tanggal Masuk</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.start_date || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Status Karyawan</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.employment_status || '-'}</p>
                                                </div>
                                                <div></div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Gaji Pokok</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.salary ? `Rp ${new Intl.NumberFormat('id-ID').format(previewUser.salary)}` : '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Operasional</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.operational_allowance ? `Rp ${new Intl.NumberFormat('id-ID').format(previewUser.operational_allowance)}` : '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">BPJS Kesehatan</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.bpjs_kesehatan || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">BPJS Ketenagakerjaan</p>
                                                    <p className="font-semibold text-gray-800">{previewUser.bpjs_ketenagakerjaan || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
