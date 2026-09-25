import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import { Loader2, MessageSquare, Shield, ShieldAlert, Upload, Image as ImageIcon } from 'lucide-react';

export default function Create() {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        description: '',
        file: null,
        is_anonymous: true,
    });

    const [preview, setPreview] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post(route('wbs-reports.store'), {
            onSuccess: () => {
                reset();
                setPreview(null);
                Swal.fire({
                    title: 'Berhasil!',
                    text: data.is_anonymous 
                        ? 'Laporan WBS Anda telah dikirim dan akan kami rahasiakan.' 
                        : 'Laporan WBS Anda telah dikirim.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPreview(null);
            setData('file', null);
            return;
        }
        
        if (!file.type.startsWith('image/') || file.size < 500 * 1024) {
            setData('file', file);
            setPreview(URL.createObjectURL(file));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    setData('file', compressedFile);
                    setPreview(URL.createObjectURL(compressedFile));
                }, 'image/jpeg', 0.7);
            };
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Lapor WBS</h2>}
        >
            <Head title="Lapor WBS" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Whistleblowing System</h3>
                                    <p className="text-gray-500 text-sm">Fasilitas pelaporan dugaan pelanggaran</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Toggle Anonymous */}
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${data.is_anonymous ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {data.is_anonymous ? <Shield className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-gray-800 text-base">
                                                {data.is_anonymous ? 'Laporan Anonim Aktif' : 'Laporan dengan Identitas'}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setData('is_anonymous', !data.is_anonymous)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${data.is_anonymous ? 'bg-sky-500' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.is_anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {data.is_anonymous 
                                                ? 'Identitas Anda disembunyikan. Pelaporan dilakukan secara anonim dan rahasia.'
                                                : `Pelaporan dilakukan dengan nama Anda (${auth.user.name}).`}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Keterangan Laporan *" className="font-bold text-gray-700 mb-2" />
                                    <textarea
                                        id="description"
                                        className="w-full rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-sm p-4 min-h-[160px]"
                                        placeholder="Jelaskan secara rinci kronologi kejadian, tempat, waktu, dan siapa saja yang terlibat..."
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        required
                                    ></textarea>
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="file" value="Bukti Foto (Opsional)" className="font-bold text-gray-700 mb-2" />
                                    
                                    <label className={`relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden ${preview ? 'border-sky-300 bg-sky-50/30' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-sky-300'}`}>
                                        <input
                                            type="file"
                                            id="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        
                                        {preview ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
                                                        <Upload className="w-4 h-4" /> Ganti Foto
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                                                <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mb-3">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Klik untuk upload foto</p>
                                                <p className="text-xs text-gray-500">Maks. 10MB (JPG, PNG, GIF, WebP)</p>
                                            </div>
                                        )}
                                    </label>
                                    <InputError message={errors.file} className="mt-2" />
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <PrimaryButton 
                                        className="bg-sky-600 hover:bg-sky-700 focus:bg-sky-700 active:bg-sky-800 px-8 py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(14,165,233,0.4)] hover:shadow-[0_10px_25px_-6px_rgba(14,165,233,0.5)] transition-all flex items-center gap-2" 
                                        disabled={processing}
                                    >
                                        {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                                        <span className="font-bold text-[15px] tracking-wide uppercase">Kirim Laporan</span>
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
