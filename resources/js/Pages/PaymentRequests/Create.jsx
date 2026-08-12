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

export default function Create({ auth, vendors, companies, user }) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        payment_deadline: '',
        transaction_date: '',
        category: '',
        purpose: '',
        recipient_name: '',
        vendor_id: '',
        invoice_reference: '',
        project_or_outlet: '',
        payment_method: '',
        bank_or_wallet: '',
        account_number: '',
        account_name: '',
        account_used_before: false,
        account_changed: false,
        account_change_note: '',
        vat_status: 'Tidak Dikenakan',
        vat_rate: 0,
        discount: 0,
        other_cost: 0,
        items: [{ description: '', quantity: 1, unit: '', unit_price: 0 }],
        lampiran_foto: null
    });

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

    const submit = (e) => {
        e.preventDefault();
        post(route('payment-requests.store'), {
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
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Buat Pengajuan Pembayaran</h2>}
        >
            <Head title="Buat Pengajuan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                                        placeholder="Pilih Perusahaan..."
                                        className="w-full"
                                    />
                                    <InputError message={errors.company_name} />
                                </div>
                                <div>
                                    <InputLabel value="Nama Pengaju & Divisi" />
                                    <TextInput value={`${user.name} - ${user.division?.name}`} disabled className="w-full bg-gray-100" />
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
                                    <InputLabel value="Nama Penerima / Vendor" />
                                    <TextInput value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} className="w-full" required />
                                    <InputError message={errors.recipient_name} />
                                </div>
                                <div>
                                    <InputLabel value="Outlet / Proyek / Keterangan" />
                                    <TextInput value={data.project_or_outlet} onChange={e => setData('project_or_outlet', e.target.value)} className="w-full" required />
                                    <InputError message={errors.project_or_outlet} />
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
                                <div className="w-1/2 md:w-1/3 space-y-3">
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
                                            className="w-48"
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
                                        placeholder="Pilih Metode..."
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
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Lampiran Tambahan</h3>
                            <div className="mt-4">
                                <InputLabel value="Lampiran Foto" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setData('lampiran_foto', e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-md file:border-0
                                      file:text-sm file:font-medium
                                      file:bg-indigo-50 file:text-indigo-700
                                      hover:file:bg-indigo-100 border border-gray-300 rounded-md p-1"
                                />
                                <InputError message={errors.lampiran_foto} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t">
                            <Link href={route('payment-requests.index')} className="mr-3 px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50">
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
