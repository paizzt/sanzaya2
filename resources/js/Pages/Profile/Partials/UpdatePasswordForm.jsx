import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Check, Key, Lock, ShieldCheck } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (recentlySuccessful) {
            Swal.fire({
                title: 'Berhasil!',
                text: 'Kata sandi berhasil diperbarui.',
                icon: 'success',
                confirmButtonColor: '#f97316',
                customClass: { popup: 'rounded-3xl' },
                timer: 2000,
                showConfirmButton: false
            });
        }
    }, [recentlySuccessful]);

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value="Kata Sandi Saat Ini" className="mb-1 text-gray-700 font-medium" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            className="block w-full pl-11 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-orange-500 transition-all"
                            autoComplete="current-password"
                        />
                    </div>
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="password" value="Kata Sandi Baru" className="mb-1 text-gray-700 font-medium" />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <TextInput
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="block w-full pl-11 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-orange-500 transition-all"
                                autoComplete="new-password"
                            />
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" className="mb-1 text-gray-700 font-medium" />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <ShieldCheck className="h-5 w-5 text-gray-400" />
                            </div>
                            <TextInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="block w-full pl-11 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-orange-500 transition-all"
                                autoComplete="new-password"
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                    <PrimaryButton disabled={processing} className="h-11 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 focus:ring-orange-500">
                        Perbarui Sandi
                    </PrimaryButton>

                    <div className={`transition-opacity duration-500 ${recentlySuccessful ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-500" /> Tersimpan
                        </p>
                    </div>
                </div>
            </form>
        </section>
    );
}
