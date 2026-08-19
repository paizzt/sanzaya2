import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Activity, Truck, Calendar, FileText, Image as ImageIcon, Trash2, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

export default function Usages({ usages, vehicles, filters }) {
    const { flash } = usePage().props;

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Catatan?',
            text: "Catatan penggunaan ini akan dihapus secara permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('vehicle-usages.destroy', id), { preserveScroll: true });
            }
        });
    };

    const handleFilterChange = (e) => {
        router.get(route('vehicle-usages.index'), { vehicle_id: e.target.value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Log Penggunaan Armada</h2>}
        >
            <Head title="Log Armada" />

            <div className="pb-6 pt-0 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('vehicles.index')}
                            className="p-2.5 bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-gray-100 flex items-center justify-center w-fit"
                            title="Kembali ke Data Armada"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                        </Link>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-green-600" />
                                Riwayat Penggunaan Seluruh Armada
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select 
                                value={filters.vehicle_id || ''}
                                onChange={handleFilterChange}
                                className="pl-9 pr-10 py-2.5 bg-white border-gray-200 text-gray-700 font-medium rounded-xl shadow-sm text-sm focus:border-green-500 focus:ring-green-500 hover:border-gray-300 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Semua Kendaraan</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.license_plate} - {v.brand_type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Tanggal & User</th>
                                    <th className="px-6 py-4">Kendaraan</th>
                                    <th className="px-6 py-4">Tujuan</th>
                                    <th className="px-6 py-4">Biaya Bensin</th>
                                    <th className="px-6 py-4 text-center">Bukti Foto</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usages.data.length > 0 ? usages.data.map((usage) => (
                                    <tr key={usage.id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{dayjs(usage.created_at).format('DD MMM YYYY HH:mm')}</div>
                                            <div className="text-xs text-gray-500 mt-1">Oleh: {usage.user?.name || 'Sistem'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 uppercase">{usage.vehicle?.license_plate}</div>
                                            <div className="text-xs text-gray-500">{usage.vehicle?.brand_type}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {usage.destination || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {usage.gas_expense > 0 ? (
                                                <span className="font-semibold text-red-600">Rp {Number(usage.gas_expense).toLocaleString('id-ID')}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {usage.usage_photo && (
                                                    <a href={`/storage/${usage.usage_photo}`} target="_blank" className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg tooltip transition-colors" title="Lihat Foto Kendaraan">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {usage.receipt_photo && (
                                                    <a href={`/storage/${usage.receipt_photo}`} target="_blank" className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg tooltip transition-colors" title="Lihat Nota Bensin">
                                                        <FileText className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {!usage.usage_photo && !usage.receipt_photo && (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => handleDelete(usage.id)}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors tooltip"
                                                    title="Hapus Catatan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            Belum ada data log penggunaan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {usages.links && usages.links.length > 3 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                            {usages.links.map((link, k) => (
                                <Link
                                    key={k}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white font-semibold'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
