import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PlaneTakeoff, FileCheck, Calendar, Download, FileImage, UploadCloud, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UcHistory({ requests }) {
    const user = usePage().props.auth.user;
    
    // Form Result State
    const { data: resultData, setData: setResultData, post: postResult, processing: resultProcessing, errors: resultErrors, reset: resultReset } = useForm({
        result_summary: '',
        receipt_photos: [],
    });

    const [selectedUc, setSelectedUc] = useState(null);
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
                
                {/* Daftar & Upload Result UC */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                        <FileCheck className="text-emerald-500" /> Riwayat & Result UC
                    </h3>

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
                                                <a 
                                                    href={route('requests.uc.pdf', req.id)}
                                                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                                                >
                                                    <Download className="w-3 h-3" /> Unduh PDF
                                                </a>
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
