import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FileText, Send, Clock, CheckCircle2, XCircle, UploadCloud } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomSelect from '@/Components/CustomSelect';

export default function Pengajuan({ requests }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'Sakit',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null,
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
        post(route('absensi.pengajuan.store'), {
            preserveScroll: true,
        });
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Menunggu': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'Disetujui': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'Ditolak': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengajuan Izin / Sakit</h2>}
        >
            <Head title="Pengajuan Izin/Sakit" />

            <div className="py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                                <FileText className="text-blue-600 w-5 h-5" />
                                Buat Pengajuan Baru
                            </h3>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel value="Jenis Pengajuan" />
                                    <CustomSelect
                                        value={data.type}
                                        onChange={(val) => setData('type', val)}
                                        options={[
                                            { value: 'Sakit', label: 'Sakit' },
                                            { value: 'Izin', label: 'Izin' },
                                            { value: 'Izin Khusus', label: 'Izin Khusus' }
                                        ]}
                                    />
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Mulai Tanggal" />
                                        <TextInput 
                                            type="date" 
                                            className="mt-1 block w-full" 
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                        <InputError message={errors.start_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Sampai Tanggal" />
                                        <TextInput 
                                            type="date" 
                                            className="mt-1 block w-full" 
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                        />
                                        <InputError message={errors.end_date} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Alasan / Keterangan" />
                                    <textarea 
                                        className="mt-1 block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        rows="3"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Tuliskan alasan lengkap..."
                                    ></textarea>
                                    <InputError message={errors.reason} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Lampiran (Surat Dokter, dll)" />
                                    <div className="mt-1 flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk upload</span></p>
                                                <p className="text-xs text-gray-500">PNG, JPG, PDF (Maks 5MB)</p>
                                                {data.attachment && <p className="text-sm font-bold text-blue-600 mt-2">{data.attachment.name}</p>}
                                            </div>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={(e) => setData('attachment', e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                    <InputError message={errors.attachment} className="mt-2" />
                                </div>

                                <div className="pt-2">
                                    <PrimaryButton disabled={processing} className="w-full justify-center py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2">
                                        <Send className="w-4 h-4" /> Kirim Pengajuan
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 border-b border-gray-50 pb-4">Riwayat Pengajuan</h3>
                            
                            {requests.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Belum ada riwayat pengajuan</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <div key={req.id} className="p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${req.type === 'Sakit' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        {req.type}
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {req.start_date} {req.start_date !== req.end_date ? ` s/d ${req.end_date}` : ''}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">{req.reason}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(req.status)}
                                                <span className={`text-xs font-bold ${req.status === 'Menunggu' ? 'text-orange-500' : req.status === 'Disetujui' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
