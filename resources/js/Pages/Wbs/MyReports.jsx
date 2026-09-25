import { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { MessageSquare, Calendar, Clock, X, Download, FileText, Send, Loader2 } from 'lucide-react';

dayjs.locale('id');

export default function MyReports({ reports }) {
    const { auth } = usePage().props;
    const [selectedReport, setSelectedReport] = useState(null);
    const [chatModal, setChatModal] = useState(false);
    const [photoModal, setPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        message: ''
    });

    const openChat = (report) => {
        setSelectedReport(report);
        setChatModal(true);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        post(route('wbs-reports.messages.store', selectedReport.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // We need to update the selected report's messages locally or wait for inertia to update props
                // Inertia will automatically update the reports prop, we just need to find the new report and update selectedReport
            }
        });
    };

    // Update selected report when reports prop changes
    if (selectedReport && chatModal) {
        const updatedReport = reports.find(r => r.id === selectedReport.id);
        if (updatedReport && updatedReport.messages.length !== selectedReport.messages.length) {
            setSelectedReport(updatedReport);
        }
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Riwayat Laporan Saya</h2>}
        >
            <Head title="Riwayat Laporan WBS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Riwayat Laporan Saya</h3>
                                    <p className="text-sm text-gray-500">Pantau status laporan dan balas pesan dari tim pengelola WBS.</p>
                                </div>
                            </div>
                            <Link
                                href={route('wbs.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/30 text-sm"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Buat Laporan Baru
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900">Tanggal Lapor</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 min-w-[300px]">Isi Laporan</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 text-center">Status</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.length > 0 ? (
                                        reports.map((report) => (
                                            <tr key={report.id} className="bg-white border-b border-gray-50 hover:bg-sky-50/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            {dayjs(report.created_at).format('DD MMM YYYY')}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            {dayjs(report.created_at).format('HH:mm')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
                                                    {report.file_path && (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedPhoto(report.file_path.startsWith('http') ? report.file_path : route('wbs-reports.download', report.id));
                                                                setPhotoModal(true);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-sky-50 text-sky-600 hover:bg-sky-100 font-semibold rounded-md transition-colors text-xs border border-sky-200"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            Lihat Lampiran
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-xl border ${
                                                        report.status === 'selesai' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        report.status === 'di proses' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}>
                                                        {report.status ? report.status.toUpperCase() : 'BELUM PROSES'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => openChat(report)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 font-semibold rounded-lg transition-colors shadow-sm text-sm"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Live Chat
                                                        {report.messages && report.messages.length > 0 && (
                                                            <span className="bg-white text-sky-600 px-1.5 py-0.5 rounded-full text-xs ml-1">
                                                                {report.messages.length}
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                                                    <p className="font-medium text-gray-600">Anda belum membuat laporan WBS apapun.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Modal */}
            <Modal show={chatModal} onClose={() => setChatModal(false)} maxWidth="2xl">
                {selectedReport && (
                    <div className="flex flex-col h-[80vh] max-h-[700px] bg-slate-50">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Live Chat WBS</h3>
                                    <p className="text-xs text-gray-500">Laporan tgl {dayjs(selectedReport.created_at).format('DD MMM YYYY')}</p>
                                </div>
                            </div>
                            <button onClick={() => setChatModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Original Report */}
                            <div className="flex justify-end">
                                <div className="bg-sky-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%] shadow-sm">
                                    <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                                    <span className="text-[10px] text-sky-200 mt-2 block text-right">
                                        {dayjs(selectedReport.created_at).format('HH:mm')} - Laporan Awal
                                    </span>
                                </div>
                            </div>

                            {/* Chat History */}
                            {selectedReport.messages && selectedReport.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`rounded-2xl p-4 max-w-[85%] shadow-sm ${
                                        msg.is_admin 
                                            ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
                                            : 'bg-sky-600 text-white rounded-tr-sm'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <span className={`text-[10px] mt-2 block ${msg.is_admin ? 'text-gray-400' : 'text-sky-200 text-right'}`}>
                                            {dayjs(msg.created_at).format('HH:mm')} {msg.is_admin ? '- Tim WBS' : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Ketik balasan Anda di sini..."
                                    className="flex-1 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-sky-500 focus:ring-sky-500 text-sm"
                                    required
                                    disabled={processing}
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.message.trim()}
                                    className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[50px]"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Photo Modal */}
            <Modal show={photoModal} onClose={() => setPhotoModal(false)} maxWidth="2xl">
                <div className="relative bg-black rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setPhotoModal(false)}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/80 rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {selectedPhoto && (
                        <div className="flex justify-center items-center min-h-[300px] max-h-[85vh] overflow-hidden p-2">
                            <img src={selectedPhoto} alt="Bukti Laporan" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
