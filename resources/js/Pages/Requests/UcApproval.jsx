import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FileCheck, Edit3, X, Check, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomSelect from '@/Components/CustomSelect';

export default function UcApproval({ requests }) {
    const user = usePage().props.auth.user;
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        status: '',
        approved_gas_cost: '',
        approved_meals_cost: '',
        approved_accommodation_cost: '',
        finance_note: '',
    });

    const openModal = (req) => {
        setSelectedRequest(req);
        setData({
            status: req.status === 'Menunggu' ? 'Disetujui' : req.status,
            approved_gas_cost: req.approved_gas_cost || req.estimated_gas_cost || '',
            approved_meals_cost: req.approved_meals_cost || req.estimated_meals_cost || '',
            approved_accommodation_cost: req.approved_accommodation_cost || req.estimated_accommodation_cost || '',
            finance_note: req.finance_note || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        reset();
    };

    const submitApproval = (e) => {
        e.preventDefault();
        post(route('requests.uc.approval.update', selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Status pengajuan berhasil diperbarui',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Persetujuan UC</h2>}
        >
            <Head title="Persetujuan UC" />

            <div className="pb-12 pt-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                            <FileCheck className="text-blue-500" /> Daftar Pengajuan UC
                        </h3>
                        
                        {!requests || requests.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Belum ada data pengajuan UC.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-xl">
                                        <tr>
                                            <th className="px-6 py-4 rounded-l-xl">No. Request</th>
                                            <th className="px-6 py-4">Pengaju</th>
                                            <th className="px-6 py-4">Tujuan</th>
                                            <th className="px-6 py-4">Tgl Berangkat</th>
                                            <th className="px-6 py-4">Est. Biaya</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 rounded-r-xl">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(requests || []).map((req) => (
                                            <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{req.request_number}</td>
                                                <td className="px-6 py-4">{req.user?.name} <br/><span className="text-xs text-gray-400">{req.department}</span></td>
                                                <td className="px-6 py-4">{req.destination_city}</td>
                                                <td className="px-6 py-4">{req.departure_date} <br/><span className="text-xs text-gray-400">({req.estimated_days} Hari)</span></td>
                                                <td className="px-6 py-4">
                                                    {formatRupiah(req.estimated_gas_cost)}
                                                    {req.approved_gas_cost && req.approved_gas_cost != req.estimated_gas_cost && (
                                                        <div className="text-xs text-green-600 font-semibold mt-1">Rev: {formatRupiah(req.approved_gas_cost)}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        req.status?.includes('Selesai') ? 'bg-indigo-100 text-indigo-700' :
                                                        req.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'Ditolak' ? 'bg-red-100 text-red-700' :
                                                        req.status === 'Direvisi' ? 'bg-orange-100 text-orange-700' :
                                                        req.status === 'Dicairkan' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button 
                                                        onClick={() => openModal(req)}
                                                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" /> Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Modal Review */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto pb-10">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative my-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Review Pengajuan UC</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitApproval} className="p-6">
                            
                            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-gray-500 block mb-1">Pengaju</span>
                                    <span className="font-semibold text-gray-900">{selectedRequest.user?.name} ({selectedRequest.department})</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Tujuan</span>
                                    <span className="font-semibold text-gray-900">{selectedRequest.destination_city}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Jadwal</span>
                                    <span className="font-semibold text-gray-900">{selectedRequest.departure_date} s/d {selectedRequest.return_date}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Est. Biaya Awal</span>
                                    <span className="font-semibold text-gray-900">{formatRupiah(selectedRequest.estimated_gas_cost)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Est. Biaya Tambahan</span>
                                    <span className="font-semibold text-gray-900 block">
                                        Makan: {formatRupiah(selectedRequest.estimated_meals_cost)}
                                    </span>
                                    <span className="font-semibold text-gray-900 block">
                                        Penginapan: {formatRupiah(selectedRequest.estimated_accommodation_cost)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel value="Status Persetujuan" />
                                    <select 
                                        className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm mt-1"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        required
                                    >
                                        <option value="Menunggu">Menunggu</option>
                                        <option value="Disetujui">Disetujui</option>
                                        <option value="Direvisi">Direvisi</option>
                                        <option value="Dicairkan">Dicairkan</option>
                                        <option value="Ditolak">Ditolak</option>
                                        <option value="Selesai / Result Dikirim">Selesai / Result Dikirim</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel value="Nominal Biaya Bensin Disetujui (Rp)" />
                                    <TextInput
                                        type="number"
                                        className="w-full mt-1"
                                        value={data.approved_gas_cost}
                                        onChange={e => setData('approved_gas_cost', e.target.value)}
                                        placeholder="Kosongkan jika tidak ada biaya"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Ubah nominal ini jika Anda ingin merevisi biaya yang diajukan.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Biaya Konsumsi Disetujui (Rp)" />
                                        <TextInput
                                            type="number"
                                            className="w-full mt-1"
                                            value={data.approved_meals_cost}
                                            onChange={e => setData('approved_meals_cost', e.target.value)}
                                            placeholder="Kosongkan jika tidak ada"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Biaya Penginapan Disetujui (Rp)" />
                                        <TextInput
                                            type="number"
                                            className="w-full mt-1"
                                            value={data.approved_accommodation_cost}
                                            onChange={e => setData('approved_accommodation_cost', e.target.value)}
                                            placeholder="Kosongkan jika tidak ada"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Catatan Finance / Manager (Opsional)" />
                                    <textarea
                                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm mt-1"
                                        rows="3"
                                        value={data.finance_note}
                                        onChange={e => setData('finance_note', e.target.value)}
                                        placeholder="Berikan catatan perihal persetujuan atau revisi..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                                    Batal
                                </button>
                                <PrimaryButton disabled={processing} className="rounded-xl flex items-center gap-2 transition-all duration-200">
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
