import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
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
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <ApplicationLogo className="w-24 h-auto" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Satu Sanzaya</h1>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Masukan email dan password yang telah di berikan, untuk mengetahuinya silahkan hubungi HR
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="EMAIL PERUSAHAAN" className="text-xs font-bold text-gray-700 tracking-wider" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="staff@sanzaya.com"
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="KATA SANDI" className="text-xs font-bold text-gray-700 tracking-wider" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="********"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Ingat Saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Lupa Password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30" disabled={processing}>
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
