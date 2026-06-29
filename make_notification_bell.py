import os
import re

def rewrite_layout():
    filepath = 'resources/js/Layouts/AuthenticatedLayout.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add imports
    if "from '@headlessui/react'" not in content:
        content = content.replace("import { Link, usePage } from '@inertiajs/react';", "import { Link, usePage, router } from '@inertiajs/react';\nimport { Menu, Transition } from '@headlessui/react';\nimport { Fragment } from 'react';")
    else:
        content = content.replace("import { Link, usePage } from '@inertiajs/react';", "import { Link, usePage, router } from '@inertiajs/react';")

    # Renaming lucide Menu to LucideMenu if Menu from headlessui is used
    content = content.replace("import { Menu, X,", "import { Menu as LucideMenu, X,")
    content = content.replace("<Menu className=", "<LucideMenu className=")

    # Add CheckCircle to Lucide
    if "CheckCircle," not in content:
        content = content.replace("import { Menu as LucideMenu, X, Bell, User,", "import { Menu as LucideMenu, X, Bell, User, CheckCircle,")

    # 2. Add handlers inside the component
    handler_code = """    const { auth } = usePage().props;
    const notifications = auth?.notifications || [];
    const unreadCount = auth?.unread_count || 0;

    const markAsRead = (id) => {
        router.post(route('notifications.markRead', id), {}, { preserveScroll: true, preserveState: true });
    };

    const markAllAsRead = () => {
        router.post(route('notifications.markAllRead'), {}, { preserveScroll: true, preserveState: true });
    };
"""
    content = content.replace("const { url } = usePage();", "const { url } = usePage();\n" + handler_code)

    # 3. Replace the static bell with Menu dropdown
    static_bell = """                                <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>"""

    dropdown_bell = """                                <Menu as="div" className="relative">
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
                                </Menu>"""
    
    content = content.replace(static_bell, dropdown_bell)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("AuthenticatedLayout.jsx updated successfully.")

if __name__ == '__main__':
    rewrite_layout()
