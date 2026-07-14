import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, CheckCircle2, Clock, MapPinOff, RefreshCcw } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';

export default function Index({ attendance, today, currentTime }) {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const { data, setData, post, processing } = useForm({
        photo: '',
        type: '',
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
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        <Camera className="text-blue-600" />
                                        Kamera Utama
                                    </h3>
                                </div>
                            </div>

                            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                                {!imgSrc ? (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                        videoConstraints={{ facingMode: "user" }}
                                        mirrored={true}
                                    />
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
                                        className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
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
                                            <button
                                                onClick={() => submitAttendance('check_out')}
                                                disabled={processing}
                                                className="mt-3 w-full bg-purple-600 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                                            >
                                                Kirim Absen Pulang
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
