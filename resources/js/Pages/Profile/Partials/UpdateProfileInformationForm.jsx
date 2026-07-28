import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Check, Mail, User } from 'lucide-react';
import { useEffect } from 'react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    useEffect(() => {
        if (recentlySuccessful) {
            Swal.fire({
                title: 'Berhasil!',
                text: 'Informasi profil berhasil diperbarui.',
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-3xl' },
                timer: 2000,
                showConfirmButton: false
            });
        }
    }, [recentlySuccessful]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="mb-1 text-gray-700 font-medium" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="name"
                            className="block w-full pl-11 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                    </div>
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="mb-1 text-gray-700 font-medium" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            className="block w-full pl-11 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <p className="text-sm text-orange-800 flex items-center gap-2">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline font-semibold hover:text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-emerald-600">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                    <PrimaryButton disabled={processing} className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                        Simpan Perubahan
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
