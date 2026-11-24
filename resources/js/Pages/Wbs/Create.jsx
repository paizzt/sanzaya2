import { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import {
    Loader2,
    MessageSquare,
    Shield,
    ShieldAlert,
    Upload,
    Image as ImageIcon,
    Trash2,
    ArrowLeft,
} from 'lucide-react';

export default function Create() {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        description: '',
        file: null,
        is_anonymous: true,
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const updatePreview = (nextUrl) => {
        setPreview((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return nextUrl;
        });
    };

    const clearPhoto = () => {
        updatePreview(null);
        setData('file', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const wasAnonymous = data.is_anonymous;
        post(route('wbs-reports.store'), {
            onSuccess: () => {
                reset();
                clearPhoto();
                Swal.fire({
                    title: 'Berhasil!',
                    text: wasAnonymous
                        ? 'Laporan WBS Anda telah dikirim dan akan kami rahasiakan.'
                        : 'Laporan WBS Anda telah dikirim.',
                    icon: 'success',
                    confirmButtonColor: '#0369a1',
                });
            },
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/') || file.size < 500 * 1024) {
            setData('file', file);
            updatePreview(URL.createObjectURL(file));
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

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            setData('file', file);
                            updatePreview(URL.createObjectURL(file));
                            return;
                        }
                        const compressedFile = new File(
                            [blob],
                            file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                            {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            }
                        );
                        setData('file', compressedFile);
                        updatePreview(URL.createObjectURL(compressedFile));
                    },
                    'image/jpeg',
                    0.7
                );
            };
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-lg sm:text-xl text-gray-800 leading-tight">
                    Lapor WBS
                </h2>
            }
        >
            <Head title="Lapor WBS" />

            <div className="py-2 sm:py-3">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                        <div className="p-4 sm:p-6 lg:p-8">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                                    <div className="p-2.5 sm:p-3 bg-sky-50 text-sky-700 rounded-xl shrink-0">
                                        <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug">
                                            Whistleblowing System
                                        </h3>
                                        <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                                            Fasilitas pelaporan dugaan pelanggaran secara aman
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={route('wbs-reports.my-reports')}
                                    className="self-start sm:self-auto inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                >
                                    <ArrowLeft className="w-4 h-4 shrink-0" />
                                    <span>Riwayat Saya</span>
                                </Link>
                            </div>

                            <form onSubmit={submit} className="space-y-5 sm:space-y-6">
                                {/* Toggle Anonymous */}
                                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex items-start gap-3 sm:gap-4">
                                    <div
                                        className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                                            data.is_anonymous
                                                ? 'bg-sky-100 text-sky-700'
                                                : 'bg-orange-100 text-orange-700'
                                        }`}
                                    >
                                        {data.is_anonymous ? (
                                            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                                        ) : (
                                            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                                                {data.is_anonymous
                                                    ? 'Laporan Anonim Aktif'
                                                    : 'Laporan dengan Identitas'}
                                            </h4>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={data.is_anonymous}
                                                aria-label="Aktifkan mode laporan anonim"
                                                onClick={() => setData('is_anonymous', !data.is_anonymous)}
                                                className="min-w-[44px] min-h-[44px] -my-2 flex items-center justify-end shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
                                            >
                                                <span
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        data.is_anonymous ? 'bg-sky-600' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                                            data.is_anonymous ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </span>
                                            </button>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1">
                                            {data.is_anonymous
                                                ? 'Identitas Anda disembunyikan. Pelaporan dilakukan secara anonim dan rahasia.'
                                                : `Pelaporan dilakukan dengan nama Anda (${auth.user.name}).`}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <InputLabel
                                        htmlFor="description"
                                        value="Keterangan Laporan *"
                                        className="font-bold text-gray-700 mb-2"
                                    />
                                    <textarea
                                        id="description"
                                        className="w-full rounded-xl border-gray-300 bg-gray-50/50 focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-500/10 transition-all text-base sm:text-sm p-3.5 sm:p-4 min-h-[150px] sm:min-h-[170px]"
                                        placeholder="Jelaskan secara rinci kronologi kejadian, tempat, waktu, dan siapa saja yang terlibat..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* File Upload */}
                                <div>
                                    <InputLabel
                                        htmlFor="file"
                                        value="Bukti Foto (Opsional)"
                                        className="font-bold text-gray-700 mb-2"
                                    />

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        id="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleImageChange}
                                    />

                                    {preview ? (
                                        <div className="rounded-2xl border border-sky-200 bg-sky-50/30 p-3 sm:p-4">
                                            <div className="w-full rounded-xl bg-white border border-gray-200/80 p-2 flex items-center justify-center">
                                                <img
                                                    src={preview}
                                                    alt="Pratinjau bukti foto"
                                                    className="max-h-60 sm:max-h-72 max-w-full object-contain rounded-lg"
                                                />
                                            </div>
                                            <div className="mt-3 grid grid-cols-1 min-[400px]:grid-cols-2 sm:flex sm:items-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-sky-700 hover:bg-sky-50 active:bg-sky-100 border border-sky-200 rounded-xl font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                                >
                                                    <Upload className="w-4 h-4 shrink-0" />
                                                    <span>Ganti Foto</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={clearPhoto}
                                                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 active:bg-rose-100 border border-rose-200 rounded-xl font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <Trash2 className="w-4 h-4 shrink-0" />
                                                    <span>Hapus Foto</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="file"
                                            className="flex flex-col items-center justify-center w-full min-h-[156px] sm:min-h-[170px] border-2 border-dashed border-gray-300 bg-gray-50/60 hover:bg-gray-50 hover:border-sky-400 rounded-2xl cursor-pointer transition-colors p-5 text-center"
                                        >
                                            <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mb-3">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800 mb-1">
                                                Ketuk atau klik untuk upload foto
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Maks. 10MB (JPG, PNG, GIF, WebP)
                                            </p>
                                        </label>
                                    )}
                                    <InputError message={errors.file} className="mt-2" />
                                </div>

                                {/* Submit */}
                                <div className="pt-5 sm:pt-6 border-t border-gray-100 flex justify-end">
                                    <PrimaryButton
                                        className="w-full sm:w-auto justify-center min-h-[48px] bg-sky-700 hover:bg-sky-800 focus:bg-sky-800 active:bg-sky-900 px-6 sm:px-8 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                                        disabled={processing}
                                    >
                                        {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                                        <span className="font-bold text-sm sm:text-[15px] tracking-wide uppercase">
                                            Kirim Laporan
                                        </span>
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
