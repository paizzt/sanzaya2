import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import dayjs from 'dayjs';
import { MessageSquare, Download, FileText, Calendar, Clock, X, User, UserX, Send, Loader2 } from 'lucide-react';
import 'dayjs/locale/id';
import Swal from 'sweetalert2';

dayjs.locale('id');

export default function Index({ auth, reports }) {
    const [photoModal, setPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [chatModal, setChatModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const { data: chatData, setData: setChatData, post: postChat, processing: chatProcessing, reset: chatReset } = useForm({
        message: ''
    });

    const openChat = (report) => {
        setSelectedReport(report);
        setChatModal(true);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        postChat(route('wbs-reports.messages.store', selectedReport.id), {
            preserveScroll: true,
            onSuccess: () => {
                chatReset();
            }
        });
    };

    if (selectedReport && chatModal) {
        const updatedReport = reports.data.find(r => r.id === selectedReport.id);
        if (updatedReport && updatedReport.messages?.length !== selectedReport.messages?.length) {
            setSelectedReport(updatedReport);
        }
    }

    const updateStatus = (id, newStatus) => {
        router.post(route('wbs-reports.status', id), {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Status berhasil diperbarui',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan WBS (Whistleblowing System)</h2>}
        >
            <Head title="Laporan WBS" />

            <div className="py-2">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-3">
                            <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Daftar Laporan Masuk</h3>
                                <p className="text-sm text-gray-500">Kumpulan laporan anonim dari Whistleblowing System.</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900">Tanggal Lapor</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900">Pelapor</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 min-w-[300px]">Isi Laporan</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 text-center">Lampiran Foto</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.data.length > 0 ? (
                                        reports.data.map((report) => (
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {report.is_anonymous ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                                                            <UserX className="w-3.5 h-3.5" /> Anonim
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-100 text-sky-700 text-xs font-semibold">
                                                            <User className="w-3.5 h-3.5" /> {report.reporter_name || 'Dengan Identitas'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {report.file_path ? (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedPhoto(route('wbs-reports.download', report.id));
                                                                setPhotoModal(true);
                                                            }}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 font-semibold rounded-lg transition-colors border border-sky-200 shadow-sm"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span>Lihat Foto</span>
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs italic border border-gray-100">
                                                            <FileText className="w-3 h-3" />
                                                            Tidak ada foto
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col gap-2 items-center">
                                                        <select
                                                            value={report.status || 'belum proses'}
                                                            onChange={(e) => updateStatus(report.id, e.target.value)}
                                                            className={`text-xs font-bold rounded-xl border focus:ring focus:ring-opacity-50 px-3 py-2 w-full ${
                                                                report.status === 'selesai' ? 'bg-green-100 text-green-700 border-green-200 focus:border-green-500 focus:ring-green-200' :
                                                                report.status === 'di proses' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-200' :
                                                                'bg-gray-100 text-gray-700 border-gray-200 focus:border-gray-500 focus:ring-gray-200'
                                                            }`}
                                                        >
                                                            <option value="belum proses">Belum Proses</option>
                                                            <option value="di proses">Di Proses</option>
                                                            <option value="selesai">Selesai</option>
                                                        </select>
                                                        
                                                        {report.user_id && (
                                                            <button
                                                                onClick={() => openChat(report)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white hover:bg-sky-700 font-semibold rounded-lg transition-colors text-xs w-full justify-center"
                                                            >
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                Live Chat
                                                                {report.messages && report.messages.length > 0 && (
                                                                    <span className="bg-white text-sky-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                                                                        {report.messages.length}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                                                    <p className="font-medium text-gray-600">Belum ada laporan WBS yang masuk.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Component can be added here if needed */}
                        {reports.links && reports.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                    {reports.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 text-sm border rounded-lg ${link.active ? 'bg-sky-50 text-sky-600 border-sky-200 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    <h3 className="font-bold text-gray-900">Live Chat - {selectedReport.is_anonymous ? 'Anonim' : selectedReport.reporter_name}</h3>
                                    <p className="text-xs text-gray-500">Tgl {dayjs(selectedReport.created_at).format('DD MMM YYYY HH:mm')}</p>
                                </div>
                            </div>
                            <button onClick={() => setChatModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Original Report */}
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-[85%] shadow-sm">
                                    <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {dayjs(selectedReport.created_at).format('HH:mm')} - Laporan Awal
                                    </span>
                                </div>
                            </div>

                            {/* Chat History */}
                            {selectedReport.messages && selectedReport.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-2xl p-4 max-w-[85%] shadow-sm ${
                                        msg.is_admin 
                                            ? 'bg-sky-600 text-white rounded-tr-sm' 
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <span className={`text-[10px] mt-2 block ${msg.is_admin ? 'text-sky-200 text-right' : 'text-gray-400'}`}>
                                            {dayjs(msg.created_at).format('HH:mm')}
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
                                    value={chatData.message}
                                    onChange={e => setChatData('message', e.target.value)}
                                    placeholder="Ketik pesan balasan untuk pelapor..."
                                    className="flex-1 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-sky-500 focus:ring-sky-500 text-sm"
                                    required
                                    disabled={chatProcessing}
                                />
                                <button
                                    type="submit"
                                    disabled={chatProcessing || !chatData.message.trim()}
                                    className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[50px]"
                                >
                                    {chatProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
