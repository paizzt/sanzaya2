import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Menu as LucideMenu, X, Bell, User, CheckCircle, ChevronDown, LogOut, LayoutDashboard, Settings, FileText, Camera, Users, ChevronLeft, ChevronRight, Briefcase, PlaneTakeoff, ShoppingCart, Database, Store, BarChart2, ClipboardList, FileCheck, Clock, TrendingUp, Truck, Package, Wallet, CreditCard, Building } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const SidebarItem = ({ item, sidebarCollapsed, setSidebarCollapsed }) => {
    const [isOpen, setIsOpen] = useState(item.active || (item.children && item.children.some(c => c.active)));

    useEffect(() => {
        if ((item.active || (item.children && item.children.some(c => c.active))) && !sidebarCollapsed) setIsOpen(true);
    }, [item.active, item.children, sidebarCollapsed]);

    if (!item.children) {
        return (
            <Link
                href={item.href}
                title={sidebarCollapsed ? item.name : ''}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 ${item.active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.active && sidebarCollapsed ? 'animate-bounce' : ''}`} />
                {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-sm">{item.name}</span>}
            </Link>
        );
    }

    const activeChild = item.children.some(c => c.active);

    return (
        <div className="flex flex-col">
            <button
                onClick={() => {
                    if (sidebarCollapsed) setSidebarCollapsed(false);
                    setIsOpen(!isOpen);
                }}
                title={sidebarCollapsed ? item.name : ''}
                className={`flex justify-between items-center ${sidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all duration-200 ${activeChild || item.active ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${(activeChild || item.active) && sidebarCollapsed ? 'text-blue-600 animate-pulse' : ''}`} />
                    {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-sm">{item.name}</span>}
                </div>
                {!sidebarCollapsed && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${isOpen && !sidebarCollapsed ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1 pl-11 pr-2 py-1">
                    {item.children.filter(c => c.show !== false).map(child => (
                        <Link
                            key={child.name}
                            href={child.href}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${child.active ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            {child.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

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
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: url === '/dashboard', show: auth.active_features?.includes(15) },
        { 
            name: 'Absensi', icon: Camera, show: auth.active_features?.includes(2), 
            active: url.startsWith('/absensi'),
            children: [
                { name: 'Ambil Absensi', href: route('absensi.index'), active: url === '/absensi' },
                { name: 'Rekap Absensi', href: route('absensi.rekap'), active: url.startsWith('/absensi/rekap') },
                { name: 'Izin/Sakit', href: route('absensi.pengajuan'), active: url.startsWith('/absensi/pengajuan') },
            ]
        },
        { 
            name: 'Marketing', icon: Briefcase, show: auth.active_features?.includes(3) || auth.active_features?.includes(10),
            active: url.startsWith('/marketing'),
            children: [
                { name: 'Form Marketing', href: route('marketing.index'), active: url === '/marketing', show: auth.active_features?.includes(3) },
                { name: 'Rekap Marketing', href: route('marketing.recap.index'), active: url.startsWith('/marketing/recap-all'), show: auth.active_features?.includes(10) },
            ]
        },
        {
            name: 'Up Country (UC)', icon: PlaneTakeoff, show: auth.active_features?.includes(4) || auth.active_features?.includes(8),
            active: url.startsWith('/requests/uc'),
            children: [
                { name: 'Form UC', href: route('requests.uc.index'), active: url.startsWith('/requests/uc') && !url.startsWith('/requests/uc-approval') && !url.startsWith('/requests/uc-history'), show: auth.active_features?.includes(4) },
                { name: 'Riwayat UC', href: route('requests.uc.history'), active: url.startsWith('/requests/uc-history'), show: auth.active_features?.includes(4) },
                { name: 'Persetujuan UC', href: route('requests.uc.approval.index'), active: url.startsWith('/requests/uc-approval'), show: auth.active_features?.includes(8) },
            ]
        },
        {
            name: 'Form BHP', icon: ShoppingCart, show: auth.active_features?.includes(5),
            active: url.startsWith('/requests/bhp'),
            children: [
                { name: 'Input BHP', href: route('requests.bhp.index'), active: url.startsWith('/requests/bhp') && !url.startsWith('/requests/bhp-recap') },
                { name: 'Rekap BHP', href: route('requests.bhp.recap.index'), active: url.startsWith('/requests/bhp-recap') },
            ]
        },
        {
            name: 'Laporan & Data', icon: BarChart2, show: true,
            active: url.startsWith('/reports') || url.startsWith('/logistic-reports') || url.startsWith('/purchase-orders') || url.startsWith('/receivables') || url.startsWith('/payables'),
            children: [
                { name: 'Dashboard Laporan', href: route('reports.index'), active: url.startsWith('/reports'), show: auth.active_features?.includes(7) },
                { name: 'Laporan Logistik', href: route('logistic-reports.index'), active: url.startsWith('/logistic-reports') },
                { name: 'Surat Pesanan', href: route('purchase-orders.index'), active: url.startsWith('/purchase-orders') },
                { name: 'Data Piutang', href: route('receivables.index'), active: url.startsWith('/receivables') },
                { name: 'Data Hutang', href: route('payables.index'), active: url.startsWith('/payables') },
            ]
        },
        {
            name: 'Master Data', icon: Database, show: true,
            active: url.startsWith('/outlets') || url.startsWith('/item-requirements') || url.startsWith('/vehicles') || url.startsWith('/providers') || url.startsWith('/users') || url.startsWith('/company'),
            children: [
                { name: 'Data Perusahaan', href: route('company.index'), active: url.startsWith('/company'), show: true },
                { name: 'Data Outlet', href: route('outlets.index'), active: url.startsWith('/outlets'), show: auth.active_features?.includes(9) },
                { name: 'Kebutuhan Barang', href: route('item-requirements.index'), active: url.startsWith('/item-requirements') },
                { name: 'Data Armada', href: route('vehicles.index'), active: url.startsWith('/vehicles'), show: auth.active_features?.includes(11) },
                { name: 'Data Penyedia', href: route('providers.index'), active: url.startsWith('/providers'), show: auth.active_features?.includes(12) },
                { name: 'Pengguna', href: route('users.index'), active: url.startsWith('/users'), show: auth.active_features?.includes(6) },
            ]
        },
        {
            name: 'Sistem', icon: Settings, show: true,
            active: url.startsWith('/spreadsheet') || url.startsWith('/settings') || url.startsWith('/profile'),
            children: [
                { name: 'Sync Spreadsheet', href: route('spreadsheet.index'), active: url.startsWith('/spreadsheet'), show: auth.active_features?.includes(1) },
                { name: 'Notifikasi', href: route('notifications.index'), active: url.startsWith('/settings/notifications'), show: auth.active_features?.includes(13) },
                { name: 'Profil & Akun', href: route('profile.edit'), active: url.startsWith('/profile'), show: auth.active_features?.includes(14) },
            ]
        }
    ].filter(item => item.show !== false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)] fixed h-full z-20 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="p-6 flex items-center justify-center h-28 border-b border-gray-50 mb-2">
                    <Link href={route('dashboard')} className={`relative flex items-center justify-center bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/80 hover:shadow-[0_4px_15px_-3px_rgba(6,81,237,0.15)] hover:border-blue-100 transition-all duration-300 group overflow-hidden ${sidebarCollapsed ? 'w-12 h-12 p-2' : 'w-full h-16 p-2'}`}>
                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {auth.user?.company?.logo ? (
                            <img 
                                src={`/storage/${auth.user.company.logo}`} 
                                alt={auth.user.company.name}
                                className={`relative z-10 h-full w-full object-contain transition-all duration-300 ${sidebarCollapsed ? 'scale-90' : 'px-2'}`} 
                            />
                        ) : (
                            <ApplicationLogo className={`relative z-10 transition-all duration-300 ${sidebarCollapsed ? 'w-8 h-8' : 'w-28 h-auto'}`} />
                        )}
                    </Link>
                </div>
                <div className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <SidebarItem key={item.name} item={item} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
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
            <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
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
                                <Link href={route("dashboard")} className="ml-3 relative flex items-center justify-center bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(6,81,237,0.1)] border border-gray-100 p-1.5 h-10 w-24">
                                    {auth.user?.company?.logo ? (
                                        <img 
                                            src={`/storage/${auth.user.company.logo}`} 
                                            alt={auth.user.company.name}
                                            className="w-full h-full object-contain" 
                                        />
                                    ) : (
                                        <ApplicationLogo className="w-full h-full object-contain" />
                                    )}
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
                                        <Menu.Items className="absolute right-0 z-50 mt-2 w-[280px] sm:w-80 origin-top-right rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
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
                            <div className="flex-1 flex justify-center w-full px-2">
                                <Link href={route("dashboard")} className="relative flex items-center justify-center bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-2 h-16 w-full max-w-[200px]">
                                    {auth.user?.company?.logo ? (
                                        <img 
                                            src={`/storage/${auth.user.company.logo}`} 
                                            alt={auth.user.company.name}
                                            className="w-full h-full object-contain px-2" 
                                        />
                                    ) : (
                                        <ApplicationLogo className="w-24 h-auto" />
                                    )}
                                </Link>
                            </div>
                            <button onClick={() => setShowingNavigationDropdown(false)} className="absolute right-6 p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                            {navItems.map((item) => (
                                <SidebarItem key={item.name} item={item} sidebarCollapsed={false} setSidebarCollapsed={() => {}} />
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

                <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 lg:pt-4 pb-4 sm:pb-6 lg:pb-8 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            
            {/* Bottom Navigation for Mobile */}
            <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe z-50 flex justify-around p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {[
                    { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: url === '/dashboard', show: auth.active_features?.includes(15) },
                    { name: 'Absensi', href: route('absensi.index'), icon: Camera, active: url === '/absensi', show: auth.active_features?.includes(2) },
                    { name: 'Marketing', href: route('marketing.index'), icon: Briefcase, active: url.startsWith('/marketing'), show: auth.active_features?.includes(3) },
                    { name: 'Izin/Sakit', href: route('absensi.pengajuan'), icon: FileText, active: url.startsWith('/absensi/pengajuan'), show: auth.active_features?.includes(2) },
                ].filter(item => item.show).map((item) => (
                    <Link key={item.name} href={item.href} className={`flex flex-col items-center p-2 rounded-xl ${item.active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                        <item.icon className={`w-6 h-6 mb-1 ${item.active ? 'animate-bounce' : ''}`} />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
