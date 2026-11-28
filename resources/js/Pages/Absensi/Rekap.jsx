import React, { useState, useEffect, useMemo } from 'react';
import ExportDropdown from '@/Components/ExportDropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmployeeAttendanceCalendarModal from '@/Components/EmployeeAttendanceCalendarModal';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Users, ClipboardCheck, Clock, CheckCircle2, AlertCircle, FileText, Search, Download, Camera, Trash2, Edit, UserCheck, Paperclip, Wallet, Settings, X, Save, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomSelect from '@/Components/CustomSelect';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

const escapeHtml = (val) => String(val ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const parseDatePart = (raw) => {
    if (!raw) return null;
    const match = String(raw).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const d = new Date(year, month - 1, day);
    if (Number.isNaN(d.getTime())) return null;
    return {
        dayName: ID_DAYS[d.getDay()],
        dayNum: day,
        monthName: ID_MONTHS[month - 1],
        month,
        year,
    };
};

const formatRecapDate = (rawDate) => {
    if (!rawDate) return { dayLabel: '', dateLabel: '-' };
    const str = String(rawDate).trim();
    if (str.includes(' s/d ')) {
        const [startRaw, endRaw] = str.split(' s/d ');
        const start = parseDatePart(startRaw);
        const end = parseDatePart(endRaw);
        if (start && end) {
            if (start.year === end.year && start.month === end.month && start.dayNum === end.dayNum) {
                return {
                    dayLabel: start.dayName,
                    dateLabel: `${start.dayNum} ${start.monthName}`,
                };
            }
            const dayLabel = start.dayName === end.dayName ? start.dayName : `${start.dayName} - ${end.dayName}`;
            const dateLabel = start.month === end.month && start.year === end.year
                ? `${start.dayNum} - ${end.dayNum} ${start.monthName}`
                : `${start.dayNum} ${start.monthName} - ${end.dayNum} ${end.monthName}`;
            return { dayLabel, dateLabel };
        }
    }
    const single = parseDatePart(str);
    if (single) {
        return {
            dayLabel: single.dayName,
            dateLabel: `${single.dayNum} ${single.monthName}`,
        };
    }
    return { dayLabel: '', dateLabel: str };
};

export default function Rekap({ auth, recapList, summary, userSummaries, filters, todayDate = null, users, isAdmin, payrollSettings = {} }) {
    const isSuperAdmin = auth?.user?.roles?.some(r => {
        const name = (r.name || '').toLowerCase().replace(/[\s_-]/g, '');
        return name === 'superadmin';
    }) || false;
    // Setup Filter Form
    const { data, setData } = useForm({
        month: filters.month.toString(),
        year: filters.year.toString(),
        user_id: filters.user_id ? filters.user_id.toString() : 'all'
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [calendarModal, setCalendarModal] = useState({ isOpen: false, employee: null, selectedDate: null });

    const openEmployeeCalendar = (employeeOrId, dateStr = null) => {
        let emp = null;
        if (employeeOrId && typeof employeeOrId === 'object') {
            emp = employeeOrId;
        } else if (employeeOrId !== null && employeeOrId !== undefined) {
            emp = (userSummaries || []).find((u) => Number(u.id) === Number(employeeOrId))
                || (users || []).find((u) => Number(u.id) === Number(employeeOrId))
                || null;
        }
        if (!emp) return;

        const cleanDate = dateStr ? String(dateStr).trim().slice(0, 10) : null;
        setCalendarModal({
            isOpen: true,
            employee: emp,
            selectedDate: cleanDate && /^\d{4}-\d{2}-\d{2}$/.test(cleanDate) ? cleanDate : null,
        });
    };

    const selectedEmployeeCalendarRecords = useMemo(() => {
        if (!calendarModal.employee) return [];
        return (recapList || []).filter((r) => Number(r.user_id) === Number(calendarModal.employee.id));
    }, [calendarModal.employee, recapList]);

    const selectedEmployeeCalendarSummary = useMemo(() => {
        if (!calendarModal.employee) return null;
        return (userSummaries || []).find((u) => Number(u.id) === Number(calendarModal.employee.id)) || calendarModal.employee;
    }, [calendarModal.employee, userSummaries]);

    useEffect(() => {
        if (!showSettingsModal) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setShowSettingsModal(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showSettingsModal]);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        jam_pulang_otomatis: payrollSettings?.jam_pulang_otomatis || '17:00',
        jam_pulang_otomatis_sabtu: payrollSettings?.jam_pulang_otomatis_sabtu || '13:00',
        jam_mulai_lembur_weekday: payrollSettings?.jam_mulai_lembur_weekday || '20:00',
        jam_mulai_lembur_sabtu: payrollSettings?.jam_mulai_lembur_sabtu || '14:00',
        jam_batas_terlambat: payrollSettings?.jam_batas_terlambat || '08:15',
        toleransi_terlambat_lembur_jam: payrollSettings?.toleransi_terlambat_lembur_jam ?? 1,
    });

    useEffect(() => {
        if (payrollSettings) {
            setSettingsForm({
                jam_pulang_otomatis: payrollSettings.jam_pulang_otomatis || '17:00',
                jam_pulang_otomatis_sabtu: payrollSettings.jam_pulang_otomatis_sabtu || '13:00',
                jam_mulai_lembur_weekday: payrollSettings.jam_mulai_lembur_weekday || '20:00',
                jam_mulai_lembur_sabtu: payrollSettings.jam_mulai_lembur_sabtu || '14:00',
                jam_batas_terlambat: payrollSettings.jam_batas_terlambat || '08:15',
                toleransi_terlambat_lembur_jam: payrollSettings.toleransi_terlambat_lembur_jam ?? 1,
            });
        }
    }, [payrollSettings]);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        setSavingSettings(true);
        router.post(route('absensi.settings'), {
            ...settingsForm,
            month: data.month,
            year: data.year,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingSettings(false);
                setShowSettingsModal(false);
                Swal.fire({
                    title: 'Berhasil',
                    text: 'Pengaturan jam absensi & lembur berhasil disimpan.',
                    icon: 'success',
                    timer: 1800,
                    showConfirmButton: false,
                });
            },
            onError: () => {
                setSavingSettings(false);
                Swal.fire('Gagal', 'Periksa kembali format jam yang dimasukkan.', 'error');
            },
        });
    };

    const handleOvertimeStatus = (item, status) => {
        const realId = item.raw_id || item.id.toString().replace('att_', '');
        router.patch(route('absensi.overtime-status', realId), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: status === 'Disetujui' ? 'Lembur Ter-ACC!' : 'Lembur Ditolak',
                    text: status === 'Disetujui'
                        ? 'Alasan lembur diterima dan dihitung ke rekap absensi & manajemen gaji.'
                        : 'Alasan lembur ditolak.',
                    icon: 'success',
                    timer: 1600,
                    showConfirmButton: false,
                });
            },
            onError: () => {
                Swal.fire('Gagal!', 'Tidak dapat memperbarui status lembur.', 'error');
            }
        });
    };

    const handleFilter = () => {
        router.get(route('absensi.rekap'), data, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleShowPhoto = (url, type) => {
        if (!url) {
            Swal.fire('Tidak ada foto / lampiran', `Dokumen ${type} tidak tersedia.`, 'info');
            return;
        }

        if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')) {
            window.open(url, '_blank');
            return;
        }

        // Bypass blokir ISP Indonesia (ERR_CERT_COMMON_NAME_INVALID / ERR_SSL_VERSION_OR_CIPHER_MISMATCH) terhadap i.ibb.co
        // dengan menormalkan ke CDN i.ibb.co.com lalu melalui proxy gambar publik wsrv.nl
        let finalUrl = url;
        if (url.includes('i.ibb.co')) {
            const normalizedUrl = url.replace('://i.ibb.co/', '://i.ibb.co.com/');
            finalUrl = `https://wsrv.nl/?url=${encodeURIComponent(normalizedUrl)}`;
        }

        Swal.fire({
            title: `Foto ${type}`,
            imageUrl: finalUrl,
            imageAlt: `Foto ${type}`,
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#3b82f6',
            width: '400px'
        });
    };

    const handleUpdateStatus = (id, status) => {
        const realId = id.replace('req_', '');
        Swal.fire({
            title: 'Konfirmasi',
            text: `Anda yakin ingin ${status === 'Disetujui' ? 'menyetujui' : 'menolak'} pengajuan ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            confirmButtonColor: status === 'Disetujui' ? '#10b981' : '#ef4444'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('absensi.pengajuan.status', realId), { status }, {
                    preserveScroll: true,
                    onSuccess: () => { Swal.fire('Berhasil!', 'Status berhasil diperbarui.', 'success'); },
                    onError: () => { Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error'); }
                });
            }
        });
    };

    const handleDeleteAbsensi = (id) => {
        let routeName = 'absensi.destroy';
        let realId = id;
        
        if (id.startsWith('req_')) {
            routeName = 'absensi.pengajuan.destroy';
            realId = id.replace('req_', '');
        } else if (id.startsWith('att_')) {
            routeName = 'absensi.destroy';
            realId = id.replace('att_', '');
        }

        Swal.fire({
            title: 'Hapus Data?',
            text: "Data ini akan dihapus secara permanen beserta fotonya (jika ada)!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route(routeName, realId), {
                    preserveScroll: true,
                    onSuccess: () => { Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success'); },
                    onError: () => { Swal.fire('Gagal!', 'Terjadi kesalahan atau Anda tidak memiliki akses.', 'error'); }
                });
            }
        });
    };

    const handleEditAbsensi = (item) => {
        if (item.id.toString().startsWith('req_')) {
            Swal.fire('Error', 'Tidak bisa mengedit pengajuan dari sini.', 'error');
            return;
        }

        const realId = item.id.toString().replace('att_', '');
        const currentInNotes = item.check_in_notes || '';
        const currentOutNotes = item.check_out_notes || (item.notes && !item.notes.startsWith('Masuk:') ? item.notes : '');

        Swal.fire({
            title: 'Edit Keterangan Absensi',
            html: `
                <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-left text-xs space-y-1">
                    <p><strong class="text-gray-700">Karyawan:</strong> <span class="text-gray-900 font-semibold">${escapeHtml(item.user_name)}</span></p>
                    <p><strong class="text-gray-700">Tanggal:</strong> <span class="text-gray-900">${escapeHtml(item.date)}</span></p>
                    <div class="flex items-center gap-4 pt-1 font-medium text-gray-700">
                        <span>Jam Masuk: <b class="text-blue-600">${escapeHtml(item.check_in && item.check_in !== '-' ? item.check_in : '-')}</b></span>
                        <span>Jam Keluar: <b class="text-green-600">${escapeHtml(item.check_out && item.check_out !== '-' ? item.check_out : '-')}</b></span>
                    </div>
                </div>
                <div class="text-left mb-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Keterangan Masuk</label>
                    <textarea id="swal-input-notes-in" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" rows="2" placeholder="Catatan/keterangan saat masuk...">${escapeHtml(currentInNotes)}</textarea>
                </div>
                <div class="text-left mb-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">
                        ${item.is_lembur ? 'Keterangan Pulang / Keterangan Jika Lembur' : 'Keterangan Pulang'}
                    </label>
                    <textarea id="swal-input-notes-out" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" rows="2" placeholder="Catatan/alasan saat pulang atau lembur...">${escapeHtml(currentOutNotes)}</textarea>
                    ${item.is_lembur ? '<p class="text-[11px] text-blue-600 font-medium mt-1">Jika terhitung lembur, isi keterangan lembur di sini. Kosongkan jika pulang biasa.</p>' : ''}
                </div>
                ${item.is_satpam ? `
                <div class="text-left">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Shift (Khusus Satpam)</label>
                    <select id="swal-input-shift" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                        <option value="Shift Siang" ${item.shift === 'Shift Siang' ? 'selected' : ''}>Shift Siang</option>
                        <option value="Shift Malam" ${item.shift === 'Shift Malam' ? 'selected' : ''}>Shift Malam</option>
                    </select>
                </div>
                ` : ''}
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#3b82f6',
            preConfirm: () => {
                const shiftEl = document.getElementById('swal-input-shift');
                return {
                    check_in_notes: document.getElementById('swal-input-notes-in').value?.trim() ?? '',
                    check_out_notes: document.getElementById('swal-input-notes-out').value?.trim() ?? '',
                    shift: shiftEl ? shiftEl.value : (item.shift || null)
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('absensi.update', realId), {
                    _method: 'put',
                    ...result.value,
                    month: data.month,
                    year: data.year
                }, {
                    preserveScroll: true,
                    onSuccess: (page) => { 
                        const msg = page.props.flash?.success || 'Keterangan absensi berhasil diperbarui.';
                        Swal.fire({
                            title: 'Tersimpan!',
                            text: msg,
                            icon: 'success',
                            timer: 1600,
                            showConfirmButton: false
                        }); 
                    },
                    onError: (errors) => { 
                        const errMsg = (errors && typeof errors === 'object') ? Object.values(errors).flat().join(', ') : 'Gagal memperbarui keterangan absensi.';
                        Swal.fire('Error!', errMsg || 'Gagal memperbarui keterangan absensi.', 'error'); 
                    }
                });
            }
        });
    };

    // Month Options
    const monthOptions = [
        { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
        { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
    ];

    // Year Options (last 5 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({length: 5}, (_, i) => {
        const y = (currentYear - i).toString();
        return { value: y, label: y };
    });

    const [roleTab, setRoleTab] = useState('all'); // 'all', 'regular', 'satpam', 'lembur'
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter available users for dropdown based on active roleTab
    const roleFilteredUsers = users.filter(u => {
        const summaryMatch = userSummaries?.find(s => s.id === u.id);
        const isSatpamUser = summaryMatch ? summaryMatch.is_satpam : false;
        if (roleTab === 'satpam') return isSatpamUser;
        if (roleTab === 'regular') return !isSatpamUser;
        if (roleTab === 'lembur') {
            const hasLembur = summaryMatch ? ((summaryMatch.lembur || 0) > 0) : false;
            const anyLembur = userSummaries?.some(s => (s.lembur || 0) > 0);
            return anyLembur ? hasLembur : !isSatpamUser;
        }
        return true;
    });

    const userOptions = [
        { value: 'all', label: roleTab === 'satpam' ? '-- Semua Satpam --' : roleTab === 'regular' ? '-- Semua Karyawan Reguler --' : roleTab === 'lembur' ? '-- Semua Karyawan Lembur --' : '-- Semua Karyawan --' },
        ...roleFilteredUsers.map(u => ({ value: u.id.toString(), label: u.name }))
    ];

    // Total Satpam data calculated from userSummaries
    const satpamTotals = userSummaries?.filter(u => u.is_satpam).reduce((acc, u) => {
        acc.hadir += u.hadir || 0;
        acc.sakit += u.sakit || 0;
        acc.izin += u.izin || 0;
        acc.shift_siang += u.shift_siang || 0;
        acc.shift_malam += u.shift_malam || 0;
        return acc;
    }, { hadir: 0, sakit: 0, izin: 0, shift_siang: 0, shift_malam: 0 }) || { hadir: 0, sakit: 0, izin: 0, shift_siang: 0, shift_malam: 0 };

    // Total Lembur data calculated from recapList
    const lemburTotals = React.useMemo(() => {
        let total = 0;
        let terAcc = 0;
        let menunggu = 0;
        let ditolak = 0;
        (recapList || []).forEach(item => {
            if (!item.is_satpam && (item.is_lembur === true || item.type === 'Lembur' || item.type?.toLowerCase() === 'lembur' || Boolean(item.overtime_status))) {
                total++;
                if (item.overtime_status === 'Disetujui' || item.status === 'Disetujui') {
                    terAcc++;
                } else if (item.overtime_status === 'Ditolak' || item.status === 'Ditolak') {
                    ditolak++;
                } else {
                    menunggu++;
                }
            }
        });
        return { total, terAcc, menunggu, ditolak };
    }, [recapList]);

    const roleFilteredUserSummaries = userSummaries?.filter(u => {
        if (roleTab === 'satpam') return u.is_satpam;
        if (roleTab === 'regular') return !u.is_satpam;
        if (roleTab === 'lembur') return !u.is_satpam && (u.lembur || 0) > 0;
        return true;
    }) || [];

    const filteredUserSummaries = roleFilteredUserSummaries.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (statusFilter === 'all') return true;
        if (roleTab === 'lembur') {
            if (statusFilter === 'Disetujui' || statusFilter === 'Ter-ACC') return (u.lembur || 0) > 0;
            if (statusFilter === 'Menunggu' || statusFilter === 'Ditolak') return (u.lembur || 0) > 0;
            return true;
        }
        if (statusFilter === 'Hadir') return u.hadir > 0;
        if (statusFilter === 'Sakit') return u.sakit > 0;
        if (statusFilter === 'Izin') return u.izin > 0;
        if (statusFilter === 'Alpa') return u.alpa > 0;
        if (statusFilter === 'Terlambat') return u.terlambat > 0;
        if (statusFilter === 'Shift Siang') return (u.shift_siang || 0) > 0;
        if (statusFilter === 'Shift Malam') return (u.shift_malam || 0) > 0;
        
        return true;
    });

    const roleFilteredRecapList = recapList?.filter(item => {
        if (roleTab === 'satpam') return item.is_satpam;
        if (roleTab === 'regular') return !item.is_satpam;
        if (roleTab === 'lembur') {
            return !item.is_satpam && (
                item.is_lembur === true || 
                item.type === 'Lembur' || 
                item.type?.toLowerCase() === 'lembur' ||
                Boolean(item.overtime_status)
            );
        }
        return true;
    }) || [];

    const filteredRecapList = roleFilteredRecapList.filter(item => {
        const matchesSearch = item.user_name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (statusFilter === 'all') return true;
        if (roleTab === 'lembur') {
            if (statusFilter === 'Disetujui') return item.overtime_status === 'Disetujui' || item.status === 'Disetujui';
            if (statusFilter === 'Menunggu') return (!item.overtime_status || item.overtime_status === 'Menunggu') && item.status !== 'Disetujui' && item.status !== 'Ditolak';
            if (statusFilter === 'Ditolak') return item.overtime_status === 'Ditolak' || item.status === 'Ditolak';
            return true;
        }
        if (statusFilter === 'Terlambat') return (item.is_late === true || item.is_late === 1) && !item.is_off_day;
        if (statusFilter === 'Izin') return item.type === 'Izin' || item.type === 'Izin Khusus' || item.type === 'Cuti';
        if (statusFilter === 'Shift Siang') return item.shift === 'Shift Siang';
        if (statusFilter === 'Shift Malam') return item.shift === 'Shift Malam';
        return item.type === statusFilter;
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters, statusFilter, roleTab]);

    const totalPages = Math.ceil(filteredRecapList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedList = filteredRecapList.slice(startIndex, startIndex + itemsPerPage);

    // Calculate dynamic page range for pagination controls (max 5 buttons)
    const getPageNumbers = () => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl sm:text-2xl text-gray-800 leading-tight">Rekap Absensi &amp; Riwayat</h2>}
        >
            <Head title="Rekap Absensi" />

            <div className="pb-6 pt-0 space-y-4 sm:space-y-6">

                {/* Role Tabs Filter */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => { setRoleTab('all'); setStatusFilter('all'); }}
                            className={`px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center sm:justify-start gap-2 min-w-0 ${
                                roleTab === 'all'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                            }`}
                        >
                            <Users className="w-4 h-4 shrink-0" />
                            <span className="truncate">Semua Karyawan</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRoleTab('regular'); setStatusFilter('all'); }}
                            className={`px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center sm:justify-start gap-2 min-w-0 ${
                                roleTab === 'regular'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                            }`}
                        >
                            <UserCheck className="w-4 h-4 shrink-0" />
                            <span className="truncate">Karyawan Reguler</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRoleTab('satpam'); setStatusFilter('all'); }}
                            className={`px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center sm:justify-start gap-2 min-w-0 ${
                                roleTab === 'satpam'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                            }`}
                        >
                            <Users className="w-4 h-4 shrink-0" />
                            <span className="truncate">Satpam</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRoleTab('lembur'); setStatusFilter('all'); }}
                            className={`px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center sm:justify-start gap-2 min-w-0 ${
                                roleTab === 'lembur'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                            }`}
                        >
                            <Clock className="w-4 h-4 shrink-0" />
                            <span className="truncate">Pengajuan Lembur</span>
                        </button>
                    </div>
                </div>

                {/* Filter & Search Section */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-30">
                    <div className="grid grid-cols-2 md:grid-cols-6 xl:grid-cols-12 gap-3 items-end">
                        <div className="col-span-1 md:col-span-3 xl:col-span-2 relative z-40 min-w-0">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Bulan</label>
                            <CustomSelect
                                value={data.month}
                                onChange={(val) => setData('month', val)}
                                options={monthOptions}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-3 xl:col-span-2 relative z-30 min-w-0">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Tahun</label>
                            <CustomSelect
                                value={data.year}
                                onChange={(val) => setData('year', val)}
                                options={yearOptions}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-3 xl:col-span-3 relative z-20 min-w-0">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                {roleTab === 'satpam' ? 'Personel Satpam' : roleTab === 'lembur' ? 'Karyawan Lembur' : 'Karyawan'}
                            </label>
                            <CustomSelect
                                value={data.user_id}
                                onChange={(val) => setData('user_id', val)}
                                options={userOptions}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-3 xl:col-span-3 relative z-10 min-w-0">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Cari Karyawan</label>
                            <TextInput
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full min-h-[44px] text-sm"
                                placeholder="Ketik nama karyawan..."
                            />
                        </div>
                        <div className="col-span-2 md:col-span-6 xl:col-span-2">
                            <PrimaryButton onClick={handleFilter} className="w-full min-h-[44px] justify-center">
                                <Search className="w-4 h-4 mr-2 shrink-0" /> Tampilkan
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {roleTab === 'satpam' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Hadir' ? 'all' : 'Hadir')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Hadir' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Hadir Satpam</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{summary.satpam_hadir ?? satpamTotals.hadir}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Shift Siang' ? 'all' : 'Shift Siang')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Shift Siang' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-amber-600 font-semibold truncate">Shift Siang</p>
                                <h4 className="text-lg sm:text-xl font-black text-amber-700">{summary.shift_siang ?? satpamTotals.shift_siang}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Shift Malam' ? 'all' : 'Shift Malam')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Shift Malam' ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-indigo-600 font-semibold truncate">Shift Malam</p>
                                <h4 className="text-lg sm:text-xl font-black text-indigo-800">{summary.shift_malam ?? satpamTotals.shift_malam}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Sakit' ? 'all' : 'Sakit')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Sakit' ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Sakit</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{satpamTotals.sakit}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Izin' ? 'all' : 'Izin')}
                            className={`col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Izin' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Izin</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{satpamTotals.izin}</h4>
                            </div>
                        </div>
                    </div>
                ) : roleTab === 'lembur' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'all' ? 'all' : 'all')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Total Lembur</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{lemburTotals.total}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Disetujui' ? 'all' : 'Disetujui')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Disetujui' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-emerald-600 font-semibold truncate">Lembur Ter-ACC</p>
                                <h4 className="text-lg sm:text-xl font-black text-emerald-700">{lemburTotals.terAcc}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Menunggu' ? 'all' : 'Menunggu')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Menunggu' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-amber-600 font-semibold truncate">Menunggu ACC</p>
                                <h4 className="text-lg sm:text-xl font-black text-amber-700">{lemburTotals.menunggu}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Ditolak' ? 'all' : 'Ditolak')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Ditolak' ? 'ring-2 ring-rose-500 border-rose-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Ditolak</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{lemburTotals.ditolak}</h4>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Hadir' ? 'all' : 'Hadir')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Hadir' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Total Hadir</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{summary.hadir}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Sakit' ? 'all' : 'Sakit')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Sakit' ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Sakit</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{summary.sakit}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Izin' ? 'all' : 'Izin')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Izin' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Izin</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{summary.izin}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Alpa' ? 'all' : 'Alpa')}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Alpa' ? 'ring-2 ring-red-500 border-red-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Alpa</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{summary.alpa}</h4>
                            </div>
                        </div>

                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Terlambat' ? 'all' : 'Terlambat')}
                            className={`col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Terlambat' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium truncate">Terlambat</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-800">{summary.terlambat || 0}</h4>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Summaries Table */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm sm:text-lg text-gray-800 flex items-center gap-2">
                                {roleTab === 'satpam' ? (
                                    <>
                                        <Users className="w-5 h-5 text-amber-500 shrink-0" />
                                        <span className="truncate">Ringkasan Kehadiran &amp; Shift Satpam</span>
                                    </>
                                ) : roleTab === 'lembur' ? (
                                    <>
                                        <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                                        <span className="truncate">Ringkasan Lembur per Karyawan</span>
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span className="truncate">Ringkasan Kehadiran per Karyawan</span>
                                    </>
                                )}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Tekan nama karyawan untuk melihat rincian kalender bulanan</span>
                            </p>
                        </div>
                        {(isAdmin || isSuperAdmin) && (
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(true)}
                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Settings className="w-4 h-4 shrink-0" />
                                    Atur Jam
                                </button>
                                <Link
                                    href={route('salaries.index', { month: data.month, year: data.year })}
                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Wallet className="w-4 h-4 shrink-0" />
                                    Gaji
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Card List for User Summaries */}
                    <div className="block md:hidden divide-y divide-gray-100">
                        {filteredUserSummaries.length > 0 ? (
                            filteredUserSummaries.map((u, idx) => (
                                <button
                                    key={u.id || idx}
                                    type="button"
                                    onClick={() => openEmployeeCalendar(u)}
                                    className="w-full text-left p-4 space-y-3 hover:bg-blue-50/40 active:bg-blue-50/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                                                {(u.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="font-bold text-gray-900 text-sm block truncate">{u.name}</span>
                                                <span className="text-[11px] text-blue-600 font-semibold inline-flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3 shrink-0" /> Lihat Kalender
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white tabular-nums">
                                                {roleTab === 'lembur' ? `Lembur: ${u.lembur || 0}` : `Hadir: ${u.hadir}`}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                    {roleTab === 'satpam' ? (
                                        <div className="grid grid-cols-2 gap-2 text-center">
                                            <div className="bg-amber-50 border border-amber-200/70 rounded-xl py-2 px-2.5 flex items-center justify-between">
                                                <span className="text-xs text-amber-800 font-semibold">Shift Siang</span>
                                                <span className="text-sm font-black text-amber-900 tabular-nums">{u.shift_siang || 0}</span>
                                            </div>
                                            <div className="bg-indigo-50 border border-indigo-200/70 rounded-xl py-2 px-2.5 flex items-center justify-between">
                                                <span className="text-xs text-indigo-800 font-semibold">Shift Malam</span>
                                                <span className="text-sm font-black text-indigo-900 tabular-nums">{u.shift_malam || 0}</span>
                                            </div>
                                            <div className="bg-orange-50 border border-orange-200/70 rounded-xl py-2 px-2.5 flex items-center justify-between">
                                                <span className="text-xs text-orange-800 font-semibold">Sakit</span>
                                                <span className="text-sm font-black text-orange-900 tabular-nums">{u.sakit || 0}</span>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl py-2 px-2.5 flex items-center justify-between">
                                                <span className="text-xs text-emerald-800 font-semibold">Izin</span>
                                                <span className="text-sm font-black text-emerald-900 tabular-nums">{u.izin || 0}</span>
                                            </div>
                                        </div>
                                    ) : roleTab === 'lembur' ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-blue-50 border border-blue-200/70 rounded-xl p-2.5">
                                                <span className="text-[11px] text-blue-700 font-semibold block">Total Lembur</span>
                                                <span className="text-sm font-black text-blue-900 tabular-nums">{u.lembur || 0} Kali</span>
                                            </div>
                                            <div className="bg-indigo-50 border border-indigo-200/70 rounded-xl p-2.5">
                                                <span className="text-[11px] text-indigo-700 font-semibold block">Weekday (Jam 20)</span>
                                                <span className="text-sm font-black text-indigo-900 tabular-nums">{u.lembur_weekday_pertama || 0}x</span>
                                            </div>
                                            <div className="bg-purple-50 border border-purple-200/70 rounded-xl p-2.5">
                                                <span className="text-[11px] text-purple-700 font-semibold block">Lembur Weekend</span>
                                                <span className="text-sm font-black text-purple-900 tabular-nums">{u.lembur_sabtu || 0} Jam</span>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-2.5">
                                                <span className="text-[11px] text-emerald-700 font-semibold block">Estimasi Nominal</span>
                                                <span className="text-xs font-black text-emerald-900 tabular-nums break-words">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(u.nominal_lembur || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-blue-50 border border-blue-200/70 rounded-xl py-2 px-1.5">
                                                <span className="text-[11px] text-blue-700 font-semibold block">Hadir</span>
                                                <span className="text-sm font-black text-blue-900 tabular-nums">{u.hadir}</span>
                                            </div>
                                            <div className="bg-orange-50 border border-orange-200/70 rounded-xl py-2 px-1.5">
                                                <span className="text-[11px] text-orange-700 font-semibold block">Sakit</span>
                                                <span className="text-sm font-black text-orange-900 tabular-nums">{u.sakit}</span>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl py-2 px-1.5">
                                                <span className="text-[11px] text-emerald-700 font-semibold block">Izin</span>
                                                <span className="text-sm font-black text-emerald-900 tabular-nums">{u.izin}</span>
                                            </div>
                                            <div className="bg-rose-50 border border-rose-200/70 rounded-xl py-2 px-1.5">
                                                <span className="text-[11px] text-rose-700 font-semibold block">Alpa</span>
                                                <span className="text-sm font-black text-rose-900 tabular-nums">{u.alpa}</span>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-200/70 rounded-xl py-2 px-1.5">
                                                <span className="text-[11px] text-amber-800 font-semibold block">Telat</span>
                                                <span className="text-sm font-black text-amber-900 tabular-nums">{u.terlambat || 0}</span>
                                            </div>
                                            <div className="bg-indigo-50 border border-indigo-200/70 rounded-xl py-2 px-1.5">
                                                <span className="text-[11px] text-indigo-700 font-semibold block">Lembur</span>
                                                <span className="text-sm font-black text-indigo-900 tabular-nums">{u.lembur || 0}</span>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                {roleTab === 'satpam'
                                    ? 'Tidak ada data personel satpam yang cocok.'
                                    : roleTab === 'lembur'
                                        ? 'Tidak ada data lembur karyawan yang cocok.'
                                        : 'Tidak ada data karyawan yang cocok dengan pencarian.'}
                            </div>
                        )}
                    </div>

                    {/* Desktop Table for User Summaries */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {roleTab === 'satpam' ? (
                                    <tr className="bg-gray-50/70 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="py-3.5 px-5 font-semibold">Nama Satpam</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-blue-600">Total Hadir</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-amber-600">Shift Siang</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-indigo-600">Shift Malam</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-orange-600">Sakit</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-emerald-600">Izin</th>
                                        <th className="py-3.5 px-5 font-semibold text-right">Kalender</th>
                                    </tr>
                                ) : roleTab === 'lembur' ? (
                                    <tr className="bg-gray-50/70 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="py-3.5 px-5 font-semibold">Nama Karyawan</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-blue-600">Total Lembur</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-indigo-600">Weekday (Jam Pertama)</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-amber-600">Weekday (Berikutnya)</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-purple-600">Lembur Weekend</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-emerald-600">Estimasi Nominal</th>
                                        <th className="py-3.5 px-5 font-semibold text-right">Kalender</th>
                                    </tr>
                                ) : (
                                    <tr className="bg-gray-50/70 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="py-3.5 px-5 font-semibold">Nama Karyawan</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-blue-600">Hadir</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-orange-600">Sakit</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-emerald-600">Izin</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-red-600">Alpa</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-rose-600">Terlambat</th>
                                        <th className="py-3.5 px-4 font-semibold text-center text-blue-600">Lembur</th>
                                        <th className="py-3.5 px-5 font-semibold text-right">Kalender</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {filteredUserSummaries.length > 0 ? (
                                    filteredUserSummaries.map((u, idx) => (
                                        <tr
                                            key={u.id || idx}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => openEmployeeCalendar(u)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    openEmployeeCalendar(u);
                                                }
                                            }}
                                            className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer group focus:outline-none focus-visible:bg-blue-50"
                                            title={`Klik untuk melihat kalender bulanan ${u.name}`}
                                        >
                                            <td className="py-3.5 px-5 font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        {(u.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{u.name}</span>
                                                </div>
                                            </td>

                                            {roleTab === 'satpam' ? (
                                                <>
                                                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 tabular-nums">{u.hadir}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-amber-600 tabular-nums">{u.shift_siang || 0}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600 tabular-nums">{u.shift_malam || 0}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-orange-600 tabular-nums">{u.sakit}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 tabular-nums">{u.izin}</td>
                                                </>
                                            ) : roleTab === 'lembur' ? (
                                                <>
                                                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 tabular-nums">{u.lembur || 0} Kali</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600 tabular-nums">{u.lembur_weekday_pertama || 0}x</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-amber-600 tabular-nums">{u.lembur_weekday_berikutnya || 0} Jam</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-purple-600 tabular-nums">{u.lembur_sabtu || 0} Jam</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 tabular-nums whitespace-nowrap">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(u.nominal_lembur || 0)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 tabular-nums">{u.hadir}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-orange-600 tabular-nums">{u.sakit}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 tabular-nums">{u.izin}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-red-600 tabular-nums">{u.alpa}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-rose-600 tabular-nums">{u.terlambat || 0}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 tabular-nums">{u.lembur || 0}</td>
                                                </>
                                            )}

                                            <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    Kalender
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={roleTab === 'satpam' || roleTab === 'lembur' ? '7' : '8'} className="py-8 text-center text-gray-500">
                                            {roleTab === 'satpam'
                                                ? 'Tidak ada data personel satpam yang cocok.'
                                                : roleTab === 'lembur'
                                                    ? 'Tidak ada data lembur karyawan yang cocok.'
                                                    : 'Tidak ada data karyawan yang cocok dengan pencarian.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                        <h3 className="font-bold text-sm sm:text-lg text-gray-800 flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                            <span className="truncate">
                                {roleTab === 'satpam' ? 'Rincian Kehadiran & Shift Satpam' : roleTab === 'lembur' ? 'Rincian Pengajuan & Kehadiran Lembur' : 'Rincian Kehadiran'}
                            </span>
                        </h3>
                        <ExportDropdown pdfRoute={route('absensi.rekap.export-pdf', { month: data.month, year: data.year, user_id: data.user_id })} trigger={
                            <button type="button" className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl transition-colors">
                                <Download className="w-4 h-4 shrink-0" /> Export PDF
                            </button>
                        } />
                    </div>

                    {/* Mobile Card List for Attendance Records */}
                    <div className="block md:hidden divide-y divide-gray-100">
                        {paginatedList.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Tidak ada riwayat absensi yang cocok dengan pencarian.
                            </div>
                        ) : (
                            paginatedList.map((item, idx) => (
                                <div key={item.id || idx} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    {/* Top: Name, Date, Type Badge, and Actions */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openEmployeeCalendar(item.user_id, item.start_date || item.date)}
                                                    className="font-bold text-gray-900 hover:text-blue-700 text-sm text-left inline-flex items-center gap-1.5 transition-colors break-words"
                                                    title={`Lihat kalender bulanan ${item.user_name}`}
                                                >
                                                    <span>{item.user_name}</span>
                                                    <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                </button>
                                                {item.is_satpam && (
                                                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold shrink-0">Satpam</span>
                                                )}
                                            </div>
                                            {(() => {
                                                const fmt = formatRecapDate(item.date);
                                                return fmt.dayLabel ? (
                                                    <div className="mt-0.5 leading-tight">
                                                        <p className="text-xs font-semibold text-gray-700">{fmt.dayLabel}, <span className="font-normal text-gray-500">{fmt.dateLabel}</span></p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                item.type === 'Hadir' ? 'bg-blue-600 text-white' :
                                                item.type === 'Sakit' ? 'bg-orange-500 text-white' :
                                                item.type === 'Lembur' ? 'bg-indigo-600 text-white' :
                                                item.type === 'Alpa' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shift Tag if available */}
                                    {item.shift && (
                                        <div className="inline-flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                                            Shift: {item.shift}
                                        </div>
                                    )}

                                    {/* Check In & Check Out 2-column Box */}
                                    <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-200/70">
                                        {/* Masuk */}
                                        <div className="space-y-1.5 min-w-0">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                                {roleTab === 'satpam' ? 'Masuk Shift' : 'Jam Masuk'}
                                            </span>
                                            <div className="font-bold text-gray-900 text-sm tabular-nums">
                                                {item.check_in || '-'}
                                            </div>
                                            {!item.is_satpam && item.is_late && !item.is_off_day && (
                                                <span className="inline-block text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold">
                                                    Terlambat
                                                </span>
                                            )}
                                            {item.check_in_photo && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowPhoto(item.check_in_photo, 'Masuk')}
                                                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-white hover:bg-blue-50 border border-blue-200/70 px-2.5 py-1.5 min-h-[34px] rounded-lg font-semibold transition-colors"
                                                >
                                                    <Camera className="w-3.5 h-3.5 shrink-0" /> Foto Masuk
                                                </button>
                                            )}
                                        </div>

                                        {/* Keluar */}
                                        <div className="space-y-1.5 border-l border-gray-200 pl-3 min-w-0">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                                {roleTab === 'satpam' ? 'Keluar Shift' : 'Jam Keluar'}
                                            </span>
                                            <div className="font-bold text-gray-900 text-sm tabular-nums">
                                                {item.check_out || '-'}
                                            </div>
                                            {!item.is_satpam && item.is_lembur && (
                                                <div>
                                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                        item.overtime_status === 'Disetujui'
                                                            ? 'bg-emerald-600 text-white'
                                                            : item.overtime_status === 'Ditolak'
                                                                ? 'bg-rose-600 text-white line-through'
                                                                : 'bg-amber-500 text-white'
                                                    }`}>
                                                        Lembur
                                                    </span>
                                                </div>
                                            )}
                                            {item.check_out_photo && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowPhoto(item.check_out_photo, 'Keluar')}
                                                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-white hover:bg-blue-50 border border-blue-200/70 px-2.5 py-1.5 min-h-[34px] rounded-lg font-semibold transition-colors"
                                                >
                                                    <Camera className="w-3.5 h-3.5 shrink-0" /> Foto Keluar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status, Attachment & Notes */}
                                    <div className="space-y-2 pt-0.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                item.status === 'Selesai' || item.status === 'Disetujui' ? 'bg-emerald-600 text-white' :
                                                item.status === 'Menunggu' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                                            }`}>
                                                Status: {item.status}
                                            </span>

                                            {item.attachment && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowPhoto(item.attachment, 'Lampiran Pengajuan')}
                                                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-3 py-1.5 min-h-[36px] rounded-xl font-semibold transition-colors"
                                                    title="Lihat lampiran pengajuan"
                                                >
                                                    <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                    Lihat Lampiran
                                                </button>
                                            )}
                                        </div>

                                        {/* Keterangan Masuk */}
                                        {item.check_in_notes && (
                                            <div className="text-xs text-blue-900 bg-blue-50/80 border border-blue-200/60 rounded-xl px-3 py-2 break-words">
                                                <span className="font-bold text-blue-950">Masuk:</span> {item.check_in_notes}
                                            </div>
                                        )}

                                        {/* Alasan Lembur Khusus Jika Lembur */}
                                        {!item.is_satpam && item.is_lembur && (
                                            <div className="text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded-xl p-3 break-words space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-blue-950 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-blue-600 inline" /> Alasan:
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        item.overtime_status === 'Disetujui'
                                                            ? 'bg-emerald-600 text-white'
                                                            : item.overtime_status === 'Ditolak'
                                                                ? 'bg-rose-600 text-white'
                                                                : 'bg-amber-500 text-white'
                                                    }`}>
                                                        {item.overtime_status === 'Disetujui' ? 'ACC' : item.overtime_status === 'Ditolak' ? 'Ditolak' : 'Menunggu ACC'}
                                                    </span>
                                                </div>
                                                <div className="text-gray-800">
                                                    {item.check_out_notes || item.notes || (
                                                        <span className="text-amber-700 italic">Belum ada alasan lembur</span>
                                                    )}
                                                </div>
                                                {(isAdmin || isSuperAdmin) && !item.id.toString().startsWith('req_') && !item.id.toString().startsWith('alpa_') && (
                                                    <div className="flex items-center gap-2 pt-2 border-t border-blue-200/60">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOvertimeStatus(item, 'Disetujui')}
                                                            disabled={item.overtime_status === 'Disetujui'}
                                                            className={`flex-1 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors text-center ${
                                                                item.overtime_status === 'Disetujui'
                                                                    ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                                            }`}
                                                        >
                                                            Terima
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOvertimeStatus(item, 'Ditolak')}
                                                            disabled={item.overtime_status === 'Ditolak'}
                                                            className={`flex-1 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors text-center ${
                                                                item.overtime_status === 'Ditolak'
                                                                    ? 'bg-rose-100 text-rose-700 cursor-default'
                                                                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                                                            }`}
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Keterangan Pulang Biasa (Jika Tidak Lembur) */}
                                        {!item.is_lembur && item.check_out_notes && (
                                            <div className="text-xs text-emerald-900 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-3 py-2 break-words">
                                                <span className="font-bold text-emerald-950">Pulang:</span> {item.check_out_notes}
                                            </div>
                                        )}

                                        {/* Fallback Legacy Notes */}
                                        {!item.is_lembur && !item.check_in_notes && !item.check_out_notes && item.notes && (
                                            <div className="text-xs text-gray-600 italic break-words bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                                &quot;{item.notes}&quot;
                                            </div>
                                        )}

                                        {/* Action Row for Edit Notes / Delete / Approve Requests */}
                                        {(isSuperAdmin || isAdmin) && (
                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {!item.id.startsWith('req_') && !item.id.startsWith('alpa_') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditAbsensi(item)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70 rounded-xl text-xs font-semibold transition-colors"
                                                            title="Edit Keterangan Masuk & Pulang"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                            {item.check_in_notes || item.check_out_notes || item.notes ? 'Ubah Keterangan' : 'Tambah Keterangan'}
                                                        </button>
                                                    )}

                                                    {item.id.startsWith('req_') && item.status === 'Menunggu' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                                                                className="px-3.5 py-1.5 min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                                                            >
                                                                ACC
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                                                                className="px-3.5 py-1.5 min-h-[38px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {!item.id.startsWith('alpa_') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAbsensi(item.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 rounded-xl text-xs font-semibold transition-colors"
                                                        title="Hapus Data"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table for Attendance Records */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                                    <th className="py-3.5 px-5 font-semibold">Karyawan</th>
                                    <th className="py-3.5 px-4 font-semibold">Tanggal</th>
                                    <th className="py-3.5 px-4 font-semibold">Tipe Absen</th>
                                    <th className="py-3.5 px-4 font-semibold text-center">Shift</th>
                                    <th className="py-3.5 px-4 font-semibold text-center">
                                        {roleTab === 'satpam' ? 'Masuk Shift' : 'Jam Masuk'}
                                    </th>
                                    <th className="py-3.5 px-4 font-semibold text-center">
                                        {roleTab === 'satpam' ? 'Keluar Shift' : 'Jam Keluar'}
                                    </th>
                                    <th className="py-3.5 px-5 font-semibold">Status &amp; Catatan</th>
                                    {(isSuperAdmin || isAdmin) && <th className="py-3.5 px-5 font-semibold text-right">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {paginatedList.length === 0 ? (
                                    <tr>
                                        <td colSpan={(isSuperAdmin || isAdmin) ? '8' : '7'} className="py-8 text-center text-gray-500">
                                            Tidak ada riwayat absensi yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedList.map((item, idx) => (
                                        <tr key={item.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 px-5 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEmployeeCalendar(item.user_id, item.start_date || item.date)}
                                                        className="font-semibold text-gray-900 hover:text-blue-700 text-left inline-flex items-center gap-1.5 transition-colors"
                                                        title={`Lihat kalender bulanan ${item.user_name}`}
                                                    >
                                                        <span>{item.user_name}</span>
                                                        <CalendarDays className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    </button>
                                                    {item.is_satpam && (
                                                        <span className="text-xs text-gray-500 font-normal">
                                                            (Satpam)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                {(() => {
                                                    const fmt = formatRecapDate(item.date);
                                                    return fmt.dayLabel ? (
                                                        <div className="leading-tight">
                                                            <div className="font-semibold text-gray-900">{fmt.dayLabel}</div>
                                                            <div className="text-xs text-gray-600 mt-0.5">{fmt.dateLabel}</div>
                                                        </div>
                                                    ) : (
                                                        <span>{item.date}</span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.type === 'Hadir' ? 'bg-blue-600 text-white' :
                                                    item.type === 'Sakit' ? 'bg-orange-500 text-white' : 
                                                    item.type === 'Lembur' ? 'bg-indigo-600 text-white' : 
                                                    item.type === 'Alpa' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {item.shift ? (
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {item.shift}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center font-medium">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span>{item.check_in || '-'}</span>
                                                    {!item.is_satpam && item.is_late && !item.is_off_day && (
                                                        <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold whitespace-nowrap">Terlambat</span>
                                                    )}
                                                    {item.check_in_photo && (
                                                        <button onClick={() => handleShowPhoto(item.check_in_photo, 'Masuk')} className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                                            <Camera className="w-3 h-3"/> Foto
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center font-medium">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span>{item.check_out || '-'}</span>
                                                    {!item.is_satpam && item.is_lembur && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                                                            item.overtime_status === 'Disetujui'
                                                                ? 'bg-emerald-600 text-white'
                                                                : item.overtime_status === 'Ditolak'
                                                                ? 'bg-rose-600 text-white line-through'
                                                                : 'bg-amber-500 text-white'
                                                        }`}>
                                                            Lembur
                                                        </span>
                                                    )}
                                                    {item.check_out_photo && (
                                                        <button onClick={() => handleShowPhoto(item.check_out_photo, 'Keluar')} className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                                            <Camera className="w-3 h-3"/> Foto
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        item.status === 'Selesai' || item.status === 'Disetujui' ? 'bg-emerald-600 text-white' :
                                                        item.status === 'Menunggu' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                                                    }`}>
                                                        {item.status}
                                                    </span>

                                                    {item.attachment && (
                                                        <button 
                                                            onClick={() => handleShowPhoto(item.attachment, 'Lampiran Pengajuan')} 
                                                            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                                                            title="Lihat lampiran pengajuan"
                                                        >
                                                            <Paperclip className="w-3 h-3 text-blue-500" />
                                                            Lihat Lampiran
                                                        </button>
                                                    )}

                                                    {/* Keterangan Masuk */}
                                                    {item.check_in_notes && (
                                                        <div className="text-[11px] text-blue-800 bg-blue-50/80 border border-blue-200/60 rounded px-2 py-0.5 max-w-[240px] break-words">
                                                            <span className="font-bold text-blue-900">Masuk:</span> {item.check_in_notes}
                                                        </div>
                                                    )}

                                                    {/* Alasan Lembur Khusus Jika Lembur */}
                                                    {!item.is_satpam && item.is_lembur && (
                                                        <div className="text-[11px] text-blue-900 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 max-w-[280px] break-words space-y-1.5">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-bold text-blue-950 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3 text-blue-600 inline" /> Alasan :
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                    item.overtime_status === 'Disetujui'
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : item.overtime_status === 'Ditolak'
                                                                        ? 'bg-rose-600 text-white'
                                                                        : 'bg-amber-500 text-white'
                                                                }`}>
                                                                    {item.overtime_status === 'Disetujui' ? 'ACC' : item.overtime_status === 'Ditolak' ? 'Ditolak' : 'Menunggu ACC'}
                                                                </span>
                                                            </div>
                                                            <div className="text-gray-800">
                                                                {item.check_out_notes || item.notes || (
                                                                    <span className="text-amber-600 italic">Belum ada alasan lembur</span>
                                                                )}
                                                            </div>
                                                            {(isAdmin || isSuperAdmin) && !item.id.toString().startsWith('req_') && !item.id.toString().startsWith('alpa_') && (
                                                                <div className="flex items-center gap-1.5 pt-1 border-t border-blue-200/60">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOvertimeStatus(item, 'Disetujui')}
                                                                        disabled={item.overtime_status === 'Disetujui'}
                                                                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                                                                            item.overtime_status === 'Disetujui'
                                                                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                                                        }`}
                                                                    >
                                                                        Terima
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOvertimeStatus(item, 'Ditolak')}
                                                                        disabled={item.overtime_status === 'Ditolak'}
                                                                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                                                                            item.overtime_status === 'Ditolak'
                                                                                ? 'bg-rose-100 text-rose-700 cursor-default'
                                                                                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                                                                        }`}
                                                                    >
                                                                        Tolak
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Keterangan Pulang Biasa (Jika Tidak Lembur) */}
                                                    {!item.is_lembur && item.check_out_notes && (
                                                        <div className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 rounded px-2 py-0.5 max-w-[240px] break-words">
                                                            <span className="font-bold text-emerald-900">Pulang:</span> {item.check_out_notes}
                                                        </div>
                                                    )}

                                                    {/* Fallback Legacy Notes */}
                                                    {!item.is_lembur && !item.check_in_notes && !item.check_out_notes && item.notes && (
                                                        <div className="text-xs text-gray-500 italic max-w-[220px] break-words mt-0.5">
                                                            "{item.notes}"
                                                        </div>
                                                    )}

                                                    {(isSuperAdmin || isAdmin) && !item.id.startsWith('req_') && (
                                                        <button 
                                                            onClick={() => handleEditAbsensi(item)} 
                                                            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1 mt-0.5"
                                                            title="Edit Keterangan Masuk & Pulang"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                            {item.check_in_notes || item.check_out_notes || item.notes ? 'Ubah Keterangan' : 'Tambah Keterangan'}
                                                        </button>
                                                    )}

                                                    {(isAdmin || isSuperAdmin) && item.id.startsWith('req_') && item.status === 'Menunggu' && (
                                                        <div className="flex gap-1.5 mt-1">
                                                            <button 
                                                                onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                                                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm transition-colors"
                                                            >
                                                                ACC
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                                                                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow-sm transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {(isSuperAdmin || isAdmin) && (
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button 
                                                            onClick={() => handleEditAbsensi(item)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Keterangan"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        {!item.id.startsWith('alpa_') && (
                                                            <button 
                                                                onClick={() => handleDeleteAbsensi(item.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus Data"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex justify-center py-4 sm:py-5 px-3 border-t border-gray-100 bg-white">
                            <nav className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Halaman sebelumnya"
                                    title="Halaman sebelumnya"
                                    className="inline-flex items-center justify-center min-w-[38px] sm:min-w-[40px] h-9 sm:h-10 px-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex flex-wrap items-center gap-1">
                                    {getPageNumbers().map(page => (
                                        <button
                                            type="button"
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Halaman selanjutnya"
                                    title="Halaman selanjutnya"
                                    className="inline-flex items-center justify-center min-w-[38px] sm:min-w-[40px] h-9 sm:h-10 px-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </nav>
                        </div>
                    )}
                </div>

                {showSettingsModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 backdrop-blur-sm p-0 sm:p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowSettingsModal(false);
                        }}
                    >
                        <div
                            className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90dvh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2 min-w-0">
                                    <Settings className="w-5 h-5 text-blue-600 shrink-0" />
                                    <span className="truncate">Pengaturan Jam Absensi &amp; Lembur</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    aria-label="Tutup pengaturan"
                                    className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveSettings} className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Absen Keluar Otomatis (Senin-Jumat)
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_pulang_otomatis}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_pulang_otomatis: e.target.value })}
                                            required
                                            className="w-full min-h-[42px] rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Absen Keluar Otomatis (Sabtu)
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_pulang_otomatis_sabtu}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_pulang_otomatis_sabtu: e.target.value })}
                                            required
                                            className="w-full min-h-[42px] rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 -mt-1">
                                    Jam pulang otomatis jika karyawan belum absen keluar di hari sebelumnya (Senin-Jumat default 17:00, Sabtu default 13:00).
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Lembur Senin-Jumat Dimulai
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_mulai_lembur_weekday}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_mulai_lembur_weekday: e.target.value })}
                                            required
                                            className="w-full min-h-[42px] rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Lembur Sabtu Dimulai
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_mulai_lembur_sabtu}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_mulai_lembur_sabtu: e.target.value })}
                                            required
                                            className="w-full min-h-[42px] rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Batas Keterlambatan Normal
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_batas_terlambat}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_batas_terlambat: e.target.value })}
                                            required
                                            className="w-full min-h-[42px] rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Jika Lembur, Keterlambatan (Jam)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="12"
                                                value={settingsForm.toleransi_terlambat_lembur_jam}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, toleransi_terlambat_lembur_jam: parseInt(e.target.value || '0', 10) })}
                                                required
                                                className="w-full min-h-[42px] rounded-xl border-gray-300 text-sm pr-12 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                                                Jam
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
                                    Maksimal keterlambatan <b>{settingsForm.toleransi_terlambat_lembur_jam} jam</b> di hari esoknya bagi karyawan yang lembur mulai jam <b>{settingsForm.jam_mulai_lembur_weekday}</b> sampai selesai (dan lemburnya sudah Ter-ACC).
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowSettingsModal(false)}
                                        className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingSettings}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {savingSettings ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <EmployeeAttendanceCalendarModal
                    isOpen={calendarModal.isOpen}
                    employee={calendarModal.employee}
                    initialMonth={Number(filters.month)}
                    initialYear={Number(filters.year)}
                    initialRecords={selectedEmployeeCalendarRecords}
                    initialSummary={selectedEmployeeCalendarSummary}
                    initialSelectedDate={calendarModal.selectedDate}
                    todayDate={todayDate}
                    isAdmin={isAdmin || isSuperAdmin}
                    onClose={() => setCalendarModal({ isOpen: false, employee: null, selectedDate: null })}
                    onShowPhoto={handleShowPhoto}
                    onEditRecord={handleEditAbsensi}
                    onOvertimeStatus={handleOvertimeStatus}
                    onUpdateRequestStatus={handleUpdateStatus}
                />

            </div>
        </AuthenticatedLayout>
    );
}
