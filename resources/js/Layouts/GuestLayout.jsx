import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center p-4 sm:p-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[100px] mix-blend-multiply"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-400/10 blur-[100px] mix-blend-multiply"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-sky-300/10 blur-[120px] mix-blend-multiply"></div>
            </div>

            <div className="w-full sm:max-w-[420px] p-8 sm:p-10 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] border border-white/60 relative z-10 transition-all duration-500 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)]">
                {children}
            </div>
        </div>
    );
}
