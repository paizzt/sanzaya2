import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { CheckCircle2, Clock, MapPin, MapPinOff, CalendarDays, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import imageCompression from 'browser-image-compression';
import Webcam from 'react-webcam';

const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
};

export default function Index({ attendance, today, currentTime, isOvertime, history = [], company, isMarketing }) {
    const [isLocating, setIsLocating] = useState(false);
    const [showWebcamModal, setShowWebcamModal] = useState(false);
    const [pendingAttendance, setPendingAttendance] = useState(null);
    const [facingMode, setFacingMode] = useState("user");
    const webcamRef = useRef(null);
    
    const { data, setData, post, processing } = useForm({
        type: '',
        notes: '',
        latitude: '',
        longitude: '',
    });

    const [liveTime, setLiveTime] = useState(currentTime + ':00');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            setLiveTime(`${hours}:${minutes}:${seconds}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

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
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                let isFar = false;
                if (!isMarketing && company) {
                    const compLat = company.latitude;
                    const compLon = company.longitude;
                    const maxRadius = company.radius || 300;
                    
                    const R = 6371e3;
                    const phi1 = compLat * Math.PI/180;
                    const phi2 = latitude * Math.PI/180;
                    const dPhi = (latitude-compLat) * Math.PI/180;
                    const dLam = (longitude-compLon) * Math.PI/180;

                    const a = Math.sin(dPhi/2) * Math.sin(dPhi/2) +
                            Math.cos(phi1) * Math.cos(phi2) *
                            Math.sin(dLam/2) * Math.sin(dLam/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                    const distance = R * c;
                    
                    if (distance > maxRadius) {
                        isFar = true;
                    }
                }

                if (isFar) {
                    setIsLocating(false);
                    Swal.fire({
                        title: 'Lokasi Anda Jauh',
                        text: 'Sistem mendeteksi Anda di luar radius kantor PT. Anda harus mengambil foto langsung sebagai bukti.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Buka Kamera',
                        cancelButtonText: 'Batal'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setPendingAttendance({ type, latitude, longitude });
                            setShowWebcamModal(true);
                        }
                    });
                } else {
                    sendAttendancePost(type, latitude, longitude, null);
                }
            },
            (error) => {
                setIsLocating(false);
                let msg = 'Gagal mendapatkan lokasi GPS. Pastikan GPS/Lokasi perangkat Anda aktif.';
                if (error.code === 1) {
                    msg = `<b>Akses lokasi ditolak oleh browser.</b><br><br>
                           Sistem tidak bisa meminta izin lagi secara otomatis. Anda harus mengizinkannya secara manual:<br><br>
                           1. Klik ikon <b>Gembok/Settings</b> di samping alamat web (di atas).<br>
                           2. Pilih <b>Izin (Permissions)</b>.<br>
                           3. Ubah Izin Lokasi (Location) menjadi <b>Izinkan (Allow)</b>.<br>
                           4. Muat ulang (Refresh) halaman ini.`;
                }
                Swal.fire({
                    title: 'Error Lokasi',
                    html: msg,
                    icon: 'error'
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    const sendAttendancePost = (type, latitude, longitude, photoUrl) => {
        router.post(route('absensi.store'), {
            type: type,
            latitude: latitude,
            longitude: longitude,
            notes: data.notes,
            photo_url: photoUrl
        }, {
            preserveScroll: true,
            onFinish: () => setIsLocating(false)
        });
    };

    const captureAndSubmit = async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;
        
        setShowWebcamModal(false);
        Swal.fire({
            title: 'Memproses...',
            text: 'Sedang mengunggah foto dan absensi',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const file = dataURLtoFile(imageSrc, 'attendance.jpg');
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: true
            };
            const compressedFile = await imageCompression(file, options);
            
            const formData = new FormData();
            formData.append('image', compressedFile);
            
            const response = await fetch('https://api.imgbb.com/1/upload?key=5950b44b24860057ff810fe73f58868b', {
                method: 'POST',
                body: formData
            });
            
            const imgData = await response.json();
            
            if (imgData.success) {
                sendAttendancePost(pendingAttendance.type, pendingAttendance.latitude, pendingAttendance.longitude, imgData.data.url);
            } else {
                Swal.fire('Gagal!', 'Gagal mengunggah gambar.', 'error');
            }
        } catch (error) {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat mengompres/mengunggah gambar.', 'error');
        }
    };

    const hasCheckedIn = attendance?.check_in_time != null;
    const hasCheckedOut = attendance?.check_out_time != null;

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Presensi Harian</h2>}
        >
            <Head title="Absensi" />

            <div className="pb-6 pt-0 space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status Section */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 text-center">
                            <p className="text-blue-100 text-lg font-medium">{today}</p>
                            <h2 className="text-6xl font-black mt-2 tracking-tighter tabular-nums">{liveTime}</h2>
                            <p className="text-blue-200 mt-4 max-w-xl mx-auto text-sm">Pastikan Anda berada di lokasi kantor (PT) saat melakukan absensi masuk maupun pulang.</p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Check In Status */}
                                <div className="flex gap-4 items-start p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                                    {hasCheckedIn && (
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600">
                                            <CheckCircle2 className="w-7 h-7" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-gray-800">Absen Masuk</p>
                                        <p className="text-sm font-medium text-gray-500 mt-1">{hasCheckedIn ? `Berhasil: ${attendance.check_in_time}` : 'Belum Absen'}</p>

                                        {!hasCheckedIn && (
                                            <button
                                                onClick={() => submitAttendance('check_in')}
                                                disabled={isLocating}
                                                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
                                            >
                                                {isLocating ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari Lokasi...</> : <>Masuk</>}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Check Out Status */}
                                <div className="flex gap-4 items-start p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                                    {hasCheckedOut && (
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600">
                                            <CheckCircle2 className="w-7 h-7" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-gray-800">Absen Pulang</p>
                                        <p className="text-sm font-medium text-gray-500 mt-1">{hasCheckedOut ? `Berhasil: ${attendance.check_out_time}` : 'Belum Absen'}</p>

                                        {hasCheckedIn && !hasCheckedOut && (
                                            <div className="mt-4 space-y-4">
                                                {isOvertime && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                            Catatan Lembur (Opsional)
                                                        </label>
                                                        <textarea
                                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                            rows="2"
                                                            value={data.notes}
                                                            onChange={(e) => setData('notes', e.target.value)}
                                                            placeholder="Jelaskan alasan lembur..."
                                                        ></textarea>
                                                        <p className="text-xs text-blue-500 mt-1">Isi catatan jika Anda terhitung lembur, kosongkan jika tidak lembur.</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => submitAttendance('check_out')}
                                                    disabled={isLocating}
                                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
                                                >
                                                    {isLocating ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari Lokasi...</> : <>Keluar</>}
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
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
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

            {/* Webcam Modal */}
            {showWebcamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Ambil Foto Bukti Lokasi</h3>
                            <button onClick={() => setShowWebcamModal(false)} className="text-gray-400 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-black relative flex-1 flex flex-col items-center justify-center min-h-[300px]">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: facingMode }}
                                mirrored={facingMode === "user"}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
                                className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm text-white shadow-lg transition-colors"
                                title="Flip Kamera"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 bg-white flex justify-between gap-3">
                            <button
                                onClick={() => setShowWebcamModal(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200"
                            >
                                Batal
                            </button>
                            <button
                                onClick={captureAndSubmit}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Ambil & Absen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

