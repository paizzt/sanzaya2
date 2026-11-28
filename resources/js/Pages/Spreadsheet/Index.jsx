import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Database, RefreshCw, Key, Plus, Trash2, Package, ShoppingCart, CreditCard, Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

const REPORT_TABS = [
    {
        id: 'logistik',
        label: 'Laporan Logistik',
        shortLabel: 'Logistik',
        icon: Package,
        activeClass: 'bg-blue-600 text-white border-blue-600 shadow-sm',
        inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200',
    },
    {
        id: 'pesanan',
        label: 'Surat Pesanan',
        shortLabel: 'Surat Pesanan',
        icon: ShoppingCart,
        activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
        inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200',
    },
    {
        id: 'piutang',
        label: 'Data Piutang',
        shortLabel: 'Data Piutang',
        icon: CreditCard,
        activeClass: 'bg-indigo-600 text-white border-indigo-600 shadow-sm',
        inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200',
    },
    {
        id: 'hutang',
        label: 'Data Hutang',
        shortLabel: 'Data Hutang',
        icon: CreditCard,
        activeClass: 'bg-orange-600 text-white border-orange-600 shadow-sm',
        inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200',
    },
];

export default function Index({ config_logistik, config_pesanan, config_piutang, config_hutang }) {
    const [activeTab, setActiveTab] = useState('logistik');
    const { flash } = usePage().props;

    const logistikForm = useForm({
        type: 'logistik',
        spreadsheet_id: config_logistik?.spreadsheet_id || '',
        sheets_config: config_logistik?.sheets_config || [{sheet_name:'', col_nama_pt:'', col_pelanggan:'', col_jenis_pelanggan:'', col_tanggal:'', col_nama_sales:'', col_no_faktur:'', col_id_paket:'', col_brand:'', col_nama_produk:'', col_qty:'', col_satuan:'', col_hna:'', col_subtotal:'', col_ppn:'', col_total:'', col_grand_total:'', col_jenis_barang:''}],
    });

    const pesananForm = useForm({
        type: 'pesanan',
        spreadsheet_id: config_pesanan?.spreadsheet_id || '',
        sheets_config: config_pesanan?.sheets_config || [{sheet_name:'', col_tanggal:'', col_nomor_klikkan:'', col_nama_outlet:'', col_nama_produk:'', col_jumlah:'', col_satuan:'', col_harga_faktur:'', col_total_faktur:'', col_terkirim:'', col_belum_terkirim:'', col_nominal_sdh_kirim:'', col_nominal_blm_kirim:'', col_persen_terpenuhi:'', col_persen_belum_terpenuhi:'', col_keterangan:''}],
    });

    const piutangForm = useForm({
        type: 'piutang',
        spreadsheet_id: config_piutang?.spreadsheet_id || '',
        sheets_config: config_piutang?.sheets_config || [{sheet_name:'', col_nama_outlet:'', col_tahun_1:'', col_tahun_2:'', col_tahun_3:'', col_total_sanzaya:'', col_ruma_1:'', col_ruma_2:'', col_ruma_3:'', col_total_ruma:'', col_total_gabungan:''}],
    });

    const hutangForm = useForm({
        type: 'hutang',
        spreadsheet_id: config_hutang?.spreadsheet_id || '',
        sheets_config: config_hutang?.sheets_config || [{sheet_name:'', col_no:'', col_nama_penyedia:'', col_nominal:''}],
    });

    const { post: postSync, processing: syncProcessing } = useForm({});

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', customClass: { popup: 'rounded-2xl' } });
        }
        if (flash?.warning) {
            Swal.fire({ title: 'Perhatian!', text: flash.warning, icon: 'warning', customClass: { popup: 'rounded-2xl' } });
        }
        if (flash?.error) {
            Swal.fire({ title: 'Gagal!', text: flash.error, icon: 'error', customClass: { popup: 'rounded-2xl' } });
        }
    }, [flash]);

    const submit = (e, form) => {
        e.preventDefault();
        form.post(route('spreadsheet.store'), { preserveScroll: true });
    };

    const handleSync = () => {
        Swal.fire({
            title: 'Mulai Sinkronisasi?',
            text: `Sistem akan menarik baris data untuk ${activeTab} dari Google Spreadsheet ke database lokal.`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Sinkronisasi',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                postSync(route('spreadsheet.sync', { type: activeTab }));
            }
        });
    };

    const handleCopyEmail = async () => {
        const email = 'sanzaya@sanzaya.iam.gserviceaccount.com';
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(email);
            } else {
                const el = document.createElement('textarea');
                el.value = email;
                el.setAttribute('readonly', '');
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            }
            Swal.fire({ title: 'Disalin!', text: 'Email berhasil disalin ke clipboard.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch {
            Swal.fire({ title: 'Info', text: 'Salin manual: ' + email, icon: 'info', customClass: { popup: 'rounded-2xl' } });
        }
    };

    const addSheet = (form, template) => {
        form.setData('sheets_config', [...form.data.sheets_config, template]);
    };

    const removeSheet = (form, index) => {
        const newSheets = [...form.data.sheets_config];
        newSheets.splice(index, 1);
        form.setData('sheets_config', newSheets);
    };

    const handleSheetChange = (form, index, field, value) => {
        const newSheets = form.data.sheets_config.map((item, idx) =>
            idx === index ? { ...item, [field]: value } : item
        );
        form.setData('sheets_config', newSheets);
    };

    const renderField = (label, value, onChange, extraClass = '') => (
        <div className={`flex flex-col justify-end min-w-0 ${extraClass}`}>
            <InputLabel value={label} className="text-xs leading-snug break-words" />
            <TextInput
                className="mt-1 block w-full min-w-0 text-sm"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );

    const renderLogistikForm = () => (
        <form onSubmit={(e) => submit(e, logistikForm)} className="space-y-5 sm:space-y-6">
            <div className="min-w-0">
                <InputLabel value="Spreadsheet ID Laporan Logistik *" />
                <TextInput
                    className="mt-1 block w-full min-w-0 text-sm"
                    value={logistikForm.data.spreadsheet_id}
                    onChange={(e) => logistikForm.setData('spreadsheet_id', e.target.value)}
                />
                <InputError message={logistikForm.errors.spreadsheet_id} className="mt-2" />
            </div>

            <div className="pt-2 space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">Pemetaan Kolom Logistik</h4>
                    <button
                        type="button"
                        onClick={() => addSheet(logistikForm, {sheet_name:'', col_nama_pt:'', col_pelanggan:'', col_jenis_pelanggan:'', col_tanggal:'', col_nama_sales:'', col_no_faktur:'', col_id_paket:'', col_brand:'', col_nama_produk:'', col_qty:'', col_satuan:'', col_hna:'', col_subtotal:'', col_ppn:'', col_total:'', col_grand_total:'', col_jenis_barang:''})}
                        className="inline-flex items-center justify-center gap-1.5 text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4 shrink-0" /> Tambah Sheet
                    </button>
                </div>
                {logistikForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-4 sm:p-5 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-200/80">
                            <span className="text-xs sm:text-sm font-bold text-gray-700">Konfigurasi Sheet #{index + 1}</span>
                            {logistikForm.data.sheets_config.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSheet(logistikForm, index)}
                                    aria-label={`Hapus Sheet #${index + 1}`}
                                    className="inline-flex items-center justify-center gap-1.5 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-colors shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="min-w-0">
                                <InputLabel value={`Nama Sheet #${index + 1} *`} />
                                <TextInput className="mt-1 block w-full min-w-0 text-sm" value={sheet.sheet_name} onChange={(e) => handleSheetChange(logistikForm, index, 'sheet_name', e.target.value)} />
                            </div>
                            <div className="min-w-0">
                                <InputLabel value="Nama PT (Penanda)" />
                                <TextInput className="mt-1 block w-full min-w-0 text-sm" value={sheet.col_nama_pt} onChange={(e) => handleSheetChange(logistikForm, index, 'col_nama_pt', e.target.value)} placeholder="Misal: Data_Sanzaya_Ruma" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {renderField('Kol. Pelanggan', sheet.col_pelanggan, (v) => handleSheetChange(logistikForm, index, 'col_pelanggan', v))}
                            {renderField('Kol. Jenis Pelanggan', sheet.col_jenis_pelanggan, (v) => handleSheetChange(logistikForm, index, 'col_jenis_pelanggan', v))}
                            {renderField('Kol. Tanggal', sheet.col_tanggal, (v) => handleSheetChange(logistikForm, index, 'col_tanggal', v))}
                            {renderField('Kol. Nama Sales', sheet.col_nama_sales, (v) => handleSheetChange(logistikForm, index, 'col_nama_sales', v))}
                            {renderField('Kol. No Faktur', sheet.col_no_faktur, (v) => handleSheetChange(logistikForm, index, 'col_no_faktur', v))}
                            {renderField('Kol. ID Paket', sheet.col_id_paket, (v) => handleSheetChange(logistikForm, index, 'col_id_paket', v))}
                            {renderField('Kol. Brand', sheet.col_brand, (v) => handleSheetChange(logistikForm, index, 'col_brand', v))}
                            {renderField('Kol. Nama Produk', sheet.col_nama_produk, (v) => handleSheetChange(logistikForm, index, 'col_nama_produk', v))}
                            {renderField('Kol. Qty', sheet.col_qty, (v) => handleSheetChange(logistikForm, index, 'col_qty', v))}
                            {renderField('Kol. Satuan', sheet.col_satuan, (v) => handleSheetChange(logistikForm, index, 'col_satuan', v))}
                            {renderField('Kol. HNA', sheet.col_hna, (v) => handleSheetChange(logistikForm, index, 'col_hna', v))}
                            {renderField('Kol. Subtotal', sheet.col_subtotal, (v) => handleSheetChange(logistikForm, index, 'col_subtotal', v))}
                            {renderField('Kol. PPN', sheet.col_ppn, (v) => handleSheetChange(logistikForm, index, 'col_ppn', v))}
                            {renderField('Kol. Total', sheet.col_total, (v) => handleSheetChange(logistikForm, index, 'col_total', v))}
                            {renderField('Kol. Grand Total', sheet.col_grand_total, (v) => handleSheetChange(logistikForm, index, 'col_grand_total', v))}
                            {renderField('Kol. Jenis Brg', sheet.col_jenis_barang, (v) => handleSheetChange(logistikForm, index, 'col_jenis_barang', v))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-2">
                <PrimaryButton disabled={logistikForm.processing} className="w-full sm:w-auto justify-center min-h-[44px]">
                    Simpan Konfigurasi
                </PrimaryButton>
            </div>
        </form>
    );

    const renderPesananForm = () => (
        <form onSubmit={(e) => submit(e, pesananForm)} className="space-y-5 sm:space-y-6">
            <div className="min-w-0">
                <InputLabel value="Spreadsheet ID Surat Pesanan *" />
                <TextInput
                    className="mt-1 block w-full min-w-0 text-sm"
                    value={pesananForm.data.spreadsheet_id}
                    onChange={(e) => pesananForm.setData('spreadsheet_id', e.target.value)}
                />
                <InputError message={pesananForm.errors.spreadsheet_id} className="mt-2" />
            </div>

            <div className="pt-2 space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">Pemetaan Kolom Surat Pesanan</h4>
                    <button
                        type="button"
                        onClick={() => addSheet(pesananForm, {sheet_name:'', col_tanggal:'', col_nomor_klikkan:'', col_nama_outlet:'', col_nama_produk:'', col_jumlah:'', col_satuan:'', col_harga_faktur:'', col_total_faktur:'', col_terkirim:'', col_belum_terkirim:'', col_nominal_sdh_kirim:'', col_nominal_blm_kirim:'', col_persen_terpenuhi:'', col_persen_belum_terpenuhi:'', col_keterangan:''})}
                        className="inline-flex items-center justify-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4 shrink-0" /> Tambah Sheet
                    </button>
                </div>
                {pesananForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-4 sm:p-5 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-200/80">
                            <span className="text-xs sm:text-sm font-bold text-gray-700">Konfigurasi Sheet #{index + 1}</span>
                            {pesananForm.data.sheets_config.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSheet(pesananForm, index)}
                                    aria-label={`Hapus Sheet #${index + 1}`}
                                    className="inline-flex items-center justify-center gap-1.5 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-colors shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="min-w-0">
                                <InputLabel value={`Nama Sheet #${index + 1} *`} />
                                <TextInput className="mt-1 block w-full min-w-0 text-sm" value={sheet.sheet_name} onChange={(e) => handleSheetChange(pesananForm, index, 'sheet_name', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {renderField('Kol. Tanggal', sheet.col_tanggal, (v) => handleSheetChange(pesananForm, index, 'col_tanggal', v))}
                            {renderField('Kol. No Klikkan', sheet.col_nomor_klikkan, (v) => handleSheetChange(pesananForm, index, 'col_nomor_klikkan', v))}
                            {renderField('Kol. Pelanggan *', sheet.col_nama_outlet, (v) => handleSheetChange(pesananForm, index, 'col_nama_outlet', v))}
                            {renderField('Kol. Produk', sheet.col_nama_produk, (v) => handleSheetChange(pesananForm, index, 'col_nama_produk', v))}
                            {renderField('Kol. Jumlah', sheet.col_jumlah, (v) => handleSheetChange(pesananForm, index, 'col_jumlah', v))}
                            {renderField('Kol. Satuan', sheet.col_satuan, (v) => handleSheetChange(pesananForm, index, 'col_satuan', v))}
                            {renderField('Kol. H. Faktur', sheet.col_harga_faktur, (v) => handleSheetChange(pesananForm, index, 'col_harga_faktur', v))}
                            {renderField('Kol. T. Faktur', sheet.col_total_faktur, (v) => handleSheetChange(pesananForm, index, 'col_total_faktur', v))}
                            {renderField('Kol. Terkirim', sheet.col_terkirim, (v) => handleSheetChange(pesananForm, index, 'col_terkirim', v))}
                            {renderField('Kol. Blm Terkirim', sheet.col_belum_terkirim, (v) => handleSheetChange(pesananForm, index, 'col_belum_terkirim', v))}
                            {renderField('Kol. Nom Sdh Kirim', sheet.col_nominal_sdh_kirim, (v) => handleSheetChange(pesananForm, index, 'col_nominal_sdh_kirim', v))}
                            {renderField('Kol. Nom Blm Kirim', sheet.col_nominal_blm_kirim, (v) => handleSheetChange(pesananForm, index, 'col_nominal_blm_kirim', v))}
                            {renderField('Kol. % Terpenuhi', sheet.col_persen_terpenuhi, (v) => handleSheetChange(pesananForm, index, 'col_persen_terpenuhi', v))}
                            {renderField('Kol. % Blm Terpenuhi', sheet.col_persen_belum_terpenuhi, (v) => handleSheetChange(pesananForm, index, 'col_persen_belum_terpenuhi', v))}
                            {renderField('Kol. Keterangan', sheet.col_keterangan, (v) => handleSheetChange(pesananForm, index, 'col_keterangan', v), 'col-span-2 sm:col-span-1 md:col-span-2')}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-2">
                <PrimaryButton disabled={pesananForm.processing} className="w-full sm:w-auto justify-center min-h-[44px]">
                    Simpan Konfigurasi
                </PrimaryButton>
            </div>
        </form>
    );

    const renderPiutangForm = () => (
        <form onSubmit={(e) => submit(e, piutangForm)} className="space-y-5 sm:space-y-6">
            <div className="min-w-0">
                <InputLabel value="Spreadsheet ID Data Piutang *" />
                <TextInput
                    className="mt-1 block w-full min-w-0 text-sm"
                    value={piutangForm.data.spreadsheet_id}
                    onChange={(e) => piutangForm.setData('spreadsheet_id', e.target.value)}
                />
                <InputError message={piutangForm.errors.spreadsheet_id} className="mt-2" />
            </div>

            <div className="pt-2 space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">Pemetaan Kolom Piutang</h4>
                    <button
                        type="button"
                        onClick={() => addSheet(piutangForm, {sheet_name:'', col_nama_outlet:'', col_tahun_1:'', col_tahun_2:'', col_tahun_3:'', col_total_sanzaya:'', col_ruma_1:'', col_ruma_2:'', col_ruma_3:'', col_total_ruma:'', col_total_gabungan:''})}
                        className="inline-flex items-center justify-center gap-1.5 text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4 shrink-0" /> Tambah Sheet
                    </button>
                </div>
                {piutangForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-4 sm:p-5 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-200/80">
                            <span className="text-xs sm:text-sm font-bold text-gray-700">Konfigurasi Sheet #{index + 1}</span>
                            {piutangForm.data.sheets_config.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSheet(piutangForm, index)}
                                    aria-label={`Hapus Sheet #${index + 1}`}
                                    className="inline-flex items-center justify-center gap-1.5 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-colors shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="min-w-0">
                                <InputLabel value={`Nama Sheet #${index + 1} *`} />
                                <TextInput className="mt-1 block w-full min-w-0 text-sm" value={sheet.sheet_name} onChange={(e) => handleSheetChange(piutangForm, index, 'sheet_name', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {renderField('Kol. Outlet *', sheet.col_nama_outlet, (v) => handleSheetChange(piutangForm, index, 'col_nama_outlet', v))}
                            {renderField('Kol. Tahun 1', sheet.col_tahun_1, (v) => handleSheetChange(piutangForm, index, 'col_tahun_1', v))}
                            {renderField('Kol. Tahun 2', sheet.col_tahun_2, (v) => handleSheetChange(piutangForm, index, 'col_tahun_2', v))}
                            {renderField('Kol. Tahun 3 (Ops)', sheet.col_tahun_3, (v) => handleSheetChange(piutangForm, index, 'col_tahun_3', v))}
                            {renderField('Kol. Total Sanzaya', sheet.col_total_sanzaya, (v) => handleSheetChange(piutangForm, index, 'col_total_sanzaya', v))}
                            {renderField('Kol. Ruma 1 (Ops)', sheet.col_ruma_1, (v) => handleSheetChange(piutangForm, index, 'col_ruma_1', v))}
                            {renderField('Kol. Ruma 2 (Ops)', sheet.col_ruma_2, (v) => handleSheetChange(piutangForm, index, 'col_ruma_2', v))}
                            {renderField('Kol. Ruma 3', sheet.col_ruma_3, (v) => handleSheetChange(piutangForm, index, 'col_ruma_3', v))}
                            {renderField('Kol. Total Ruma', sheet.col_total_ruma, (v) => handleSheetChange(piutangForm, index, 'col_total_ruma', v))}
                            {renderField('Kol. Total Gabungan', sheet.col_total_gabungan, (v) => handleSheetChange(piutangForm, index, 'col_total_gabungan', v), 'col-span-1 sm:col-span-3 md:col-span-3')}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-2">
                <PrimaryButton disabled={piutangForm.processing} className="w-full sm:w-auto justify-center min-h-[44px]">
                    Simpan Konfigurasi
                </PrimaryButton>
            </div>
        </form>
    );

    const renderHutangForm = () => (
        <form onSubmit={(e) => submit(e, hutangForm)} className="space-y-5 sm:space-y-6">
            <div className="min-w-0">
                <InputLabel value="Spreadsheet ID Data Hutang *" />
                <TextInput
                    className="mt-1 block w-full min-w-0 text-sm"
                    value={hutangForm.data.spreadsheet_id}
                    onChange={(e) => hutangForm.setData('spreadsheet_id', e.target.value)}
                />
                <InputError message={hutangForm.errors.spreadsheet_id} className="mt-2" />
            </div>

            <div className="pt-2 space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">Pemetaan Kolom Hutang</h4>
                    <button
                        type="button"
                        onClick={() => addSheet(hutangForm, {sheet_name:'', col_no:'', col_nama_penyedia:'', col_nominal:''})}
                        className="inline-flex items-center justify-center gap-1.5 text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4 shrink-0" /> Tambah Sheet
                    </button>
                </div>
                {hutangForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-4 sm:p-5 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-200/80">
                            <span className="text-xs sm:text-sm font-bold text-gray-700">Konfigurasi Sheet #{index + 1}</span>
                            {hutangForm.data.sheets_config.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSheet(hutangForm, index)}
                                    aria-label={`Hapus Sheet #${index + 1}`}
                                    className="inline-flex items-center justify-center gap-1.5 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-colors shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="min-w-0">
                                <InputLabel value={`Nama Sheet #${index + 1} *`} />
                                <TextInput className="mt-1 block w-full min-w-0 text-sm" value={sheet.sheet_name} onChange={(e) => handleSheetChange(hutangForm, index, 'sheet_name', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {renderField('Kol. No', sheet.col_no, (v) => handleSheetChange(hutangForm, index, 'col_no', v))}
                            {renderField('Kol. Nama Penyedia', sheet.col_nama_penyedia, (v) => handleSheetChange(hutangForm, index, 'col_nama_penyedia', v))}
                            {renderField('Kol. Nominal', sheet.col_nominal, (v) => handleSheetChange(hutangForm, index, 'col_nominal', v))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-2">
                <PrimaryButton disabled={hutangForm.processing} className="w-full sm:w-auto justify-center min-h-[44px]">
                    Simpan Konfigurasi
                </PrimaryButton>
            </div>
        </form>
    );

    const activeConfig = activeTab === 'logistik' ? config_logistik : (activeTab === 'pesanan' ? config_pesanan : (activeTab === 'piutang' ? config_piutang : config_hutang));

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={
                <div>
                    <h2 className="font-bold text-xl sm:text-2xl text-gray-800 leading-tight">Data Laporan Tersinkronisasi</h2>
                </div>
            }
        >
            <Head title="Data Laporan Tersinkronisasi" />

            <div className="pb-6 pt-0 space-y-5 sm:space-y-6">

                {/* Stats / Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-slate-700 to-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-sm flex items-center justify-between gap-4 min-w-0">
                        <div className="min-w-0 flex-1">
                            <p className="text-gray-300 text-xs sm:text-sm font-medium mb-1">Status {activeTab.toUpperCase()}</p>
                            <h2 className="text-xl sm:text-2xl font-bold leading-snug break-words">
                                {activeConfig?.last_synced_at ? 'Tersinkronisasi' : 'Belum Pernah Sync'}
                            </h2>
                            <p className="text-xs text-gray-300 mt-1 break-words">
                                Terakhir: {activeConfig?.last_synced_at ? new Date(activeConfig.last_synced_at).toLocaleString('id-ID') : '-'}
                            </p>
                        </div>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center min-w-0">
                        <p className="text-gray-600 text-xs sm:text-sm font-medium mb-3">
                            Tarik seluruh baris data <span className="font-bold text-gray-800">{activeTab}</span> terbaru sekarang:
                        </p>
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={syncProcessing}
                            className="w-full py-3 px-4 min-h-[44px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${syncProcessing ? 'animate-spin' : ''}`} />
                            <span className="truncate">Mulai Sinkronisasi Manual ({activeTab})</span>
                        </button>
                    </div>
                </div>

                {/* Tipe Laporan Switcher (Responsif Mobile 2x2, Tablet/Desktop 4 Kolom) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3" role="tablist" aria-label="Pilih tipe laporan">
                    {REPORT_TABS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl border font-bold text-xs sm:text-sm transition-colors min-w-0 ${
                                    isActive ? item.activeClass : item.inactiveClass
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
                    {/* Form Konfigurasi */}
                    <div className="xl:col-span-8 min-w-0">
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            {activeTab === 'logistik' && renderLogistikForm()}
                            {activeTab === 'pesanan' && renderPesananForm()}
                            {activeTab === 'piutang' && renderPiutangForm()}
                            {activeTab === 'hutang' && renderHutangForm()}
                        </div>
                    </div>

                    {/* Petunjuk Penggunaan */}
                    <div className="xl:col-span-4 min-w-0 xl:sticky xl:top-6">
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit">
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-4 sm:mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                                <Key className="text-gray-500 w-5 h-5 shrink-0" />
                                <span>Petunjuk Setup API</span>
                            </h3>
                            <div className="space-y-4 text-xs sm:text-sm text-gray-600">
                                <div className="flex gap-3 items-start">
                                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">1</span>
                                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                                        <span className="leading-relaxed">Bagikan file Spreadsheet sebagai &quot;Pelihat&quot; ke email Service Account berikut:</span>
                                        <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200 w-full min-w-0">
                                            <code className="text-[11px] sm:text-xs text-gray-700 flex-1 min-w-0 break-all font-mono">
                                                sanzaya@sanzaya.iam.gserviceaccount.com
                                            </code>
                                            <button
                                                type="button"
                                                onClick={handleCopyEmail}
                                                className="inline-flex items-center justify-center min-w-[38px] min-h-[38px] p-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg transition-colors shrink-0 shadow-sm"
                                                title="Salin Email"
                                                aria-label="Salin Email Service Account"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">2</span>
                                    <span className="flex-1 min-w-0 leading-relaxed">
                                        Setiap tipe laporan (Logistik, Pesanan, Piutang, Hutang) ditarik dan disimpan ke dalam tabel databasenya masing-masing secara terpisah.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
