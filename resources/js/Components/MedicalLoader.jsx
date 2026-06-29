import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function MedicalLoader() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let timeoutId;
        
        const start = () => {
            setIsLoading(true);
        };
        
        const finish = () => {
            timeoutId = setTimeout(() => {
                setIsLoading(false);
            }, 400); // 400ms delay to ensure the animation shows nicely
        };

        const unsubscribeStart = router.on('start', start);
        const unsubscribeFinish = router.on('finish', finish);
        // Inertia 'navigate' or 'success' also means finish
        
        return () => {
            clearTimeout(timeoutId);
            unsubscribeStart();
            unsubscribeFinish();
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="loading-svg">
                <svg width="64px" height="48px" viewBox="0 0 64 48">
                    <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back" />
                    <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front" />
                </svg>
            </div>
        </div>
    );
}
