import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import { User, Lock, UserMinus } from 'lucide-react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengaturan Akun</h2>}
        >
            <Head title="Pengaturan" />

            <div className="pb-6 pt-0 space-y-6 max-w-4xl mx-auto">
                
                {/* Profile Information Section */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Informasi Profil</h3>
                                <p className="text-sm text-gray-500">Perbarui nama dan alamat email akun Anda.</p>
                            </div>
                        </div>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                </div>

                {/* Update Password Section */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Ubah Kata Sandi</h3>
                                <p className="text-sm text-gray-500">Pastikan akun Anda menggunakan kata sandi yang panjang dan acak untuk menjaga keamanan.</p>
                            </div>
                        </div>
                        <UpdatePasswordForm />
                    </div>
                </div>

                {/* Delete Account Section */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-red-50 pb-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                                <UserMinus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-600">Hapus Akun</h3>
                                <p className="text-sm text-red-400">Setelah dihapus, semua data akan hilang secara permanen.</p>
                            </div>
                        </div>
                        <DeleteUserForm />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
