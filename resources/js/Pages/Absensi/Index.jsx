import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, CheckCircle2, Clock, MapPinOff, RefreshCcw, CalendarDays } from 'lucide-react';
import React, { useRef, useState, useCallback, useEffect, Suspense } from 'react';
const Webcam = React.lazy(() => import('react-webcam'));
import Swal from 'sweetalert2';

export default function Index({ attendance, today, currentTime, isOvertime, history = [] }) {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const { data, setData, post, processing } = useForm({
        photo: '',
        type: '',
        notes: '',
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
            setImgSrc(null);
        } else if (flash.error) {
            Swal.fire({
                title: 'Gagal!',
                text: flash.error,
                icon: 'error',
                confirmButtonColor: '#ef4444',
                customClass: { popup: 'rounded-2xl' }
            });
            setImgSrc(null);
        }
    }, [flash]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        setData('photo', imageSrc);
    }, [webcamRef, setData]);

    const submitAttendance = (type) => {
        setData('type', type);
        setTimeout(() => {
            post(route('absensi.store'), {
                preserveScroll: true,
            });
        }, 100);
    };

    const hasCheckedIn = attendance?.check_in_time != null;
    const hasCheckedOut = attendance?.check_out_time != null;

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Presensi Harian</h2>}
        >
            <Head title="Absensi" />

            <div className="pb-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Camera Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        <Camera className="text-blue-600" />
                                        Kamera Utama
                                    </h3>
                                </div>
                            </div>

                            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                                {!imgSrc ? (
                                    <Suspense fallback={<div className="text-white animate-pulse">Memuat Kamera...</div>}>
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            screenshotQuality={0.7}
                                            className="w-full h-full object-cover"
                                            videoConstraints={{ facingMode: "user", width: 720, height: 480 }}
                                            mirrored={true}
                                        />
                                    </Suspense>
                                ) : (
                                    <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
                                )}

                                {!imgSrc && (
                                    <div className="absolute inset-0 border-4 border-white/20 rounded-2xl pointer-events-none">
                                        <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-dashed border-white/50 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-4">
                                {!imgSrc ? (
                                    <button
                                        onClick={capture}
                                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 shrink-0"
                                    >
                                        <Camera className="w-5 h-5" /> Ambil Foto
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setImgSrc(null)}
                                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw className="w-5 h-5" /> Ulangi Foto
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
                            <p className="text-blue-100 text-sm font-medium">{today}</p>
                            <h2 className="text-5xl font-black mt-2 tracking-tighter">{currentTime}</h2>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 border-b border-gray-50 pb-4">Status Absensi Anda</h3>

                            <div className="space-y-6">
                                {/* Check In Status */}
                                <div className="flex gap-4 items-start">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${hasCheckedIn ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                        {hasCheckedIn ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Absen Masuk</p>
                                        <p className="text-sm text-gray-500 mt-1">{hasCheckedIn ? attendance.check_in_time : 'Belum Absen'}</p>

                                        {!hasCheckedIn && imgSrc && (
                                            <button
                                                onClick={() => submitAttendance('check_in')}
                                                disabled={processing}
                                                className="mt-3 w-full bg-blue-600 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                                            >
                                                Kirim Absen Masuk
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Check Out Status */}
                                <div className="flex gap-4 items-start">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${hasCheckedOut ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                        {hasCheckedOut ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Absen Pulang</p>
                                        <p className="text-sm text-gray-500 mt-1">{hasCheckedOut ? attendance.check_out_time : 'Belum Absen'}</p>

                                        {hasCheckedIn && !hasCheckedOut && imgSrc && (
                                            <div className="mt-4 space-y-3">
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
                                                            required
                                                        ></textarea>
                                                        <p className="text-xs text-red-500 mt-1">Wajib diisi karena absen di atas jam 20:00</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => submitAttendance('check_out')}
                                                    disabled={processing || (isOvertime && !data.notes.trim())}
                                                    className="w-full bg-purple-600 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                                                >
                                                    Kirim Absen Pulang
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
