import { useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { LayoutDashboard, PanelBottom } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UpdatePreferencesForm({ className = '' }) {
    const user = usePage().props.auth.user;
    const defaultPreferences = {
        bottom_nav: ['dashboard', 'absensi', 'marketing', 'izin'],
        dashboard: ['attendance', 'marketing', "uc", "bhp"]
    };

    const currentPreferences = user.preferences || defaultPreferences;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        preferences: {
            bottom_nav: currentPreferences.bottom_nav || defaultPreferences.bottom_nav,
            dashboard: currentPreferences.dashboard || defaultPreferences.dashboard,
        }
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const toggleBottomNav = (key) => {
        const current = data.preferences.bottom_nav;
        const updated = current.includes(key) 
            ? current.filter(k => k !== key)
            : [...current, key];
        setData('preferences', { ...data.preferences, bottom_nav: updated });
    };

    const toggleDashboard = (key) => {
        const current = data.preferences.dashboard;
        const updated = current.includes(key) 
            ? current.filter(k => k !== key)
            : [...current, key];
        setData('preferences', { ...data.preferences, dashboard: updated });
    };

    const bottomNavOptions = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'absensi', label: 'Absensi' },
        { key: 'marketing', label: 'Marketing' },
        { key: 'izin', label: 'Izin/Sakit' },
    ];

    const dashboardOptions = [
        { key: 'attendance', label: 'Absen (Hari Ini)' },
        { key: 'marketing', label: 'Kunjungan Sales' },
        { key: 'uc', label: 'Pengajuan UC' },
        { key: 'bhp', label: 'Pengajuan BHP' },
    ];

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                        <PanelBottom className="w-5 h-5 text-indigo-500" /> Pintasan Navigasi Bawah (Mobile)
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Pilih menu apa saja yang ingin ditampilkan sebagai pintasan cepat di bagian bawah layar HP Anda.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {bottomNavOptions.map(opt => (
                            <label key={opt.key} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 mr-3"
                                    checked={data.preferences.bottom_nav.includes(opt.key)}
                                    onChange={() => toggleBottomNav(opt.key)}
                                />
                                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                        <LayoutDashboard className="w-5 h-5 text-indigo-500" /> Widget Dashboard Beranda
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Pilih kotak informasi (widget) yang ingin ditampilkan di bagian atas halaman beranda.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {dashboardOptions.map(opt => (
                            <label key={opt.key} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 mr-3"
                                    checked={data.preferences.dashboard.includes(opt.key)}
                                    onChange={() => toggleDashboard(opt.key)}
                                />
                                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <PrimaryButton disabled={processing}>Simpan Preferensi</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 font-semibold">Berhasil disimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
