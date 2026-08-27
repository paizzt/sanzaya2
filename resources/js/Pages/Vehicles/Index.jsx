import ExportDropdown from '@/Components/ExportDropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { Truck, Plus, Edit, Trash2, Calendar, FileText, AlertTriangle, X, Eye, ShieldCheck, Wrench, History, ClipboardEdit, Image as ImageIcon } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Index({ vehicles }) {
    const { flash, auth } = usePage().props;
    const userRoles = auth.user?.roles?.map(r => r.name?.toLowerCase()) || [];
    const canManage = userRoles.includes('superadmin') || userRoles.includes('manajemen');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUsageFormOpen, setIsUsageFormOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        destination: '',
        gas_expense: '',
        usage_photo: null,
        receipt_photo: [],
        vehicle_id: null
    });

    const handleUsageSubmit = (e) => {
        e.preventDefault();
        post(route('vehicle-usages.store'), {
            onSuccess: () => {
                setIsUsageFormOpen(false);
                reset();
                clearErrors();
                setIsModalOpen(false); // Reload happens, close modal or just fetch updated data
            }
        });
    };

    useEffect(() => {
        if (flash.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', customClass: { popup: 'rounded-2xl' } });
        }
        if (flash.error) {
            Swal.fire({ title: 'Gagal!', text: flash.error, icon: 'error', customClass: { popup: 'rounded-2xl' } });
        }
    }, [flash]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Armada?',
            text: "Data kendaraan ini akan dihapus secara permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('vehicles.destroy', id), { preserveScroll: true });
            }
        });
    };

    const isExpiringSoon = (date) => {
        if (!date) return false;
        const today = dayjs();
        const expiryDate = dayjs(date);
        return expiryDate.diff(today, 'day') <= 30 && expiryDate.diff(today, 'day') >= 0;
    };

    const isExpired = (date) => {
        if (!date) return false;
        return dayjs(date).isBefore(dayjs());
    };

    const StatusBadge = ({ date, label }) => {
        if (!date) return null;
        if (isExpired(date)) {
            return <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 w-max flex items-center gap-1 font-medium"><AlertTriangle className="w-3 h-3" /> {label} Exp</span>;
        }
        if (isExpiringSoon(date)) {
            return <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 w-max flex items-center gap-1 font-medium"><AlertTriangle className="w-3 h-3" /> {label} H-30</span>;
        }
        return <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 w-max font-medium">{label} Aman</span>;
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Manajemen Armada</h2>}
        >
            <Head title="Data Armada" />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Truck className="w-8 h-8 text-blue-600" />
                            Daftar Kendaraan Operasional
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                            Kelola data kendaraan, legalitas, dan jadwal perawatan rutin.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-3 w-full md:w-auto">
                        <Link 
                            href={route('vehicle-usages.index')}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-gray-100 hover:text-blue-600 transition-colors gap-2 whitespace-nowrap"
                        >
                            <History className="w-4 h-4" /> Riwayat Jalan
                        </Link>
                        <div className="w-full">
                            <ExportDropdown pdfRoute={route('vehicles.export.pdf')} excelRoute={route('vehicles.export.excel')} className="w-full justify-center" />
                        </div>
                        {canManage && (
                            <Link 
                                href={route('vehicles.create')}
                                className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Tambah Armada
                            </Link>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Kendaraan</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Status Legalitas</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Perawatan Terakhir</th>
                                    <th className="px-4 sm:px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.data.length > 0 ? vehicles.data.map((vehicle) => (
                                    <tr 
                                        key={vehicle.id} 
                                        onClick={() => { setSelectedVehicle(vehicle); setIsModalOpen(true); }}
                                        className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {vehicle.photo ? (
                                                    <img src={`/storage/${vehicle.photo}`} alt={vehicle.license_plate} className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                                                ) : (
                                                    <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400">
                                                        <Truck className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg uppercase">{vehicle.license_plate}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <span>{vehicle.brand_type || '-'}</span>
                                                        {vehicle.manufacture_year && <span>• {vehicle.manufacture_year}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex flex-col gap-1.5">
                                                <StatusBadge date={vehicle.annual_tax_date} label="Pajak 1 Thn" />
                                                <StatusBadge date={vehicle.stnk_expiry_date} label="STNK" />
                                                <StatusBadge date={vehicle.kir_expiry_date} label="KIR" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <Calendar className="w-3.5 h-3.5" /> 
                                                    Service: {vehicle.scheduled_service_date ? dayjs(vehicle.scheduled_service_date).format('DD MMM YYYY') : '-'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <FileText className="w-3.5 h-3.5" /> 
                                                    Odo: {vehicle.last_odometer ? `${vehicle.last_odometer.toLocaleString('id-ID')} km` : '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-center items-center gap-2">
                                                <button 
                                                    onClick={() => { setSelectedVehicle(vehicle); setData('vehicle_id', vehicle.id); setIsUsageFormOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip flex items-center justify-center gap-1.5 font-semibold text-xs whitespace-nowrap"
                                                    title="Catat Penggunaan"
                                                >
                                                    <ClipboardEdit className="w-4 h-4" />
                                                    <span>Catat</span>
                                                </button>
                                                {canManage && (
                                                    <>
                                                        <button 
                                                            onClick={() => { setSelectedVehicle(vehicle); setIsModalOpen(true); }}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <Link 
                                                            href={route('vehicles.edit', vehicle.id)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                            title="Edit Data"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(vehicle.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Belum ada data armada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Detail Armada */}
            {isModalOpen && selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Truck className="w-6 h-6 text-blue-600" />
                                Detail Armada: {selectedVehicle.license_plate}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 overflow-y-auto bg-gray-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Kolom Kiri: Info Utama & Foto */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white rounded-2xl p-1 border border-gray-100 shadow-sm overflow-hidden">
                                        {selectedVehicle.photo ? (
                                            <img src={`/storage/${selectedVehicle.photo}`} alt={selectedVehicle.license_plate} className="w-full h-48 object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-gray-200 border-dashed">
                                                <Truck className="w-12 h-12 mb-2" />
                                                <span className="text-sm font-medium">Tidak ada foto</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Nomor Polisi</p>
                                            <p className="text-lg font-bold text-gray-900 uppercase">{selectedVehicle.license_plate}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Merk & Tipe</p>
                                            <p className="font-semibold text-gray-800">{selectedVehicle.brand_type || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Warna</p>
                                            <p className="font-semibold text-gray-800">{selectedVehicle.color || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Tahun Pembuatan</p>
                                            <p className="font-semibold text-gray-800">{selectedVehicle.manufacture_year || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Kapasitas</p>
                                            <p className="font-semibold text-gray-800">{selectedVehicle.capacity || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">No. Rangka / Mesin</p>
                                            <p className="font-semibold text-gray-800 uppercase">{selectedVehicle.chassis_number || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Kolom Kanan: Legalitas & Perawatan */}
                                <div className="lg:col-span-2 space-y-6">
                                    
                                    {/* Legalitas */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-3">
                                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                            Administrasi & Legalitas
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Pajak Tahunan</p>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                    {selectedVehicle.annual_tax_date ? dayjs(selectedVehicle.annual_tax_date).format('DD MMMM YYYY') : '-'}
                                                    <StatusBadge date={selectedVehicle.annual_tax_date} label="" />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Pajak 5 Tahunan (Ganti Plat)</p>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                    {selectedVehicle.five_year_tax_date ? dayjs(selectedVehicle.five_year_tax_date).format('DD MMMM YYYY') : '-'}
                                                    <StatusBadge date={selectedVehicle.five_year_tax_date} label="" />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Masa Berlaku STNK</p>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                    {selectedVehicle.stnk_expiry_date ? dayjs(selectedVehicle.stnk_expiry_date).format('DD MMMM YYYY') : '-'}
                                                    <StatusBadge date={selectedVehicle.stnk_expiry_date} label="" />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Masa Berlaku KIR</p>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                    {selectedVehicle.kir_expiry_date ? dayjs(selectedVehicle.kir_expiry_date).format('DD MMMM YYYY') : '-'}
                                                    {selectedVehicle.kir_expiry_date && <StatusBadge date={selectedVehicle.kir_expiry_date} label="" />}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Asuransi (No. Polis)</p>
                                                <p className="font-semibold text-gray-800">{selectedVehicle.insurance_policy || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Masa Berlaku Asuransi</p>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedVehicle.insurance_expiry_date ? dayjs(selectedVehicle.insurance_expiry_date).format('DD MMMM YYYY') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Perawatan */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-3">
                                            <Wrench className="w-5 h-5 text-orange-600" />
                                            Perawatan & Operasional
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Jadwal Service Berikutnya</p>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedVehicle.scheduled_service_date ? dayjs(selectedVehicle.scheduled_service_date).format('DD MMMM YYYY') : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Jadwal Ganti Oli Berikutnya</p>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedVehicle.oil_change_schedule ? dayjs(selectedVehicle.oil_change_schedule).format('DD MMMM YYYY') : '-'}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 font-medium">Odometer Terakhir</p>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedVehicle.last_odometer ? `${selectedVehicle.last_odometer.toLocaleString('id-ID')} KM` : '-'}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-xs text-gray-500 font-medium">Odometer Sekarang</p>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedVehicle.current_odometer ? `${selectedVehicle.current_odometer.toLocaleString('id-ID')} KM` : '-'}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500 font-medium">Riwayat Perbaikan</p>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                                                    {selectedVehicle.repair_history || 'Belum ada catatan perbaikan.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Target Suku Cadang */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-3">
                                            <Wrench className="w-5 h-5 text-indigo-600" />
                                            Target Penggantian Suku Cadang
                                        </h4>
                                        
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Berdasarkan Jarak Tempuh (KM)</p>
                                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Oli Mesin</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedVehicle.engine_oil_target_km ? `${selectedVehicle.engine_oil_target_km.toLocaleString('id-ID')} KM` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Filter Oli</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedVehicle.oil_filter_target_km ? `${selectedVehicle.oil_filter_target_km.toLocaleString('id-ID')} KM` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Saringan Udara Mesin</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedVehicle.air_filter_target_km ? `${selectedVehicle.air_filter_target_km.toLocaleString('id-ID')} KM` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Saringan Udara AC</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedVehicle.ac_filter_target_km ? `${selectedVehicle.ac_filter_target_km.toLocaleString('id-ID')} KM` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Oli Transmisi Matic</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedVehicle.transmission_oil_target_km ? `${selectedVehicle.transmission_oil_target_km.toLocaleString('id-ID')} KM` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Busi</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedVehicle.spark_plug_target_km ? `${selectedVehicle.spark_plug_target_km.toLocaleString('id-ID')} KM` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Kampas Rem (Depan/Belakang)</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedVehicle.brake_pad_target_km ? `${selectedVehicle.brake_pad_target_km.toLocaleString('id-ID')} KM` : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-t pt-4">Berdasarkan Waktu</p>
                                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Aki</p>
                                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                        {selectedVehicle.battery_target_date ? dayjs(selectedVehicle.battery_target_date).format('DD MMMM YYYY') : '-'}
                                                        <StatusBadge date={selectedVehicle.battery_target_date} label="" />
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Ban</p>
                                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                        {selectedVehicle.tire_target_date ? dayjs(selectedVehicle.tire_target_date).format('DD MMMM YYYY') : '-'}
                                                        <StatusBadge date={selectedVehicle.tire_target_date} label="" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    
                                    {/* Riwayat Penggunaan Singkat */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mt-6">
                                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                                            <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                                <ClipboardEdit className="w-5 h-5 text-green-600" />
                                                Riwayat Penggunaan
                                            </h4>
                                            <button 
                                                onClick={() => {
                                                    setData('vehicle_id', selectedVehicle.id);
                                                    setIsUsageFormOpen(true);
                                                }}
                                                className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Catat
                                            </button>
                                        </div>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                            {selectedVehicle.vehicle_usages && selectedVehicle.vehicle_usages.length > 0 ? (
                                                selectedVehicle.vehicle_usages.slice(0, 5).map(usage => (
                                                    <div key={usage.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-sm">{usage.destination || 'Tanpa Tujuan'}</p>
                                                                <p className="text-xs text-gray-500">{dayjs(usage.created_at).format('DD MMM YYYY HH:mm')}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                {usage.gas_expense > 0 && (
                                                                    <p className="text-xs font-bold text-red-600">Bensin: Rp {Number(usage.gas_expense).toLocaleString('id-ID')}</p>
                                                                )}
                                                                <div className="flex gap-2 mt-1 justify-end">
                                                                    {usage.usage_photo && (
                                                                        <a href={`/storage/${usage.usage_photo}`} target="_blank" className="text-blue-500 hover:text-blue-700 tooltip" title="Foto Kendaraan">
                                                                            <ImageIcon className="w-4 h-4" />
                                                                        </a>
                                                                    )}
                                                                    {usage.receipt_photo && (
                                                                        Array.isArray(usage.receipt_photo) ? (
                                                                            usage.receipt_photo.map((photo, idx) => (
                                                                                <a key={idx} href={`/storage/${photo}`} target="_blank" className="text-orange-500 hover:text-orange-700 tooltip" title={`Nota Bensin ${idx + 1}`}>
                                                                                    <FileText className="w-4 h-4" />
                                                                                </a>
                                                                            ))
                                                                        ) : (
                                                                            <a href={`/storage/${usage.receipt_photo}`} target="_blank" className="text-orange-500 hover:text-orange-700 tooltip" title="Nota Bensin">
                                                                                <FileText className="w-4 h-4" />
                                                                            </a>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">Belum ada riwayat penggunaan</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isUsageFormOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <form onSubmit={handleUsageSubmit}>
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <ClipboardEdit className="w-6 h-6 text-green-600" />
                                    Catat Penggunaan Kendaraan
                                </h3>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsUsageFormOpen(false);
                                        reset();
                                        clearErrors();
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Penggunaan</label>
                                    <input 
                                        type="text" 
                                        value={data.destination}
                                        onChange={e => setData('destination', e.target.value)}
                                        className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl shadow-sm"
                                        />
                                    {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Bensin</label>
                                    <NumericFormat
                                        value={data.gas_expense}
                                        onValueChange={(values) => {
                                            setData('gas_expense', values.value);
                                        }}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="Rp "
                                        className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl shadow-sm"
                                        />
                                    {errors.gas_expense && <p className="text-red-500 text-xs mt-1">{errors.gas_expense}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto Penggunaan</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={e => setData('usage_photo', e.target.files[0])}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                    />
                                    {errors.usage_photo && <p className="text-red-500 text-xs mt-1">{errors.usage_photo}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto Nota Bensin</label>
                                    <input 
                                        type="file" 
                                        multiple
                                        accept="image/*"
                                        onChange={e => setData('receipt_photo', Array.from(e.target.files))}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {errors.receipt_photo && <p className="text-red-500 text-xs mt-1">{errors.receipt_photo}</p>}
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsUsageFormOpen(false);
                                        reset();
                                        clearErrors();
                                    }}
                                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
