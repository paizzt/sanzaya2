import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { 
    FileText, 
    Send, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    UploadCloud, 
    Paperclip, 
    ExternalLink, 
    Download, 
    X, 
    Trash2, 
    Image as ImageIcon,
    Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomSelect from '@/Components/CustomSelect';
import CustomDatePicker from '@/Components/CustomDatePicker';
import Modal from '@/Components/Modal';

export default function Pengajuan({ requests, canApprove }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'Sakit',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null,
    });

    const { auth, flash } = usePage().props;
    const currentUser = auth.user;

    // Modal state for previewing attachments
    const [previewModal, setPreviewModal] = useState({
        isOpen: false,
        url: '',
        type: '', // 'pdf' or 'image'
        title: '',
        fileName: '',
    });

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-2xl' }
            });
            reset();
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('absensi.pengajuan.store'), {
            preserveScroll: true,
        });
    };

    const handleUpdateStatus = (id, status) => {
        router.put(route('absensi.pengajuan.status', id), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Status pengajuan berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    customClass: { popup: 'rounded-2xl' }
                });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Pengajuan?',
            text: 'Data pengajuan dan lampirannya akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('absensi.pengajuan.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Pengajuan berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#3b82f6',
                            customClass: { popup: 'rounded-2xl' }
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan saat menghapus data.',
                            icon: 'error',
                            confirmButtonColor: '#3b82f6',
                            customClass: { popup: 'rounded-2xl' }
                        });
                    }
                });
            }
        });
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Menunggu': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'Disetujui': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'Ditolak': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const getAttachmentUrl = (req) => {
        if (req.attachment_url) return req.attachment_url;
        if (!req.attachment) return null;
        if (req.attachment.startsWith('http://') || req.attachment.startsWith('https://')) {
            return req.attachment;
        }
        return `/storage/${req.attachment}`;
    };

    const isPdf = (urlOrPath) => {
        if (!urlOrPath) return false;
        const clean = urlOrPath.split('?')[0].toLowerCase();
        return clean.endsWith('.pdf');
    };

    const handleOpenPreview = (req) => {
        const url = getAttachmentUrl(req);
        if (!url) return;
        const isPdfFile = isPdf(req.attachment || url);
        setPreviewModal({
            isOpen: true,
            url: url,
            type: isPdfFile ? 'pdf' : 'image',
            title: `Lampiran ${req.type} - ${req.user?.name || 'User'} (${req.start_date})`,
            fileName: (req.attachment || 'lampiran').split('/').pop(),
        });
    };

    const handleClosePreview = () => {
        setPreviewModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <AuthenticatedLayout
            user={currentUser}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengajuan Izin / Sakit</h2>}
        >
            <Head title="Pengajuan Izin/Sakit" />

            <div className="pb-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                                <FileText className="text-blue-600 w-5 h-5" />
                                Buat Pengajuan Baru
                            </h3>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel value="Jenis Pengajuan" />
                                    <CustomSelect
                                        value={data.type}
                                        onChange={(val) => setData('type', val)}
                                        options={[
                                            { value: 'Sakit', label: 'Sakit' },
                                            { value: 'Izin', label: 'Izin' },
                                            { value: 'Izin Khusus', label: 'Izin Khusus' },
                                            { value: 'Cuti', label: 'Cuti' }
                                        ]}
                                    />
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Mulai Tanggal" />
                                        <CustomDatePicker 
                                            value={data.start_date}
                                            onChange={(val) => setData('start_date', val)}
                                        />
                                        <InputError message={errors.start_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Sampai Tanggal" />
                                        <CustomDatePicker 
                                            value={data.end_date}
                                            onChange={(val) => setData('end_date', val)}
                                        />
                                        <InputError message={errors.end_date} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Alasan / Keterangan" />
                                    <textarea 
                                        className="mt-1 block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Tuliskan keterangan detail pengajuan..."
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.reason} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Lampiran (Surat Dokter, Formulir Cuti, dll)" />
                                    <div className="mt-1 flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="mb-1 text-sm text-gray-600"><span className="font-semibold text-blue-600">Klik untuk upload lampiran</span></p>
                                                <p className="text-xs text-gray-400">PNG, JPG, PDF (Maks 5MB)</p>
                                                {data.attachment && (
                                                    <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 truncate max-w-[220px]">
                                                        {data.attachment.name}
                                                    </p>
                                                )}
                                            </div>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept=".png,.jpg,.jpeg,.pdf"
                                                onChange={(e) => setData('attachment', e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                    <InputError message={errors.attachment} className="mt-2" />
                                </div>

                                <div className="pt-4 flex justify-center">
                                    <PrimaryButton disabled={processing} className="w-full justify-center">
                                        <Send className="w-4 h-4 mr-2" />
                                        {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    Riwayat Pengajuan
                                </h3>
                                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    Total: {requests.length}
                                </span>
                            </div>
                            
                            {requests.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-medium text-sm">Belum ada riwayat pengajuan</p>
                                    <p className="text-xs text-gray-400 mt-1">Formulir yang Anda ajukan akan muncul di sini.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => {
                                        const attachmentUrl = getAttachmentUrl(req);
                                        const hasAttachment = Boolean(req.attachment);
                                        const isAttachmentPdf = isPdf(req.attachment || attachmentUrl);
                                        const isOwner = currentUser && req.user_id === currentUser.id;
                                        const canDelete = canApprove || (isOwner && req.status === 'Menunggu');

                                        return (
                                            <div 
                                                key={req.id} 
                                                className="p-4 md:p-5 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                                                            req.type === 'Sakit' ? 'bg-red-50 text-red-600 border border-red-200' : 
                                                            req.type === 'Cuti' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                                            'bg-blue-50 text-blue-600 border border-blue-200'
                                                        }`}>
                                                            {req.type}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            {req.start_date} {req.start_date !== req.end_date ? ` s/d ${req.end_date}` : ''}
                                                        </span>
                                                        {canApprove && (
                                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                {req.user?.name || 'User'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line break-words">
                                                        {req.reason}
                                                    </p>

                                                    {/* Lampiran Section */}
                                                    {hasAttachment ? (
                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenPreview(req)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-semibold transition-all hover:shadow-sm"
                                                                title="Pratinjau lampiran"
                                                            >
                                                                {isAttachmentPdf ? (
                                                                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                                                                ) : (
                                                                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                                                                )}
                                                                <span>Lihat Lampiran {isAttachmentPdf ? '(PDF)' : ''}</span>
                                                                <Eye className="w-3 h-3 opacity-60 ml-0.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-400 italic">
                                                            <Paperclip className="w-3 h-3 opacity-40" />
                                                            <span>Tidak ada lampiran</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                                                        {getStatusIcon(req.status)}
                                                        <span className={`text-xs font-bold ${
                                                            req.status === 'Menunggu' ? 'text-orange-600' : 
                                                            req.status === 'Disetujui' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {req.status}
                                                        </span>
                                                    </div>

                                                    {canApprove && req.status === 'Menunggu' && (
                                                        <div className="flex gap-1.5 mt-1">
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req.id, 'Disetujui')}
                                                                className="text-xs px-2.5 py-1 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 shadow-sm transition-colors"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req.id, 'Ditolak')}
                                                                className="text-xs px-2.5 py-1 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 shadow-sm transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}

                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(req.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                                            title="Hapus Pengajuan"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal Preview Lampiran */}
            <Modal show={previewModal.isOpen} onClose={handleClosePreview} maxWidth="3xl">
                <div className="p-6">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                previewModal.type === 'pdf' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                                {previewModal.type === 'pdf' ? (
                                    <FileText className="w-5 h-5 text-rose-600" />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-gray-900 leading-tight">
                                    {previewModal.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">
                                    {previewModal.fileName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClosePreview}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-2 border border-gray-200/80 flex items-center justify-center min-h-[320px] max-h-[70vh] overflow-auto">
                        {previewModal.type === 'pdf' ? (
                            <iframe
                                src={previewModal.url}
                                className="w-full h-[65vh] rounded-xl bg-white border border-gray-200"
                                title={previewModal.title}
                            />
                        ) : (
                            <img
                                src={previewModal.url}
                                alt={previewModal.title}
                                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-sm bg-white"
                            />
                        )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                            Sistem Sanzaya &bull; Dokumen Lampiran
                        </span>
                        <div className="flex items-center gap-2">
                            <a
                                href={previewModal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Buka di Tab Baru
                            </a>
                            <a
                                href={previewModal.url}
                                download
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Unduh
                            </a>
                            <button
                                onClick={handleClosePreview}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
