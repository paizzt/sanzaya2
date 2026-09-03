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
        { key: 'Dashboard', label: 'Dashboard' },
        { key: 'Ambil Absensi', label: 'Ambil Absensi' },
        { key: 'Izin/Sakit', label: 'Izin/Sakit' },
        { key: 'Form Marketing', label: 'Form Marketing' },
        { key: 'Rekap Marketing', label: 'Rekap Marketing' },
        { key: 'Cari Produk', label: 'Cari Produk' },
        { key: 'Form UC', label: 'Form UC' },
        { key: 'Riwayat UC', label: 'Riwayat UC' },
        { key: 'Persetujuan UC', label: 'Persetujuan UC' },
        { key: 'Input BHP', label: 'Input BHP' },
        { key: 'Rekap BHP', label: 'Rekap BHP' },
        { key: 'Pengajuan Pembayaran', label: 'Pengajuan Pembayaran' },
        { key: 'Data Hutang', label: 'Data Hutang' },
        { key: 'Data Piutang', label: 'Data Piutang' },
        { key: 'Persetujuan Pembayaran', label: 'Persetujuan Pembayaran' },
        { key: 'Laporan Logistik', label: 'Laporan Logistik' },
        { key: 'Surat Pesanan', label: 'Surat Pesanan' },
        { key: 'Data Penyedia', label: 'Data Penyedia' },
        { key: 'Data Produk', label: 'Data Produk' },
        { key: 'Kebutuhan Barang', label: 'Kebutuhan Barang' },
        { key: 'Data Outlet', label: 'Data Outlet' },
        { key: 'Pemetaan Outlet', label: 'Pemetaan Outlet' },
        { key: 'Data Armada', label: 'Data Armada' },
        { key: 'Data Perusahaan', label: 'Data Perusahaan' },
        { key: 'Data Pengguna', label: 'Data Pengguna' },
        { key: 'Manajemen SOP', label: 'Manajemen SOP' },
        { key: 'Rekap Absensi', label: 'Rekap Absensi' },
        { key: 'Riwayat Perubahan', label: 'Riwayat Perubahan' },
        { key: 'Notifikasi', label: 'Notifikasi' },
        { key: 'Profil & Akun', label: 'Profil & Akun' },
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
                        <PanelBottom className="w-5 h-5 text-blue-500" /> Pintasan Navigasi Bawah (Mobile)
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Pilih menu apa saja yang ingin ditampilkan sebagai pintasan cepat di bagian bawah layar HP Anda (Maksimal 4 Menu).</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {bottomNavOptions.map(opt => {
                            // Support migrated keys just for the UI state
                            const isChecked = data.preferences.bottom_nav.includes(opt.key) || 
                                (opt.key === 'Dashboard' && data.preferences.bottom_nav.includes('dashboard')) ||
                                (opt.key === 'Ambil Absensi' && data.preferences.bottom_nav.includes('absensi')) ||
                                (opt.key === 'Form Marketing' && data.preferences.bottom_nav.includes('marketing')) ||
                                (opt.key === 'Izin/Sakit' && data.preferences.bottom_nav.includes('izin'));
                            
                            const isDisabled = !isChecked && (data.preferences.bottom_nav.length >= 4);

                            return (
                                <label key={opt.key} className={`flex items-center p-3 border rounded-xl transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : 'border-gray-200 cursor-pointer hover:bg-gray-50'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 mr-3 disabled:opacity-50"
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={(e) => {
                                            const current = data.preferences.bottom_nav;
                                            // Ensure we remove old keys as well if they exist
                                            const currentClean = current.filter(k => !['dashboard', 'absensi', 'marketing', 'izin'].includes(k) || (k === 'dashboard' && opt.key !== 'Dashboard') || (k === 'absensi' && opt.key !== 'Ambil Absensi') || (k === 'marketing' && opt.key !== 'Form Marketing') || (k === 'izin' && opt.key !== 'Izin/Sakit'));
                                            
                                            const updated = e.target.checked 
                                                ? [...currentClean, opt.key] 
                                                : currentClean.filter(k => k !== opt.key);
                                            setData('preferences', { ...data.preferences, bottom_nav: updated });
                                        }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                        <LayoutDashboard className="w-5 h-5 text-blue-500" /> Widget Dashboard Beranda
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
