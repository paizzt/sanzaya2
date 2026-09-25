import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { MessageSquareWarning, Download, FileText, Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function Index({ auth, reports }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan WBS (Whistleblowing System)</h2>}
        >
            <Head title="Laporan WBS" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-3">
                            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                <MessageSquareWarning className="w-6 h-6" />
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
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 min-w-[300px]">Isi Laporan</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-gray-900 text-center">Lampiran File</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.data.length > 0 ? (
                                        reports.data.map((report) => (
                                            <tr key={report.id} className="bg-white border-b border-gray-50 hover:bg-red-50/30 transition-colors">
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
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {report.file_path ? (
                                                        <a 
                                                            href={report.file_path.startsWith('http') ? report.file_path : route('wbs-reports.download', report.id)} 
                                                            target={report.file_path.startsWith('http') ? '_blank' : '_self'}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-colors border border-red-200 shadow-sm"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span>{report.file_path.startsWith('http') ? 'Lihat Foto' : 'Unduh'}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs italic border border-gray-100">
                                                            <FileText className="w-3 h-3" />
                                                            Tidak ada foto
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <MessageSquareWarning className="w-12 h-12 text-gray-300 mb-3" />
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
                                            className={`px-3 py-1 text-sm border rounded-lg ${link.active ? 'bg-red-50 text-red-600 border-red-200 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
