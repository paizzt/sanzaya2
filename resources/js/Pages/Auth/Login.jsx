import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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

    return (
        <GuestLayout>
            <Head title="Log in" />

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
                <h1 className="text-[28px] font-extrabold text-gray-900 mb-2 tracking-tight">Satu Sanzaya</h1>
                <p className="text-[14px] text-gray-500 leading-relaxed px-4">
                    Masukan email dan password yang telah diberikan. Silakan hubungi HR jika belum memiliki akses.
                </p>
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
                        placeholder="staff@sanzaya.com"
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
                            placeholder="••••••••"
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
                    <PrimaryButton className="w-full justify-center py-3.5 rounded-xl text-[15px] font-semibold tracking-wide bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.4)] hover:shadow-[0_10px_25px_-6px_rgba(59,130,246,0.5)] border-0" disabled={processing}>
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memproses...
                            </span>
                        ) : (
                            'Masuk'
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
