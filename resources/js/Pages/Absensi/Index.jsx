import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { CheckCircle2, Check, Clock, CalendarDays, List, Loader2, Sun, Moon, Camera, AlertCircle, HeartPulse, CalendarCheck, FileText } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Swal from 'sweetalert2';
import imageCompression from 'browser-image-compression';
import Webcam from 'react-webcam';
import ClientPagination from '@/Components/ClientPagination';

const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
};

const parseLocalDate = (dStr) => {
    if (!dStr) return null;
    const clean = String(dStr).slice(0, 10);
    const parts = clean.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
};

const formatDateRange = (start, end) => {
    if (!start) return '-';
    const sDate = parseLocalDate(start);
    if (!sDate) return start;
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const sText = sDate.toLocaleDateString('id-ID', options);
    if (!end || start === end) return sText;
    const eDate = parseLocalDate(end);
    if (!eDate) return sText;
    const eText = eDate.toLocaleDateString('id-ID', options);
    return `${sText} s/d ${eText}`;
};

const CALENDAR_DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const CALENDAR_STYLES = {
    hadir: {
        cell: 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200/80',
        dot: 'bg-emerald-500',
    },
    lembur: {
        cell: 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200/80',
        dot: 'bg-blue-600',
    },
    sakit: {
        cell: 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200/80',
        dot: 'bg-orange-500',
    },
    tidak_hadir: {
        cell: 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200/80',
        dot: 'bg-red-500',
    },
    izin: {
        cell: 'bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200/80',
        dot: 'bg-yellow-500',
    },
    cuti: {
        cell: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200/80',
        dot: 'bg-purple-500',
    },
    belum_absen: {
        cell: 'bg-white text-blue-700 border-blue-400 border-dashed hover:bg-blue-50/50',
        dot: 'bg-blue-400',
    },
    libur: {
        cell: 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100/80',
        dot: 'bg-gray-300',
    },
    mendatang: {
        cell: 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50',
        dot: 'bg-transparent',
    },
};

