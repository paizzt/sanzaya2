import { useEffect, useRef, useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import {
    MessageSquare,
    Calendar,
    Clock,
    X,
    Download,
    Send,
    Loader2,
    Plus,
    ExternalLink,
} from 'lucide-react';

dayjs.locale('id');

const getStatusBadge = (status) => {
    if (status === 'selesai') {
        return {
            label: 'Selesai',
            className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
    }
    if (status === 'di proses') {
        return {
            label: 'Di Proses',
            className: 'bg-amber-50 text-amber-800 border-amber-200',
        };
    }
    return {
        label: 'Belum Proses',
        className: 'bg-gray-100 text-gray-700 border-gray-200',
    };
};

export default function MyReports({ reports = [] }) {
    const { auth } = usePage().props;
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [chatModal, setChatModal] = useState(false);
    const [photoModal, setPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const messagesEndRef = useRef(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        message: '',
    });

    const selectedReport = selectedReportId
        ? reports.find((r) => r.id === selectedReportId) || null
        : null;

    useEffect(() => {
        if (chatModal && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatModal, selectedReport?.messages?.length]);

    const openPhoto = (report) => {
        const url = report.file_path.startsWith('http')
            ? report.file_path
            : route('wbs-reports.download', report.id);
        setSelectedPhoto(url);
        setPhotoModal(true);
    };

    const openChat = (report) => {
        clearErrors();
        setSelectedReportId(report.id);
        setChatModal(true);
    };

    const closeChat = () => {
        setChatModal(false);
        clearErrors();
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!selectedReport || !data.message.trim()) return;
        post(route('wbs-reports.messages.store', selectedReport.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-lg sm:text-xl text-gray-800 leading-tight">
                    Riwayat Laporan Saya
                </h2>
            }
        >
            <Head title="Riwayat Laporan WBS" />

            <div className="py-2 sm:py-3">
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                    {/* Card Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="p-2.5 sm:p-3 bg-sky-100 text-sky-700 rounded-xl shrink-0">
                                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                                    Riwayat Laporan Saya
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                    Pantau status laporan dan balas pesan dari tim pengelola WBS.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('wbs.create')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-sky-700 text-white rounded-xl hover:bg-sky-800 active:bg-sky-900 transition-colors font-semibold shadow-sm text-sm shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                        >
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>Buat Laporan Baru</span>
                        </Link>
                    </div>

                    {/* Mobile & Tablet / Small-Laptop Cards (< xl) */}
                    <div className="xl:hidden">
                        {reports.length > 0 ? (
                            <div className="p-3.5 sm:p-5 bg-slate-50/60 grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                                {reports.map((report) => {
                                    const badge = getStatusBadge(report.status);
                                    const messageCount = report.messages?.length || 0;

                                    return (
                                        <article
                                            key={report.id}
                                            className="bg-white rounded-xl border border-gray-200/80 p-4 flex flex-col justify-between gap-3.5 shadow-sm min-w-0"
                                        >
                                            <div className="space-y-3 min-w-0">
                                                {/* Meta Row */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                                                    <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                                        <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                            {dayjs(report.created_at).format('DD MMM YYYY')}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                                                            {dayjs(report.created_at).format('HH:mm')}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.className}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                                    {report.description}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div
                                                className={`pt-3 border-t border-gray-100 grid gap-2.5 ${
                                                    report.file_path
                                                        ? 'grid-cols-1 min-[400px]:grid-cols-2'
                                                        : 'grid-cols-1'
                                                }`}
                                            >
                                                {report.file_path && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openPhoto(report)}
                                                        className="min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 active:bg-sky-200 font-semibold rounded-xl transition-colors text-sm border border-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                                    >
                                                        <Download className="w-4 h-4 shrink-0" />
                                                        <span>Lihat Lampiran</span>
                                                    </button>
                                                )}

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
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-4 py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <MessageSquare className="w-11 h-11 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-600">
                                        Anda belum membuat laporan WBS apa pun.
                                    </p>
                                    <Link
                                        href={route('wbs.create')}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-sky-700 text-white hover:bg-sky-800 rounded-xl font-semibold text-sm transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Buat Laporan Pertama</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (xl+) */}
                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 table-fixed">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="w-[160px] px-6 py-4 font-bold text-gray-900">
                                        Tanggal Lapor
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold text-gray-900">
                                        Isi Laporan
                                    </th>
                                    <th scope="col" className="w-[144px] px-6 py-4 font-bold text-gray-900 text-center">
                                        Status
                                    </th>
                                    <th scope="col" className="w-[172px] px-6 py-4 font-bold text-gray-900 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.length > 0 ? (
                                    reports.map((report) => {
                                        const badge = getStatusBadge(report.status);
                                        const messageCount = report.messages?.length || 0;

                                        return (
                                            <tr
                                                key={report.id}
                                                className="bg-white hover:bg-sky-50/30 transition-colors"
                                            >
                                                <td className="px-6 py-4 align-top whitespace-nowrap">
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
                                                <td className="px-6 py-4 align-top">
                                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                                        {report.description}
                                                    </p>
                                                    {report.file_path && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openPhoto(report)}
                                                            className="inline-flex items-center gap-1.5 mt-3 min-h-[34px] px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold rounded-lg transition-colors text-xs border border-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                                        >
                                                            <Download className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Lihat Lampiran</span>
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top text-center">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${badge.className}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openChat(report)}
                                                        className="min-h-[38px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 font-semibold rounded-xl transition-colors shadow-sm text-xs w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
                                                    >
                                                        <MessageSquare className="w-4 h-4 shrink-0" />
                                                        <span>Live Chat</span>
                                                        {messageCount > 0 && (
                                                            <span className="bg-white text-sky-800 font-bold px-1.5 py-0.5 rounded-full text-[11px] leading-none">
                                                                {messageCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="font-medium text-gray-600">
                                                    Anda belum membuat laporan WBS apa pun.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
                                        Live Chat WBS
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Laporan tgl {dayjs(selectedReport.created_at).format('DD MMM YYYY')}
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
                            <div className="flex justify-end">
                                <div className="bg-sky-700 text-white rounded-2xl rounded-tr-sm p-3.5 sm:p-4 max-w-[88%] sm:max-w-[80%] shadow-sm">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {selectedReport.description}
                                    </p>
                                    <span className="text-[11px] text-sky-100 mt-2 block text-right">
                                        {dayjs(selectedReport.created_at).format('HH:mm')} - Laporan Awal
                                    </span>
                                </div>
                            </div>

                            {/* Chat History */}
                            {selectedReport.messages &&
                                selectedReport.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`rounded-2xl p-3.5 sm:p-4 max-w-[88%] sm:max-w-[80%] shadow-sm ${
                                                msg.is_admin
                                                    ? 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-sm'
                                                    : 'bg-sky-700 text-white rounded-tr-sm'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {msg.message}
                                            </p>
                                            <span
                                                className={`text-[11px] mt-2 block ${
                                                    msg.is_admin ? 'text-gray-500' : 'text-sky-100 text-right'
                                                }`}
                                            >
                                                {dayjs(msg.created_at).format('HH:mm')}{' '}
                                                {msg.is_admin ? '- Tim WBS' : ''}
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
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Ketik balasan Anda di sini..."
                                    className="flex-1 min-w-0 min-h-[44px] rounded-xl border-gray-300 bg-gray-50/70 focus:bg-white focus:border-sky-600 focus:ring-sky-600 text-base sm:text-sm px-3.5"
                                    required
                                    disabled={processing}
                                />
                                <button
                                    type="submit"
                                    aria-label="Kirim balasan"
                                    disabled={processing || !data.message.trim()}
                                    className="min-w-[48px] min-h-[44px] px-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-800 active:bg-sky-900 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                                >
                                    {processing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                            {errors.message && (
                                <p className="text-xs text-red-600 mt-1.5">{errors.message}</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Photo Modal */}
            <Modal show={photoModal} onClose={() => setPhotoModal(false)} maxWidth="2xl">
                <div className="bg-neutral-950 rounded-xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-900 border-b border-neutral-800">
                        <span className="text-sm font-semibold text-white truncate">
                            Lampiran Bukti Laporan
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
                                aria-label="Tutup lampiran foto"
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
        </AuthenticatedLayout>
    );
}
