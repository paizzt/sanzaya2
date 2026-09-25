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
import { Loader2, Eye, EyeOff, MessageSquareWarning } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [wbsModal, setWbsModal] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const { data: wbsData, setData: setWbsData, post: postWbs, processing: wbsProcessing, errors: wbsErrors, reset: wbsReset } = useForm({
        description: '',
        file: null,
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

    const submitWbs = (e) => {
        e.preventDefault();
        postWbs(route('wbs-reports.store'), {
            onSuccess: () => {
                setWbsModal(false);
                wbsReset();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Laporan WBS Anda telah dikirim dan akan kami rahasiakan.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
            }
        });
    };

    return (
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
            
            {/* WBS Floating Button & Modal via Portal */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    <button 
                        onClick={() => setWbsModal(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(220,38,38,0.6)] hover:bg-red-700 hover:scale-105 transition-all z-50 focus:outline-none group"
                        title="Whistleblowing System (Lapor WBS)"
                    >
                        <MessageSquareWarning className="w-6 h-6 group-hover:animate-bounce" />
                    </button>

                    <Modal show={wbsModal} onClose={() => setWbsModal(false)} maxWidth="lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5 border-b pb-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <MessageSquareWarning className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">Lapor WBS</h2>
                                </div>
                                <button onClick={() => setWbsModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-100">
                                Whistleblowing System (WBS) adalah fasilitas untuk melaporkan dugaan pelanggaran. Identitas Anda akan kami rahasiakan.
                            </p>

                            <form onSubmit={submitWbs} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="description" value="Isi Laporan / Keterangan" className="font-bold text-gray-700 mb-2" />
                                    <textarea
                                        id="description"
                                        className="w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-colors shadow-sm text-sm p-3"
                                        rows="5"
                                        placeholder="Jelaskan detail laporan Anda secara rinci..."
                                        value={wbsData.description}
                                        onChange={e => setWbsData('description', e.target.value)}
                                        required
                                    ></textarea>
                                    <InputError message={wbsErrors.description} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="file" value="Upload Bukti Foto (Opsional)" className="font-bold text-gray-700 mb-2" />
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-red-400 transition-colors bg-gray-50 text-center">
                                        <input
                                            type="file"
                                            id="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => setWbsData('file', e.target.files[0])}
                                        />
                                        <div className="pointer-events-none">
                                            <div className="text-gray-500 text-sm">
                                                {wbsData.file ? (
                                                    <span className="font-semibold text-red-600">{wbsData.file.name}</span>
                                                ) : (
                                                    <span>Klik atau drop gambar di sini (Format JPG, PNG, dll, maks 10MB)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <InputError message={wbsErrors.file} className="mt-2" />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t">
                                    <button type="button" onClick={() => setWbsModal(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
                                    <button type="submit" disabled={wbsProcessing} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.3)] disabled:opacity-70 flex items-center gap-2">
                                        {wbsProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Kirim Laporan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Modal>
                </>,
                document.body
            )}
        </GuestLayout>
    );
}