export default function Index({ attendance, approvedLeave = null, today, todayDate = null, currentMonth = null, currentYear = null, currentTime, isOvertime, isSaturday, isSunday, isOffDay, userWorkDays, history = [], company, isMarketing, isSatpam, activeDutySatpam, tanpaLembur = false, tanpaKeterlambatan = false, overtimeWeekdayStart = '20:00', overtimeSaturdayStart = '14:00' }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [historyView, setHistoryView] = useState('table');
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);

    const nowLocal = new Date();
    const resolvedYear = currentYear || nowLocal.getFullYear();
    const resolvedMonth = currentMonth || (nowLocal.getMonth() + 1);
    const resolvedTodayDate = todayDate || `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(resolvedTodayDate);

    const calendarData = useMemo(() => {
        const historyByDate = {};
        history.forEach((item) => {
            if (!item?.date) return;
            const key = String(item.date).slice(0, 10);
            if (!historyByDate[key]) {
                historyByDate[key] = item;
            }
        });

        const daysInMonth = new Date(resolvedYear, resolvedMonth, 0).getDate();
        const firstDayOfWeek = new Date(resolvedYear, resolvedMonth - 1, 1).getDay();
        const leadingEmptyCount = (firstDayOfWeek + 6) % 7;
        const monthLabel = new Date(resolvedYear, resolvedMonth - 1, 1).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
        });

        const stats = {
            hadir: 0,
            lembur: 0,
            sakit: 0,
            tidak_hadir: 0,
            izin: 0,
            cuti: 0,
        };

        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${resolvedYear}-${String(resolvedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dateObj = new Date(resolvedYear, resolvedMonth - 1, d);
            const dayOfWeek = dateObj.getDay();
            const isDayOff = dayOfWeek === 0 || (dayOfWeek === 6 && (userWorkDays || 6) <= 5);
            const isPast = dateStr < resolvedTodayDate;
            const isTodayCell = dateStr === resolvedTodayDate;
            const record = historyByDate[dateStr] || null;

            let category = 'mendatang';
            let shortLabel = '';
            let fullLabel = 'Belum Berlangsung';

            if (record) {
                const st = String(record.status || 'Hadir').toLowerCase();
                const isLateExempt = tanpaKeterlambatan || isDayOff;

                if (record.is_lembur || st === 'lembur') {
                    category = 'lembur';
                    shortLabel = 'Lembur';
                    fullLabel = 'Lembur';
                    stats.lembur += 1;
                } else if (st === 'sakit') {
                    category = 'sakit';
                    shortLabel = 'Sakit';
                    fullLabel = 'Sakit';
                    stats.sakit += 1;
                } else if (st === 'alpa' || st === 'alpha' || st === 'tidak hadir') {
                    category = 'tidak_hadir';
                    shortLabel = 'Alpa';
                    fullLabel = 'Tidak Hadir';
                    stats.tidak_hadir += 1;
                } else if (st === 'izin' || st === 'izin khusus') {
                    category = 'izin';
                    shortLabel = 'Izin';
                    fullLabel = record.status;
                    stats.izin += 1;
                } else if (st === 'cuti') {
                    category = 'cuti';
                    shortLabel = 'Cuti';
                    fullLabel = 'Cuti';
                    stats.cuti += 1;
                } else {
                    category = 'hadir';
                    shortLabel = 'Hadir';
                    fullLabel = (!isLateExempt && st === 'terlambat') ? 'Hadir (Terlambat)' : 'Hadir';
                    stats.hadir += 1;
                }
            } else if (isDayOff) {
                category = 'libur';
                shortLabel = 'Libur';
                fullLabel = 'Hari Libur';
            } else if (isPast && !isSatpam) {
                category = 'tidak_hadir';
                shortLabel = 'Absen';
                fullLabel = 'Tidak Hadir';
                stats.tidak_hadir += 1;
            } else if (isPast && isSatpam) {
                category = 'libur';
                shortLabel = '-';
                fullLabel = 'Tidak Ada Jadwal Shift';
            } else if (isTodayCell) {
                category = 'belum_absen';
                shortLabel = 'Hari Ini';
                fullLabel = 'Belum Absen';
            }

            days.push({
                day: d,
                dateStr,
                dateObj,
                isDayOff,
                isToday: isTodayCell,
                isPast,
                record,
                category,
                shortLabel,
                fullLabel,
            });
        }

        return { monthLabel, leadingEmptyCount, days, stats };
    }, [history, resolvedYear, resolvedMonth, resolvedTodayDate, userWorkDays, tanpaKeterlambatan, isSatpam]);

    const selectedDayInfo = useMemo(() => {
        return (
            calendarData.days.find((d) => d.dateStr === selectedCalendarDate) ||
            calendarData.days.find((d) => d.isToday) ||
            calendarData.days[0] ||
            null
        );
    }, [calendarData.days, selectedCalendarDate]);

    const toggleHistoryView = () => {
        setHistoryView((prev) => (prev === 'table' ? 'calendar' : 'table'));
    };

    const defaultShift = (() => {
        const hour = new Date().getHours();
        return (hour >= 7 && hour < 19) ? 'Shift Siang' : 'Shift Malam';
    })();
    const [selectedShift, setSelectedShift] = useState(attendance?.shift || defaultShift);

    const [isLocating, setIsLocating] = useState(false);
    const [showWebcamModal, setShowWebcamModal] = useState(false);
    const [pendingAttendance, setPendingAttendance] = useState(null);
    const [webcamReason, setWebcamReason] = useState('');
    const [cameraError, setCameraError] = useState(false);
    const [facingMode, setFacingMode] = useState("user");
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const { data, setData, post, processing } = useForm({
        type: '',
        notes: '',
        latitude: '',
        longitude: '',
        shift: defaultShift,
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
            setPendingAttendance({ type, latitude: 0, longitude: 0, shift: selectedShift });
            setWebcamReason('Perangkat atau browser tidak mendukung akses GPS. Silakan ambil foto bukti kehadiran langsung.');
            setCameraError(false);
            setShowWebcamModal(true);
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
                    setPendingAttendance({ type, latitude, longitude, shift: selectedShift });
                    setWebcamReason('Lokasi Anda di luar radius kantor PT. Silakan ambil foto langsung sebagai bukti kehadiran.');
                    setCameraError(false);
                    setShowWebcamModal(true);
                } else {
                    sendAttendancePost(type, latitude, longitude, null, selectedShift);
                }
            },
            (error) => {
                setIsLocating(false);
                // Langsung minta foto absensi jika akses lokasi ditolak atau lokasi bermasalah
                const reason = error.code === 1 
                    ? 'Akses lokasi ditolak oleh browser/perangkat. Silakan ambil foto bukti kehadiran langsung.'
                    : 'Lokasi/GPS bermasalah atau tidak terdeteksi. Silakan ambil foto bukti kehadiran langsung.';

                setPendingAttendance({ type, latitude: 0, longitude: 0, shift: selectedShift });
                setWebcamReason(reason);
                setCameraError(false);
                setShowWebcamModal(true);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const sendAttendancePost = (type, latitude, longitude, photoUrl, shiftParam) => {
        router.post(route('absensi.store'), {
            type: type,
            latitude: latitude,
            longitude: longitude,
            notes: data.notes,
            photo_url: photoUrl,
            shift: shiftParam || selectedShift
        }, {
            preserveScroll: true,
            onFinish: () => setIsLocating(false)
        });
    };

    const handleFileInput = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !pendingAttendance) return;

        setShowWebcamModal(false);
        Swal.fire({
            title: 'Memproses...',
            text: 'Sedang mengunggah foto dan absensi',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
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
                sendAttendancePost(
                    pendingAttendance.type,
                    pendingAttendance.latitude,
                    pendingAttendance.longitude,
                    imgData.data.url,
                    pendingAttendance.shift
                );
            } else {
                Swal.fire('Gagal!', 'Gagal mengunggah gambar.', 'error');
            }
        } catch (error) {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat mengompres/mengunggah gambar.', 'error');
        }
    };

    const captureAndSubmit = async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
            // Jika webcam tidak dapat mengambil gambar, panggil file input kamera HP
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
            return;
        }
        
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
                sendAttendancePost(pendingAttendance.type, pendingAttendance.latitude, pendingAttendance.longitude, imgData.data.url, pendingAttendance.shift);
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
                        <div className="rounded-3xl p-8 text-white shadow-xl text-center bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/20">
                            <p className="text-blue-100 text-lg font-medium">{today}</p>
                            <h2 className="text-6xl font-black mt-2 tracking-tighter tabular-nums">{liveTime}</h2>
                            <p className="text-blue-200 mt-4 max-w-xl mx-auto text-sm">
                                {approvedLeave ? (
                                    <span>Status Hari Ini: <strong className="text-white font-bold">Anda {approvedLeave.type}</strong> ({formatDateRange(approvedLeave.start_date, approvedLeave.end_date)})</span>
                                ) : (
                                    'Pastikan Anda berada di lokasi kantor saat melakukan absensi masuk maupun pulang.'
                                )}
                            </p>
                        </div>

                        {/* Card Absensi Masuk & Keluar (Sederhana untuk Semua Role Termasuk Satpam) */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            {approvedLeave ? (
                                <div className={`p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-all ${
                                    approvedLeave.type === 'Sakit'
                                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                                        : approvedLeave.type === 'Cuti'
                                        ? 'bg-purple-50/80 border-purple-200 text-purple-900'
                                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                                }`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                                        approvedLeave.type === 'Sakit'
                                            ? 'bg-rose-600 text-white shadow-rose-600/30'
                                            : approvedLeave.type === 'Cuti'
                                            ? 'bg-purple-600 text-white shadow-purple-600/30'
                                            : 'bg-amber-500 text-white shadow-amber-500/30'
                                    }`}>
                                        {approvedLeave.type === 'Sakit' ? (
                                            <HeartPulse className="w-7 h-7" />
                                        ) : approvedLeave.type === 'Cuti' ? (
                                            <CalendarCheck className="w-7 h-7" />
                                        ) : (
                                            <FileText className="w-7 h-7" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left space-y-2">
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-600 text-white shadow-sm flex items-center gap-1">
                                                <Check className="w-3 h-3 stroke-[3]" /> Disetujui
                                            </span>
                                            <h4 className="font-black text-xl text-gray-900">
                                                Anda {approvedLeave.type}
                                            </h4>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700 flex items-center justify-center sm:justify-start gap-1.5">
                                            <CalendarDays className="w-4 h-4 text-blue-600" />
                                            Rentang Tanggal: <span className="text-gray-900 font-bold">{formatDateRange(approvedLeave.start_date, approvedLeave.end_date)}</span>
                                        </p>
                                        {approvedLeave.reason && (
                                            <p className="text-xs sm:text-sm text-gray-700 bg-white/70 py-1.5 px-3 rounded-lg border border-gray-200/60 inline-block">
                                                <span className="font-semibold text-gray-800">Alasan: </span>
                                                {approvedLeave.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Check In Status */}
                                    <div className="flex gap-4 items-start p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                                        {hasCheckedIn && (
                                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-600 text-white shadow-lg shadow-green-600/25">
                                                <Check className="w-7 h-7 stroke-[3]" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold text-lg text-gray-800">Absen Masuk</p>
                                            <p className="text-sm font-medium text-gray-500 mt-1">
                                                {hasCheckedIn 
                                                    ? `Berhasil: ${attendance.check_in_time}${attendance.shift ? ` (${attendance.shift})` : ''}` 
                                                    : 'Belum Absen'}
                                            </p>

                                            {/* Pilihan Shift Sederhana untuk Satpam Sebelum Masuk */}
                                            {isSatpam && !hasCheckedIn && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedShift('Shift Siang')}
                                                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                                                            selectedShift === 'Shift Siang'
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <Sun className="w-3.5 h-3.5" /> Shift Siang
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedShift('Shift Malam')}
                                                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                                                            selectedShift === 'Shift Malam'
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <Moon className="w-3.5 h-3.5" /> Shift Malam
                                                    </button>
                                                </div>
                                            )}

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
                                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-600 text-white shadow-lg shadow-green-600/25">
                                                <Check className="w-7 h-7 stroke-[3]" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold text-lg text-gray-800">Absen Pulang</p>
                                            <p className="text-sm font-medium text-gray-500 mt-1">
                                                {hasCheckedOut ? `Berhasil: ${attendance.check_out_time}` : 'Belum Absen'}
                                            </p>

                                            {hasCheckedIn && !hasCheckedOut && (
                                                <div className="mt-4 space-y-4">
                                                    {isOvertime && !isSatpam && !tanpaLembur && (
                                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                                <Clock className="w-4 h-4 text-gray-500" />
                                                                Keterangan Jika Lembur
                                                            </label>
                                                            <textarea
                                                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 placeholder-gray-400"
                                                                rows="2"
                                                                value={data.notes}
                                                                onChange={(e) => setData('notes', e.target.value)}
                                                                placeholder="Isi keterangan jika lembur. Kosongkan jika pulang biasa (tidak lembur)..."
                                                            ></textarea>
                                                            <p className="text-xs text-gray-500">
                                                                {(isSaturday || new Date().getDay() === 6)
                                                                    ? ((userWorkDays <= 5) ? 'Hari Libur (Sabtu - 5 Hari Kerja): Seluruh jam kerja Anda terhitung sebagai lembur. Anda dapat menambahkan keterangan tugas lembur di atas.' : `Hari Sabtu (lewat ${overtimeSaturdayStart} WITA): Isi keterangan jika Anda lembur. Jika tidak diisi, Anda terhitung pulang biasa (tidak lembur).`)
                                                                    : (isSunday || new Date().getDay() === 0)
                                                                        ? 'Hari Libur (Minggu): Seluruh jam kerja Anda terhitung sebagai lembur. Anda dapat menambahkan keterangan tugas lembur di atas.'
                                                                    : `Lewat pukul ${overtimeWeekdayStart} WITA: Isi keterangan jika Anda lembur. Jika tidak diisi, Anda terhitung pulang biasa (tidak lembur).`}
                                                            </p>
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Riwayat Absensi 1 Bulan */}
                <div className="mt-8 bg-white rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleHistoryView}
                                aria-pressed={historyView === 'calendar'}
                                aria-label={historyView === 'calendar' ? 'Ubah ke tampilan tabel riwayat absensi' : 'Ubah ke tampilan kalender riwayat absensi'}
                                title={historyView === 'calendar' ? 'Klik untuk kembali ke Tampilan Tabel' : 'Klik untuk melihat Tampilan Kalender'}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shrink-0 ${
                                    historyView === 'calendar'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700'
                                        : 'bg-blue-50 text-blue-600 border border-blue-200/80 hover:bg-blue-600 hover:text-white'
                                }`}
                            >
                                {historyView === 'calendar' ? <List className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                            </button>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Riwayat Absensi Bulan Ini</h3>
                                <p className="text-sm text-gray-500">
                                    {historyView === 'calendar'
                                        ? `Kalender kehadiran ${calendarData.monthLabel}`
                                        : 'Rekapan kehadiran Anda selama bulan ini'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={toggleHistoryView}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            {historyView === 'calendar' ? (
                                <>
                                    <List className="w-3.5 h-3.5" />
                                    <span>Tampilan Tabel</span>
                                </>
                            ) : (
                                <>
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    <span>Tampilan Kalender</span>
                                </>
                            )}
                        </button>
                    </div>

                    {historyView === 'calendar' ? (
                        <div className="space-y-4">
                            {/* Legend Warna Status */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                <span className="text-sm font-bold text-gray-800">{calendarData.monthLabel}</span>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-gray-700">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                                        Hadir ({calendarData.stats.hadir})
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                                        Sakit ({calendarData.stats.sakit})
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                                        Tidak Hadir ({calendarData.stats.tidak_hadir})
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                        Lembur ({calendarData.stats.lembur})
                                    </span>
                                    {calendarData.stats.izin > 0 && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
                                            Izin ({calendarData.stats.izin})
                                        </span>
                                    )}
                                    {calendarData.stats.cuti > 0 && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                                            Cuti ({calendarData.stats.cuti})
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Grid Header Hari (Senin - Minggu) */}
                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {CALENDAR_DAY_HEADERS.map((dayName, idx) => (
                                    <div
                                        key={dayName}
                                        className={`text-center text-[11px] sm:text-xs font-semibold py-1.5 ${
                                            idx === 6 ? 'text-rose-600' : 'text-gray-500'
                                        }`}
                                    >
                                        {dayName}
                                    </div>
                                ))}

                                {/* Sel Kosong Awal Bulan */}
                                {Array.from({ length: calendarData.leadingEmptyCount }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="min-h-[48px] sm:min-h-[68px]" aria-hidden="true" />
                                ))}

                                {/* Sel Tanggal 1..N */}
                                {calendarData.days.map((day) => {
                                    const style = CALENDAR_STYLES[day.category] || CALENDAR_STYLES.mendatang;
                                    const isSelected = selectedDayInfo?.dateStr === day.dateStr;
                                    const fullDateLabel = day.dateObj.toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    });

                                    return (
                                        <button
                                            key={day.dateStr}
                                            type="button"
                                            onClick={() => setSelectedCalendarDate(day.dateStr)}
                                            aria-label={`${fullDateLabel}, status ${day.fullLabel}`}
                                            aria-pressed={isSelected}
                                            title={`${fullDateLabel} (${day.fullLabel})`}
                                            className={`min-h-[48px] sm:min-h-[68px] p-1 sm:p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${style.cell} ${
                                                isSelected
                                                    ? 'ring-2 ring-gray-800 ring-offset-1'
                                                    : day.isToday
                                                    ? 'ring-2 ring-blue-500/80 ring-offset-1'
                                                    : ''
                                            }`}
                                        >
                                            <span className={`text-sm sm:text-base tabular-nums leading-none ${day.isToday ? 'font-black' : 'font-bold'}`}>
                                                {day.day}
                                            </span>
                                            {day.shortLabel && (
                                                <>
                                                    <span className="hidden sm:block text-[10px] font-semibold leading-tight truncate max-w-full mt-0.5">
                                                        {day.shortLabel}
                                                    </span>
                                                    <span
                                                        className={`sm:hidden w-1.5 h-1.5 rounded-full mt-0.5 ${style.dot}`}
                                                        aria-hidden="true"
                                                    />
                                                </>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Panel Detail Tanggal Terpilih */}
                            {selectedDayInfo && (
                                <div className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200/80 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-bold text-sm sm:text-base text-gray-900">
                                            {selectedDayInfo.dateObj.toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        {selectedDayInfo.isToday && (
                                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-600 text-white">
                                                Hari Ini
                                            </span>
                                        )}
                                    </div>

                                    {selectedDayInfo.record ? (
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                                            {!selectedDayInfo.record.check_in_time && !selectedDayInfo.record.check_out_time && (
                                                <span>
                                                    Status: <strong className="text-gray-900">{selectedDayInfo.fullLabel}</strong>
                                                </span>
                                            )}
                                            {selectedDayInfo.record.check_in_time && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                    Masuk: <strong className="text-gray-900 tabular-nums">{selectedDayInfo.record.check_in_time}</strong>
                                                </span>
                                            )}
                                            {selectedDayInfo.record.check_out_time && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                    Keluar: <strong className="text-gray-900 tabular-nums">{selectedDayInfo.record.check_out_time}</strong>
                                                </span>
                                            )}
                                            {isSatpam && selectedDayInfo.record.check_in_time && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                                                    Shift: <strong>{selectedDayInfo.record.shift || (selectedDayInfo.record.check_in_time >= '18:00' ? 'Shift Malam' : 'Shift Siang')}</strong>
                                                </span>
                                            )}
                                            {selectedDayInfo.category === 'lembur' && selectedDayInfo.record.overtime_status && (
                                                <span className="text-xs font-semibold text-blue-700">
                                                    Status Lembur: {selectedDayInfo.record.overtime_status}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            {selectedDayInfo.category === 'tidak_hadir'
                                                ? 'Tidak ada catatan kehadiran atau pengajuan izin/sakit pada tanggal ini.'
                                                : selectedDayInfo.category === 'libur'
                                                ? (isSatpam ? 'Tidak ada jadwal shift tercatat pada tanggal ini.' : 'Hari libur kerja.')
                                                : selectedDayInfo.category === 'belum_absen'
                                                ? 'Anda belum melakukan absensi hari ini.'
                                                : 'Tanggal belum berlangsung.'}
                                        </p>
                                    )}

                                    {selectedDayInfo.record?.notes && (
                                        <p className="text-xs text-gray-600 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/70 inline-block mt-1 break-words max-w-full">
                                            <span className="font-semibold text-gray-700">Catatan:</span> {selectedDayInfo.record.notes}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 font-medium rounded-l-xl">Tanggal</th>
                                            {isSatpam && <th className="px-4 py-3 font-medium">Shift</th>}
                                            <th className="px-4 py-3 font-medium">Jam Masuk</th>
                                            <th className="px-4 py-3 font-medium">Jam Keluar</th>
                                            <th className="px-4 py-3 font-medium rounded-r-xl">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {paginatedHistory.length > 0 ? (
                                            paginatedHistory.map((item, index) => {
                                                const itemShift = item.shift || ((item.check_in_time && item.check_in_time >= '18:00') ? 'Shift Malam' : 'Shift Siang');
                                                const itemDate = parseLocalDate(item.date) || new Date(item.date);
                                                const itemIsSunday = itemDate.getDay() === 0;
                                                const itemIsSaturday = itemDate.getDay() === 6;
                                                const itemIsOffDay = itemIsSunday || (itemIsSaturday && (userWorkDays || 6) <= 5);
                                                const isLateExempt = tanpaKeterlambatan || itemIsOffDay;
                                                return (
                                                    <tr key={item.id || index} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-gray-900">{itemDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                                        {isSatpam && (
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                    itemShift === 'Shift Malam'
                                                                        ? 'bg-indigo-100 text-indigo-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                    {itemShift === 'Shift Malam' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                                                                    {itemShift}
                                                                </span>
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {item.check_in_time ? (
                                                                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500"/> {item.check_in_time}</span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {item.check_out_time ? (
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5 text-green-500"/> {item.check_out_time}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                                    item.status === 'Lembur' ? 'bg-blue-100 text-blue-700' :
                                                                    item.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                                                                    item.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' :
                                                                    item.status === 'Izin Khusus' ? 'bg-amber-100 text-amber-700' :
                                                                    item.status === 'Sakit' ? 'bg-orange-100 text-orange-700' :
                                                                    item.status === 'Cuti' ? 'bg-purple-100 text-purple-700' :
                                                                    item.status === 'Terlambat' ? (isLateExempt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                    {(isLateExempt && item.status === 'Terlambat') ? 'Hadir' : (item.status || 'Hadir')}
                                                                </span>
                                                                {item.is_lembur && item.status !== 'Lembur' && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                                                                        Lembur
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={isSatpam ? "5" : "4"} className="px-4 py-8 text-center text-gray-500">Belum ada riwayat absensi bulan ini.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {history.length > 0 && (
                                <div className="mt-4">
                                    <ClientPagination 
                                        total={history.length} 
                                        itemsPerPage={itemsPerPage} 
                                        currentPage={currentPage} 
                                        onPageChange={setCurrentPage} 
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Webcam Modal */}
            {showWebcamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="user" 
                        ref={fileInputRef} 
                        onChange={handleFileInput} 
                        className="hidden" 
                    />
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start gap-3">
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-blue-600" />
                                    Foto Bukti Absensi
                                </h3>
                                {webcamReason && (
                                    <p className="text-xs text-amber-700 font-medium mt-1 leading-snug">
                                        {webcamReason}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowWebcamModal(false)} className="text-gray-400 hover:text-red-500 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-black relative flex-1 flex flex-col items-center justify-center min-h-[300px]">
                            {cameraError ? (
                                <div className="text-center p-6 text-white space-y-3">
                                    <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                                    <p className="text-sm font-medium">Kamera browser tidak dapat diakses langsung.</p>
                                    <p className="text-xs text-gray-400">Silakan gunakan kamera HP langsung di bawah ini:</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Buka Kamera HP
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: facingMode }}
                                        mirrored={facingMode === "user"}
                                        onUserMediaError={() => setCameraError(true)}
                                        onUserMedia={() => setCameraError(false)}
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
                                </>
                            )}
                        </div>
                        <div className="p-4 bg-white space-y-3">
                            <div className="flex justify-between gap-3">
                                <button
                                    onClick={() => setShowWebcamModal(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={captureAndSubmit}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 text-sm shadow-md"
                                >
                                    <Camera className="w-4 h-4" />
                                    Ambil & Absen
                                </button>
                            </div>
                            <div className="text-center pt-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 hover:underline"
                                >
                                    Gunakan Kamera HP / Upload File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
