import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Modal from '@/Components/Modal';
import dayjs from 'dayjs';
import {
    MessageSquare,
    Download,
    FileText,
    Calendar,
    Clock,
    X,
    User,
    UserX,
    Send,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
} from 'lucide-react';
import 'dayjs/locale/id';
import Swal from 'sweetalert2';

dayjs.locale('id');

const getStatusSelectClass = (status) => {
    if (status === 'selesai') {
        return 'bg-emerald-50/70 text-emerald-800 border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200';
    }
    if (status === 'di proses') {
        return 'bg-amber-50/70 text-amber-800 border-amber-400 focus:border-amber-500 focus:ring-amber-200';
    }
    return 'bg-white text-gray-800 border-gray-300 focus:border-sky-500 focus:ring-sky-200';
};

export default function Index({ auth, reports }) {
    const reportList = reports?.data || [];
    const [photoModal, setPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [chatModal, setChatModal] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const messagesEndRef = useRef(null);

    const {
        data: chatData,
        setData: setChatData,
        post: postChat,
        processing: chatProcessing,
        errors: chatErrors,
        reset: chatReset,
        clearErrors: clearChatErrors,
    } = useForm({
        message: '',
    });

    const selectedReport = selectedReportId
        ? reportList.find((r) => r.id === selectedReportId) || null
        : null;

    useEffect(() => {
        if (chatModal && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatModal, selectedReport?.messages?.length]);

    const openPhoto = (reportId) => {
        setSelectedPhoto(route('wbs-reports.download', reportId));
        setPhotoModal(true);
    };

    const openChat = (report) => {
        clearChatErrors();
        setSelectedReportId(report.id);
        setChatModal(true);
    };

    const closeChat = () => {
        setChatModal(false);
        clearChatErrors();
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!selectedReport || !chatData.message.trim()) return;
        postChat(route('wbs-reports.messages.store', selectedReport.id), {
            preserveScroll: true,
            onSuccess: () => {
                chatReset();
            },
        });
    };

    const updateStatus = (id, newStatus) => {
        setUpdatingStatusId(id);
        router.post(
            route('wbs-reports.status', id),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Status berhasil diperbarui',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                },
                onError: () => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'error',
                        title: 'Gagal memperbarui status',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                },
                onFinish: () => {
                    setUpdatingStatusId(null);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-lg sm:text-xl text-gray-800 leading-tight">
                    Laporan WBS (Whistleblowing System)
                </h2>
            }
        >
            <Head title="Laporan WBS" />

            <div className="py-2 sm:py-3">
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                    {/* Card Header */}
                    <div className="p-4 sm:p-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="p-2.5 sm:p-3 bg-sky-100 text-sky-700 rounded-xl shrink-0">
                                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                                    Daftar Laporan Masuk
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                    Kumpulan laporan dari Whistleblowing System.
                                </p>
                            </div>
                        </div>
                        {typeof reports?.total === 'number' && (
                            <div className="self-start sm:self-auto shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold">
                                Total: {reports.total} laporan
                            </div>
                        )}
                    </div>

                    {/* Mobile & Tablet / Small-Laptop Card Layout (< xl) */}
                    <div className="xl:hidden">
                        {reportList.length > 0 ? (
                            <div className="p-3.5 sm:p-5 bg-slate-50/60 grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                                {reportList.map((report) => {
                                    const messageCount = report.messages?.length || 0;
                                    const isUpdating = updatingStatusId === report.id;

                                    return (
                                        <article
                                            key={report.id}
                                            className="bg-white rounded-xl border border-gray-200/80 p-4 flex flex-col justify-between gap-3.5 shadow-sm min-w-0"
                                        >
                                            <div className="space-y-3 min-w-0">
                                                {/* Meta Row: Reporter & Timestamp */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                                                    {report.is_anonymous ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                                                            <UserX className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Anonim</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/70 text-xs font-semibold max-w-full min-w-0">
                                                            <User className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">
                                                                {report.reporter_name || 'Dengan Identitas'}
                                                            </span>
                                                        </span>
                                                    )}

                                                    <div className="flex items-center gap-2.5 text-xs text-gray-600 shrink-0">
                                                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                            {dayjs(report.created_at).format('DD MMM YYYY')}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                                                            {dayjs(report.created_at).format('HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Report Description */}
                                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                                    {report.description}
                                                </p>

                                                {/* Attachment */}
                                                <div>
                                                    {report.file_path ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openPhoto(report.id)}
                                                            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 active:bg-sky-200 font-semibold text-sm rounded-xl transition-colors border border-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                                        >
                                                            <Download className="w-4 h-4 shrink-0" />
                                                            <span>Lihat Foto</span>
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs border border-gray-100">
                                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Tidak ada foto</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div
                                                className={`pt-3 border-t border-gray-100 grid gap-2.5 ${
                                                    report.user_id
                                                        ? 'grid-cols-1 min-[400px]:grid-cols-2'
                                                        : 'grid-cols-1'
                                                }`}
                                            >
                                                <select
                                                    aria-label="Status laporan"
                                                    value={report.status || 'belum proses'}
                                                    disabled={isUpdating}
                                                    onChange={(e) => updateStatus(report.id, e.target.value)}
                                                    className={`min-h-[44px] w-full text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 px-3 py-2 cursor-pointer transition-colors disabled:opacity-60 ${getStatusSelectClass(
                                                        report.status
                                                    )}`}
                                                >
                                                    <option className="bg-white text-gray-900" value="belum proses">
                                                        Belum Proses
                                                    </option>
                                                    <option className="bg-white text-gray-900" value="di proses">
                                                        Di Proses
                                                    </option>
                                                    <option className="bg-white text-gray-900" value="selesai">
                                                        Selesai
                                                    </option>
                                                </select>

                                                {report.user_id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openChat(report)}
                                                        className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-sky-700 text-white hover:bg-sky-800 active:bg-sky-900 font-semibold rounded-xl transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                                                    >
                                                        <MessageSquare className="w-4 h-4 shrink-0" />
                                                        <span>Live Chat</span>
                                                        {messageCount > 0 && (
                                                            <span className="bg-white text-sky-800 font-bold px-1.5 py-0.5 rounded-full text-xs leading-none">
                                                                {messageCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-4 py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <MessageSquare className="w-11 h-11 text-gray-300 mb-3" />
                                    <p className="text-sm font-medium text-gray-600">
                                        Belum ada laporan WBS yang masuk.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table Layout (xl+) */}
                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 table-fixed">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="w-[152px] px-5 py-4 font-bold text-gray-900">
                                        Tanggal Lapor
                                    </th>
                                    <th scope="col" className="w-[172px] px-5 py-4 font-bold text-gray-900">
                                        Pelapor
                                    </th>
                                    <th scope="col" className="px-5 py-4 font-bold text-gray-900">
                                        Isi Laporan
                                    </th>
                                    <th scope="col" className="w-[148px] px-5 py-4 font-bold text-gray-900 text-center">
                                        Lampiran Foto
                                    </th>
                                    <th scope="col" className="w-[184px] px-5 py-4 font-bold text-gray-900 text-center">
                                        Status &amp; Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportList.length > 0 ? (
                                    reportList.map((report) => {
                                        const messageCount = report.messages?.length || 0;
                                        const isUpdating = updatingStatusId === report.id;

                                        return (
                                            <tr
                                                key={report.id}
                                                className="bg-white hover:bg-sky-50/30 transition-colors"
                                            >
                                                <td className="px-5 py-4 align-top whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                            {dayjs(report.created_at).format('DD MMM YYYY')}
                                                        </span>
                                                        <span className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            {dayjs(report.created_at).format('HH:mm')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    {report.is_anonymous ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                                                            <UserX className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Anonim</span>
                                                        </span>
                                                    ) : (
                                                        <span
                                                            title={report.reporter_name || 'Dengan Identitas'}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/70 text-xs font-semibold max-w-full"
                                                        >
                                                            <User className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">
                                                                {report.reporter_name || 'Dengan Identitas'}
                                                            </span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                                        {report.description}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 align-top text-center">
                                                    {report.file_path ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openPhoto(report.id)}
                                                            className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs rounded-xl transition-colors border border-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                                        >
                                                            <Download className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Lihat Foto</span>
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs border border-gray-100">
                                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Tidak ada</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 align-top text-center">
                                                    <div className="flex flex-col gap-2 items-stretch">
                                                        <select
                                                            aria-label="Status laporan"
                                                            value={report.status || 'belum proses'}
                                                            disabled={isUpdating}
                                                            onChange={(e) => updateStatus(report.id, e.target.value)}
                                                            className={`min-h-[38px] text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 px-3 py-2 w-full cursor-pointer transition-colors disabled:opacity-60 ${getStatusSelectClass(
                                                                report.status
                                                            )}`}
                                                        >
                                                            <option className="bg-white text-gray-900" value="belum proses">
                                                                Belum Proses
                                                            </option>
                                                            <option className="bg-white text-gray-900" value="di proses">
                                                                Di Proses
                                                            </option>
                                                            <option className="bg-white text-gray-900" value="selesai">
                                                                Selesai
                                                            </option>
                                                        </select>

                                                        {report.user_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openChat(report)}
                                                                className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-700 text-white hover:bg-sky-800 font-semibold rounded-xl transition-colors text-xs w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
                                                            >
                                                                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Live Chat</span>
                                                                {messageCount > 0 && (
                                                                    <span className="bg-white text-sky-800 font-bold px-1.5 py-0.5 rounded-full text-[11px] leading-none">
                                                                        {messageCount}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="font-medium text-gray-600">
                                                    Belum ada laporan WBS yang masuk.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {reports?.links && reports.links.length > 3 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs sm:text-sm text-gray-600">
                                Menampilkan {reports.from || 0}-{reports.to || 0} dari {reports.total || 0} laporan
                            </p>
                            <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-1.5">
                                {reports.links.map((link, i) => {
                                    const labelStr = String(link.label || '');
                                    const isPrev = i === 0 || /previous|&laquo;|«/i.test(labelStr);
                                    const isNext = i === reports.links.length - 1 || /next|&raquo;|»/i.test(labelStr);
                                    const navTitle = isPrev
                                        ? 'Halaman sebelumnya'
                                        : isNext
                                        ? 'Halaman selanjutnya'
                                        : undefined;
                                    const content = isPrev ? (
                                        <ChevronLeft className="w-4 h-4" />
                                    ) : isNext ? (
                                        <ChevronRight className="w-4 h-4" />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    );

                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            aria-label={navTitle}
                                            title={navTitle}
                                            className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] px-3 py-1.5 text-sm border rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                                                link.active
                                                    ? 'bg-sky-700 text-white border-sky-700 font-bold'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        <span
                                            key={i}
                                            aria-label={navTitle}
                                            title={navTitle}
                                            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] px-3 py-1.5 text-sm border rounded-lg bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                        >
                                            {content}
                                        </span>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Photo Preview Modal */}
            <Modal show={photoModal} onClose={() => setPhotoModal(false)} maxWidth="2xl">
                <div className="bg-neutral-950 rounded-xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-900 border-b border-neutral-800">
                        <span className="text-sm font-semibold text-white truncate">
                            Bukti Foto Laporan
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                            {selectedPhoto && (
                                <a
                                    href={selectedPhoto}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-100 hover:bg-neutral-700 text-xs font-semibold transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Buka Asli</span>
                                </a>
                            )}
                            <button
                                type="button"
                                aria-label="Tutup pratinjau foto"
                                onClick={() => setPhotoModal(false)}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-neutral-800 text-white hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {selectedPhoto && (
                        <div className="flex justify-center items-center min-h-[240px] max-h-[75dvh] overflow-hidden p-3 sm:p-4">
                            <img
                                src={selectedPhoto}
                                alt="Bukti Laporan"
                                className="max-w-full max-h-[70dvh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Chat Modal */}
            <Modal show={chatModal} onClose={closeChat} maxWidth="2xl">
                {selectedReport && (
                    <div className="flex flex-col h-[82dvh] sm:h-[78dvh] max-h-[680px] bg-slate-50">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                                        Live Chat - {selectedReport.is_anonymous ? 'Anonim' : selectedReport.reporter_name || 'Pelapor'}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Tgl {dayjs(selectedReport.created_at).format('DD MMM YYYY HH:mm')}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Tutup live chat"
                                onClick={closeChat}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                            {/* Original Report */}
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200/80 text-gray-800 rounded-2xl rounded-tl-sm p-3.5 sm:p-4 max-w-[88%] sm:max-w-[80%] shadow-sm">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {selectedReport.description}
                                    </p>
                                    <span className="text-[11px] text-gray-500 mt-2 block">
                                        {dayjs(selectedReport.created_at).format('HH:mm')} - Laporan Awal
                                    </span>
                                </div>
                            </div>

                            {/* Chat History */}
                            {selectedReport.messages &&
                                selectedReport.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`rounded-2xl p-3.5 sm:p-4 max-w-[88%] sm:max-w-[80%] shadow-sm ${
                                                msg.is_admin
                                                    ? 'bg-sky-700 text-white rounded-tr-sm'
                                                    : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-sm'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {msg.message}
                                            </p>
                                            <span
                                                className={`text-[11px] mt-2 block ${
                                                    msg.is_admin ? 'text-sky-100 text-right' : 'text-gray-500'
                                                }`}
                                            >
                                                {dayjs(msg.created_at).format('HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={sendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={chatData.message}
                                    onChange={(e) => setChatData('message', e.target.value)}
                                    placeholder="Ketik pesan balasan untuk pelapor..."
                                    className="flex-1 min-w-0 min-h-[44px] rounded-xl border-gray-300 bg-gray-50/70 focus:bg-white focus:border-sky-600 focus:ring-sky-600 text-base sm:text-sm px-3.5"
                                    required
                                    disabled={chatProcessing}
                                />
                                <button
                                    type="submit"
                                    aria-label="Kirim pesan"
                                    disabled={chatProcessing || !chatData.message.trim()}
                                    className="min-w-[48px] min-h-[44px] px-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-800 active:bg-sky-900 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                                >
                                    {chatProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                            {chatErrors.message && (
                                <p className="text-xs text-red-600 mt-1.5">{chatErrors.message}</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
