import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Menu as LucideMenu, X, Bell, User, CheckCircle, ChevronDown, LogOut, LayoutDashboard, Settings, FileText, Camera, Users, ChevronLeft, ChevronRight, Briefcase, PlaneTakeoff, ShoppingCart, Database, Store, BarChart2, ClipboardList, FileCheck, Clock, TrendingUp, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { url } = usePage();
    const { auth } = usePage().props;
    const notifications = auth?.notifications || [];
    const unreadCount = auth?.unread_count || 0;

    const markAsRead = (id) => {
        router.post(route('notifications.markRead', id), {}, { preserveScroll: true, preserveState: true });
    };

    const markAllAsRead = () => {
        router.post(route('notifications.markAllRead'), {}, { preserveScroll: true, preserveState: true });
    };


    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    if (!subscription) {
                        subscribeUser(registration);
                    }
                });
            }).catch(err => console.log('Service Worker not ready:', err));
        }
    }, []);

    const subscribeUser = async (registration) => {
        try {
            const response = await axios.get('/settings/vapid-public-key');
            if (!response.data.publicKey) return;
            const applicationServerKey = urlB64ToUint8Array(response.data.publicKey);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });
            await axios.post('/settings/push-subscription', subscription);
            console.log('User is subscribed.');
        } catch (err) {
            console.log('Failed to subscribe the user: ', err);
        }
    };

    const urlB64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };


    const handleLogout = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Keluar Aplikasi?',
            text: "Apakah Anda yakin ingin mengakhiri sesi ini?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('logout'));
            }
        });
    };

    const navItems = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: url === '/dashboard', show: true },
        { name: 'Absensi', href: route('absensi.index'), icon: Camera, active: url === '/absensi', show: auth.active_features?.includes(2) },
        { name: 'Rekap Absensi', href: route('absensi.rekap'), icon: ClipboardList, active: url.startsWith('/absensi/rekap'), show: auth.active_features?.includes(2) },
        { name: 'Izin/Sakit', href: route('absensi.pengajuan'), icon: FileText, active: url.startsWith('/absensi/pengajuan'), show: auth.active_features?.includes(2) },
        { name: 'Marketing', href: route('marketing.index'), icon: Briefcase, active: url.startsWith('/marketing'), show: auth.active_features?.includes(3) },
        { name: 'Data Outlet', href: route('outlets.index'), icon: Store, active: url.startsWith('/outlets'), show: auth.active_features?.includes(3) },
        { name: 'Dashboard Laporan', href: route('reports.index'), icon: BarChart2, active: url.startsWith('/reports'), show: auth.active_features?.includes(7) },
        { name: 'Form UC', href: route('requests.uc.index'), icon: PlaneTakeoff, active: url.startsWith('/requests/uc') && !url.startsWith('/requests/uc-approval') && !url.startsWith('/requests/uc-history'), show: auth.active_features?.includes(4) },
        { name: 'Riwayat & Result UC', href: route('requests.uc.history'), icon: FileCheck, active: url.startsWith('/requests/uc-history'), show: auth.active_features?.includes(4) },
        { name: 'Persetujuan UC', href: route('requests.uc.approval.index'), icon: CheckCircle, active: url.startsWith('/requests/uc-approval'), show: auth.active_features?.includes(8) },
        { name: 'Form BHP', href: route('requests.bhp.index'), icon: ShoppingCart, active: url.startsWith('/requests/bhp') && !url.startsWith('/requests/bhp-recap'), show: auth.active_features?.includes(5) },
        { name: 'Rekap BHP', href: route('requests.bhp.recap.index'), icon: ClipboardList, active: url.startsWith('/requests/bhp-recap'), show: auth.active_features?.includes(5) },
        { name: 'Rekap Semua Marketing', href: route('marketing.recap.index'), icon: Users, active: url.startsWith('/marketing/recap-all'), show: auth.active_features?.includes(3) && (auth.user?.roles?.some(r => r && ['Superadmin', 'Admin', 'Manager', 'Direktur'].includes(r.name || r))) },
        { name: 'Sync Spreadsheet', href: route('spreadsheet.index'), icon: Database, active: url.startsWith('/spreadsheet'), show: auth.active_features?.includes(1) },
        { name: 'Notifikasi', href: route('notifications.index'), icon: Bell, active: url.startsWith('/settings/notifications'), show: true },
        { name: 'Pengguna', href: route('users.index'), icon: Users, active: url.startsWith('/users'), show: auth.active_features?.includes(6) },
        { name: 'Data Armada', href: route('vehicles.index'), icon: Truck, active: url.startsWith('/vehicles'), show: true },
        { name: 'Data Penyedia', href: route('providers.index'), icon: Store, active: url.startsWith('/providers'), show: true },
        { name: 'Pengaturan', href: route('profile.edit'), icon: Settings, active: url.startsWith('/profile'), show: true },
    ].filter(item => item.show);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)] fixed h-full z-20 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="p-6 flex items-center justify-center h-24">
                    <Link href={route('dashboard')}>
                        <ApplicationLogo className={`h-auto flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-10' : 'w-28'}`} />
                    </Link>
                </div>
                <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={sidebarCollapsed ? item.name : ''}
                            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 ${item.active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${item.active && sidebarCollapsed ? 'animate-bounce' : ''}`} />
                            {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                        </Link>
                    ))}
                </div>
                
                {/* Collapse Toggle Button */}
                <div className="p-4 border-t border-gray-50 flex justify-end">
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center ${sidebarCollapsed ? 'w-full' : ''}`}
                        title={sidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                {/* Topbar */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 shadow-sm transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center lg:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition duration-150 ease-in-out"
                                >
                                    {showingNavigationDropdown ? <X className="w-6 h-6" /> : <LucideMenu className="w-6 h-6" />}
                                </button>
                                <Link href={route("dashboard")} className="ml-3">
                                    <ApplicationLogo className="w-20 h-auto" />
                                </Link>
                            </div>

                            <div className="flex items-center ml-auto gap-4">
                                <Menu as="div" className="relative">
                                    <Menu.Button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 focus:outline-none">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[10px] text-white font-bold">
                                                
                                            </span>
                                        )}
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                                <h3 className="text-sm font-bold text-gray-800">Notifikasi ({unreadCount})</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                                        Tandai Semua Dibaca
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-sm text-gray-500">
                                                        Tidak ada notifikasi baru.
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <Menu.Item key={notif.id}>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => markAsRead(notif.id)}
                                                                    className={`${active ? 'bg-gray-50' : ''} flex w-full flex-col gap-1 p-4 border-b border-gray-50 text-left transition-colors`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                                                        <span className="text-sm font-bold text-gray-800">{notif.data.title || 'Pemberitahuan'}</span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 ml-4">{notif.data.message}</p>
                                                                    <span className="text-[10px] text-gray-400 ml-4 mt-1">Baru saja</span>
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    ))
                                                )}
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                                
                                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                                <div className="flex items-center gap-3 cursor-pointer group">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                                        <p className="text-xs text-gray-500">Superadmin</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-white shadow-sm font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50" title="Keluar">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu */}
                <div className={`lg:hidden fixed inset-0 z-20 transform transition-transform duration-300 ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowingNavigationDropdown(false)}></div>
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
                        <div className="p-6 flex items-center border-b border-gray-100 relative h-24">
                            <div className="flex-1 flex justify-center">
                                <Link href={route("dashboard")}>
                                    <ApplicationLogo className="w-28 h-auto" />
                                </Link>
                            </div>
                            <button onClick={() => setShowingNavigationDropdown(false)} className="absolute right-6 p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </aside>
                </div>

                {header && (
                    <div className="bg-white/50 border-b border-gray-100/50 backdrop-blur-sm transition-all duration-300">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </div>
                )}

                <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            
            {/* Bottom Navigation for Mobile */}
            <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe z-10 flex justify-around p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {navItems.slice(0, 4).map((item) => (
                    <Link key={item.name} href={item.href} className={`flex flex-col items-center p-2 rounded-xl ${item.active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                        <item.icon className={`w-6 h-6 mb-1 ${item.active ? 'animate-bounce' : ''}`} />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
