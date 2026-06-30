import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Target, TrendingUp, Building, MapPin, Send, AlertTriangle, CalendarDays, CheckSquare, ClipboardList } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import CustomSelect from '@/Components/CustomSelect';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomDateRangePicker from '@/Components/CustomDateRangePicker';

export default function Index({ outlets, reports, target, allTargets, realization, isAdminMarketing, sales_users }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        activity_type: 'Kunjungan Lapangan (Ke Outlet/RS/Klinik)',
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        outlet_type: '',
        outlet_id: '',
        pic_phone: '',
        pic_position: '',
        pic_name: '',
        outlet_status: 'Prospek Lama',
        visit_type: 'Kunjungan Awal',
        issue_type: 'Tidak Ada Kendala',
        competitor_notes: '',
        visit_result: '',
        photos: null,
    });


    const [activeTab, setActiveTab] = useState('laporan');
    const user = usePage().props.auth.user;

    const { data: targetData, setData: setTargetData, post: postTarget, processing: targetProcessing, errors: targetErrors, reset: resetTarget } = useForm({
        user_id: isAdminMarketing ? '' : user.id,
        start_date: '',
        end_date: '',
        target_outlets: [],
    });

    const handleOutletToggle = (outletId) => {
        let currentOutlets = [...targetData.target_outlets];
        if (currentOutlets.includes(outletId)) {
            currentOutlets = currentOutlets.filter(id => id !== outletId);
        } else {
            currentOutlets.push(outletId);
        }
        setTargetData('target_outlets', currentOutlets);
    };

    const submitTarget = (e) => {
        e.preventDefault();
        postTarget(route('marketing.target.store'), {
            preserveScroll: true,
            onSuccess: () => resetTarget('target_outlets')
        });
    };

    // Group outlets by type
    const groupedOutlets = outlets.reduce((acc, outlet) => {
        const type = outlet.type || 'Lainnya';
        if (!acc[type]) acc[type] = [];
        acc[type].push(outlet);
        return acc;
    }, {});

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-2xl' }
            });
            reset();
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('marketing.report.store'), {
            preserveScroll: true,
        });
    };

    const formatRupiah = (value) => {
        if (!value) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Modul Marketing</h2>}
        >
            <Head title="Marketing" />

            <div className="py-6 space-y-8">
                
                {/* Target vs Realization */}
                <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="text-blue-600" /> Target Mingguan vs Realisasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
                            <p className="text-blue-100 text-sm font-medium mb-1">Target Kunjungan Mingguan</p>
                            <div className="flex items-end gap-2 mb-4">
                                <h2 className="text-4xl font-black">{realization.visits}</h2>
                                <span className="text-blue-200 mb-1">/ {target?.target_visits || 0} Outlet</span>
                            </div>
                            <div className="w-full bg-blue-900/50 rounded-full h-2">
                                <div 
                                    className="bg-white h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (realization.visits / (target?.target_visits || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
                            <p className="text-emerald-100 text-sm font-medium mb-1">Realisasi Kunjungan</p>
                            <div className="flex items-end gap-2 mb-4">
                                <h2 className="text-4xl font-black">{target?.target_visits > 0 ? Math.round((realization.visits / target.target_visits) * 100) : 0}%</h2>
                            </div>
                            <p className="text-sm text-emerald-100">Dari target {target?.target_visits || 0} kunjungan mingguan</p>
                            <div className="w-full bg-emerald-900/30 rounded-full h-2 mt-2">
                                <div 
                                    className="bg-white h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, target?.target_visits > 0 ? (realization.visits / target.target_visits) * 100 : 0)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                
                {/* Tab Navigation */}
                <div className="flex gap-2 w-full overflow-x-auto pb-2">
                    <button onClick={() => setActiveTab('laporan')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab==='laporan'?'bg-blue-600 text-white shadow-md shadow-blue-500/30':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                        <ClipboardList className="w-4 h-4"/> Form Laporan Harian
                    </button>
                    <button onClick={() => setActiveTab('target')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab==='target'?'bg-emerald-600 text-white shadow-md shadow-emerald-500/30':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                        <Target className="w-4 h-4"/> Form Target Mingguan
                    </button>
                    <button onClick={() => setActiveTab('rekap_laporan')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab==='rekap_laporan'?'bg-indigo-600 text-white shadow-md shadow-indigo-500/30':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                        <TrendingUp className="w-4 h-4"/> Rekap Laporan Harian
                    </button>
                    <button onClick={() => setActiveTab('rekap_target')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab==='rekap_target'?'bg-teal-600 text-white shadow-md shadow-teal-500/30':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                        <CalendarDays className="w-4 h-4"/> Rekap Target Mingguan
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Form Laporan Harian */}
                    {activeTab === 'laporan' && (
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                                <TrendingUp className="text-blue-600 w-5 h-5" />
                                Form Laporan Harian
                            </h3>

                            <form onSubmit={submit} className="space-y-6">
                                <p className="text-sm text-gray-500 mb-6">Lengkapi detail kunjungan lapangan atau aktivitas kantor di bawah ini.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel value="Nama Sales" />
                                        <TextInput 
                                            className="mt-1 block w-full bg-gray-100 text-gray-500" 
                                            value={user.name}
                                            disabled
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="Tanggal" />
                                            <TextInput 
                                                type="date" 
                                                className="mt-1 block w-full" 
                                                value={data.visit_date}
                                                onChange={(e) => setData('visit_date', e.target.value)}
                                            />
                                            <InputError message={errors.visit_date} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Waktu" />
                                            <TextInput 
                                                type="time" 
                                                className="mt-1 block w-full" 
                                                value={data.visit_time}
                                                onChange={(e) => setData('visit_time', e.target.value)}
                                            />
                                            <InputError message={errors.visit_time} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Pilih Jenis Aktivitas Hari Ini" />
                                    <CustomSelect
                                        value={data.activity_type}
                                        onChange={(val) => setData('activity_type', val)}
                                        options={[
                                            { value: 'Kunjungan Lapangan (Ke Outlet/RS/Klinik)', label: 'Kunjungan Lapangan (Ke Outlet/RS/Klinik)' },
                                            { value: 'Non-Kunjungan (Kantor / Administrasi / Rapat)', label: 'Non-Kunjungan (Kantor / Administrasi / Rapat)' },
                                        ]}
                                    />
                                    <InputError message={errors.activity_type} className="mt-2" />
                                </div>

                                {data.activity_type === 'Kunjungan Lapangan (Ke Outlet/RS/Klinik)' && (
                                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-6 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel value="Jenis Outlet" />
                                                <CustomSelect
                                                    value={data.outlet_type}
                                                    onChange={(val) => setData('outlet_type', val)}
                                                    options={[
                                                        { value: '', label: '-- Pilih Jenis Outlet --' },
                                                        { value: 'RS (Rumah Sakit)', label: 'RS (Rumah Sakit)' },
                                                        { value: 'Dinas Kesehatan (DINKES)', label: 'Dinas Kesehatan (DINKES)' },
                                                        { value: 'Klinik', label: 'Klinik' }
                                                    ]}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="Nama Outlet" />
                                                <CustomSelect
                                                    value={data.outlet_id}
                                                    onChange={(val) => setData('outlet_id', val)}
                                                    options={[
                                                        { value: '', label: '-- Pilih Outlet --' },
                                                        ...outlets.map(o => ({ value: o.id, label: `${o.name} - ${o.city}` }))
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <InputLabel value="Nama PIC Outlet" />
                                                <TextInput 
                                                    className="mt-1 block w-full bg-white" 
                                                    value={data.pic_name}
                                                    onChange={(e) => setData('pic_name', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="No HP PIC Outlet" />
                                                <TextInput 
                                                    className="mt-1 block w-full bg-white" 
                                                    value={data.pic_phone}
                                                    onChange={(e) => setData('pic_phone', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="Jabatan PIC Outlet" />
                                                <TextInput 
                                                    className="mt-1 block w-full bg-white" 
                                                    value={data.pic_position}
                                                    onChange={(e) => setData('pic_position', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel value="Status Outlet" />
                                                <CustomSelect
                                                    value={data.outlet_status}
                                                    onChange={(val) => setData('outlet_status', val)}
                                                    options={[
                                                        { value: 'Prospek Lama', label: 'Prospek Lama' },
                                                        { value: 'Prospek Baru', label: 'Prospek Baru' }
                                                    ]}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="Jenis Kunjungan" />
                                                <CustomSelect
                                                    value={data.visit_type}
                                                    onChange={(val) => setData('visit_type', val)}
                                                    options={[
                                                        { value: 'Kunjungan Awal', label: 'Kunjungan Awal' },
                                                        { value: 'Follow Up', label: 'Follow Up' },
                                                        { value: 'Negosiasi', label: 'Negosiasi' },
                                                        { value: 'Administrasi', label: 'Administrasi' },
                                                        { value: 'Penagihan', label: 'Penagihan' }
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                            <div>
                                                <InputLabel value="Kendala / Jenis Kendala" />
                                                <CustomSelect
                                                    value={data.issue_type}
                                                    onChange={(val) => setData('issue_type', val)}
                                                    options={[
                                                        { value: 'Tidak Ada Kendala', label: 'Tidak Ada Kendala' },
                                                        { value: 'Kompetitor', label: 'Kompetitor' },
                                                        { value: 'Harga', label: 'Harga' },
                                                        { value: 'Administrasi', label: 'Administrasi' }
                                                    ]}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="Identifikasi Kompetitor" />
                                                <TextInput 
                                                    className="mt-1 block w-full bg-white" 
                                                    value={data.competitor_notes}
                                                    onChange={(e) => setData('competitor_notes', e.target.value)}
                                                    placeholder="Nama produk/vendor kompetitor..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <InputLabel 
                                        value={data.activity_type === 'Non-Kunjungan (Kantor / Administrasi / Rapat)' 
                                            ? "Keterangan / Detail Aktivitas" 
                                            : "Hasil Kunjungan / Laporan Aktivitas"} 
                                    />
                                    <textarea 
                                        className="mt-1 block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        rows="4"
                                        value={data.visit_result}
                                        onChange={(e) => setData('visit_result', e.target.value)}
                                        placeholder={data.activity_type === 'Non-Kunjungan (Kantor / Administrasi / Rapat)' 
                                            ? "Tulis rincian hasil kegiatan/pertemuan hari ini..." 
                                            : "Ceritakan detail aktivitas atau hasil kunjungan hari ini..."}
                                    ></textarea>
                                </div>

                                <div>
                                    <InputLabel value="Foto Dokumentasi" />
                                    <input 
                                        type="file" 
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) => setData('photos', e.target.files[0])}
                                        accept="image/*"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <PrimaryButton disabled={processing} className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2">
                                        <Send className="w-4 h-4" /> Simpan Laporan
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    )}


                    {/* Form Target Mingguan */}
                    {activeTab === 'target' && (
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                                <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                                    <Target className="text-blue-600 w-5 h-5" />
                                    Target Mingguan Sales
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-50">
                                    Tentukan target kunjungan dan sebaran outlet untuk periode minggu depan.
                                </p>

                                <form onSubmit={submitTarget} className="space-y-6">
                                    {isAdminMarketing && (
                                        <div>
                                            <InputLabel value="Nama Sales" />
                                            <CustomSelect
                                                value={targetData.user_id}
                                                onChange={(val) => setTargetData('user_id', val)}
                                                options={[
                                                    { value: '', label: '-- Pilih Sales --' },
                                                    ...(sales_users || []).map(u => ({ value: u.id, label: u.name }))
                                                ]}
                                            />
                                            <InputError message={targetErrors.user_id} className="mt-2" />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <InputLabel value="Periode Target (Start & End Date)" />
                                            <div className="relative mt-1">
                                                <CustomDateRangePicker
                                                    value={{ 
                                                        startDate: targetData.start_date || null, 
                                                        endDate: targetData.end_date || null 
                                                    }}
                                                    onChange={(newVal) => {
                                                        setTargetData(data => ({
                                                            ...data,
                                                            start_date: newVal?.startDate || '',
                                                            end_date: newVal?.endDate || ''
                                                        }));
                                                    }}
                                                />
                                            </div>
                                            <InputError message={targetErrors.start_date} className="mt-2" />
                                            <InputError message={targetErrors.end_date} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-start gap-2 mb-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                            <span className="text-xl">💡</span>
                                            <p className="text-sm text-yellow-800 mt-0.5">
                                                Centang nama-nama outlet target kunjungan sesuai wilayah penugasan Anda.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {Object.entries(groupedOutlets).map(([type, typeOutlets]) => (
                                                <div key={type} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-gray-400" /> {type}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {typeOutlets.map(outlet => (
                                                            <label key={outlet.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                                    checked={targetData.target_outlets.includes(outlet.id)}
                                                                    onChange={() => handleOutletToggle(outlet.id)}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-gray-800 leading-tight">{outlet.name}</span>
                                                                    <span className="text-xs text-gray-500">{outlet.city || '-'}</span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={targetErrors.target_outlets} className="mt-2" />
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                                        <PrimaryButton disabled={targetProcessing} className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30">
                                            <CheckSquare className="w-4 h-4" /> Tetapkan Target
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Rekap Laporan Harian */}
                    {activeTab === 'rekap_laporan' && (
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                                <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                                    <ClipboardList className="text-indigo-600 w-5 h-5" />
                                    Rekap Laporan Harian
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-xl">Tanggal & Waktu</th>
                                                <th className="px-4 py-3">Aktivitas</th>
                                                <th className="px-4 py-3">Outlet / PIC</th>
                                                <th className="px-4 py-3">Kendala / Hasil</th>
                                                <th className="px-4 py-3 text-right rounded-r-xl">Estimasi/Aktual</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {reports.length > 0 ? reports.map(r => (
                                                <tr key={r.id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-800">{new Date(r.visit_date).toLocaleDateString('id-ID')}</div>
                                                        <div className="text-xs text-gray-500">{r.visit_time}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">{r.activity_type}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {r.activity_type?.includes('Non-Kunjungan') ? '-' : (
                                                            <>
                                                                <div className="font-medium text-gray-800">{r.outlet?.name || r.outlet_id || '-'}</div>
                                                                <div className="text-xs text-gray-500">{r.pic_name ? `PIC: ${r.pic_name}` : ''}</div>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-xs text-orange-600 font-medium">{r.issue_type && r.issue_type !== 'Tidak Ada Kendala' ? `Kendala: ${r.issue_type}` : ''}</div>
                                                        <div className="text-gray-600 line-clamp-2" title={r.visit_result}>{r.visit_result}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="text-gray-500 text-xs">Est: {formatRupiah(r.estimated_value)}</div>
                                                        <div className="font-medium text-emerald-600">Akt: {formatRupiah(r.actual_value)}</div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">Belum ada data laporan harian.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rekap Target Mingguan */}
                    {activeTab === 'rekap_target' && (
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                                <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                                    <CalendarDays className="text-teal-600 w-5 h-5" />
                                    Rekap Target Mingguan
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-xl">Tahun/Minggu</th>
                                                <th className="px-4 py-3">Tanggal Periode</th>
                                                <th className="px-4 py-3 text-center">Target Kunjungan</th>
                                                <th className="px-4 py-3 text-right rounded-r-xl">Target Transaksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {allTargets && allTargets.length > 0 ? allTargets.map(t => (
                                                <tr key={t.id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                        Tahun {t.year} - M{t.week_number}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {new Date(t.start_date).toLocaleDateString('id-ID')} s/d {new Date(t.end_date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{t.target_visits} Outlet</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                                        {formatRupiah(t.target_transactions)}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400">Belum ada data target mingguan.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Riwayat Kunjungan */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 border-b border-gray-50 pb-4 flex items-center gap-2">
                                <Building className="text-gray-400 w-5 h-5" /> Riwayat Kunjungan
                            </h3>
                            
                            {reports.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Belum ada riwayat hari ini</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map(rep => (
                                        <div key={rep.id} className="p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${rep.visit_result === 'Closing / Deal' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            <div className="pl-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-800 text-sm">{rep.outlet ? rep.outlet.name : 'Outlet Umum'}</h4>
                                                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{rep.visit_time.substring(0,5)}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2">{rep.visit_type} - {rep.visit_result}</p>
                                                <p className="text-sm text-gray-700 line-clamp-2">{rep.summary}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
