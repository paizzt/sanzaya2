import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { History, Search, ArrowRight, Eye, MonitorSmartphone, Globe } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Modal from '@/Components/Modal';

dayjs.locale('id');

export default function ActivityLog({ auth, logs, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('system.activity-logs'), { search }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'Created': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
            case 'Updated': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'Deleted': return 'text-rose-700 bg-rose-50 border-rose-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'Created': return 'Membuat';
            case 'Updated': return 'Mengubah';
            case 'Deleted': return 'Menghapus';
            default: return action;
        }
    };

    const openDetails = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    
    const renderJsonData = (jsonString) => {
        if (!jsonString) return <span className="text-gray-400 italic">Tidak ada data</span>;
        try {
            const data = JSON.parse(jsonString);
            
            // Kamus terjemahan field ke bahasa manusia
            const kamus = {
                'name': 'Nama',
                'email': 'Alamat Email',
                'role': 'Hak Akses',
                'password': 'Kata Sandi',
                'remember_token': 'Sesi Login',
                'created_at': 'Dibuat Pada',
                'updated_at': 'Diperbarui Pada',
                'email_verified_at': 'Email Diverifikasi Pada',
                'phone': 'Nomor Telepon',
                'address': 'Alamat',
                'status': 'Status',
                'description': 'Deskripsi',
                'title': 'Judul',
                'date': 'Tanggal',
                'amount': 'Nominal / Jumlah'
            };

            // Filter field sistem yang mungkin membingungkan atau ubah bahasanya
            const filteredData = Object.entries(data).filter(([key, value]) => {
                // Abaikan field ini agar tidak muncul
                if (['id', 'updated_at'].includes(key)) return false;
                return true;
            });

            if (filteredData.length === 0) return <span className="text-gray-400 italic">Tidak ada perubahan data penting</span>;
            
            return (
                <div className="space-y-3">
                    {filteredData.map(([key, value]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:gap-4 border-b border-gray-100/80 pb-3 last:border-0 last:pb-0">
                            <div className="sm:w-1/3 font-semibold text-gray-700">
                                {kamus[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="sm:w-2/3 text-gray-800 bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-100">
                                {key === 'remember_token' || key === 'password' ? (
                                    <span className="text-gray-400 italic text-xs">(Disembunyikan demi keamanan)</span>
                                ) : value === null ? (
                                    <span className="text-gray-400 italic">Kosong</span>
                                ) : (
                                    String(value)
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return <span className="text-red-500">Format data tidak valid</span>;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Riwayat Perubahan (Activity Log)</h2>}
        >
            <Head title="Riwayat Perubahan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        {/* Header & Filter */}
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <History className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Jejak Audit</h3>
                                    <p className="text-sm text-gray-500">Merekam semua perubahan data dalam sistem</p>
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        type="text"
                                        placeholder="Cari user, modul, aksi..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 w-full md:w-64"
                                    />
                                </div>
                                <PrimaryButton type="submit">Cari</PrimaryButton>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 font-semibold">Waktu</th>
                                        <th className="py-4 px-6 font-semibold">Pengguna</th>
                                        <th className="py-4 px-6 font-semibold">Modul</th>
                                        <th className="py-4 px-6 font-semibold">Aksi</th>
                                        <th className="py-4 px-6 font-semibold text-center">Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">
                                                    {dayjs(log.created_at).format('DD MMM YYYY')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {dayjs(log.created_at).format('HH:mm:ss')}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{log.user?.name || 'Sistem'}</div>
                                                <div className="text-xs text-gray-500">{log.ip_address}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getActionColor(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => openDetails(log)}
                                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-gray-500">
                                                Belum ada riwayat aktivitas ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Menampilkan {logs.from || 0} - {logs.to || 0} dari {logs.total} data
                            </span>
                            <div className="flex gap-1">
                                {logs.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                            link.active 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Detail Perubahan</h2>
                                <p className="text-sm text-gray-500">#{selectedLog?.id} • {selectedLog?.module}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Close</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Info Pelaku */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Dilakukan Oleh</div>
                                <div className="font-medium text-gray-900">{selectedLog?.user?.name || 'Sistem'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Waktu</div>
                                <div className="font-medium text-gray-900">{dayjs(selectedLog?.created_at).format('DD MMM YYYY, HH:mm:ss')}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-600 font-mono">{selectedLog?.ip_address}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MonitorSmartphone className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-600 truncate" title={selectedLog?.user_agent}>{selectedLog?.user_agent}</span>
                            </div>
                        </div>

                        {/* Komparasi Data */}
                        {selectedLog?.action === 'Updated' ? (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="font-semibold text-rose-600 mb-3 flex items-center gap-2">
                                        Data Lama
                                    </div>
                                    <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-sm overflow-x-auto">
                                        {renderJsonData(selectedLog?.old_values)}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                                        Data Baru
                                    </div>
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm overflow-x-auto">
                                        {renderJsonData(selectedLog?.new_values)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className={`font-semibold mb-3 ${selectedLog?.action === 'Deleted' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {selectedLog?.action === 'Deleted' ? 'Data Dihapus' : 'Data Ditambahkan'}
                                </div>
                                <div className={`p-4 rounded-xl border text-sm overflow-x-auto ${selectedLog?.action === 'Deleted' ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                                    {renderJsonData(selectedLog?.action === 'Deleted' ? selectedLog?.old_values : selectedLog?.new_values)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
