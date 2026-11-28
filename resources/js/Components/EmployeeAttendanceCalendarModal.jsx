import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    X,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    List,
    Clock,
    Camera,
    Paperclip,
    Edit,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';

const CALENDAR_DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const CALENDAR_STYLES = {
    hadir: {
        cell: 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800',
        dot: 'bg-white',
    },
    lembur: {
        cell: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
        dot: 'bg-white',
    },
    sakit: {
        cell: 'bg-orange-700 text-white border-orange-700 hover:bg-orange-800',
        dot: 'bg-white',
    },
    tidak_hadir: {
        cell: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
        dot: 'bg-white',
    },
    izin: {
        cell: 'bg-amber-400 text-gray-950 border-amber-500 hover:bg-amber-500',
        dot: 'bg-gray-950',
    },
    cuti: {
        cell: 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700',
        dot: 'bg-white',
    },
    belum_absen: {
        cell: 'bg-white text-blue-700 border-blue-600 border-dashed hover:bg-blue-50',
        dot: 'bg-blue-600',
    },
    libur: {
        cell: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200',
        dot: 'bg-gray-400',
    },
    mendatang: {
        cell: 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50',
        dot: 'bg-transparent',
    },
};

const pad2 = (n) => String(n).padStart(2, '0');

const parseIsoDate = (raw) => {
    if (!raw) return null;
    const match = String(raw).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const expandRecordDates = (item) => {
    const str = String(item?.date || '').trim();
    if (item?.start_date && item?.end_date) {
        const start = parseIsoDate(item.start_date);
        const end = parseIsoDate(item.end_date);
        if (start && end && start <= end) {
            const out = [];
            const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            let guard = 0;
            while (cur <= end && guard < 366) {
                out.push(`${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`);
                cur.setDate(cur.getDate() + 1);
                guard += 1;
            }
            return out;
        }
    }
    if (str.includes(' s/d ')) {
        const [startRaw, endRaw] = str.split(' s/d ');
        const start = parseIsoDate(startRaw);
        const end = parseIsoDate(endRaw);
        if (start && end && start <= end) {
            const out = [];
            const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            let guard = 0;
            while (cur <= end && guard < 366) {
                out.push(`${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`);
                cur.setDate(cur.getDate() + 1);
                guard += 1;
            }
            return out;
        }
    }
    const single = parseIsoDate(str);
    if (single) {
        return [`${single.getFullYear()}-${pad2(single.getMonth() + 1)}-${pad2(single.getDate())}`];
    }
    return [];
};

const getRecordPriority = (item) => {
    const idStr = String(item?.id || '');
    if (idStr.startsWith('att_')) return 3;
    if (idStr.startsWith('req_')) return item?.status === 'Ditolak' ? 1 : 2;
    return 0; // alpa_
};

export default function EmployeeAttendanceCalendarModal({
    isOpen,
    employee,
    initialMonth,
    initialYear,
    initialRecords = [],
    initialSummary = null,
    initialSelectedDate = null,
    todayDate = null,
    isAdmin = false,
    onClose,
    onShowPhoto,
    onEditRecord,
    onOvertimeStatus,
    onUpdateRequestStatus,
}) {
    const nowLocal = new Date();
    const fallbackToday = `${nowLocal.getFullYear()}-${pad2(nowLocal.getMonth() + 1)}-${pad2(nowLocal.getDate())}`;
    const resolvedToday = todayDate || fallbackToday;

    const [viewMonth, setViewMonth] = useState(Number(initialMonth) || nowLocal.getMonth() + 1);
    const [viewYear, setViewYear] = useState(Number(initialYear) || nowLocal.getFullYear());
    const [records, setRecords] = useState(initialRecords);
    const [empSummary, setEmpSummary] = useState(initialSummary);
    const [selectedDate, setSelectedDate] = useState(initialSelectedDate || resolvedToday);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [failedTarget, setFailedTarget] = useState(null);
    const lastOpenKeyRef = useRef(null);
    const prevInitialRecordsRef = useRef(initialRecords);

    const fetchMonthData = async (targetMonth, targetYear, options = {}) => {
        if (!employee) return;
        const { preserveSelectedDate = false } = options;

        // If returning to the page's already-loaded month, use props immediately
        if (targetMonth === Number(initialMonth) && targetYear === Number(initialYear)) {
            setViewMonth(targetMonth);
            setViewYear(targetYear);
            setRecords(initialRecords);
            setEmpSummary(initialSummary || employee);
            setLoadError('');
            setFailedTarget(null);
            if (!preserveSelectedDate) {
                const prefix = `${targetYear}-${pad2(targetMonth)}-`;
                setSelectedDate(resolvedToday.startsWith(prefix) ? resolvedToday : `${prefix}01`);
            }
            return;
        }

        setIsLoading(true);
        setLoadError('');
        setFailedTarget(null);
        try {
            const url = typeof route === 'function' ? route('absensi.rekap') : '/absensi/rekap';
            const res = await window.axios.get(url, {
                params: {
                    month: targetMonth,
                    year: targetYear,
                    user_id: employee.id,
                    calendar_json: 1,
                },
            });
            const list = Array.isArray(res.data?.recapList)
                ? res.data.recapList.filter((r) => Number(r.user_id) === Number(employee.id))
                : [];
            const foundSummary = Array.isArray(res.data?.userSummaries)
                ? res.data.userSummaries.find((u) => Number(u.id) === Number(employee.id))
                : null;

            setViewMonth(targetMonth);
            setViewYear(targetYear);
            setRecords(list);
            setEmpSummary(foundSummary || { ...employee, hadir: 0, sakit: 0, izin: 0, alpa: 0, lembur: 0, terlambat: 0, shift_siang: 0, shift_malam: 0 });

            if (!preserveSelectedDate) {
                const prefix = `${targetYear}-${pad2(targetMonth)}-`;
                if (resolvedToday.startsWith(prefix)) {
                    setSelectedDate(resolvedToday);
                } else {
                    const firstRec = list.find((r) => expandRecordDates(r).some((d) => d.startsWith(prefix)));
                    const foundDate = firstRec ? expandRecordDates(firstRec).find((d) => d.startsWith(prefix)) : null;
                    setSelectedDate(foundDate || `${prefix}01`);
                }
            }
        } catch {
            setFailedTarget({ month: targetMonth, year: targetYear });
            setLoadError('Gagal memuat data kalender untuk bulan tersebut. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize modal state only when opened or switched to another employee / initial period
    useEffect(() => {
        if (!isOpen || !employee) {
            lastOpenKeyRef.current = null;
            return;
        }
        const m = Number(initialMonth) || nowLocal.getMonth() + 1;
        const y = Number(initialYear) || nowLocal.getFullYear();
        const openKey = `${employee.id}:${m}:${y}:${initialSelectedDate || ''}`;
        if (lastOpenKeyRef.current === openKey) return;
        lastOpenKeyRef.current = openKey;
        prevInitialRecordsRef.current = initialRecords;

        setViewMonth(m);
        setViewYear(y);
        setRecords(initialRecords);
        setEmpSummary(initialSummary || employee);
        setLoadError('');
        setFailedTarget(null);
        setIsLoading(false);
        setViewMode('calendar');

        const monthPrefix = `${y}-${pad2(m)}-`;
        if (initialSelectedDate && initialSelectedDate.startsWith(monthPrefix)) {
            setSelectedDate(initialSelectedDate);
        } else if (resolvedToday.startsWith(monthPrefix)) {
            setSelectedDate(resolvedToday);
        } else {
            const firstWithData = (initialRecords || []).find((r) => {
                const ds = expandRecordDates(r);
                return ds.some((d) => d.startsWith(monthPrefix));
            });
            const foundDate = firstWithData
                ? expandRecordDates(firstWithData).find((d) => d.startsWith(monthPrefix))
                : null;
            setSelectedDate(foundDate || `${y}-${pad2(m)}-01`);
        }
    }, [isOpen, employee?.id, initialMonth, initialYear, initialSelectedDate, resolvedToday]);

    // Sync silently when parent Inertia props refresh after admin edit/ACC without resetting month/date/viewMode
    useEffect(() => {
        if (!isOpen || !employee) return;
        if (prevInitialRecordsRef.current === initialRecords) return;
        prevInitialRecordsRef.current = initialRecords;

        if (viewMonth === Number(initialMonth) && viewYear === Number(initialYear)) {
            setRecords(initialRecords);
            setEmpSummary(initialSummary || employee);
        } else {
            fetchMonthData(viewMonth, viewYear, { preserveSelectedDate: true });
        }
    }, [initialRecords, initialSummary]);

    // Close on Escape (only if SweetAlert2 dialog is not currently open) and lock body scroll
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !document.body.classList.contains('swal2-shown')) {
                onClose?.();
            }
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen, onClose]);

    const navigateMonth = (delta) => {
        if (isLoading) return;
        const d = new Date(viewYear, viewMonth - 1 + delta, 1);
        fetchMonthData(d.getMonth() + 1, d.getFullYear());
    };

    const isSatpam = Boolean(empSummary?.is_satpam ?? employee?.is_satpam);
    const workDaysPerWeek = Number(empSummary?.work_days_per_week ?? employee?.work_days_per_week ?? 6);

    const calendarData = useMemo(() => {
        const byDate = {};
        const allByDate = {};
        (records || []).forEach((item) => {
            const dates = expandRecordDates(item);
            dates.forEach((dStr) => {
                if (!allByDate[dStr]) allByDate[dStr] = [];
                allByDate[dStr].push(item);

                const existing = byDate[dStr];
                if (!existing || getRecordPriority(item) > getRecordPriority(existing)) {
                    byDate[dStr] = item;
                }
            });
        });

        const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
        const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
        const leadingEmptyCount = (firstDayOfWeek + 6) % 7;
        const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
        });

        const stats = {
            hadir: 0,
            terlambat: 0,
            lembur: 0,
            sakit: 0,
            izin: 0,
            cuti: 0,
            tidak_hadir: 0,
            shift_siang: 0,
            shift_malam: 0,
        };

        const days = [];
        for (let d = 1; d <= daysInMonth; d += 1) {
            const dateStr = `${viewYear}-${pad2(viewMonth)}-${pad2(d)}`;
            const dateObj = new Date(viewYear, viewMonth - 1, d);
            const dayOfWeek = dateObj.getDay();
            const isDayOff = dayOfWeek === 0 || (dayOfWeek === 6 && workDaysPerWeek <= 5);
            const isPast = dateStr < resolvedToday;
            const isTodayCell = dateStr === resolvedToday;
            const record = byDate[dateStr] || null;
            const dayRecords = allByDate[dateStr] || [];

            let category = 'mendatang';
            let shortLabel = '';
            let fullLabel = 'Belum Berlangsung';
            let isLateDay = false;

            if (record && !(String(record.id || '').startsWith('req_') && record.status === 'Ditolak')) {
                const typeLower = String(record.type || 'Hadir').toLowerCase();
                const isLemburApprovedOrPending = !isSatpam && (
                    typeLower === 'lembur' ||
                    (record.is_lembur === true && record.overtime_status !== 'Ditolak')
                );

                if (isLemburApprovedOrPending) {
                    category = 'lembur';
                    shortLabel = 'Lembur';
                    fullLabel = record.overtime_status === 'Disetujui'
                        ? 'Lembur (ACC)'
                        : record.overtime_status === 'Menunggu'
                            ? 'Lembur (Menunggu)'
                            : 'Lembur';
                    stats.lembur += 1;
                    stats.hadir += 1;
                    if (record.is_late && !record.is_off_day) {
                        isLateDay = true;
                        stats.terlambat += 1;
                    }
                } else if (typeLower === 'sakit') {
                    category = 'sakit';
                    shortLabel = 'Sakit';
                    fullLabel = 'Sakit';
                    stats.sakit += 1;
                } else if (typeLower === 'alpa' || typeLower === 'alpha' || typeLower === 'tidak hadir') {
                    category = 'tidak_hadir';
                    shortLabel = 'Alpa';
                    fullLabel = 'Alpa / Tidak Hadir';
                    stats.tidak_hadir += 1;
                } else if (typeLower === 'cuti') {
                    category = 'cuti';
                    shortLabel = 'Cuti';
                    fullLabel = 'Cuti';
                    stats.cuti += 1;
                } else if (typeLower === 'izin' || typeLower === 'izin khusus') {
                    category = 'izin';
                    shortLabel = 'Izin';
                    fullLabel = record.type;
                    stats.izin += 1;
                } else {
                    category = 'hadir';
                    isLateDay = !isSatpam && Boolean(record.is_late) && !record.is_off_day;
                    shortLabel = isSatpam && record.shift
                        ? (record.shift === 'Shift Malam' ? 'Malam' : 'Siang')
                        : (isLateDay ? 'Telat' : 'Hadir');
                    fullLabel = isLateDay
                        ? 'Hadir (Terlambat)'
                        : (isSatpam && record.shift ? `Hadir (${record.shift})` : 'Hadir');
                    stats.hadir += 1;
                    if (isLateDay) stats.terlambat += 1;
                    if (isSatpam) {
                        if (record.shift === 'Shift Malam') stats.shift_malam += 1;
                        else stats.shift_siang += 1;
                    }
                }
            } else if (isDayOff) {
                category = 'libur';
                shortLabel = 'Libur';
                fullLabel = 'Hari Libur';
            } else if (isPast && !isSatpam) {
                category = 'tidak_hadir';
                shortLabel = 'Alpa';
                fullLabel = 'Alpa / Tidak Hadir';
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
                isLateDay,
                record,
                dayRecords,
                category,
                shortLabel,
                fullLabel,
            });
        }

        return { monthLabel, leadingEmptyCount, days, stats };
    }, [records, viewYear, viewMonth, resolvedToday, isSatpam, workDaysPerWeek]);

    const selectedDayInfo = useMemo(() => {
        return (
            calendarData.days.find((d) => d.dateStr === selectedDate) ||
            calendarData.days.find((d) => d.isToday) ||
            calendarData.days[0] ||
            null
        );
    }, [calendarData.days, selectedDate]);

    if (!isOpen || !employee) return null;

    const listDays = calendarData.days.filter((d) => d.record || d.category === 'tidak_hadir');

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`Kalender Kehadiran ${employee.name}`}
        >
            <div
                className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 max-h-[92dvh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-white shrink-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600 text-white font-bold text-base sm:text-lg flex items-center justify-center shrink-0">
                            {(employee.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-sm sm:text-lg text-gray-900 truncate">{employee.name}</h3>
                                {isSatpam && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                                        Satpam
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                                {employee.division_name ? `${employee.division_name} • ` : ''}
                                Kalender Rincian Kehadiran Bulanan
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup kalender karyawan"
                        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 custom-scrollbar">
                    {/* Month Navigation & View Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                            <button
                                type="button"
                                onClick={() => navigateMonth(-1)}
                                disabled={isLoading}
                                aria-label="Bulan sebelumnya"
                                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm sm:text-base font-bold text-gray-900 min-w-[140px] text-center inline-flex items-center justify-center gap-1.5">
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                                {calendarData.monthLabel}
                            </span>
                            <button
                                type="button"
                                onClick={() => navigateMonth(1)}
                                disabled={isLoading}
                                aria-label="Bulan selanjutnya"
                                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200/70 self-stretch sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode('calendar')}
                                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition-colors ${
                                    viewMode === 'calendar' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <CalendarDays className="w-3.5 h-3.5" /> Kalender
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition-colors ${
                                    viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <List className="w-3.5 h-3.5" /> Daftar ({listDays.length})
                            </button>
                        </div>
                    </div>

                    {/* Error state if month fetch failed */}
                    {loadError && (
                        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-red-700">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{loadError}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchMonthData(failedTarget?.month ?? viewMonth, failedTarget?.year ?? viewYear)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shrink-0"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
                            </button>
                        </div>
                    )}

                    {/* Compact Monthly Legend / Stats */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 tabular-nums">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 shrink-0" />
                            Hadir: {calendarData.stats.hadir}
                        </span>
                        {!isSatpam && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/70 tabular-nums">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                Lembur: {calendarData.stats.lembur}
                            </span>
                        )}
                        {!isSatpam && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/70 tabular-nums">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                                Telat: {calendarData.stats.terlambat}
                            </span>
                        )}
                        {isSatpam && (
                            <>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 tabular-nums">
                                    Shift Siang: {calendarData.stats.shift_siang}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200/70 tabular-nums">
                                    Shift Malam: {calendarData.stats.shift_malam}
                                </span>
                            </>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200/70 tabular-nums">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-700 shrink-0" />
                            Sakit: {calendarData.stats.sakit}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/70 tabular-nums">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 shrink-0" />
                            Izin: {calendarData.stats.izin}
                        </span>
                        {calendarData.stats.cuti > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200/70 tabular-nums">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                                Cuti: {calendarData.stats.cuti}
                            </span>
                        )}
                        {!isSatpam && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200/70 tabular-nums">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                                Alpa: {calendarData.stats.tidak_hadir}
                            </span>
                        )}
                    </div>

                    {viewMode === 'calendar' ? (
                        <>
                            {/* 7-Column Calendar Grid */}
                            <div className={`grid grid-cols-7 gap-1 sm:gap-2 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                {CALENDAR_DAY_HEADERS.map((dayName, idx) => (
                                    <div
                                        key={dayName}
                                        className={`text-center text-[11px] sm:text-xs font-bold py-1 ${idx === 6 ? 'text-rose-600' : 'text-gray-500'}`}
                                    >
                                        {dayName}
                                    </div>
                                ))}

                                {Array.from({ length: calendarData.leadingEmptyCount }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="min-h-[44px] sm:min-h-[60px]" aria-hidden="true" />
                                ))}

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
                                            onClick={() => setSelectedDate(day.dateStr)}
                                            aria-label={`${fullDateLabel}, status ${day.fullLabel}`}
                                            aria-pressed={isSelected}
                                            title={`${fullDateLabel} (${day.fullLabel})`}
                                            className={`relative min-w-0 w-full min-h-[44px] sm:min-h-[60px] p-1 sm:p-1.5 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${style.cell} ${
                                                isSelected
                                                    ? 'ring-2 ring-gray-900 ring-offset-1'
                                                    : day.isToday
                                                        ? 'ring-2 ring-blue-600 ring-offset-1'
                                                        : ''
                                            }`}
                                        >
                                            {day.isLateDay && (
                                                <span
                                                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-400 ring-1 ring-white"
                                                    title="Terlambat"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span className={`text-xs sm:text-sm tabular-nums leading-none ${day.isToday ? 'font-black' : 'font-bold'}`}>
                                                {day.day}
                                            </span>
                                            {day.shortLabel && (
                                                <>
                                                    <span className="hidden sm:block text-[10px] font-semibold leading-tight truncate max-w-full">
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

                            {/* Selected Day Detail Panel */}
                            {selectedDayInfo && (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                                            <p className="font-bold text-sm sm:text-base text-gray-900">
                                                {selectedDayInfo.dateObj.toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                            {selectedDayInfo.isToday && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                                                    Hari Ini
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                selectedDayInfo.category === 'hadir' ? 'bg-emerald-700 text-white' :
                                                selectedDayInfo.category === 'lembur' ? 'bg-blue-600 text-white' :
                                                selectedDayInfo.category === 'sakit' ? 'bg-orange-700 text-white' :
                                                selectedDayInfo.category === 'izin' ? 'bg-amber-400 text-gray-950' :
                                                selectedDayInfo.category === 'cuti' ? 'bg-purple-600 text-white' :
                                                selectedDayInfo.category === 'tidak_hadir' ? 'bg-red-600 text-white' :
                                                'bg-gray-200 text-gray-700'
                                            }`}>
                                                {selectedDayInfo.fullLabel}
                                            </span>
                                            {selectedDayInfo.isLateDay && (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                                                    Terlambat
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {selectedDayInfo.record ? (
                                        <div className="space-y-3">
                                            {/* Jam Masuk & Jam Keluar */}
                                            {(selectedDayInfo.record.check_in && selectedDayInfo.record.check_in !== '-') ||
                                            (selectedDayInfo.record.check_out && selectedDayInfo.record.check_out !== '-') ? (
                                                <div className="grid grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-gray-200/80">
                                                    <div className="space-y-1 min-w-0">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                                            {isSatpam ? 'Masuk Shift' : 'Jam Masuk'}
                                                        </span>
                                                        <div className="font-bold text-sm sm:text-base text-gray-900 tabular-nums flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                            <span>{selectedDayInfo.record.check_in || '-'}</span>
                                                        </div>
                                                        {selectedDayInfo.record.check_in_photo && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onShowPhoto?.(selectedDayInfo.record.check_in_photo, 'Masuk')}
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 min-h-[34px] rounded-lg transition-colors"
                                                            >
                                                                <Camera className="w-3.5 h-3.5" /> Foto Masuk
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1 border-l border-gray-200 pl-3 min-w-0">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                                            {isSatpam ? 'Keluar Shift' : 'Jam Keluar'}
                                                        </span>
                                                        <div className="font-bold text-sm sm:text-base text-gray-900 tabular-nums flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span>{selectedDayInfo.record.check_out || '-'}</span>
                                                        </div>
                                                        {selectedDayInfo.record.check_out_photo && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onShowPhoto?.(selectedDayInfo.record.check_out_photo, 'Keluar')}
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 min-h-[34px] rounded-lg transition-colors"
                                                            >
                                                                <Camera className="w-3.5 h-3.5" /> Foto Keluar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Notes & Attachments */}
                                            <div className="space-y-2 text-xs">
                                                {selectedDayInfo.record.check_in_notes && (
                                                    <div className="text-blue-900 bg-blue-50 border border-blue-200/70 rounded-xl px-3 py-2 break-words">
                                                        <span className="font-bold">Catatan Masuk:</span> {selectedDayInfo.record.check_in_notes}
                                                    </div>
                                                )}

                                                {!isSatpam && selectedDayInfo.record.is_lembur && (
                                                    <div className="text-blue-900 bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2 break-words">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-bold">Alasan Lembur</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                selectedDayInfo.record.overtime_status === 'Disetujui'
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : selectedDayInfo.record.overtime_status === 'Ditolak'
                                                                        ? 'bg-rose-600 text-white'
                                                                        : 'bg-amber-500 text-white'
                                                            }`}>
                                                                {selectedDayInfo.record.overtime_status === 'Disetujui' ? 'ACC' : selectedDayInfo.record.overtime_status === 'Ditolak' ? 'Ditolak' : 'Menunggu ACC'}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-800">
                                                            {selectedDayInfo.record.check_out_notes || selectedDayInfo.record.notes || (
                                                                <span className="text-amber-700 italic">Belum ada alasan lembur</span>
                                                            )}
                                                        </p>
                                                        {isAdmin && !String(selectedDayInfo.record.id).startsWith('req_') && !String(selectedDayInfo.record.id).startsWith('alpa_') && (
                                                            <div className="flex items-center gap-2 pt-2 border-t border-blue-200/70">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOvertimeStatus?.(selectedDayInfo.record, 'Disetujui')}
                                                                    disabled={selectedDayInfo.record.overtime_status === 'Disetujui'}
                                                                    className={`flex-1 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors ${
                                                                        selectedDayInfo.record.overtime_status === 'Disetujui'
                                                                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                    }`}
                                                                >
                                                                    Terima Lembur
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOvertimeStatus?.(selectedDayInfo.record, 'Ditolak')}
                                                                    disabled={selectedDayInfo.record.overtime_status === 'Ditolak'}
                                                                    className={`flex-1 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors ${
                                                                        selectedDayInfo.record.overtime_status === 'Ditolak'
                                                                            ? 'bg-rose-100 text-rose-700 cursor-default'
                                                                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                                                                    }`}
                                                                >
                                                                    Tolak Lembur
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!selectedDayInfo.record.is_lembur && selectedDayInfo.record.check_out_notes && (
                                                    <div className="text-emerald-900 bg-emerald-50 border border-emerald-200/70 rounded-xl px-3 py-2 break-words">
                                                        <span className="font-bold">Catatan Pulang:</span> {selectedDayInfo.record.check_out_notes}
                                                    </div>
                                                )}

                                                {!selectedDayInfo.record.is_lembur && !selectedDayInfo.record.check_in_notes && !selectedDayInfo.record.check_out_notes && selectedDayInfo.record.notes && (
                                                    <div className="text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 break-words">
                                                        <span className="font-bold text-gray-800">Keterangan:</span> {selectedDayInfo.record.notes}
                                                    </div>
                                                )}

                                                {/* Action buttons for selected day */}
                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                    {selectedDayInfo.record.attachment && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onShowPhoto?.(selectedDayInfo.record.attachment, 'Lampiran Pengajuan')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200/70 transition-colors"
                                                        >
                                                            <Paperclip className="w-3.5 h-3.5" /> Lihat Lampiran
                                                        </button>
                                                    )}
                                                    {isAdmin && String(selectedDayInfo.record.id || '').startsWith('att_') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onEditRecord?.(selectedDayInfo.record)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-colors"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" /> Edit Keterangan
                                                        </button>
                                                    )}
                                                    {isAdmin && String(selectedDayInfo.record.id || '').startsWith('req_') && selectedDayInfo.record.status === 'Menunggu' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => onUpdateRequestStatus?.(selectedDayInfo.record.id, 'Disetujui')}
                                                                className="inline-flex items-center justify-center px-3.5 py-2 min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                                                            >
                                                                ACC Pengajuan
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onUpdateRequestStatus?.(selectedDayInfo.record.id, 'Ditolak')}
                                                                className="inline-flex items-center justify-center px-3.5 py-2 min-h-[38px] bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                                                            >
                                                                Tolak Pengajuan
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            {selectedDayInfo.category === 'tidak_hadir'
                                                ? 'Tidak ada catatan kehadiran atau pengajuan izin/sakit pada tanggal ini.'
                                                : selectedDayInfo.category === 'libur'
                                                    ? (isSatpam ? 'Tidak ada jadwal shift tercatat pada tanggal ini.' : 'Hari libur kerja.')
                                                    : selectedDayInfo.category === 'belum_absen'
                                                        ? 'Belum ada absensi tercatat untuk hari ini.'
                                                        : 'Tanggal belum berlangsung.'}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Compact Monthly List Mode */
                        <div className="space-y-2.5">
                            {listDays.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    Tidak ada rincian absensi pada bulan {calendarData.monthLabel}.
                                </div>
                            ) : (
                                [...listDays].reverse().map((day) => (
                                    <button
                                        key={day.dateStr}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(day.dateStr);
                                            setViewMode('calendar');
                                        }}
                                        className="w-full text-left p-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/50 border border-gray-200/80 transition-colors space-y-1.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="font-bold text-xs sm:text-sm text-gray-900">
                                                {day.dateObj.toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                })}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                                                day.category === 'hadir' ? 'bg-emerald-700 text-white' :
                                                day.category === 'lembur' ? 'bg-blue-600 text-white' :
                                                day.category === 'sakit' ? 'bg-orange-700 text-white' :
                                                day.category === 'izin' ? 'bg-amber-400 text-gray-950' :
                                                day.category === 'cuti' ? 'bg-purple-600 text-white' :
                                                'bg-red-600 text-white'
                                            }`}>
                                                {day.fullLabel}
                                            </span>
                                        </div>
                                        {day.record && (day.record.check_in !== '-' || day.record.check_out !== '-') && (
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 tabular-nums">
                                                <span>Masuk: <strong className="text-gray-900">{day.record.check_in || '-'}</strong></span>
                                                <span>Keluar: <strong className="text-gray-900">{day.record.check_out || '-'}</strong></span>
                                            </div>
                                        )}
                                        {(day.record?.check_in_notes || day.record?.check_out_notes || day.record?.notes) && (
                                            <p className="text-xs text-gray-600 truncate">
                                                {day.record.check_out_notes || day.record.check_in_notes || day.record.notes}
                                            </p>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3 shrink-0">
                    <span className="text-[11px] sm:text-xs text-gray-500">
                        Ketuk tanggal untuk melihat jam &amp; foto absen
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 min-h-[40px] bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shrink-0"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
