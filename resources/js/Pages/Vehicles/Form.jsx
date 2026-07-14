import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Truck, FileText, Calendar, Wrench } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CustomDatePicker from '@/Components/CustomDatePicker';
import { useState, useRef } from 'react';
import Swal from 'sweetalert2';

export default function Form({ vehicle }) {
    const isEdit = !!vehicle;
    const { data, setData, post, processing, errors } = useForm({
        license_plate: vehicle?.license_plate || '',
        chassis_number: vehicle?.chassis_number || '',
        brand_type: vehicle?.brand_type || '',
        manufacture_year: vehicle?.manufacture_year || '',
        color: vehicle?.color || '',
        capacity: vehicle?.capacity || '',
        photo: null,
        
        annual_tax_date: vehicle?.annual_tax_date || '',
        five_year_tax_date: vehicle?.five_year_tax_date || '',
        plate_replacement_date: vehicle?.plate_replacement_date || '',
        stnk_expiry_date: vehicle?.stnk_expiry_date || '',
        kir_expiry_date: vehicle?.kir_expiry_date || '',
        insurance_policy: vehicle?.insurance_policy || '',
        insurance_expiry_date: vehicle?.insurance_expiry_date || '',
        
        scheduled_service_date: vehicle?.scheduled_service_date || '',
        repair_history: vehicle?.repair_history || '',
        last_odometer: vehicle?.last_odometer || '',
        current_odometer: vehicle?.current_odometer || '',
        oil_change_schedule: vehicle?.oil_change_schedule || '',
        
        engine_oil_target_km: vehicle?.engine_oil_target_km || '',
        oil_filter_target_km: vehicle?.oil_filter_target_km || '',
        air_filter_target_km: vehicle?.air_filter_target_km || '',
        ac_filter_target_km: vehicle?.ac_filter_target_km || '',
        transmission_oil_target_km: vehicle?.transmission_oil_target_km || '',
        spark_plug_target_km: vehicle?.spark_plug_target_km || '',
        brake_pad_target_km: vehicle?.brake_pad_target_km || '',
        battery_target_date: vehicle?.battery_target_date || '',
        tire_target_date: vehicle?.tire_target_date || '',
        
        _method: isEdit ? 'PUT' : 'POST'
    });

    const [photoPreview, setPhotoPreview] = useState(vehicle?.photo ? `/storage/${vehicle.photo}` : null);
    const photoInputRef = useRef(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEdit) {
            post(route('vehicles.update', vehicle.id), {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({ title: 'Berhasil!', text: 'Data armada berhasil diperbarui', icon: 'success', customClass: { popup: 'rounded-2xl' } });
                }
            });
        } else {
            post(route('vehicles.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({ title: 'Berhasil!', text: 'Data armada berhasil ditambahkan', icon: 'success', customClass: { popup: 'rounded-2xl' } });
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">{isEdit ? 'Edit Armada' : 'Tambah Armada Baru'}</h2>}
        >
            <Head title={isEdit ? "Edit Armada" : "Tambah Armada"} />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('vehicles.index')} className="p-2 bg-white rounded-xl shadow-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Data Kendaraan' : 'Form Tambah Kendaraan'}</h3>
                        <p className="text-sm text-gray-500 mt-1">Lengkapi data informasi armada operasional di bawah ini.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* Data Kendaraan */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-4">
                            <Truck className="w-5 h-5 text-blue-600" />
                            Informasi Kendaraan
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="license_plate" value="Nomor Polisi (Plat Nomor) *" />
                                <TextInput
                                    id="license_plate"
                                    type="text"
                                    name="license_plate"
                                    value={data.license_plate}
                                    className="mt-1 block w-full uppercase"
                                    onChange={(e) => setData('license_plate', e.target.value.toUpperCase())}
                                    required
                                    placeholder="Contoh: B 1234 ABC"
                                />
                                <InputError message={errors.license_plate} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="brand_type" value="Merk & Tipe Kendaraan" />
                                <TextInput
                                    id="brand_type"
                                    type="text"
                                    name="brand_type"
                                    value={data.brand_type}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('brand_type', e.target.value)}
                                    placeholder="Contoh: Toyota Avanza / Isuzu Elf"
                                />
                                <InputError message={errors.brand_type} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="chassis_number" value="Nomor Rangka / Nomor Mesin" />
                                <TextInput
                                    id="chassis_number"
                                    type="text"
                                    name="chassis_number"
                                    value={data.chassis_number}
                                    className="mt-1 block w-full uppercase"
                                    onChange={(e) => setData('chassis_number', e.target.value.toUpperCase())}
                                />
                                <InputError message={errors.chassis_number} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="manufacture_year" value="Tahun Pembuatan" />
                                    <TextInput
                                        id="manufacture_year"
                                        type="number"
                                        name="manufacture_year"
                                        value={data.manufacture_year}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('manufacture_year', e.target.value)}
                                    />
                                    <InputError message={errors.manufacture_year} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="color" value="Warna" />
                                    <TextInput
                                        id="color"
                                        type="text"
                                        name="color"
                                        value={data.color}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('color', e.target.value)}
                                    />
                                    <InputError message={errors.color} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="capacity" value="Kapasitas Kendaraan" />
                                <TextInput
                                    id="capacity"
                                    type="text"
                                    name="capacity"
                                    value={data.capacity}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('capacity', e.target.value)}
                                    placeholder="Contoh: 15 Penumpang / 2 Ton"
                                />
                                <InputError message={errors.capacity} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Foto Kendaraan" />
                                <div className="mt-1 flex items-center gap-4">
                                    {photoPreview ? (
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => { setPhotoPreview(null); setData('photo', null); if(photoInputRef.current) photoInputRef.current.value = ''; }} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 hover:bg-white transition-colors">
                                                &times;
                                            </button>
                                        </div>
                                    ) : (
                                        <div onClick={() => photoInputRef.current?.click()} className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors">
                                            <span className="text-xs font-medium">Pilih Foto</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" ref={photoInputRef} onChange={handlePhotoChange} accept="image/*" />
                                    <div className="text-xs text-gray-500 flex-1">
                                        Format JPG, PNG, atau JPEG. Ukuran maksimal 2MB.
                                    </div>
                                </div>
                                <InputError message={errors.photo} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Administrasi & Legalitas */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-4">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Administrasi & Legalitas
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="annual_tax_date" value="Tanggal Jatuh Tempo Pajak 1 Tahunan" />
                                <CustomDatePicker
                                    value={data.annual_tax_date}
                                    onChange={(val) => setData('annual_tax_date', val)}
                                />
                                <InputError message={errors.annual_tax_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="five_year_tax_date" value="Tanggal Jatuh Tempo Pajak 5 Tahunan" />
                                <CustomDatePicker
                                    value={data.five_year_tax_date}
                                    onChange={(val) => setData('five_year_tax_date', val)}
                                />
                                <InputError message={errors.five_year_tax_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="stnk_expiry_date" value="Tanggal STNK Berakhir" />
                                <CustomDatePicker
                                    value={data.stnk_expiry_date}
                                    onChange={(val) => setData('stnk_expiry_date', val)}
                                />
                                <InputError message={errors.stnk_expiry_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="plate_replacement_date" value="Tanggal Ganti Plat Nomor" />
                                <CustomDatePicker
                                    value={data.plate_replacement_date}
                                    onChange={(val) => setData('plate_replacement_date', val)}
                                />
                                <InputError message={errors.plate_replacement_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kir_expiry_date" value="Tanggal KIR/Uji Berkala (Opsional)" />
                                <CustomDatePicker
                                    value={data.kir_expiry_date}
                                    onChange={(val) => setData('kir_expiry_date', val)}
                                />
                                <InputError message={errors.kir_expiry_date} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="insurance_policy" value="No. Polis Asuransi" />
                                    <TextInput
                                        id="insurance_policy"
                                        type="text"
                                        name="insurance_policy"
                                        value={data.insurance_policy}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('insurance_policy', e.target.value)}
                                    />
                                    <InputError message={errors.insurance_policy} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="insurance_expiry_date" value="Masa Berlaku Asuransi" />
                                    <CustomDatePicker
                                        value={data.insurance_expiry_date}
                                        onChange={(val) => setData('insurance_expiry_date', val)}
                                    />
                                    <InputError message={errors.insurance_expiry_date} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Perawatan & Operasional */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-4">
                            <Wrench className="w-5 h-5 text-orange-600" />
                            Perawatan & Operasional
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="scheduled_service_date" value="Jadwal Service Berkala Berikutnya" />
                                <CustomDatePicker
                                    value={data.scheduled_service_date}
                                    onChange={(val) => setData('scheduled_service_date', val)}
                                />
                                <InputError message={errors.scheduled_service_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="oil_change_schedule" value="Jadwal Ganti Oli Berikutnya" />
                                <CustomDatePicker
                                    value={data.oil_change_schedule}
                                    onChange={(val) => setData('oil_change_schedule', val)}
                                />
                                <InputError message={errors.oil_change_schedule} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="last_odometer" value="Kilometer Terakhir (Odometer)" />
                                <div className="flex items-center mt-1">
                                    <TextInput
                                        id="last_odometer"
                                        type="number"
                                        name="last_odometer"
                                        value={data.last_odometer}
                                        className="block w-full rounded-r-none border-r-0"
                                        onChange={(e) => setData('last_odometer', e.target.value)}
                                    />
                                    <span className="px-4 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium">KM</span>
                                </div>
                                <InputError message={errors.last_odometer} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="current_odometer" value="Odometer Sekarang" />
                                <div className="flex items-center mt-1">
                                    <TextInput
                                        id="current_odometer"
                                        type="number"
                                        name="current_odometer"
                                        value={data.current_odometer}
                                        className="block w-full rounded-r-none border-r-0"
                                        onChange={(e) => setData('current_odometer', e.target.value)}
                                    />
                                    <span className="px-4 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium">KM</span>
                                </div>
                                <InputError message={errors.current_odometer} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="repair_history" value="Riwayat Perbaikan / Catatan Tambahan" />
                                <textarea
                                    id="repair_history"
                                    name="repair_history"
                                    value={data.repair_history}
                                    onChange={(e) => setData('repair_history', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                    rows="4"
                                    placeholder="Contoh: Turun mesin di bengkel A pada tgl 12 Mei..."
                                ></textarea>
                                <InputError message={errors.repair_history} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Target Penggantian Sparepart */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-4">
                            <Wrench className="w-5 h-5 text-indigo-600" />
                            Target Penggantian Suku Cadang (Sparepart)
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            {/* Berdasarkan KM */}
                            <div className="space-y-4">
                                <h5 className="font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">Berdasarkan Jarak Tempuh (Target KM)</h5>
                                
                                <div>
                                    <InputLabel htmlFor="engine_oil_target_km" value="Oli Mesin (Target KM)" />
                                    <div className="flex items-center mt-1">
                                        <TextInput id="engine_oil_target_km" type="number" value={data.engine_oil_target_km} className="block w-full rounded-r-none border-r-0" onChange={(e) => setData('engine_oil_target_km', e.target.value)} placeholder="Contoh: 10000" />
                                        <span className="px-3 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium text-sm">KM</span>
                                    </div>
                                    <InputError message={errors.engine_oil_target_km} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="oil_filter_target_km" value="Filter Oli (Target KM)" />
                                    <div className="flex items-center mt-1">
                                        <TextInput id="oil_filter_target_km" type="number" value={data.oil_filter_target_km} className="block w-full rounded-r-none border-r-0" onChange={(e) => setData('oil_filter_target_km', e.target.value)} placeholder="Contoh: 10000" />
                                        <span className="px-3 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium text-sm">KM</span>
                                    </div>
                                    <InputError message={errors.oil_filter_target_km} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="air_filter_target_km" value="Saringan Udara Mesin (Target KM)" />
                                    <div className="flex items-center mt-1">
                                        <TextInput id="air_filter_target_km" type="number" value={data.air_filter_target_km} className="block w-full rounded-r-none border-r-0" onChange={(e) => setData('air_filter_target_km', e.target.value)} placeholder="Contoh: 10000" />
                                        <span className="px-3 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium text-sm">KM</span>
                                    </div>
                                    <InputError message={errors.air_filter_target_km} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ac_filter_target_km" value="Saringan Udara AC (Target KM)" />
                                    <div className="flex items-center mt-1">
                                        <TextInput id="ac_filter_target_km" type="number" value={data.ac_filter_target_km} className="block w-full rounded-r-none border-r-0" onChange={(e) => setData('ac_filter_target_km', e.target.value)} placeholder="Contoh: 10000" />
                                        <span className="px-3 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium text-sm">KM</span>
                                    </div>
                                    <InputError message={errors.ac_filter_target_km} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="transmission_oil_target_km" value="Oli Transmisi Matic (Target KM)" />
                                    <div className="flex items-center mt-1">
                                        <TextInput id="transmission_oil_target_km" type="number" value={data.transmission_oil_target_km} className="block w-full rounded-r-none border-r-0" onChange={(e) => setData('transmission_oil_target_km', e.target.value)} placeholder="Contoh: 40000" />
                                        <span className="px-3 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium text-sm">KM</span>
                                    </div>
                                    <InputError message={errors.transmission_oil_target_km} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="spark_plug_target_km" value="Busi (Target KM)" />
                                    <div className="flex items-center mt-1">
                                        <TextInput id="spark_plug_target_km" type="number" value={data.spark_plug_target_km} className="block w-full rounded-r-none border-r-0" onChange={(e) => setData('spark_plug_target_km', e.target.value)} placeholder="Contoh: 40000" />
                                        <span className="px-3 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium text-sm">KM</span>
                                    </div>
                                    <InputError message={errors.spark_plug_target_km} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="brake_pad_target_km" value="Kampas Rem Depan/Belakang (Target KM)" />
                                    <div className="flex items-center mt-1">
                                        <TextInput id="brake_pad_target_km" type="number" value={data.brake_pad_target_km} className="block w-full rounded-r-none border-r-0" onChange={(e) => setData('brake_pad_target_km', e.target.value)} placeholder="Contoh: 60000" />
                                        <span className="px-3 py-[9px] bg-gray-50 border border-gray-300 rounded-r-lg text-gray-500 font-medium text-sm">KM</span>
                                    </div>
                                    <InputError message={errors.brake_pad_target_km} className="mt-2" />
                                </div>
                            </div>
                            
                            {/* Berdasarkan Tanggal */}
                            <div className="space-y-4">
                                <h5 className="font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">Berdasarkan Waktu (Target Tanggal)</h5>
                                
                                <div>
                                    <InputLabel htmlFor="battery_target_date" value="Aki (Target Tanggal Ganti)" />
                                    <CustomDatePicker value={data.battery_target_date} onChange={(val) => setData('battery_target_date', val)} />
                                    <InputError message={errors.battery_target_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tire_target_date" value="Ban (Target Tanggal Ganti)" />
                                    <CustomDatePicker value={data.tire_target_date} onChange={(val) => setData('tire_target_date', val)} />
                                    <InputError message={errors.tire_target_date} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pb-10">
                        <Link 
                            href={route('vehicles.index')}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </Link>
                        <button 
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" /> {processing ? 'Menyimpan...' : 'Simpan Data Armada'}
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
