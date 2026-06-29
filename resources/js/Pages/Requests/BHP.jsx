import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ShoppingCart, Send, FileCheck, Calendar, PackageOpen, Box, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function BHP({ requests, today }) {
    const user = usePage().props.auth.user;

    const { data, setData, post, processing, errors, reset } = useForm({
        request_date: today,
        department: 'Sales',
        target_date: '',
        product_name: '',
        specifications: '',
    });

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: { popup: 'rounded-2xl' }
            });
            reset();
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('requests.bhp.store'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengajuan BHP</h2>}
        >
            <Head title="Pengajuan BHP" />

            <div className="py-6 space-y-8">
                
                {/* Form Pengajuan BHP */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="mb-6 border-b border-gray-50 pb-4">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <ShoppingCart className="text-orange-500" /> Form Pengajuan BHP
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Ajukan kebutuhan Barang Habis Pakai harian untuk divisi Anda.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel value="Tanggal Pengajuan" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500"/> Tanggal Pengajuan</InputLabel>
                                <TextInput 
                                    type="date"
                                    className="mt-1 block w-full bg-gray-50 text-gray-600" 
                                    value={data.request_date}
                                    readOnly
                                />
                            </div>
                            <div>
                                <InputLabel value="Divisi / Departemen *" />
                                <TextInput 
                                    className="mt-1 block w-full" 
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                />
                                <InputError message={errors.department} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Target Tanggal Barang Dibutuhkan *" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500"/> Tanggal Dibutuhkan</InputLabel>
                            <TextInput 
                                type="date"
                                className="mt-1 block w-full md:w-1/2" 
                                value={data.target_date}
                                onChange={(e) => setData('target_date', e.target.value)}
                            />
                            <InputError message={errors.target_date} className="mt-2" />
                        </div>

                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-50">
                            <div className="space-y-6">
                                <div>
                                    <InputLabel value="Nama Produk / Barang *" className="flex items-center gap-2"><PackageOpen className="w-4 h-4 text-orange-500"/> Nama Barang</InputLabel>
                                    <TextInput 
                                        className="mt-1 block w-full bg-white" 
                                        placeholder="Contoh: Kertas HVS A4, Tinta Printer Epson, dll..."
                                        value={data.product_name}
                                        onChange={(e) => setData('product_name', e.target.value)}
                                    />
                                    <InputError message={errors.product_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Spesifikasi Detail & Jumlah *" />
                                    <textarea 
                                        className="mt-1 block w-full rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white"
                                        rows="3"
                                        placeholder="Contoh: 5 Rim Kertas A4 80gsm, 2 Botol Tinta Hitam..."
                                        value={data.specifications}
                                        onChange={(e) => setData('specifications', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.specifications} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <PrimaryButton disabled={processing} className="py-3 px-8 bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center gap-2 text-sm">
                                <Send className="w-4 h-4" /> Ajukan Form BHP
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* Daftar BHP */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                        <Box className="text-blue-500" /> Riwayat Pengajuan BHP
                    </h3>

                    {requests.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Belum ada riwayat pengajuan BHP</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {requests.map(req => (
                                <div key={req.id} className="p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-gray-800">{req.product_name}</h4>
                                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{req.request_date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">{req.specifications}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                        <p className="text-xs font-semibold text-gray-500"><span className="font-normal text-gray-400">Dibutuhkan: </span>{req.target_date}</p>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : req.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {req.status}
                                            </span>
                                            {/* Simulate approval logic for demo purposes */}
                                            {req.status !== 'Ditolak' && (
                                                <a 
                                                    href={route('requests.bhp.pdf', req.id)}
                                                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-full transition-colors flex items-center gap-1"
                                                >
                                                    <Download className="w-3 h-3" /> PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
