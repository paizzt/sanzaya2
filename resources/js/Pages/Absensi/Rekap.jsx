import React, { useState, useEffect } from 'react';
import ExportDropdown from '@/Components/ExportDropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Calendar, Users, ClipboardCheck, Clock, CheckCircle2, AlertCircle, FileText, Search, Download, Camera, Trash2, Edit, UserCheck, Paperclip, Wallet, Settings, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomSelect from '@/Components/CustomSelect';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Rekap({ auth, recapList, summary, userSummaries, filters, users, isAdmin, payrollSettings = {} }) {
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

        // Bypass blokir ISP Indonesia (ERR_SSL_VERSION_OR_CIPHER_MISMATCH) terhadap i.ibb.co
        // dengan menggunakan proxy gambar publik wsrv.nl
        let finalUrl = url;
        if (url.includes('i.ibb.co')) {
            finalUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
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
                    <p><strong class="text-gray-700">Karyawan:</strong> <span class="text-gray-900 font-semibold">${item.user_name}</span></p>
                    <p><strong class="text-gray-700">Tanggal:</strong> <span class="text-gray-900">${item.date}</span></p>
                    <div class="flex items-center gap-4 pt-1 font-medium text-gray-700">
                        <span>Jam Masuk: <b class="text-blue-600">${item.check_in && item.check_in !== '-' ? item.check_in : '-'}</b></span>
                        <span>Jam Keluar: <b class="text-green-600">${item.check_out && item.check_out !== '-' ? item.check_out : '-'}</b></span>
                    </div>
                </div>
                <div class="text-left mb-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Keterangan Masuk</label>
                    <textarea id="swal-input-notes-in" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" rows="2" placeholder="Catatan/keterangan saat masuk...">${currentInNotes}</textarea>
                </div>
                <div class="text-left mb-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">
                        ${item.is_lembur ? 'Keterangan Pulang / Keterangan Jika Lembur' : 'Keterangan Pulang'}
                    </label>
                    <textarea id="swal-input-notes-out" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" rows="2" placeholder="Catatan/alasan saat pulang atau lembur...">${currentOutNotes}</textarea>
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

    const [roleTab, setRoleTab] = useState('all'); // 'all', 'regular', 'satpam'
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter available users for dropdown based on active roleTab
    const roleFilteredUsers = users.filter(u => {
        const summaryMatch = userSummaries?.find(s => s.id === u.id);
        const isSatpamUser = summaryMatch ? summaryMatch.is_satpam : false;
        if (roleTab === 'satpam') return isSatpamUser;
        if (roleTab === 'regular') return !isSatpamUser;
        return true;
    });

    const userOptions = [
        { value: 'all', label: roleTab === 'satpam' ? '-- Semua Satpam --' : roleTab === 'regular' ? '-- Semua Karyawan Reguler --' : '-- Semua Karyawan --' },
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

    const roleFilteredUserSummaries = userSummaries?.filter(u => {
        if (roleTab === 'satpam') return u.is_satpam;
        if (roleTab === 'regular') return !u.is_satpam;
        return true;
    }) || [];

    const filteredUserSummaries = roleFilteredUserSummaries.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (statusFilter === 'all') return true;
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
        return true;
    }) || [];

    const filteredRecapList = roleFilteredRecapList.filter(item => {
        const matchesSearch = item.user_name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (statusFilter === 'all') return true;
        if (statusFilter === 'Terlambat') return item.is_late === true || item.is_late === 1;
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
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Rekap Absensi & Riwayat</h2>}
        >
            <Head title="Rekap Absensi" />

            <div className="pb-6 pt-0 space-y-6">
                
                {/* Role Tabs Filter */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => { setRoleTab('all'); setStatusFilter('all'); }}
                            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                                roleTab === 'all'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            <Users className="w-4 h-4" /> Semua Karyawan
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRoleTab('regular'); setStatusFilter('all'); }}
                            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                                roleTab === 'regular'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            <UserCheck className="w-4 h-4" /> Karyawan Reguler
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRoleTab('satpam'); setStatusFilter('all'); }}
                            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                                roleTab === 'satpam'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            <Users className="w-4 h-4" /> Satpam
                        </button>
                    </div>
                </div>

                {/* Filter & Search Section */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-end gap-3 sm:gap-4">
                    <div className="w-full lg:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                        <CustomSelect 
                            value={data.month} 
                            onChange={(val) => setData('month', val)} 
                            options={monthOptions} 
                        />
                    </div>
                    <div className="w-full lg:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                        <CustomSelect 
                            value={data.year} 
                            onChange={(val) => setData('year', val)} 
                            options={yearOptions} 
                        />
                    </div>
                    <div className="w-full lg:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {roleTab === 'satpam' ? 'Personel Satpam' : 'Karyawan'}
                        </label>
                        <CustomSelect 
                            value={data.user_id} 
                            onChange={(val) => setData('user_id', val)} 
                            options={userOptions} 
                        />
                    </div>
                    <div className="w-full lg:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Karyawan / Status</label>
                        <TextInput
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full"
                            placeholder="Ketik nama karyawan..."
                        />
                    </div>
                    <div className="w-full lg:w-auto flex gap-2">
                        <PrimaryButton onClick={handleFilter} className="w-full justify-center">
                            <Search className="w-4 h-4 mr-2" /> Tampilkan
                        </PrimaryButton>
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
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-3">
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                            {roleTab === 'satpam' ? (
                                <>
                                    <Users className="w-5 h-5 text-amber-500"/> Ringkasan Kehadiran & Shift Personel Satpam
                                </>
                            ) : (
                                <>
                                    <Users className="w-5 h-5 text-blue-500"/> Ringkasan Kehadiran per Karyawan
                                </>
                            )}
                        </h3>
                        {(isAdmin || isSuperAdmin) && (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(true)}
                                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                    Atur Jam
                                </button>
                                <Link
                                    href={route('salaries.index', { month: data.month, year: data.year })}
                                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Gaji
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Card List for User Summaries */}
                    <div className="block md:hidden divide-y divide-gray-100">
                        {filteredUserSummaries.length > 0 ? (
                            filteredUserSummaries.map((u, idx) => (
                                <div key={idx} className="p-4 space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-gray-900 text-sm truncate">{u.name}</span>
                                        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                                            Hadir: {u.hadir}
                                        </span>
                                    </div>
                                    {roleTab === 'satpam' ? (
                                        <div className="grid grid-cols-4 gap-1.5 text-center">
                                            <div className="bg-amber-50 rounded-xl p-1.5 border border-amber-100/60">
                                                <span className="text-[10px] text-amber-700 font-semibold block">Siang</span>
                                                <span className="text-xs font-black text-amber-800">{u.shift_siang || 0}</span>
                                            </div>
                                            <div className="bg-indigo-50 rounded-xl p-1.5 border border-indigo-100/60">
                                                <span className="text-[10px] text-indigo-700 font-semibold block">Malam</span>
                                                <span className="text-xs font-black text-indigo-800">{u.shift_malam || 0}</span>
                                            </div>
                                            <div className="bg-orange-50 rounded-xl p-1.5 border border-orange-100/60">
                                                <span className="text-[10px] text-orange-700 font-semibold block">Sakit</span>
                                                <span className="text-xs font-black text-orange-800">{u.sakit || 0}</span>
                                            </div>
                                            <div className="bg-emerald-50 rounded-xl p-1.5 border border-emerald-100/60">
                                                <span className="text-[10px] text-emerald-700 font-semibold block">Izin</span>
                                                <span className="text-xs font-black text-emerald-800">{u.izin || 0}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-5 gap-1.5 text-center">
                                            <div className="bg-orange-50 rounded-xl p-1.5 border border-orange-100/60">
                                                <span className="text-[10px] text-orange-700 font-semibold block">Sakit</span>
                                                <span className="text-xs font-black text-orange-800">{u.sakit}</span>
                                            </div>
                                            <div className="bg-emerald-50 rounded-xl p-1.5 border border-emerald-100/60">
                                                <span className="text-[10px] text-emerald-700 font-semibold block">Izin</span>
                                                <span className="text-xs font-black text-emerald-800">{u.izin}</span>
                                            </div>
                                            <div className="bg-rose-50 rounded-xl p-1.5 border border-rose-100/60">
                                                <span className="text-[10px] text-rose-700 font-semibold block">Alpa</span>
                                                <span className="text-xs font-black text-rose-800">{u.alpa}</span>
                                            </div>
                                            <div className="bg-amber-50 rounded-xl p-1.5 border border-amber-100/60">
                                                <span className="text-[10px] text-amber-700 font-semibold block">Telat</span>
                                                <span className="text-xs font-black text-amber-800">{u.terlambat || 0}</span>
                                            </div>
                                            <div className="bg-blue-50 rounded-xl p-1.5 border border-blue-100/60">
                                                <span className="text-[10px] text-blue-700 font-semibold block">Lembur</span>
                                                <span className="text-xs font-black text-blue-800">{u.lembur || 0}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                {roleTab === 'satpam' 
                                    ? 'Tidak ada data personel satpam yang cocok.' 
                                    : 'Tidak ada data karyawan yang cocok dengan pencarian.'}
                            </div>
                        )}
                    </div>

                    {/* Desktop Table for User Summaries */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {roleTab === 'satpam' ? (
                                    <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="py-4 px-6 font-semibold">Nama Satpam</th>
                                        <th className="py-4 px-6 font-semibold text-center text-blue-600">Total Hadir</th>
                                        <th className="py-4 px-6 font-semibold text-center text-amber-600">Shift Siang</th>
                                        <th className="py-4 px-6 font-semibold text-center text-indigo-600">Shift Malam</th>
                                        <th className="py-4 px-6 font-semibold text-center text-orange-600">Sakit</th>
                                        <th className="py-4 px-6 font-semibold text-center text-emerald-600">Izin</th>
                                    </tr>
                                ) : (
                                    <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="py-4 px-6 font-semibold">Nama Karyawan</th>
                                        <th className="py-4 px-6 font-semibold text-center text-blue-600">Hadir</th>
                                        <th className="py-4 px-6 font-semibold text-center text-orange-600">Sakit</th>
                                        <th className="py-4 px-6 font-semibold text-center text-emerald-600">Izin</th>
                                        <th className="py-4 px-6 font-semibold text-center text-red-600">Alpa</th>
                                        <th className="py-4 px-6 font-semibold text-center text-rose-600">Terlambat</th>
                                        <th className="py-4 px-6 font-semibold text-center text-blue-600">Lembur</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {filteredUserSummaries.length > 0 ? (
                                    filteredUserSummaries.map((u, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 font-medium text-gray-900">
                                                <span>{u.name}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-blue-600">{u.hadir}</td>
                                            
                                            {roleTab === 'satpam' ? (
                                                <>
                                                    <td className="py-4 px-6 text-center font-bold text-amber-600">
                                                        {u.shift_siang || 0}
                                                    </td>
                                                    <td className="py-4 px-6 text-center font-bold text-indigo-600">
                                                        {u.shift_malam || 0}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-4 px-6 text-center font-bold text-orange-600">{u.sakit}</td>
                                                    <td className="py-4 px-6 text-center font-bold text-emerald-600">{u.izin}</td>
                                                    <td className="py-4 px-6 text-center font-bold text-red-600">{u.alpa}</td>
                                                    <td className="py-4 px-6 text-center font-bold text-rose-600">{u.terlambat || 0}</td>
                                                    <td className="py-4 px-6 text-center font-bold text-blue-600">{u.lembur || 0}</td>
                                                </>
                                            )}

                                            {roleTab === 'satpam' && (
                                                <>
                                                    <td className="py-4 px-6 text-center font-bold text-orange-600">{u.sakit}</td>
                                                    <td className="py-4 px-6 text-center font-bold text-emerald-600">{u.izin}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={roleTab === 'satpam' ? "6" : "7"} className="py-6 text-center text-gray-500">
                                            {roleTab === 'satpam' 
                                                ? 'Tidak ada data personel satpam yang cocok.' 
                                                : 'Tidak ada data karyawan yang cocok dengan pencarian.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-3">
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500"/> 
                            {roleTab === 'satpam' ? 'Rincian Kehadiran & Shift Satpam' : 'Rincian Kehadiran'}
                        </h3>
                        <ExportDropdown pdfRoute={route('absensi.rekap.export-pdf', { month: data.month, year: data.year, user_id: data.user_id })} trigger={
                            <button className="text-xs sm:text-sm font-semibold text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                <Download className="w-4 h-4"/> Export PDF
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
                                <div key={idx} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    {/* Top: Name, Date, Type Badge, and Actions */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-gray-900 text-sm">{item.user_name}</span>
                                                {item.is_satpam && (
                                                    <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Satpam</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                item.type === 'Hadir' ? 'bg-blue-600 text-white' :
                                                item.type === 'Sakit' ? 'bg-orange-500 text-white' : 
                                                item.type === 'Lembur' ? 'bg-indigo-600 text-white' : 
                                                item.type === 'Alpa' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                                            }`}>
                                                {item.type}
                                            </span>
                                            {(isSuperAdmin || isAdmin) && (
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => handleEditAbsensi(item)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                        title="Edit Keterangan"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {!item.id.startsWith('alpa_') && (
                                                        <button 
                                                            onClick={() => handleDeleteAbsensi(item.id)}
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                            title="Hapus Data"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shift Tag if available */}
                                    {item.shift && (
                                        <div className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                                            Shift: {item.shift}
                                        </div>
                                    )}

                                    {/* Check In & Check Out 2-column Box */}
                                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        {/* Masuk */}
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                                {roleTab === 'satpam' ? 'Masuk Shift' : 'Jam Masuk'}
                                            </span>
                                            <div className="font-bold text-gray-800 text-sm">
                                                {item.check_in || '-'}
                                            </div>
                                            {!item.is_satpam && item.is_late && (
                                                <span className="inline-block text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold">
                                                    Terlambat
                                                </span>
                                            )}
                                            {item.check_in_photo && (
                                                <button 
                                                    onClick={() => handleShowPhoto(item.check_in_photo, 'Masuk')} 
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium pt-0.5"
                                                >
                                                    <Camera className="w-3.5 h-3.5"/> Foto Masuk
                                                </button>
                                            )}
                                        </div>

                                        {/* Keluar */}
                                        <div className="space-y-1 border-l border-gray-200 pl-2.5">
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                                {roleTab === 'satpam' ? 'Keluar Shift' : 'Jam Keluar'}
                                            </span>
                                            <div className="font-bold text-gray-800 text-sm">
                                                {item.check_out || '-'}
                                            </div>
                                            {!item.is_satpam && item.is_lembur && (
                                                <div className="mt-0.5">
                                                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                                        item.overtime_status === 'Disetujui'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : item.overtime_status === 'Ditolak'
                                                            ? 'bg-rose-100 text-rose-700 line-through'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        Lembur {item.is_saturday ? `(Sabtu >${(payrollSettings?.jam_mulai_lembur_sabtu || '14:00').slice(0, 5)})` : `(>${(payrollSettings?.jam_mulai_lembur_weekday || '20:00').slice(0, 5)})`}
                                                        {item.overtime_status === 'Disetujui' ? ' • ACC' : item.overtime_status === 'Ditolak' ? ' • Ditolak' : ' • Menunggu'}
                                                    </span>
                                                </div>
                                            )}
                                            {item.check_out_photo && (
                                                <button 
                                                    onClick={() => handleShowPhoto(item.check_out_photo, 'Keluar')} 
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium pt-0.5"
                                                >
                                                    <Camera className="w-3.5 h-3.5"/> Foto Keluar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status, Attachment & Notes */}
                                    <div className="space-y-2 pt-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                item.status === 'Selesai' || item.status === 'Disetujui' ? 'text-emerald-700 bg-emerald-50' :
                                                item.status === 'Menunggu' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
                                            }`}>
                                                Status: {item.status}
                                            </span>

                                            {item.attachment && (
                                                <button 
                                                    onClick={() => handleShowPhoto(item.attachment, 'Lampiran Pengajuan')} 
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
                                                    title="Lihat lampiran pengajuan"
                                                >
                                                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                                                    Lihat Lampiran
                                                </button>
                                            )}
                                        </div>

                                        {/* Keterangan Masuk */}
                                        {item.check_in_notes && (
                                            <div className="text-xs text-blue-900 bg-blue-50/80 border border-blue-200/60 rounded-lg px-2.5 py-1 break-words">
                                                <span className="font-bold text-blue-950">Masuk:</span> {item.check_in_notes}
                                            </div>
                                        )}

                                        {/* Alasan Lembur Khusus Jika Lembur */}
                                        {!item.is_satpam && item.is_lembur && (
                                            <div className="text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded-lg p-2.5 break-words space-y-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-blue-950 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-blue-600 inline" /> Alasan Lembur:
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                        item.overtime_status === 'Disetujui'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : item.overtime_status === 'Ditolak'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {item.overtime_status === 'Disetujui' ? 'Lembur Ter-ACC' : item.overtime_status === 'Ditolak' ? 'Ditolak' : 'Menunggu ACC'}
                                                    </span>
                                                </div>
                                                <div className="text-gray-800">
                                                    {item.check_out_notes || item.notes || (
                                                        <span className="text-amber-600 italic">Belum ada alasan lembur</span>
                                                    )}
                                                </div>
                                                {(isAdmin || isSuperAdmin) && !item.id.toString().startsWith('req_') && !item.id.toString().startsWith('alpa_') && (
                                                    <div className="flex items-center gap-2 pt-1.5 border-t border-blue-200/60">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOvertimeStatus(item, 'Disetujui')}
                                                            disabled={item.overtime_status === 'Disetujui'}
                                                            className={`flex-1 py-1 rounded text-xs font-bold transition-colors text-center ${
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
                                                            className={`flex-1 py-1 rounded text-xs font-bold transition-colors text-center ${
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
                                            <div className="text-xs text-emerald-900 bg-emerald-50/80 border border-emerald-200/60 rounded-lg px-2.5 py-1 break-words">
                                                <span className="font-bold text-emerald-950">Pulang:</span> {item.check_out_notes}
                                            </div>
                                        )}

                                        {/* Fallback Legacy Notes */}
                                        {!item.is_lembur && !item.check_in_notes && !item.check_out_notes && item.notes && (
                                            <div className="text-xs text-gray-500 italic break-words">
                                                "{item.notes}"
                                            </div>
                                        )}

                                        {/* Action Row for Edit Notes / Approve Requests */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                            {(isSuperAdmin || isAdmin) && !item.id.startsWith('req_') && (
                                                <button 
                                                    onClick={() => handleEditAbsensi(item)} 
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
                                                    title="Edit Keterangan Masuk & Pulang"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    {item.check_in_notes || item.check_out_notes || item.notes ? 'Ubah Keterangan' : 'Tambah Keterangan'}
                                                </button>
                                            )}

                                            {(isAdmin || isSuperAdmin) && item.id.startsWith('req_') && item.status === 'Menunggu' && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                                    >
                                                        ACC
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                                                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table for Attendance Records */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold">Karyawan</th>
                                    <th className="py-4 px-6 font-semibold">Tanggal / Periode</th>
                                    <th className="py-4 px-6 font-semibold">Tipe Absen</th>
                                    <th className="py-4 px-6 font-semibold text-center">Shift</th>
                                    <th className="py-4 px-6 font-semibold text-center">
                                        {roleTab === 'satpam' ? 'Masuk Shift' : 'Jam Masuk'}
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-center">
                                        {roleTab === 'satpam' ? 'Keluar Shift' : 'Jam Keluar'}
                                    </th>
                                    <th className="py-4 px-6 font-semibold">Status & Catatan</th>
                                    {(isSuperAdmin || isAdmin) && <th className="py-4 px-6 font-semibold text-right">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {paginatedList.length === 0 ? (
                                    <tr>
                                        <td colSpan={(isSuperAdmin || isAdmin) ? "8" : "7"} className="py-8 text-center text-gray-500">
                                            Tidak ada riwayat absensi yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{item.user_name}</span>
                                                    {item.is_satpam && (
                                                        <span className="text-xs text-gray-500 font-normal">
                                                            (Satpam)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">{item.date}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.type === 'Hadir' ? 'bg-blue-50 text-blue-600' :
                                                    item.type === 'Sakit' ? 'bg-orange-50 text-orange-600' : 
                                                    item.type === 'Lembur' ? 'bg-blue-50 text-blue-600' : 
                                                    item.type === 'Alpa' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
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
                                                    {!item.is_satpam && item.is_late && (
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
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap ${
                                                            item.overtime_status === 'Disetujui'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : item.overtime_status === 'Ditolak'
                                                                ? 'bg-rose-100 text-rose-700 line-through'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            Lembur {item.is_saturday ? `(Sabtu >${(payrollSettings?.jam_mulai_lembur_sabtu || '14:00').slice(0, 5)})` : `(>${(payrollSettings?.jam_mulai_lembur_weekday || '20:00').slice(0, 5)})`}
                                                            {item.overtime_status === 'Disetujui' ? ' • Ter-ACC' : item.overtime_status === 'Ditolak' ? ' • Ditolak' : ' • Menunggu'}
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
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        item.status === 'Selesai' || item.status === 'Disetujui' ? 'text-emerald-600 bg-emerald-50' :
                                                        item.status === 'Menunggu' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'
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
                                                                    <Clock className="w-3 h-3 text-blue-600 inline" /> Alasan Lembur:
                                                                </span>
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                                    item.overtime_status === 'Disetujui'
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : item.overtime_status === 'Ditolak'
                                                                        ? 'bg-rose-100 text-rose-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                    {item.overtime_status === 'Disetujui' ? 'Lembur Ter-ACC' : item.overtime_status === 'Ditolak' ? 'Ditolak' : 'Menunggu ACC'}
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
                        <div className="flex justify-center py-4 sm:py-6 px-3 border-t border-gray-100 bg-white">
                            <nav className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    &laquo; Prev
                                </button>
                                
                                <div className="flex flex-wrap items-center gap-1">
                                    {getPageNumbers().map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-colors ${
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
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next &raquo;
                                </button>
                            </nav>
                        </div>
                    )}
                </div>

                {showSettingsModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowSettingsModal(false);
                        }}
                    >
                        <div
                            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-blue-600" />
                                    Pengaturan Jam Absensi & Lembur
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Absen Keluar Otomatis (Senin-Jumat)
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_pulang_otomatis}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_pulang_otomatis: e.target.value })}
                                            required
                                            className="w-full rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
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
                                            className="w-full rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 -mt-2">
                                    Jam pulang otomatis jika karyawan belum absen keluar di hari sebelumnya (Senin-Jumat default 17:00, Sabtu default 13:00).
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Lembur Senin-Jumat Dimulai
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_mulai_lembur_weekday}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_mulai_lembur_weekday: e.target.value })}
                                            required
                                            className="w-full rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
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
                                            className="w-full rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Batas Keterlambatan Normal
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.jam_batas_terlambat}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, jam_batas_terlambat: e.target.value })}
                                            required
                                            className="w-full rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
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
                                                className="w-full rounded-xl border-gray-300 text-sm pr-12 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                                                Jam
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                                    Maksimal keterlambatan <b>{settingsForm.toleransi_terlambat_lembur_jam} jam</b> di hari esoknya bagi karyawan yang lembur mulai jam <b>{settingsForm.jam_mulai_lembur_weekday}</b> sampai selesai (dan lemburnya sudah Ter-ACC).
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowSettingsModal(false)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingSettings}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {savingSettings ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
