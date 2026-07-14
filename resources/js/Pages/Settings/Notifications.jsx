import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BellRing, Key, Save, Clock, CalendarDays } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Notifications({ setting }) {
    const { data, setData, post, processing, errors } = useForm({
        morning_reminder_time: setting?.morning_reminder_time || '08:00',
        evening_reminder_time: setting?.evening_reminder_time || '17:00',
        marketing_report_time: setting?.marketing_report_time || '17:30',
        days_active: setting?.days_active || '1,2,3,4,5',
    });

    const { post: postVapid, processing: vapidProcessing } = useForm({});
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-2xl' }
            });
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('notifications.store'), { preserveScroll: true });
    };

    const handleGenerateVapid = () => {
        Swal.fire({
            title: 'Generate VAPID Keys?',
            text: "Ini akan mereset Key sebelumnya. Lanjutkan jika Anda belum memilikinya atau ingin mereset.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Generate',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                postVapid(route('notifications.vapid'));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengaturan Notifikasi Push</h2>}
        >
            <Head title="Pengaturan Notifikasi" />

            <div className="pb-6 pt-0 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* VAPID Status */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                                <Key className="text-orange-500 w-5 h-5" /> VAPID Keys Status
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">Web Push membutuhkan VAPID Keys agar browser mengizinkan notifikasi.</p>
                            
                            {setting?.vapid_public_key ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
                                    <p className="text-emerald-700 font-bold text-sm">VAPID Keys Active</p>
                                    <p className="text-xs text-emerald-600 truncate">{setting.vapid_public_key}</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
                                    <p className="text-red-700 font-bold text-sm">VAPID Keys belum diatur</p>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleGenerateVapid}
                            disabled={vapidProcessing}
                            className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Key className="w-4 h-4" /> Generate VAPID Keys Baru
                        </button>
                    </div>

                    {/* Subscription Note */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
                        <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                            <BellRing className="w-6 h-6" /> Notifikasi Karyawan
                        </h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                            Saat pengguna login, browser akan secara otomatis meminta izin untuk mengirimkan notifikasi. 
                            Pastikan pengaturan jam di bawah sudah sesuai. Notifikasi akan dikirim otomatis oleh sistem (Cron Job).
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                        <Clock className="text-blue-600 w-5 h-5" />
                        Jadwal Pengingat Notifikasi
                    </h3>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <InputLabel value="Jam Pengingat Pagi (Absensi Hadir)" />
                                <TextInput 
                                    type="time"
                                    className="mt-1 block w-full text-center" 
                                    value={data.morning_reminder_time}
                                    onChange={(e) => setData('morning_reminder_time', e.target.value)}
                                />
                                <InputError message={errors.morning_reminder_time} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Jam Pengingat Sore (Absensi Pulang)" />
                                <TextInput 
                                    type="time"
                                    className="mt-1 block w-full text-center" 
                                    value={data.evening_reminder_time}
                                    onChange={(e) => setData('evening_reminder_time', e.target.value)}
                                />
                                <InputError message={errors.evening_reminder_time} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Jam Laporan Marketing" />
                                <TextInput 
                                    type="time"
                                    className="mt-1 block w-full text-center" 
                                    value={data.marketing_report_time}
                                    onChange={(e) => setData('marketing_report_time', e.target.value)}
                                />
                                <InputError message={errors.marketing_report_time} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Hari Aktif Notifikasi (1=Senin, 7=Minggu)" className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-gray-400"/> Pisahkan dengan koma</InputLabel>
                            <TextInput 
                                className="mt-1 block w-full md:w-1/2" 
                                placeholder="Contoh: 1,2,3,4,5"
                                value={data.days_active}
                                onChange={(e) => setData('days_active', e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-1">Default: 1,2,3,4,5 (Senin sampai Jumat)</p>
                            <InputError message={errors.days_active} className="mt-2" />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <PrimaryButton disabled={processing} className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 text-sm">
                                <Save className="w-4 h-4" /> Simpan Jadwal
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
