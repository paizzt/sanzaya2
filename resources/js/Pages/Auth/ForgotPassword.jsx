import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="flex items-center mb-6">
                <Link
                    href={route('login')}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors group"
                    title="Kembali ke halaman Masuk"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
            </div>

            {status && (
                <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 p-4 rounded-xl border border-green-100">
                    {status}
                </div>
            )}

            <div className="text-center mb-10 pt-2">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-gray-100/50 backdrop-blur-md">
                        <ApplicationLogo className="w-20 h-auto" />
                    </div>
                </div>
                <h1 className="text-[28px] font-extrabold text-gray-900 mb-2 tracking-tight">Lupa Kata Sandi</h1>
                <p className="text-[14px] text-gray-500 leading-relaxed px-4">
                    Tidak masalah. Beritahu kami email Anda dan kami akan mengirimkan tautan atur ulang kata sandi.
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
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                       
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="pt-4">
                    <PrimaryButton className="w-full justify-center py-3.5 rounded-xl text-[15px] font-semibold tracking-wide bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.4)] hover:shadow-[0_10px_25px_-6px_rgba(59,130,246,0.5)] border-0" disabled={processing}>
                        {processing ? (
                            <span className="flex items-center gap-2">
                                
                                Mengirim...
                            </span>
                        ) : (
                            'Kirim'
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
