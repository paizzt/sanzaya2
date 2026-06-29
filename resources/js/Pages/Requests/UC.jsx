import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PlaneTakeoff, Send, MapPin, Calendar, Users, Car, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomSelect from '@/Components/CustomSelect';

export default function UC({ requests, users }) {
    const user = usePage().props.auth.user;
    
    // Calculate Days Diff
    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const date1 = new Date(start);
        const date2 = new Date(end);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        entity: 'PT. Sanzaya Medika Pratama',
        department: 'Sales',
        destination_city: '',
        departure_date: '',
        return_date: '',
        estimated_days: 0,
        companions: [],
        transportation_type: 'Darat',
        vehicle_number: '',
        estimated_gas_cost: '',
        estimated_meals_cost: '',
        estimated_accommodation_cost: '',
    });

    const { flash } = usePage().props;

    useEffect(() => {
        if (data.departure_date && data.return_date) {
            setData('estimated_days', calculateDays(data.departure_date, data.return_date));
        }
    }, [data.departure_date, data.return_date]);

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
        post(route('requests.uc.store'), { preserveScroll: true });
    };

    const handleCompanionChange = (index, value) => {
        const newCompanions = [...(data.companions || [])];
        newCompanions[index] = value;
        setData('companions', newCompanions.filter(c => c !== '')); // Remove empties
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengajuan Upcountry (UC)</h2>}
        >
            <Head title="Pengajuan UC" />

            <div className="py-6 space-y-8">
                
                {/* Form Pengajuan UC */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="mb-6 border-b border-gray-50 pb-4">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <PlaneTakeoff className="text-blue-600" /> Form Pengajuan Biaya (UC)
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Lengkapi formulir di bawah ini untuk mengajukan biaya perjalanan dinas Upcountry.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel value="Pilih Entitas Perusahaan *" />
                                <CustomSelect
                                    value={data.entity}
                                    onChange={(val) => setData('entity', val)}
                                    options={[
                                        { value: 'PT. Sanzaya Medika Pratama', label: 'PT. Sanzaya Medika Pratama (Sanzaya)' },
                                        { value: 'PT. Harkes', label: 'PT. Harkes (Harkes)' },
                                        { value: 'CV. Meraki', label: 'CV. Meraki (Meraki)' },
                                        { value: 'PT. MSI', label: 'PT. MSI (MSI)' },
                                        { value: 'PT. Ruma', label: 'PT. Ruma (Ruma)' }
                                    ]}
                                />
                            </div>
                            <div>
                                <InputLabel value="Nama Pegawai" />
                                <TextInput className="mt-1 block w-full bg-gray-100 cursor-not-allowed" value={user.name} disabled />
                            </div>
                            <div>
                                <InputLabel value="Jabatan / Divisi *" />
                                <TextInput 
                                    className="mt-1 block w-full" 
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                />
                                <InputError message={errors.department} className="mt-2" />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
                            <div>
                                <InputLabel value="Kota Tujuan *" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500"/> Tujuan</InputLabel>
                                <TextInput 
                                    className="mt-1 block w-full bg-white" 
                                    placeholder="Contoh: Pinrang, Parepare..."
                                    value={data.destination_city}
                                    onChange={(e) => setData('destination_city', e.target.value)}
                                />
                                <InputError message={errors.destination_city} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <InputLabel value="Tgl Berangkat *" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500"/> Berangkat</InputLabel>
                                <TextInput 
                                    type="date"
                                    className="mt-1 block w-full" 
                                    value={data.departure_date}
                                    onChange={(e) => setData('departure_date', e.target.value)}
                                />
                                <InputError message={errors.departure_date} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Tgl Pulang *" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500"/> Pulang</InputLabel>
                                <TextInput 
                                    type="date"
                                    className="mt-1 block w-full" 
                                    value={data.return_date}
                                    onChange={(e) => setData('return_date', e.target.value)}
                                />
                                <InputError message={errors.return_date} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Estimasi Waktu (Hari)" />
                                <div className="mt-1 block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700">
                                    {data.estimated_days} Hari
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <InputLabel value="Nama Pendamping (Opsional)" className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-gray-500"/> Pendamping</InputLabel>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomSelect
                                    value={data.companions?.[0] || ''}
                                    onChange={(val) => handleCompanionChange(0, val)}
                                    options={[
                                        { value: '', label: '-- Pilih Pendamping 1 --' },
                                        ...(users || []).map(u => ({ value: u.name, label: u.name }))
                                    ]}
                                />
                                <CustomSelect
                                    value={data.companions?.[1] || ''}
                                    onChange={(val) => handleCompanionChange(1, val)}
                                    options={[
                                        { value: '', label: '-- Pilih Pendamping 2 --' },
                                        ...(users || []).map(u => ({ value: u.name, label: u.name }))
                                    ]}
                                />
                                <CustomSelect
                                    value={data.companions?.[2] || ''}
                                    onChange={(val) => handleCompanionChange(2, val)}
                                    options={[
                                        { value: '', label: '-- Pilih Pendamping 3 --' },
                                        ...(users || []).map(u => ({ value: u.name, label: u.name }))
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel value="Jenis Transportasi *" className="flex items-center gap-2"><Car className="w-4 h-4 text-gray-500"/> Transportasi</InputLabel>
                                <CustomSelect
                                    value={data.transportation_type}
                                    onChange={(val) => setData('transportation_type', val)}
                                    options={[
                                        { value: 'Darat', label: 'Darat' },
                                        { value: 'Laut', label: 'Laut' },
                                        { value: 'Udara', label: 'Udara' }
                                    ]}
                                />
                            </div>
                            <div>
                                <InputLabel value="No. Polisi Kendaraan (Jika Darat)" />
                                <TextInput 
                                    className="mt-1 block w-full" 
                                    placeholder="Contoh: DD 1234 XY"
                                    value={data.vehicle_number}
                                    onChange={(e) => setData('vehicle_number', e.target.value)}
                                    disabled={data.transportation_type !== 'Darat'}
                                />
                            </div>
                        </div>

                        <div className="p-5 mt-6 bg-gray-50 border border-gray-100 rounded-2xl">
                            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">Estimasi Biaya (Opsional)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Estimasi Biaya Bensin (Rp)" />
                                    <TextInput 
                                        type="number"
                                        className="mt-1 block w-full bg-white" 
                                        placeholder="Kosongkan jika tidak ada"
                                        value={data.estimated_gas_cost}
                                        onChange={(e) => setData('estimated_gas_cost', e.target.value)}
                                        disabled={data.transportation_type !== 'Darat'}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Estimasi Biaya Konsumsi (Rp)" />
                                    <TextInput 
                                        type="number"
                                        className="mt-1 block w-full bg-white" 
                                        placeholder="Kosongkan jika tidak ada"
                                        value={data.estimated_meals_cost}
                                        onChange={(e) => setData('estimated_meals_cost', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Estimasi Biaya Penginapan (Rp)" />
                                    <TextInput 
                                        type="number"
                                        className="mt-1 block w-full bg-white" 
                                        placeholder="Kosongkan jika tidak ada"
                                        value={data.estimated_accommodation_cost}
                                        onChange={(e) => setData('estimated_accommodation_cost', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <PrimaryButton disabled={processing} className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 text-sm transition-all duration-200">
                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                {processing ? 'Memproses...' : 'Ajukan Form UC'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
