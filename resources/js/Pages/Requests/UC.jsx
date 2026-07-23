import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PlaneTakeoff, Send, MapPin, Calendar, Users, Car, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SearchableSelect from '@/Components/SearchableSelect';
import CustomDatePicker from '@/Components/CustomDatePicker';
import UcPreview from '@/Components/UcPreview';


export default function UC({ requests, users, vehicles, isAdmin }) {
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
        user_id: user.id,
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
        flight_ticket_cost: '',
        ship_ticket_cost: '',
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

    const handleCurrencyChange = (field, e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            setData(field, (parseInt(value, 10) / 100).toString());
        } else {
            setData(field, '');
        }
    };

    const formatRupiah = (value) => {
        if (!value) return '';
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengajuan Upcountry (UC)</h2>}
        >
            <Head title="Pengajuan UC" />

            <div className="pb-6 pt-0">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Pengajuan UC */}
                    <div className="w-full lg:w-5/12 xl:w-1/2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit">
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
                                <div className="mt-1">
                                    <SearchableSelect
                                        value={data.entity}
                                        onChange={(val) => setData('entity', val)}
                                        options={[
                                            { value: 'PT. Sanzaya Medika Pratama', label: 'PT. Sanzaya Medika Pratama (Sanzaya)' },
                                            { value: 'PT. Harkes', label: 'PT. Harkes (Harkes)' },
                                            { value: 'CV. Meraki', label: 'CV. Meraki (Meraki)' },
                                            { value: 'PT. MSI', label: 'PT. MSI (MSI)' },
                                            { value: 'PT. Ruma', label: 'PT. Ruma (Ruma)' }
                                        ]}
                                        placeholder="Pilih Entitas..."
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Nama Pegawai" />
                                {isAdmin ? (
                                    <div className="mt-1">
                                        <SearchableSelect
                                            value={data.user_id}
                                            onChange={(val) => setData('user_id', val)}
                                            options={users.map(u => ({ value: u.id, label: u.name }))}
                                            placeholder="Pilih Pegawai..."
                                        />
                                        <InputError message={errors.user_id} className="mt-2" />
                                    </div>
                                ) : (
                                    <TextInput className="mt-1 block w-full bg-gray-100 cursor-not-allowed" value={user.name} disabled />
                                )}
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
                                <div className="mt-1">
                                    <CustomDatePicker 
                                        value={data.departure_date}
                                        onChange={(val) => setData('departure_date', val)}
                                    />
                                </div>
                                <InputError message={errors.departure_date} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Tgl Pulang *" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500"/> Pulang</InputLabel>
                                <div className="mt-1">
                                    <CustomDatePicker 
                                        value={data.return_date}
                                        onChange={(val) => setData('return_date', val)}
                                    />
                                </div>
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
                                <SearchableSelect
                                    value={data.companions?.[0] || ''}
                                    onChange={(val) => handleCompanionChange(0, val)}
                                    options={(users || []).map(u => ({ value: u.name, label: u.name }))}
                                    placeholder="Pilih Pendamping 1"
                                />
                                <SearchableSelect
                                    value={data.companions?.[1] || ''}
                                    onChange={(val) => handleCompanionChange(1, val)}
                                    options={(users || []).map(u => ({ value: u.name, label: u.name }))}
                                    placeholder="Pilih Pendamping 2"
                                />
                                <SearchableSelect
                                    value={data.companions?.[2] || ''}
                                    onChange={(val) => handleCompanionChange(2, val)}
                                    options={(users || []).map(u => ({ value: u.name, label: u.name }))}
                                    placeholder="Pilih Pendamping 3"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel value="Jenis Transportasi *" className="flex items-center gap-2"><Car className="w-4 h-4 text-gray-500"/> Transportasi</InputLabel>
                                <div className="mt-1">
                                    <SearchableSelect
                                        value={data.transportation_type}
                                        onChange={(val) => setData('transportation_type', val)}
                                        options={[
                                            { value: 'Darat', label: 'Darat' },
                                            { value: 'Laut', label: 'Laut' },
                                            { value: 'Udara', label: 'Udara' }
                                        ]}
                                        placeholder="Pilih Transportasi"
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="No. Polisi Kendaraan (Jika Darat)" />
                                <div className="mt-1">
                                    <SearchableSelect 
                                        value={data.vehicle_number}
                                        onChange={(val) => setData('vehicle_number', val)}
                                        options={(vehicles || []).map(v => ({ 
                                            value: v.license_plate, 
                                            label: `${v.license_plate} - ${v.brand_type || 'Kendaraan'}` 
                                        }))}
                                        placeholder="Pilih Kendaraan (Opsional)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 mt-6 bg-gray-50 border border-gray-100 rounded-2xl">
                            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">Estimasi Biaya</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Estimasi Biaya Bensin (Rp)" />
                                    <TextInput 
                                        type="text"
                                        className={`mt-1 block w-full ${data.transportation_type !== 'Darat' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} 
                                        placeholder="Rp 0,00"
                                        value={data.estimated_gas_cost ? formatRupiah(data.estimated_gas_cost) : ''}
                                        onChange={(e) => handleCurrencyChange('estimated_gas_cost', e)}
                                        disabled={data.transportation_type !== 'Darat'}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Estimasi Biaya Konsumsi (Rp)" />
                                    <TextInput 
                                        type="text"
                                        className="mt-1 block w-full bg-white" 
                                        placeholder="Rp 0,00"
                                        value={data.estimated_meals_cost ? formatRupiah(data.estimated_meals_cost) : ''}
                                        onChange={(e) => handleCurrencyChange('estimated_meals_cost', e)}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Estimasi Biaya Penginapan (Rp)" />
                                    <TextInput 
                                        type="text"
                                        className="mt-1 block w-full bg-white" 
                                        placeholder="Rp 0,00"
                                        value={data.estimated_accommodation_cost ? formatRupiah(data.estimated_accommodation_cost) : ''}
                                        onChange={(e) => handleCurrencyChange('estimated_accommodation_cost', e)}
                                    />
                                </div>
                                {data.transportation_type === 'Udara' && (
                                    <div>
                                        <InputLabel value="Harga Tiket Pesawat (Rp)" />
                                        <TextInput 
                                            type="text"
                                            className="mt-1 block w-full bg-white" 
                                            placeholder="Rp 0,00"
                                            value={data.flight_ticket_cost ? formatRupiah(data.flight_ticket_cost) : ''}
                                            onChange={(e) => handleCurrencyChange('flight_ticket_cost', e)}
                                        />
                                    </div>
                                )}
                                {data.transportation_type === 'Laut' && (
                                    <div>
                                        <InputLabel value="Harga Tiket Kapal (Rp)" />
                                        <TextInput 
                                            type="text"
                                            className="mt-1 block w-full bg-white" 
                                            placeholder="Rp 0,00"
                                            value={data.ship_ticket_cost ? formatRupiah(data.ship_ticket_cost) : ''}
                                            onChange={(e) => handleCurrencyChange('ship_ticket_cost', e)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <PrimaryButton disabled={processing} className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 text-sm transition-all duration-200">
                                {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                                {processing ? 'Memproses...' : 'Ajukan'}
                            </PrimaryButton>
                        </div>
                    </form>
                    </div>

                    {/* Live Preview Paper */}
                    <div className="hidden lg:block w-full lg:w-7/12 xl:w-1/2">
                        <div className="sticky top-6">
                            <h3 className="font-bold text-lg text-gray-700 mb-4 flex items-center gap-2">
                                Preview Cetakan
                            </h3>
                            <UcPreview data={data} user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
