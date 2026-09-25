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
            <form onSubmit={submitWbs} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">
                        Lapor WBS
                    </h2>
                    <button 
                        type="button"
                        onClick={() => setIsWbsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <InputLabel htmlFor="description" value="Deskripsi Laporan" />
                        <textarea
                            id="description"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={wbsForm.data.description}
                            onChange={e => wbsForm.setData('description', e.target.value)}
                            placeholder="Jelaskan secara detail indikasi pelanggaran..."
                            rows="5"
                            required
                        />
                        <InputError message={wbsForm.errors.description} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel value="Bukti Pendukung (Opsional)" />
                        <input 
                            type="file" 
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                            accept="image/*"
                            onChange={e => wbsForm.setData('file', e.target.files[0])}
                        />
                        <InputError message={wbsForm.errors.file} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setIsWbsModalOpen(false);
                                wbsForm.reset();
                            }}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 mr-2"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={wbsForm.processing}>
                            {wbsForm.processing ? 'Mengirim...' : 'Kirim Laporan'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </Modal>
        </>
    );
}
