import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import CurrencyInput from '@/Components/CurrencyInput';
import CustomSelect from '@/Components/CustomSelect';
import Swal from 'sweetalert2';
import { UploadCloud, X, Trash2, RotateCcw } from 'lucide-react';

export default function Edit({ auth, vendors, companies, paymentRequest, isApprovalView }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        company_name: paymentRequest.company_name || '',
        payment_deadline: paymentRequest.payment_deadline || '',
        transaction_date: paymentRequest.transaction_date || '',
        category: paymentRequest.category || '',
        purpose: paymentRequest.purpose || '',
        letter_number: paymentRequest.letter_number || '',
        recipient_name: paymentRequest.recipient_name || '',
        vendor_id: paymentRequest.vendor_id || '',
        invoice_reference: paymentRequest.invoice_reference || '',
        project_or_outlet: paymentRequest.project_or_outlet || '',
        payment_method: paymentRequest.payment_method || '',
        bank_or_wallet: paymentRequest.bank_or_wallet || '',
        account_number: paymentRequest.account_number || '',
        account_name: paymentRequest.account_name || '',
        account_used_before: paymentRequest.account_used_before === 1 || paymentRequest.account_used_before === true,
        account_changed: paymentRequest.account_changed === 1 || paymentRequest.account_changed === true,
        account_change_note: paymentRequest.account_change_note || '',
        vat_status: paymentRequest.vat_status || 'Tidak Dikenakan',
        vat_rate: paymentRequest.vat_rate || 0,
        discount: paymentRequest.discount || 0,
        other_cost: paymentRequest.other_cost || 0,
        items: paymentRequest.items && paymentRequest.items.length > 0 ? paymentRequest.items : [{ description: '', quantity: 1, unit: '', unit_price: 0 }],
        lampiran_foto: [],
        deleted_attachment_ids: []
    });

    const [deletedIds, setDeletedIds] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData('lampiran_foto', [...(data.lampiran_foto || []), ...files]);
        }
        e.target.value = '';
    };

    const removeNewFile = (index) => {
        const updated = [...(data.lampiran_foto || [])];
        updated.splice(index, 1);
        setData('lampiran_foto', updated);
    };

    const handleDeleteExisting = (attId) => {
        const updated = [...deletedIds, attId];
        setDeletedIds(updated);
        setData('deleted_attachment_ids', updated);
    };

    const handleRestoreExisting = (attId) => {
        const updated = deletedIds.filter(id => id !== attId);
        setDeletedIds(updated);
        setData('deleted_attachment_ids', updated);
    };

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, unit: '', unit_price: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const vatAmount = data.vat_status === 'Belum Termasuk' ? subtotal * (data.vat_rate / 100) : 0;
    const grandTotal = subtotal - Number(data.discount) + Number(data.other_cost) + vatAmount;

    const validateForm = () => {
        const emptyFields = [];

        if (!data.company_name || !data.company_name.trim()) emptyFields.push('Nama Perusahaan');
        if (!data.transaction_date || !data.transaction_date.trim()) emptyFields.push('Tanggal Transaksi');
        if (!data.payment_deadline || !data.payment_deadline.trim()) emptyFields.push('Batas Akhir Pembayaran');
        if (!data.category || !data.category.trim()) emptyFields.push('Kategori Pengajuan');
        if (!data.purpose || !data.purpose.trim()) emptyFields.push('Perihal / Tujuan');
        if (!data.recipient_name || !data.recipient_name.trim()) emptyFields.push('Nama Penerima');

        if (!data.items || data.items.length === 0) {
            emptyFields.push('Rincian Anggaran (minimal 1 baris)');
        } else {
            data.items.forEach((item, idx) => {
                const rowNum = idx + 1;
                if (!item.description || !item.description.trim()) {
                    emptyFields.push(`Uraian pada baris ke-${rowNum}`);
                }
                if (!item.quantity || Number(item.quantity) <= 0) {
                    emptyFields.push(`Qty pada baris ke-${rowNum}`);
                }
                if (item.unit_price === '' || item.unit_price === null || item.unit_price === undefined || Number(item.unit_price) <= 0) {
                    emptyFields.push(`Harga Satuan pada baris ke-${rowNum}`);
                }
            });
        }

        if (!data.payment_method || !data.payment_method.trim()) {
            emptyFields.push('Metode Pembayaran');
        } else if (data.payment_method !== 'Tunai') {
            if (!data.bank_or_wallet || !data.bank_or_wallet.trim()) emptyFields.push('Bank / E-Wallet');
            if (!data.account_number || !String(data.account_number).trim()) emptyFields.push('No. Rekening / QRIS');
        }

        if (!data.account_name || !data.account_name.trim()) emptyFields.push('Atas Nama Rekening / Penerima');

        return emptyFields;
    };

    const submit = (e) => {
        e.preventDefault();

        const emptyFields = validateForm();
        if (emptyFields.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Kolom Wajib Belum Terisi',
                html: `
                    <div class="text-left text-sm">
                        <p class="mb-2 font-medium text-gray-700">Mohon lengkapi kolom berikut sebelum mengirim pengajuan:</p>
                        <ul class="list-disc pl-5 space-y-1 text-red-600 font-medium max-h-60 overflow-y-auto">
                            ${emptyFields.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                `,
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'Mengerti'
            });
            return;
        }

        const updateRoute = route('payment-requests.update', paymentRequest.id) + (isApprovalView ? '?isApprovalView=1' : '');
        post(updateRoute, {
            onError: (errors) => {
                console.error(errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Validasi Gagal',
                    text: 'Silakan periksa pesan error berwarna merah pada form.',
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Pengajuan - ${paymentRequest.reference_number}`} />

            <div className="py-2">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <button 
                            onClick={() => window.history.back()}
                            className="p-2.5 bg-white text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-gray-100 flex-shrink-0"
                            title="Kembali"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                        </button>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Edit Pengajuan Pembayaran: {paymentRequest.reference_number}
                        </h2>
                    </div>

                    <form onSubmit={submit} noValidate className="bg-white p-6 shadow sm:rounded-lg space-y-6">
                        
                        {/* Section A: Informasi Pengajuan */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Informasi Pengajuan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Nama Perusahaan" />
                                    <CustomSelect 
                                        value={data.company_name} 
                                        onChange={(val) => setData('company_name', val)} 
                                        options={companies.map(c => ({ value: c.name, label: c.name }))} 
                                        className="w-full"
                                    />
                                    <InputError message={errors.company_name} />
                                </div>
                                <div>
                                    <InputLabel value="Nama Pengaju & Divisi" />
                                    <TextInput value={`${paymentRequest.requester?.name} - ${paymentRequest.division?.name}`} disabled className="w-full bg-gray-100" />
                                </div>
                                <div>
                                    <InputLabel value="Tanggal Transaksi" />
                                    <TextInput type="date" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} className="w-full" required />
                                    <InputError message={errors.transaction_date} />
                                </div>
                                <div>
                                    <InputLabel value="Batas Akhir Pembayaran" />
                                    <TextInput type="date" value={data.payment_deadline} onChange={e => setData('payment_deadline', e.target.value)} className="w-full" required />
                                    <InputError message={errors.payment_deadline} />
                                </div>
                                <div>
                                    <InputLabel value="Kategori Pengajuan" />
                                    <TextInput value={data.category} onChange={e => setData('category', e.target.value)} className="w-full" required />
                                    <InputError message={errors.category} />
                                </div>
                                <div>
                                    <InputLabel value="Perihal / Tujuan" />
                                    <TextInput value={data.purpose} onChange={e => setData('purpose', e.target.value)} className="w-full" required />
                                    <InputError message={errors.purpose} />
                                </div>
                                <div>
                                    <InputLabel value="Nomor Surat (Opsional)" />
                                    <TextInput value={data.letter_number} onChange={e => setData('letter_number', e.target.value)} className="w-full" />
                                    <InputError message={errors.letter_number} />
                                </div>
                                <div>
                                    <InputLabel value="Nama Penerima" />
                                    <TextInput value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} className="w-full" required />
                                    <InputError message={errors.recipient_name} />
                                </div>
                            </div>
                        </div>

                        {/* Section B: Rincian */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex justify-between items-center">
                                Rincian Anggaran
                                <button type="button" onClick={addItem} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100">
                                    + Tambah Baris
                                </button>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2">Uraian</th>
                                            <th className="px-4 py-2 w-24">Qty</th>
                                            <th className="px-4 py-2 w-48">Harga Satuan</th>
                                            <th className="px-4 py-2 w-48 text-right">Jumlah</th>
                                            <th className="px-4 py-2 w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="border-b align-top">
                                                <td className="px-2 py-2">
                                                    <TextInput value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full text-sm" required />
                                                    <InputError message={errors[`items.${index}.description`]} className="mt-1" />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <TextInput type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-sm" required />
                                                    <InputError message={errors[`items.${index}.quantity`]} className="mt-1" />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <CurrencyInput value={item.unit_price} onChange={(val) => handleItemChange(index, 'unit_price', val)} className="w-full text-sm" required />
                                                    <InputError message={errors[`items.${index}.unit_price`]} className="mt-1" />
                                                </td>
                                                <td className="px-2 py-2 text-right font-medium">
                                                    Rp {(item.quantity * item.unit_price).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    {data.items.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">✕</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 space-y-3">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>Subtotal</span>
                                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Status PPN</span>
                                        <CustomSelect 
                                            value={data.vat_status} 
                                            onChange={(val) => setData('vat_status', val)} 
                                            options={[
                                                { value: 'Tidak Dikenakan', label: 'Tidak Dikenakan' },
                                                { value: 'Belum Termasuk', label: 'Belum Termasuk' },
                                                { value: 'Sudah Termasuk', label: 'Sudah Termasuk' }
                                            ]} 
                                            className="w-[140px] sm:w-48"
                                        />
                                    </div>
                                    {data.vat_status === 'Belum Termasuk' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Tarif PPN (%)</span>
                                            <TextInput type="number" min="0" max="100" value={data.vat_rate} onChange={e => setData('vat_rate', e.target.value)} className="w-20 text-sm py-1" />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                                        <span>Grand Total</span>
                                        <span className="text-indigo-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section C: Pembayaran */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Metode Pembayaran</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Metode Pembayaran" />
                                    <CustomSelect 
                                        value={data.payment_method} 
                                        onChange={(val) => setData('payment_method', val)} 
                                        options={[
                                            { value: 'Transfer Bank', label: 'Transfer Bank' },
                                            { value: 'QRIS', label: 'QRIS' },
                                            { value: 'Tunai', label: 'Tunai' },
                                            { value: 'E-Wallet', label: 'E-Wallet' }
                                        ]} 
                                        className="w-full"
                                    />
                                    <InputError message={errors.payment_method} />
                                </div>
                                {data.payment_method && data.payment_method !== 'Tunai' && (
                                    <>
                                        <div>
                                            <InputLabel value="Bank / E-Wallet" />
                                            <TextInput value={data.bank_or_wallet} onChange={e => setData('bank_or_wallet', e.target.value)} className="w-full" required />
                                            <InputError message={errors.bank_or_wallet} />
                                        </div>
                                        <div>
                                            <InputLabel value="No. Rekening / QRIS" />
                                            <TextInput value={data.account_number} onChange={e => setData('account_number', e.target.value)} className="w-full" required />
                                            <InputError message={errors.account_number} />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <InputLabel value="Atas Nama Rekening / Penerima" />
                                    <TextInput value={data.account_name} onChange={e => setData('account_name', e.target.value)} className="w-full" required />
                                    <InputError message={errors.account_name} />
                                </div>
                            </div>
                        </div>

                        {/* Section D: Lampiran */}
                        <div>
                            <div className="border-b pb-2 mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Lampiran Tambahan</h3>
                            </div>

                            <div className="mt-2 space-y-5">
                                {/* Lampiran yang Saat Ini Terpasang */}
                                {(() => {
                                    const existingPhotos = paymentRequest.attachments?.filter(a => a.attachment_type === 'Lampiran Foto') || [];
                                    if (existingPhotos.length === 0) return null;
                                    return (
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Foto Terpasang Saat Ini ({existingPhotos.length}):
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {existingPhotos.map(att => {
                                                    const isDeleted = deletedIds.includes(att.id);
                                                    const imgUrl = att.file_path.startsWith('http') ? att.file_path : `/storage/${att.file_path}`;
                                                    return (
                                                        <div 
                                                            key={att.id} 
                                                            className={`relative group border rounded-xl overflow-hidden p-2 flex flex-col items-center transition ${isDeleted ? 'bg-red-50 border-red-200 opacity-60' : 'bg-white shadow-sm'}`}
                                                        >
                                                            <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-2">
                                                                <img 
                                                                    src={imgUrl} 
                                                                    alt={att.original_name || 'Lampiran'} 
                                                                    className={`w-full h-full object-cover ${isDeleted ? 'grayscale' : ''}`} 
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-700 truncate w-full font-medium" title={att.original_name}>
                                                                {att.original_name || 'Lampiran Foto'}
                                                            </p>
                                                            <div className="mt-1 flex items-center justify-between w-full">
                                                                <a 
                                                                    href={imgUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                                                                >
                                                                    Lihat Foto
                                                                </a>
                                                                {isDeleted ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRestoreExisting(att.id)}
                                                                        className="inline-flex items-center gap-1 text-[11px] text-gray-600 hover:text-green-600 font-semibold"
                                                                        title="Batal hapus"
                                                                    >
                                                                        <RotateCcw className="w-3 h-3" /> Batal
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteExisting(att.id)}
                                                                        className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 font-semibold"
                                                                        title="Hapus foto ini"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" /> Hapus
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {isDeleted && (
                                                                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                                                    Akan Dihapus
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Upload Foto Baru */}
                                <div className="space-y-3">
                                    <InputLabel value="Tambah Foto / Lampiran Baru" />
                                    <div className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors bg-gray-50/50">
                                        <input
                                            type="file"
                                            id="lampiran-upload-edit"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="lampiran-upload-edit" className="cursor-pointer flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                                                <UploadCloud className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700">
                                                Klik untuk memilih gambar atau foto bukti baru
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PNG, JPG, JPEG (Bisa pilih beberapa file sekaligus)
                                            </p>
                                        </label>
                                    </div>
                                    <InputError message={errors.lampiran_foto} />

                                    {/* Preview File Baru yang Dipilih */}
                                    {data.lampiran_foto && data.lampiran_foto.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                    Foto Baru yang Akan Ditambahkan ({data.lampiran_foto.length}):
                                                </p>
                                                <label htmlFor="lampiran-upload-edit" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                                                    + Tambah Gambar Lain
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {data.lampiran_foto.map((file, idx) => (
                                                    <div key={idx} className="relative group border rounded-xl overflow-hidden bg-white shadow-sm p-2 flex flex-col items-center">
                                                        <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-2">
                                                            <img 
                                                                src={URL.createObjectURL(file)} 
                                                                alt={file.name} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-700 truncate w-full font-medium" title={file.name}>
                                                            {file.name}
                                                        </p>
                                                        <span className="text-[10px] text-gray-400 w-full">
                                                            {(file.size / 1024).toFixed(0)} KB
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewFile(idx)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow"
                                                            title="Hapus foto ini"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t">
                            <Link href={route(isApprovalView ? 'payment-approvals.show' : 'payment-requests.show', paymentRequest.id)} className="mr-3 px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50">
                                Batal
                            </Link>
                            <PrimaryButton type="submit" disabled={processing}>
                                Simpan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
