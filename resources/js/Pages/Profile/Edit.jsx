import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import DownloadBarcodeForm from './Partials/DownloadBarcodeForm';
import UpdatePreferencesForm from './Partials/UpdatePreferencesForm';
import { User, Lock, UserMinus, QrCode, Sliders, Receipt } from 'lucide-react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengaturan Akun</h2>}
        >
            <Head title="Pengaturan" />

            <div className="pb-6 pt-0 space-y-6 w-full">
                
                {/* Row 1: Informasi Profil (Kiri) & Ubah Kata Sandi (Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Profile Information Section */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative flex flex-col">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Informasi Profil</h3>
                                        <p className="text-xs sm:text-sm text-gray-500">Perbarui nama dan username / email akun Anda.</p>
                                    </div>
                                </div>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Update Password Section */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative flex flex-col">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                        <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                        <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Ubah Kata Sandi</h3>
                                        <p className="text-xs sm:text-sm text-gray-500">Gunakan kata sandi yang kuat untuk menjaga keamanan akun.</p>
                                    </div>
                                </div>
                                <UpdatePasswordForm />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Barcode Tanda Tangan (Kiri) & Slip Gaji Saya (Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Download Barcode Section */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative flex flex-col">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                        <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                    <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Barcode Tanda Tangan</h3>
                                    <p className="text-xs sm:text-sm text-gray-500">Unduh Barcode (QR Code) unik untuk tanda tangan digital.</p>
                                </div>
                            </div>
                            <DownloadBarcodeForm user={auth.user} />
                        </div>
                    </div>

                    {/* Slip Gaji Section */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative flex flex-col">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                        <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                        <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Slip Gaji Saya</h3>
                                        <p className="text-xs sm:text-sm text-gray-500">Lihat dan unduh riwayat slip gaji bulanan Anda.</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">
                                    Akses rincian gaji pokok, tunjangan operasional, potongan, serta unduh dokumen slip gaji resmi Anda dalam format PDF.
                                </p>
                            </div>
                            <div>
                                <Link
                                    href={route('salaries.my-slip')}
                                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                                >
                                    <Receipt className="w-4 h-4" />
                                    Buka Slip Gaji
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Preferensi Tampilan (Kiri & Kanan di dalam kartu) */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                    <div className="p-5 sm:p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Preferensi Tampilan</h3>
                                <p className="text-xs sm:text-sm text-gray-500">Atur widget dan pintasan yang muncul di Beranda dan Navigasi Bawah.</p>
                            </div>
                        </div>
                        <UpdatePreferencesForm />
                    </div>
                </div>

                {/* Row 4: Hapus Akun */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                    <div className="p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                                <UserMinus className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Hapus Akun</h3>
                                <p className="text-xs sm:text-sm text-gray-500">Setelah akun Anda dihapus, semua data akan hilang permanen.</p>
                            </div>
                        </div>
                        <DeleteUserForm className="shrink-0" />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
