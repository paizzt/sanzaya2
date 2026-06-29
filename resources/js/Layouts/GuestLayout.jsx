import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-50">
            <div className="w-full sm:max-w-md mt-6 px-8 py-10 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden sm:rounded-3xl border border-gray-100">
                {children}
            </div>
        </div>
    );
}
