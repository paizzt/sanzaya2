import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Modal from '@/Components/Modal';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Eye, EyeOff, MessageCircle, Send, Upload, X, CheckCircle } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Swal.fire({
                title: 'Login Gagal',
                text: errors.email || 'Silakan periksa kembali kredensial Anda.',
                icon: 'error',
                confirmButtonColor: '#3b82f6',
                customClass: {
                    popup: 'rounded-2xl',
                }
            });
        }
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // WBS Form
    const [isWbsModalOpen, setIsWbsModalOpen] = useState(false);
    const wbsForm = useForm({
        description: '',
        file: null,
        is_anonymous: true
    });

    const submitWbs = (e) => {
        e.preventDefault();
        wbsForm.post(route('wbs-reports.store'), {
            onSuccess: () => {
                setIsWbsModalOpen(false);
                wbsForm.reset();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Laporan WBS Anda telah berhasil dikirim. Terima kasih atas laporan Anda.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    customClass: { popup: 'rounded-2xl' }
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Gagal',
                    text: 'Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.',
                    icon: 'error',
                    confirmButtonColor: '#3b82f6',
                    customClass: { popup: 'rounded-2xl' }
                });
            }
        });
    };

    return (
        <>
            <GuestLayout>
                <Head title="Masuk" />

            {status && (
                <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 p-4 rounded-xl border border-green-100">
                    {status}
                </div>
            )}

            <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-gray-100/50 backdrop-blur-md">
                        <ApplicationLogo className="w-20 h-auto" />
                    </div>
                </div>

                <p className="text-sm font-medium text-blue-600 mb-4 italic">"Karena Anda Kami Ada"</p>

            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="EMAIL PERUSAHAAN" className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full px-4 py-3.5 rounded-xl border-gray-200/80 bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-300 text-sm"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="KATA SANDI" className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5" />

                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full px-4 py-3.5 pr-12 rounded-xl border-gray-200/80 bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-300 text-sm"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between mt-2 pt-2">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded-md border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500/20 group-hover:border-blue-400 transition-colors cursor-pointer"
                        />
                        <span className="ms-2.5 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                            Ingat Saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline decoration-blue-300 underline-offset-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            Lupa Password?
                        </Link>
                    )}
                </div>

                <div className="pt-5">
                    <button type="submit" className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-blue-600 border border-transparent rounded-xl font-bold text-[15px] text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-[0_8px_20px_-6px_rgba(59,130,246,0.4)] hover:shadow-[0_10px_25px_-6px_rgba(59,130,246,0.5)] disabled:opacity-50" disabled={processing}>
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memproses...
                            </span>
                        ) : (
                            'Masuk'
                        )}
                    </button>
                </div>
            </form>
            
        </GuestLayout>

        {/* Floating WBS Button */}
        {createPortal(
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsWbsModalOpen(true)}
                    className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 group relative"
                    title="Lapor WBS (Whistleblowing System)"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none font-medium">
                        Lapor WBS
                        <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
                    </span>
                </button>
            </div>,
            document.body
        )}

        <Modal show={isWbsModalOpen} onClose={() => setIsWbsModalOpen(false)} maxWidth="2xl">
            <div className="p-0 overflow-hidden bg-white rounded-2xl relative">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 sm:p-8 text-white">
                    <button 
                        onClick={() => setIsWbsModalOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Lapor WBS</h2>
                            <p className="text-blue-100 text-sm mt-1">Whistleblowing System</p>
                        </div>
                    </div>
                    <p className="text-sm text-blue-50/90 leading-relaxed max-w-xl">
                        Laporkan indikasi kecurangan, pelanggaran hukum, atau etika. 
                        Laporan Anda pada halaman ini akan dijamin kerahasiaannya dan selalu berstatus <strong className="font-semibold text-white">Anonim</strong>.
                    </p>
                </div>

                <form onSubmit={submitWbs} className="p-6 sm:p-8 space-y-6">
                    <div>
                        <InputLabel htmlFor="description" value="Deskripsi Laporan" className="text-gray-700 font-semibold mb-2" />
                        <div className="relative">
                            <textarea
                                id="description"
                                className="w-full border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-500/20 rounded-xl shadow-sm min-h-[150px] p-4 text-gray-700 transition-all bg-gray-50/50 focus:bg-white"
                                value={wbsForm.data.description}
                                onChange={e => wbsForm.setData('description', e.target.value)}
                                placeholder="Jelaskan secara detail indikasi pelanggaran yang Anda ketahui. Meliputi siapa, apa, kapan, di mana, dan bagaimana terjadinya."
                                required
                            />
                        </div>
                        <InputError message={wbsForm.errors.description} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel value="Bukti Pendukung (Opsional)" className="text-gray-700 font-semibold mb-2" />
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl cursor-pointer transition-all group overflow-hidden relative">
                            {wbsForm.data.file ? (
                                <div className="absolute inset-0 bg-blue-50 flex flex-col items-center justify-center p-4 text-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-blue-900 truncate w-full px-4">{wbsForm.data.file.name}</span>
                                    <span className="text-xs text-blue-600 mt-1">Klik untuk mengganti file</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-3 transition-colors">
                                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <p className="mb-1 text-sm text-gray-600 font-medium"><span className="text-blue-600">Klik untuk upload</span> gambar pendukung</p>
                                    <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max. 10MB)</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={e => wbsForm.setData('file', e.target.files[0])}
                            />
                        </label>
                        <InputError message={wbsForm.errors.file} className="mt-2" />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                        <div className="mt-0.5"><EyeOff className="w-5 h-5 text-amber-600" /></div>
                        <p className="text-sm text-amber-800 leading-relaxed">
                            Laporan dari halaman login akan dicatat sebagai <strong className="font-semibold">Laporan Anonim</strong>.
                            Anda tidak perlu login untuk melaporkan, namun Anda tidak dapat memantau status laporan Anda (fitur Live Chat dinonaktifkan). 
                            Jika Anda ingin memantau status dan berbalas pesan, silakan <strong>Login</strong> terlebih dahulu.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                setIsWbsModalOpen(false);
                                wbsForm.reset();
                            }}
                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium transition-all"
                        >
                            Batal
                        </button>
                        <PrimaryButton
                            type="submit"
                            className="!px-6 !py-2.5 !bg-blue-600 hover:!bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20"
                            disabled={wbsForm.processing}
                        >
                            {wbsForm.processing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Mengirim...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Kirim Laporan
                                </span>
                            )}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
        </>
    );
}
