import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Rekap(props) {
    console.log("Rekap Props:", props);
    try {
        return (
            <AuthenticatedLayout header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Rekap Absensi & Riwayat</h2>}>
                <Head title="Rekap Absensi" />
                <div className="pb-6 pt-0 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow border border-gray-100">
                        <p>Halaman Rekap Absensi (Safe Mode)</p>
                        <pre className="text-xs">{JSON.stringify(props.filters, null, 2)}</pre>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    } catch (e) {
        return <div>Error rendering: {e.message}</div>;
    }
}
