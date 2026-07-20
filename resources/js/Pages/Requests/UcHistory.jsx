import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExportDropdown from '@/Components/ExportDropdown';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PlaneTakeoff, FileCheck, Calendar, Download, FileImage, UploadCloud, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UcHistory({ requests, activeUcs = [] }) {
    const user = usePage().props.auth.user;
    
    // Form Result State
    const { data: resultData, setData: setResultData, post: postResult, processing: resultProcessing, errors: resultErrors, reset: resultReset } = useForm({
        result_summary: '',
        receipt_photos: [],
    });

    const [selectedUc, setSelectedUc] = useState(null);
    const [expandedActiveUc, setExpandedActiveUc] = useState(null);
    const [previewUrls, setPreviewUrls] = useState([]);
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-2xl' }
            });
            resultReset();
            setSelectedUc(null);
            setPreviewUrls([]);
        }
    }, [flash]);

    const submitResult = (e, id) => {
        e.preventDefault();
        postResult(route('requests.uc.storeResult', id), { preserveScroll: true });
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const allFiles = [...resultData.receipt_photos, ...newFiles];
        setResultData('receipt_photos', allFiles);
        
        const newUrls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newUrls]);
    };

    const removeFile = (indexToRemove) => {
        const newFiles = resultData.receipt_photos.filter((_, index) => index !== indexToRemove);
        setResultData('receipt_photos', newFiles);
        
        const newUrls = previewUrls.filter((_, index) => index !== indexToRemove);
        setPreviewUrls(newUrls);
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Riwayat & Result UC</h2>}
        >
            <Head title="Riwayat & Result UC" />

            <div className="pb-6 pt-0 space-y-8 max-w-7xl mx-auto sm:px-6 lg:px-8">

                {/* Siapa yang Sedang UC Hari Ini */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <PlaneTakeoff className="text-blue-600" /> Sedang UC Hari Ini
                        </h3>
                    </div>

                    {activeUcs.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                            <p>Tidak ada UC hari ini</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeUcs.map(uc => (
                                <div key={uc.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div 
                                        className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition-colors"
                                        onClick={() => setExpandedActiveUc(expandedActiveUc === uc.id ? null : uc.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {uc.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{uc.user?.name}</h4>
                                                <p className="text-xs text-gray-500">{uc.department} - {uc.destination_city}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Sedang Berlangsung</span>
                                    </div>
                                    
                                    {expandedActiveUc === uc.id && (
                                        <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2">
                                            <div>
                                                <p className="text-gray-500 mb-1">Tanggal</p>
                                                <p className="font-semibold text-gray-800"><Calendar className="inline w-4 h-4 mr-1 text-gray-400"/> {uc.departure_date} s/d {uc.return_date}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">Durasi & Kendaraan</p>
                                                <p className="font-semibold text-gray-800">{uc.estimated_days} Hari - {uc.transport_type} {uc.vehicle_number ? `(${uc.vehicle_number})` : ''}</p>
                                            </div>
                                            <div className="col-span-1 md:col-span-2 mt-2">
                                                <p className="text-gray-500 mb-1">Pendamping</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {uc.companions && uc.companions.length > 0 ? (
                                                        uc.companions.map((comp, idx) => (
                                                            <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                                                {comp}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 italic">Tidak ada pendamping</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Daftar & Upload Result UC */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <FileCheck className="text-blue-600" /> Riwayat Pengajuan
                        </h3>
                        <div className="flex items-center gap-3">
                            <ExportDropdown pdfRoute={route('requests.uc.export.pdf')} excelRoute={route('requests.uc.export.excel')} />
                        </div>
                    </div>

                    {requests.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <PlaneTakeoff className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Belum ada riwayat pengajuan UC</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {requests.map(req => (
                                <div key={req.id} className={`p-5 rounded-2xl border ${req.status === 'Selesai / Result Dikirim' ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100'} hover:shadow-md transition-all`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-800">Tujuan: {req.destination_city}</h4>
                                            <p className="text-sm text-gray-500 mt-1"><Calendar className="w-3 h-3 inline mr-1"/> {req.departure_date} s/d {req.return_date} ({req.estimated_days} Hari)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Selesai / Result Dikirim' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {req.status}
                                            </span>
                                            {req.status !== 'Selesai / Result Dikirim' && (
                                                <button 
                                                    onClick={() => setSelectedUc(selectedUc === req.id ? null : req.id)}
                                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                                                >
                                                    Isi Result & Nota
                                                </button>
                                            )}
                                            {req.status === 'Selesai / Result Dikirim' && (
                                                <ExportDropdown pdfRoute={route('requests.uc.pdf', req.id)} trigger={
                                                <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1">
                                                    <Download className="w-3 h-3" /> Unduh PDF
                                                </button>
                                            } />
                                            )}
                                        </div>
                                    </div>

                                    {/* Form Result / Upload Nota */}
                                    {selectedUc === req.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                                            <form onSubmit={(e) => submitResult(e, req.id)} className="space-y-4">
                                                <div>
                                                    <InputLabel value="Hasil Result UC *" />
                                                    <textarea 
                                                        className="mt-1 block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                        rows="3"
                                                        placeholder="Ceritakan detail hasil perjalanan dinas..."
                                                        value={resultData.result_summary}
                                                        onChange={(e) => setResultData('result_summary', e.target.value)}
                                                    ></textarea>
                                                    <InputError message={resultErrors.result_summary} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel value="Upload Foto Nota (Bisa lebih dari 1) *" />
                                                    <div className="mt-1 flex items-center justify-center w-full">
                                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk memilih beberapa foto</span></p>
                                                                <p className="text-xs text-gray-500">PNG, JPG</p>
                                                            </div>
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                multiple 
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                            />
                                                        </label>
                                                    </div>
                                                    {previewUrls.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {previewUrls.map((url, i) => (
                                                                <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square shadow-sm group">
                                                                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFile(i)}
                                                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {resultData.receipt_photos.length > 0 && (
                                                        <p className="text-sm font-bold text-emerald-600 mt-3 flex items-center gap-1">
                                                            <FileImage className="w-4 h-4"/> {resultData.receipt_photos.length} file dipilih
                                                        </p>
                                                    )}
                                                    <InputError message={resultErrors.receipt_photos} className="mt-2" />
                                                </div>

                                                <div className="flex justify-end">
                                                    <PrimaryButton disabled={resultProcessing} className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                                                        Kirim Result UC
                                                    </PrimaryButton>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Display Result if done */}
                                    {req.status === 'Selesai / Result Dikirim' && (
                                        <div className="mt-4 pt-4 border-t border-emerald-100/50 bg-white/50 p-4 rounded-xl">
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Hasil UC:</p>
                                            <p className="text-sm text-gray-600">{req.result_report}</p>
                                            <div className="mt-3 flex gap-2 flex-wrap">
                                                {req.result_receipts && JSON.parse(req.result_receipts).map((photo, i) => (
                                                    <a key={i} href={`/storage/${photo}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                                                        <FileImage className="w-3 h-3" /> Lihat Nota {i+1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
