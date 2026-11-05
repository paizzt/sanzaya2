import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { LayoutDashboard, PanelBottom } from 'lucide-react';

export default function UpdatePreferencesForm({ className = '' }) {
    const user = usePage().props.auth.user;
    const defaultPreferences = {
        bottom_nav: ['dashboard', 'absensi', 'marketing', 'izin'],
        dashboard: ['attendance', 'marketing', "uc", "bhp"]
    };

    const currentPreferences = user.preferences || defaultPreferences;

    const { data, setData, patch, processing, recentlySuccessful } = useForm({
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

    const ALL_MENUS = [
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
        { key: 'Penggunaan Kendaraan', label: 'Penggunaan Kendaraan' },
        { key: 'Data Perusahaan', label: 'Data Perusahaan' },
        { key: 'Data Pengguna', label: 'Data Pengguna' },
        { key: 'Manajemen Gaji', label: 'Manajemen Gaji' },
        { key: 'Manajemen SOP', label: 'Manajemen SOP' },
        { key: 'Rekap Absensi', label: 'Rekap Absensi' },
        { key: 'Slip Gaji', label: 'Slip Gaji' },
        { key: 'Lapor WBS', label: 'Lapor WBS' },
        { key: 'Riwayat Perubahan', label: 'Riwayat Perubahan' },
        { key: 'Notifikasi', label: 'Notifikasi' },
        { key: 'Profil & Akun', label: 'Profil & Akun' },
        { key: 'Stok Gudang', label: 'Stok Gudang' },
        { key: 'Dashboard Laporan', label: 'Dashboard Laporan' },
        { key: 'Data Laporan Tersinkronisasi', label: 'Data Laporan Tersinkronisasi' },
        { key: 'Laporan WBS', label: 'Laporan WBS' },
    ];

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Kolom Kiri: Pintasan Navigasi Bawah (Mobile) */}
                    <div className="bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-100">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-1.5">
                            <PanelBottom className="w-5 h-5 text-sky-500 shrink-0" /> Pintasan Navigasi Bawah (Mobile)
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">Pilih menu pintasan cepat di bagian bawah layar HP Anda (Maksimal 4 Menu).</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 h-64 overflow-y-auto pr-1.5 custom-scrollbar">
                            {ALL_MENUS.map(opt => {
                                const isChecked = data.preferences.bottom_nav.includes(opt.key) || 
                                    (opt.key === 'Dashboard' && data.preferences.bottom_nav.includes('dashboard')) ||
                                    (opt.key === 'Ambil Absensi' && data.preferences.bottom_nav.includes('absensi')) ||
                                    (opt.key === 'Form Marketing' && data.preferences.bottom_nav.includes('marketing')) ||
                                    (opt.key === 'Izin/Sakit' && data.preferences.bottom_nav.includes('izin'));
                                
                                const isDisabled = !isChecked && (data.preferences.bottom_nav.length >= 4);

                                return (
                                    <label key={opt.key} className={`flex items-center p-3 border rounded-xl transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-100/60' : 'border-gray-200 bg-white cursor-pointer hover:border-sky-300 hover:bg-sky-50/40'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-sky-500 shadow-sm focus:ring-sky-400 mr-3 disabled:opacity-50 shrink-0"
                                            checked={isChecked}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                const current = data.preferences.bottom_nav;
                                                const currentClean = current.filter(k => !['dashboard', 'absensi', 'marketing', 'izin'].includes(k) || (k === 'dashboard' && opt.key !== 'Dashboard') || (k === 'absensi' && opt.key !== 'Ambil Absensi') || (k === 'marketing' && opt.key !== 'Form Marketing') || (k === 'izin' && opt.key !== 'Izin/Sakit'));
                                                
                                                const updated = e.target.checked 
                                                    ? [...currentClean, opt.key] 
                                                    : currentClean.filter(k => k !== opt.key);
                                                setData('preferences', { ...data.preferences, bottom_nav: updated });
                                            }}
                                        />
                                        <span className="text-sm font-medium text-gray-700 leading-tight">{opt.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Kolom Kanan: Widget Dashboard Beranda */}
                    <div className="bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-100">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-1.5">
                            <LayoutDashboard className="w-5 h-5 text-sky-500 shrink-0" /> Widget Dashboard Beranda
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">Pilih kotak informasi atau pintasan di bagian atas halaman beranda (Maksimal 10 Menu).</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 h-64 overflow-y-auto pr-1.5 custom-scrollbar">
                            {ALL_MENUS.map(opt => {
                                const isChecked = data.preferences.dashboard.includes(opt.key) || 
                                    (opt.key === 'Ambil Absensi' && data.preferences.dashboard.includes('attendance')) ||
                                    (opt.key === 'Form Marketing' && data.preferences.dashboard.includes('marketing')) ||
                                    (opt.key === 'Form UC' && data.preferences.dashboard.includes('uc')) ||
                                    (opt.key === 'Input BHP' && data.preferences.dashboard.includes('bhp'));
                                
                                const isDisabled = !isChecked && (data.preferences.dashboard.length >= 10);

                                return (
                                    <label key={opt.key} className={`flex items-center p-3 border rounded-xl transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-100/60' : 'border-gray-200 bg-white cursor-pointer hover:border-sky-300 hover:bg-sky-50/40'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-sky-500 shadow-sm focus:ring-sky-400 mr-3 disabled:opacity-50 shrink-0"
                                            checked={isChecked}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                const current = data.preferences.dashboard;
                                                const currentClean = current.filter(k => !['attendance', 'marketing', 'uc', 'bhp'].includes(k) || (k === 'attendance' && opt.key !== 'Ambil Absensi') || (k === 'marketing' && opt.key !== 'Form Marketing') || (k === 'uc' && opt.key !== 'Form UC') || (k === 'bhp' && opt.key !== 'Input BHP'));
                                                
                                                const updated = e.target.checked 
                                                    ? [...currentClean, opt.key] 
                                                    : currentClean.filter(k => k !== opt.key);
                                                setData('preferences', { ...data.preferences, dashboard: updated });
                                            }}
                                        />
                                        <span className="text-sm font-medium text-gray-700 leading-tight">{opt.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                        Simpan
                    </button>

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
