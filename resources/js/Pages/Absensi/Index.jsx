import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { CheckCircle2, Clock, MapPin, MapPinOff, CalendarDays, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Index({ attendance, today, currentTime, isOvertime, history = [] }) {
    const [isLocating, setIsLocating] = useState(false);
    const { data, setData, post, processing } = useForm({
        type: '',
        notes: '',
        latitude: '',
        longitude: '',
    });

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
        } else if (flash.error) {
            Swal.fire({
                title: 'Gagal!',
                text: flash.error,
                icon: 'error',
                confirmButtonColor: '#ef4444',
                customClass: { popup: 'rounded-2xl' }
            });
        }
    }, [flash]);

    const submitAttendance = (type) => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            setIsLocating(false);
            Swal.fire('Error', 'GPS/Geolocation tidak didukung oleh browser atau perangkat ini.', 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                router.post(route('absensi.store'), {
                    type: type,
                    latitude: latitude,
                    longitude: longitude,
                    notes: data.notes
                }, {
                    preserveScroll: true,
                    onFinish: () => setIsLocating(false)
                });
            },
            (error) => {
                setIsLocating(false);
                let msg = 'Gagal mendapatkan lokasi GPS. Pastikan GPS Anda aktif.';
                if (error.code === 1) msg = 'Akses lokasi ditolak. Silakan izinkan akses lokasi GPS pada browser Anda untuk absensi.';
                Swal.fire('Error Lokasi', msg, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    const hasCheckedIn = attendance?.check_in_time != null;
    const hasCheckedOut = attendance?.check_out_time != null;

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Presensi Harian</h2>}
        >
            <Head title="Absensi" />

            <div className="pb-6 pt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status Section */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 text-center">
                            <p className="text-blue-100 text-lg font-medium">{today}</p>
                            <h2 className="text-6xl font-black mt-2 tracking-tighter">{currentTime}</h2>
                            <p className="text-blue-200 mt-4 max-w-xl mx-auto text-sm">Pastikan Anda berada di lokasi kantor (PT) saat melakukan absensi masuk maupun pulang.</p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-xl text-gray-800 mb-6 border-b border-gray-50 pb-4">Aksi Absensi Anda</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Check In Status */}
                                <div className="flex gap-4 items-start p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${hasCheckedIn ? 'bg-green-100 text-green-600' : 'bg-white shadow-sm border border-gray-200 text-gray-400'}`}>
                                        {hasCheckedIn ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-gray-800">Absen Masuk</p>
                                        <p className="text-sm font-medium text-gray-500 mt-1">{hasCheckedIn ? `Berhasil: ${attendance.check_in_time}` : 'Belum Absen'}</p>

                                        {!hasCheckedIn && (
                                            <button
                                                onClick={() => submitAttendance('check_in')}
                                                disabled={isLocating}
                                                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
                                            >
                                                {isLocating ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari Lokasi...</> : <><MapPin className="w-4 h-4" /> Kirim Absen Masuk</>}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Check Out Status */}
                                <div className="flex gap-4 items-start p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${hasCheckedOut ? 'bg-green-100 text-green-600' : 'bg-white shadow-sm border border-gray-200 text-gray-400'}`}>
                                        {hasCheckedOut ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-gray-800">Absen Pulang</p>
                                        <p className="text-sm font-medium text-gray-500 mt-1">{hasCheckedOut ? `Berhasil: ${attendance.check_out_time}` : 'Belum Absen'}</p>

                                        {hasCheckedIn && !hasCheckedOut && (
                                            <div className="mt-4 space-y-4">
                                                {isOvertime && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                            Catatan Lembur <span className="text-red-500">*</span>
                                                        </label>
                                                        <textarea
                                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-purple-500 focus:border-purple-500"
                                                            rows="2"
                                                            value={data.notes}
                                                            onChange={(e) => setData('notes', e.target.value)}
                                                            placeholder="Jelaskan alasan lembur..."
                                                            required
                                                        ></textarea>
                                                        <p className="text-xs text-red-500 mt-1">Wajib diisi karena absen di atas jam 20:00</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => submitAttendance('check_out')}
                                                    disabled={isLocating || (isOvertime && !data.notes.trim())}
                                                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30"
                                                >
                                                    {isLocating ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari Lokasi...</> : <><MapPin className="w-4 h-4" /> Kirim Absen Pulang</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Riwayat Absensi 1 Bulan */}
                <div className="mt-8 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">Riwayat Absensi Bulan Ini</h3>
                            <p className="text-sm text-gray-500">Rekapan kehadiran Anda selama bulan ini</p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-l-xl">Tanggal</th>
                                    <th className="px-4 py-3 font-medium">Jam Masuk</th>
                                    <th className="px-4 py-3 font-medium">Jam Keluar</th>
                                    <th className="px-4 py-3 font-medium rounded-r-xl">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.length > 0 ? history.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.check_in_time ? (
                                                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500"/> {item.check_in_time}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.check_out_time ? (
                                                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-green-500"/> {item.check_out_time}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                item.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' :
                                                item.status === 'Sakit' ? 'bg-orange-100 text-orange-700' :
                                                item.status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {item.status || 'Hadir'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">Belum ada riwayat absensi bulan ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

