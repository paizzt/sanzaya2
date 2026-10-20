import React, { useState, useEffect } from 'react';
import ExportDropdown from '@/Components/ExportDropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Calendar, Users, ClipboardCheck, Clock, CheckCircle2, AlertCircle, FileText, Search, Download, Camera, Trash2, Edit, Shield, Sun, Moon, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomSelect from '@/Components/CustomSelect';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Rekap({ auth, recapList, summary, userSummaries, filters, users, isAdmin }) {
    const isSuperAdmin = auth?.user?.roles?.some(r => r.name.toLowerCase() === 'superadmin') || false;
    // Setup Filter Form
    const { data, setData } = useForm({
        month: filters.month.toString(),
        year: filters.year.toString(),
        user_id: filters.user_id ? filters.user_id.toString() : 'all'
    });

    const [searchQuery, setSearchQuery] = useState('');

    const handleFilter = () => {
        router.get(route('absensi.rekap'), data, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleShowPhoto = (url, type) => {
        if (!url) {
            Swal.fire('Tidak ada foto', `Foto ${type} tidak tersedia.`, 'info');
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
                    <textarea id="swal-input-notes-in" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" rows="2" placeholder="Catatan/keterangan saat masuk...">${item.check_in_notes || ''}</textarea>
                </div>
                <div class="text-left mb-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Keterangan Pulang</label>
                    <textarea id="swal-input-notes-out" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" rows="2" placeholder="Catatan/keterangan saat pulang...">${item.check_out_notes || ''}</textarea>
                </div>
                ${item.is_satpam ? `
                <div class="text-left">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Shift (Khusus Satpam)</label>
                    <select id="swal-input-shift" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                        <option value="Shift Siang" ${item.shift === 'Shift Siang' ? 'selected' : ''}>☀️ Shift Siang</option>
                        <option value="Shift Malam" ${item.shift === 'Shift Malam' ? 'selected' : ''}>🌙 Shift Malam</option>
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
                    check_in_notes: document.getElementById('swal-input-notes-in').value || null,
                    check_out_notes: document.getElementById('swal-input-notes-out').value || null,
                    shift: shiftEl ? shiftEl.value : (item.shift || null)
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('absensi.update', realId), result.value, {
                    preserveScroll: true,
                    onSuccess: (page) => { 
                        const msg = page.props.flash?.success || 'Keterangan absensi berhasil diperbarui.';
                        Swal.fire('Tersimpan!', msg, 'success'); 
                    },
                    onError: () => { Swal.fire('Error!', 'Gagal memperbarui keterangan absensi.', 'error'); }
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
        acc.alpa += u.alpa || 0;
        acc.shift_siang += u.shift_siang || 0;
        acc.shift_malam += u.shift_malam || 0;
        return acc;
    }, { hadir: 0, sakit: 0, izin: 0, alpa: 0, shift_siang: 0, shift_malam: 0 }) || { hadir: 0, sakit: 0, izin: 0, alpa: 0, shift_siang: 0, shift_malam: 0 };

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
                                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white shadow-md shadow-amber-500/20'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            }`}
                        >
                            <Shield className="w-4 h-4" /> Satpam (Shift Siang / Malam)
                        </button>
                    </div>

                    {roleTab === 'satpam' && (
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Mode Khusus: Shift Siang (☀️) & Malam (🌙)</span>
                        </div>
                    )}
                </div>

                {/* Filter & Search Section */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col lg:flex-row items-end gap-4">
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
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Hadir' ? 'all' : 'Hadir')}
                            className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Hadir' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-100'}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Hadir Satpam</p>
                                <h4 className="text-xl font-black text-gray-800">{summary.satpam_hadir ?? satpamTotals.hadir}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Shift Siang' ? 'all' : 'Shift Siang')}
                            className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Shift Siang' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-gray-100'}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <Sun className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-amber-600 font-semibold">Shift Siang</p>
                                <h4 className="text-xl font-black text-amber-700">{summary.shift_siang ?? satpamTotals.shift_siang}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Shift Malam' ? 'all' : 'Shift Malam')}
                            className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Shift Malam' ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-gray-100'}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                                <Moon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-600 font-semibold">Shift Malam</p>
                                <h4 className="text-xl font-black text-indigo-800">{summary.shift_malam ?? satpamTotals.shift_malam}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Sakit' ? 'all' : 'Sakit')}
                            className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Sakit' ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-100'}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Sakit</p>
                                <h4 className="text-xl font-black text-gray-800">{satpamTotals.sakit}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Izin' ? 'all' : 'Izin')}
                            className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Izin' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-100'}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Izin</p>
                                <h4 className="text-xl font-black text-gray-800">{satpamTotals.izin}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Alpa' ? 'all' : 'Alpa')}
                            className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Alpa' ? 'ring-2 ring-red-500 border-red-500' : 'border-gray-100'}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Alpa</p>
                                <h4 className="text-xl font-black text-gray-800">{satpamTotals.alpa}</h4>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Hadir' ? 'all' : 'Hadir')}
                            className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Hadir' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Hadir</p>
                                <h4 className="text-2xl font-black text-gray-800">{summary.hadir}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Sakit' ? 'all' : 'Sakit')}
                            className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Sakit' ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-100'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Sakit</p>
                                <h4 className="text-2xl font-black text-gray-800">{summary.sakit}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Izin' ? 'all' : 'Izin')}
                            className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Izin' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-100'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Izin</p>
                                <h4 className="text-2xl font-black text-gray-800">{summary.izin}</h4>
                            </div>
                        </div>
                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Alpa' ? 'all' : 'Alpa')}
                            className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Alpa' ? 'ring-2 ring-red-500 border-red-500' : 'border-gray-100'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Alpa</p>
                                <h4 className="text-2xl font-black text-gray-800">{summary.alpa}</h4>
                            </div>
                        </div>

                        <div 
                            onClick={() => setStatusFilter(statusFilter === 'Terlambat' ? 'all' : 'Terlambat')}
                            className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Terlambat' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Terlambat</p>
                                <h4 className="text-2xl font-black text-gray-800">{summary.terlambat || 0}</h4>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Summaries Table */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            {roleTab === 'satpam' ? (
                                <>
                                    <Shield className="w-5 h-5 text-amber-500"/> Ringkasan Kehadiran & Shift Personel Satpam
                                </>
                            ) : (
                                <>
                                    <Users className="w-5 h-5 text-blue-500"/> Ringkasan Kehadiran per Karyawan
                                </>
                            )}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {roleTab === 'satpam' ? (
                                    <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="py-4 px-6 font-semibold">Nama Satpam</th>
                                        <th className="py-4 px-6 font-semibold text-center text-blue-600">Total Hadir</th>
                                        <th className="py-4 px-6 font-semibold text-center text-amber-600">☀️ Shift Siang</th>
                                        <th className="py-4 px-6 font-semibold text-center text-indigo-600">🌙 Shift Malam</th>
                                        <th className="py-4 px-6 font-semibold text-center text-orange-600">Sakit</th>
                                        <th className="py-4 px-6 font-semibold text-center text-emerald-600">Izin</th>
                                        <th className="py-4 px-6 font-semibold text-center text-red-600">Alpa</th>
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
                                            <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-2">
                                                {u.is_satpam && (
                                                    <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600" title="Satpam">
                                                        <Shield className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                                <span>{u.name}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-blue-600">{u.hadir}</td>
                                            
                                            {roleTab === 'satpam' ? (
                                                <>
                                                    <td className="py-4 px-6 text-center font-bold text-amber-600">
                                                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                                                            <Sun className="w-3 h-3 text-amber-500" /> {u.shift_siang || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center font-bold text-indigo-600">
                                                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-indigo-200">
                                                            <Moon className="w-3 h-3 text-indigo-500" /> {u.shift_malam || 0}
                                                        </span>
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
                                                    <td className="py-4 px-6 text-center font-bold text-red-600">{u.alpa}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={roleTab === 'satpam' ? "7" : "7"} className="py-6 text-center text-gray-500">
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
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500"/> 
                            {roleTab === 'satpam' ? 'Rincian Kehadiran & Shift Satpam' : 'Rincian Kehadiran'}
                        </h3>
                        <ExportDropdown pdfRoute={route('absensi.rekap.export-pdf', { month: data.month, year: data.year, user_id: data.user_id })} trigger={
                            <button className="text-sm font-semibold text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                <Download className="w-4 h-4"/> Export PDF
                            </button>
                        } />
                    </div>
                    <div className="overflow-x-auto">
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
                                    {isSuperAdmin && <th className="py-4 px-6 font-semibold text-right">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {paginatedList.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? "8" : "7"} className="py-8 text-center text-gray-500">
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
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            SATPAM
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
                                                {item.shift === 'Shift Siang' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Sun className="w-3.5 h-3.5 text-amber-500" /> Shift Siang
                                                    </span>
                                                ) : item.shift === 'Shift Malam' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        <Moon className="w-3.5 h-3.5 text-indigo-500" /> Shift Malam
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center font-medium">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span>{item.check_in || '-'}</span>
                                                    {!item.is_satpam && item.is_late && (
                                                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap">Terlambat</span>
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
                                                    {item.is_cross_day && (
                                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">+1 Hari</span>
                                                    )}
                                                    {!item.is_satpam && item.is_lembur && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap">Lembur</span>
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

                                                    {/* Keterangan Masuk */}
                                                    {item.check_in_notes && (
                                                        <div className="text-[11px] text-blue-800 bg-blue-50/80 border border-blue-200/60 rounded px-2 py-0.5 max-w-[240px] break-words">
                                                            <span className="font-bold text-blue-900">Masuk:</span> {item.check_in_notes}
                                                        </div>
                                                    )}

                                                    {/* Keterangan Pulang */}
                                                    {item.check_out_notes && (
                                                        <div className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 rounded px-2 py-0.5 max-w-[240px] break-words">
                                                            <span className="font-bold text-emerald-900">Pulang:</span> {item.check_out_notes}
                                                        </div>
                                                    )}

                                                    {/* Fallback Legacy Notes */}
                                                    {!item.check_in_notes && !item.check_out_notes && item.notes && (
                                                        <div className="text-xs text-gray-500 italic max-w-[220px] break-words mt-0.5">
                                                            "{item.notes}"
                                                        </div>
                                                    )}

                                                    {isSuperAdmin && !item.id.startsWith('req_') && !item.id.startsWith('alpa_') && (
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
                                            {isSuperAdmin && (
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button 
                                                            onClick={() => handleEditAbsensi(item)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Keterangan"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAbsensi(item.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Data"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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
                        <div className="flex justify-center py-6 border-t border-gray-100 bg-white">
                            <nav className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    &laquo; Previous
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
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
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next &raquo;
                                </button>
                            </nav>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
