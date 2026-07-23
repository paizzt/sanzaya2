import React, { useState, useEffect } from 'react';
import { Download, X, Share, MoreVertical, MonitorSmartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        // Cek apakah aplikasi sudah diinstal
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) {
            return;
        }

        // Cek apakah user pernah menutup pop-up ini
        const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
        if (hasDismissed) {
            return;
        }

        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isAndroidDevice = /android/.test(userAgent);
        
        setIsIOS(isIosDevice);
        setIsAndroid(isAndroidDevice);

        let timer;
        // Hanya tampilkan otomatis jika perangkat adalah mobile (Android / iOS)
        if (isIosDevice || isAndroidDevice) {
            timer = setTimeout(() => {
                setShowPrompt(true);
                // Langsung simpan di localStorage agar tidak muncul lagi saat di-refresh/dibuka lagi
                localStorage.setItem('pwa_prompt_dismissed', 'true');
            }, 1500);
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true); // Pastikan muncul jika event tertangkap
            // Langsung simpan di localStorage agar tidak muncul lagi saat di-refresh/dibuka lagi
            localStorage.setItem('pwa_prompt_dismissed', 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isIOS && !isAndroid) return null;
    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[400px] bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 z-[100] transition-all duration-500 ease-out" style={{ animation: 'slideUp 0.5s ease-out' }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            
            <button 
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Download className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">Install Aplikasi Sanzaya</h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4 leading-relaxed">
                        Dapatkan akses lebih cepat dan ringan langsung dari layar utama perangkat Anda.
                    </p>
                    
                    {deferredPrompt ? (
                        <button 
                            onClick={handleInstallClick}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                            Install Sekarang
                        </button>
                    ) : isIOS ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2 border border-gray-100">
                            <div className="mt-0.5"><Share className="w-4 h-4 text-gray-500" /></div>
                            <div>
                                Tap tombol <strong>Share</strong> di bawah layar, lalu pilih <strong>"Add to Home Screen"</strong>
                            </div>
                        </div>
                    ) : isAndroid ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2 border border-gray-100">
                            <div className="mt-0.5"><MoreVertical className="w-4 h-4 text-gray-500" /></div>
                            <div>
                                Tap tombol <strong>Titik Tiga</strong> di pojok kanan atas browser, lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2 border border-gray-100">
                            <div className="mt-0.5"><MonitorSmartphone className="w-4 h-4 text-gray-500" /></div>
                            <div>
                                Klik icon <strong>Install (⬇️)</strong> di sebelah kanan address bar browser Anda untuk menginstall.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}