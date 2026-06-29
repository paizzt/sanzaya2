import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Database, RefreshCw, Save, Key, AlertTriangle, Plus, Trash2, Package, ShoppingCart, CreditCard, Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ config_logistik, config_pesanan, config_piutang, config_hutang }) {
    const [activeTab, setActiveTab] = useState('logistik');
    const { flash } = usePage().props;

    const logistikForm = useForm({
        type: 'logistik',
        spreadsheet_id: config_logistik?.spreadsheet_id || '',
        sheets_config: config_logistik?.sheets_config || [{sheet_name:'', col_date:'', col_sales_name:'', col_outlet_name:'', col_product_name:'', col_total_sales:''}],
    });

    const pesananForm = useForm({
        type: 'pesanan',
        spreadsheet_id: config_pesanan?.spreadsheet_id || '',
        sheets_config: config_pesanan?.sheets_config || [{sheet_name:'', col_tanggal:'', col_nama_outlet:'', col_nama_produk:'', col_jumlah:'', col_satuan:'', col_total_faktur:'', col_terkirim:'', col_belum_terkirim:'', col_persen_terpenuhi:'', col_persen_belum_terpenuhi:'', col_keterangan:''}],
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
        if (flash.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', customClass: { popup: 'rounded-2xl' } });
        }
        if (flash.warning) {
            Swal.fire({ title: 'Perhatian!', text: flash.warning, icon: 'warning', customClass: { popup: 'rounded-2xl' } });
        }
        if (flash.error) {
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

    const addSheet = (form, template) => {
        form.setData('sheets_config', [...form.data.sheets_config, template]);
    };

    const removeSheet = (form, index) => {
        const newSheets = [...form.data.sheets_config];
        newSheets.splice(index, 1);
        form.setData('sheets_config', newSheets);
    };

    const handleSheetChange = (form, index, field, value) => {
        const newSheets = [...form.data.sheets_config];
        newSheets[index][field] = value;
        form.setData('sheets_config', newSheets);
    };

    const renderLogistikForm = () => (
        <form onSubmit={(e) => submit(e, logistikForm)} className="space-y-6">
            <div>
                <InputLabel value="Spreadsheet ID Laporan Logistik *" />
                <TextInput className="mt-1 block w-full" value={logistikForm.data.spreadsheet_id} onChange={(e) => logistikForm.setData('spreadsheet_id', e.target.value)} />
                <InputError message={logistikForm.errors.spreadsheet_id} className="mt-2" />
            </div>

            <div className="pt-4 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-700">Pemetaan Kolom Logistik</h4>
                    <button type="button" onClick={() => addSheet(logistikForm, {sheet_name:'', col_date:'', col_sales_name:'', col_outlet_name:'', col_product_name:'', col_total_sales:''})} className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold flex gap-2"><Plus className="w-4 h-4"/> Tambah</button>
                </div>
                {logistikForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                        {logistikForm.data.sheets_config.length > 1 && <button type="button" onClick={() => removeSheet(logistikForm, index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>}
                        <div className="mb-5"><InputLabel value={`Nama Sheet #${index + 1} *`} /><TextInput className="mt-1 block w-full md:w-1/2" value={sheet.sheet_name} onChange={(e) => handleSheetChange(logistikForm, index, 'sheet_name', e.target.value)} /></div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div><InputLabel value="Kol. Tanggal" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_date} onChange={(e) => handleSheetChange(logistikForm, index, 'col_date', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Sales" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_sales_name} onChange={(e) => handleSheetChange(logistikForm, index, 'col_sales_name', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Outlet *" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_outlet_name} onChange={(e) => handleSheetChange(logistikForm, index, 'col_outlet_name', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Produk" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_product_name} onChange={(e) => handleSheetChange(logistikForm, index, 'col_product_name', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Total" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_total_sales} onChange={(e) => handleSheetChange(logistikForm, index, 'col_total_sales', e.target.value)} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={logistikForm.processing} className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl"><Save className="w-4 h-4 mr-2" /> Simpan Logistik</PrimaryButton></div>
        </form>
    );

    const renderPesananForm = () => (
        <form onSubmit={(e) => submit(e, pesananForm)} className="space-y-6">
            <div>
                <InputLabel value="Spreadsheet ID Surat Pesanan *" />
                <TextInput className="mt-1 block w-full" value={pesananForm.data.spreadsheet_id} onChange={(e) => pesananForm.setData('spreadsheet_id', e.target.value)} />
            </div>
            <div className="pt-4 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-700">Pemetaan Kolom Surat Pesanan</h4>
                    <button type="button" onClick={() => addSheet(pesananForm, {sheet_name:'', col_tanggal:'', col_nama_outlet:'', col_nama_produk:'', col_jumlah:'', col_satuan:'', col_total_faktur:'', col_terkirim:'', col_belum_terkirim:'', col_persen_terpenuhi:'', col_persen_belum_terpenuhi:'', col_keterangan:''})} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-semibold flex gap-2"><Plus className="w-4 h-4"/> Tambah</button>
                </div>
                {pesananForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                        {pesananForm.data.sheets_config.length > 1 && <button type="button" onClick={() => removeSheet(pesananForm, index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>}
                        <div className="mb-5"><InputLabel value={`Nama Sheet #${index + 1} *`} /><TextInput className="mt-1 block w-full md:w-1/2" value={sheet.sheet_name} onChange={(e) => handleSheetChange(pesananForm, index, 'sheet_name', e.target.value)} /></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div><InputLabel value="Kol. Tanggal" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_tanggal} onChange={(e) => handleSheetChange(pesananForm, index, 'col_tanggal', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Outlet *" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_nama_outlet} onChange={(e) => handleSheetChange(pesananForm, index, 'col_nama_outlet', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Produk" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_nama_produk} onChange={(e) => handleSheetChange(pesananForm, index, 'col_nama_produk', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Jumlah" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_jumlah} onChange={(e) => handleSheetChange(pesananForm, index, 'col_jumlah', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Satuan" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_satuan} onChange={(e) => handleSheetChange(pesananForm, index, 'col_satuan', e.target.value)} /></div>
                            <div><InputLabel value="Kol. T.Faktur" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_total_faktur} onChange={(e) => handleSheetChange(pesananForm, index, 'col_total_faktur', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Terkirim" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_terkirim} onChange={(e) => handleSheetChange(pesananForm, index, 'col_terkirim', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Blm Terkirim" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_belum_terkirim} onChange={(e) => handleSheetChange(pesananForm, index, 'col_belum_terkirim', e.target.value)} /></div>
                            <div><InputLabel value="Kol. % Terpenuhi" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_persen_terpenuhi} onChange={(e) => handleSheetChange(pesananForm, index, 'col_persen_terpenuhi', e.target.value)} /></div>
                            <div><InputLabel value="Kol. % Blm Terpenuhi" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_persen_belum_terpenuhi} onChange={(e) => handleSheetChange(pesananForm, index, 'col_persen_belum_terpenuhi', e.target.value)} /></div>
                            <div className="col-span-2"><InputLabel value="Kol. Keterangan" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_keterangan} onChange={(e) => handleSheetChange(pesananForm, index, 'col_keterangan', e.target.value)} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={pesananForm.processing} className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 rounded-xl"><Save className="w-4 h-4 mr-2" /> Simpan Pesanan</PrimaryButton></div>
        </form>
    );

    const renderPiutangForm = () => (
        <form onSubmit={(e) => submit(e, piutangForm)} className="space-y-6">
            <div>
                <InputLabel value="Spreadsheet ID Data Piutang *" />
                <TextInput className="mt-1 block w-full" value={piutangForm.data.spreadsheet_id} onChange={(e) => piutangForm.setData('spreadsheet_id', e.target.value)} />
            </div>
            <div className="pt-4 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-700">Pemetaan Kolom Piutang</h4>
                    <button type="button" onClick={() => addSheet(piutangForm, {sheet_name:'', col_nama_outlet:'', col_tahun_1:'', col_tahun_2:'', col_tahun_3:'', col_total_sanzaya:'', col_ruma_1:'', col_ruma_2:'', col_ruma_3:'', col_total_ruma:'', col_total_gabungan:''})} className="text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-lg text-sm font-semibold flex gap-2"><Plus className="w-4 h-4"/> Tambah</button>
                </div>
                {piutangForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                        {piutangForm.data.sheets_config.length > 1 && <button type="button" onClick={() => removeSheet(piutangForm, index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>}
                        <div className="mb-5"><InputLabel value={`Nama Sheet #${index + 1} *`} /><TextInput className="mt-1 block w-full md:w-1/2" value={sheet.sheet_name} onChange={(e) => handleSheetChange(piutangForm, index, 'sheet_name', e.target.value)} /></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div><InputLabel value="Kol. Outlet *" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_nama_outlet} onChange={(e) => handleSheetChange(piutangForm, index, 'col_nama_outlet', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Tahun 1" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_tahun_1} onChange={(e) => handleSheetChange(piutangForm, index, 'col_tahun_1', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Tahun 2" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_tahun_2} onChange={(e) => handleSheetChange(piutangForm, index, 'col_tahun_2', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Tahun 3 (Ops)" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_tahun_3} onChange={(e) => handleSheetChange(piutangForm, index, 'col_tahun_3', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Total Sanzaya" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_total_sanzaya} onChange={(e) => handleSheetChange(piutangForm, index, 'col_total_sanzaya', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Ruma 1 (Ops)" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_ruma_1} onChange={(e) => handleSheetChange(piutangForm, index, 'col_ruma_1', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Ruma 2 (Ops)" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_ruma_2} onChange={(e) => handleSheetChange(piutangForm, index, 'col_ruma_2', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Ruma 3" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_ruma_3} onChange={(e) => handleSheetChange(piutangForm, index, 'col_ruma_3', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Total Ruma" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_total_ruma} onChange={(e) => handleSheetChange(piutangForm, index, 'col_total_ruma', e.target.value)} /></div>
                            <div className="col-span-2"><InputLabel value="Kol. Total Gabungan" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_total_gabungan} onChange={(e) => handleSheetChange(piutangForm, index, 'col_total_gabungan', e.target.value)} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={piutangForm.processing} className="py-3 px-8 bg-purple-600 hover:bg-purple-700 rounded-xl"><Save className="w-4 h-4 mr-2" /> Simpan Piutang</PrimaryButton></div>
        </form>
    );

    const renderHutangForm = () => (
        <form onSubmit={(e) => submit(e, hutangForm)} className="space-y-6">
            <div>
                <InputLabel value="Spreadsheet ID Data Hutang *" />
                <TextInput className="mt-1 block w-full" value={hutangForm.data.spreadsheet_id} onChange={(e) => hutangForm.setData('spreadsheet_id', e.target.value)} />
            </div>
            <div className="pt-4 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-700">Pemetaan Kolom Hutang</h4>
                    <button type="button" onClick={() => addSheet(hutangForm, {sheet_name:'', col_no:'', col_nama_penyedia:'', col_nominal:''})} className="text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-lg text-sm font-semibold flex gap-2"><Plus className="w-4 h-4"/> Tambah</button>
                </div>
                {hutangForm.data.sheets_config.map((sheet, index) => (
                    <div key={index} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                        {hutangForm.data.sheets_config.length > 1 && <button type="button" onClick={() => removeSheet(hutangForm, index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>}
                        <div className="mb-5"><InputLabel value={`Nama Sheet #${index + 1} *`} /><TextInput className="mt-1 block w-full md:w-1/2" value={sheet.sheet_name} onChange={(e) => handleSheetChange(hutangForm, index, 'sheet_name', e.target.value)} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div><InputLabel value="Kol. No" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_no} onChange={(e) => handleSheetChange(hutangForm, index, 'col_no', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Nama Penyedia" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_nama_penyedia} onChange={(e) => handleSheetChange(hutangForm, index, 'col_nama_penyedia', e.target.value)} /></div>
                            <div><InputLabel value="Kol. Nominal" className="text-xs" /><TextInput className="mt-1 block w-full" value={sheet.col_nominal} onChange={(e) => handleSheetChange(hutangForm, index, 'col_nominal', e.target.value)} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end"><PrimaryButton disabled={hutangForm.processing} className="py-3 px-8 bg-orange-600 hover:bg-orange-700 rounded-xl"><Save className="w-4 h-4 mr-2" /> Simpan Hutang</PrimaryButton></div>
        </form>
    );

    const activeConfig = activeTab === 'logistik' ? config_logistik : (activeTab === 'pesanan' ? config_pesanan : (activeTab === 'piutang' ? config_piutang : config_hutang));

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Sync Multi-Spreadsheet</h2>}
        >
            <Head title="Spreadsheet Sync" />

            <div className="py-6 space-y-8">
                
                {/* Stats / Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-700 to-gray-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium mb-1">Status {activeTab.toUpperCase()}</p>
                            <h2 className="text-2xl font-bold">{activeConfig?.last_synced_at ? 'Tersinkronisasi' : 'Belum Pernah Sync'}</h2>
                            <p className="text-xs text-gray-400 mt-1">
                                Terakhir: {activeConfig?.last_synced_at ? new Date(activeConfig.last_synced_at).toLocaleString('id-ID') : '-'}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center">
                        <p className="text-gray-500 text-sm font-medium mb-3">Tarik seluruh baris data {activeTab} terbaru sekarang:</p>
                        <button 
                            onClick={handleSync}
                            disabled={syncProcessing}
                            className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${syncProcessing ? 'animate-spin' : ''}`} />
                            Mulai Sinkronisasi Manual ({activeTab})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Konfigurasi */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                            <button onClick={() => setActiveTab('logistik')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab==='logistik'?'bg-blue-50 text-blue-700':'text-gray-500 hover:bg-gray-50'}`}>
                                <Package className="w-4 h-4"/> Laporan Logistik
                            </button>
                            <button onClick={() => setActiveTab('pesanan')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab==='pesanan'?'bg-emerald-50 text-emerald-700':'text-gray-500 hover:bg-gray-50'}`}>
                                <ShoppingCart className="w-4 h-4"/> Surat Pesanan
                            </button>
                            <button onClick={() => setActiveTab('piutang')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab==='piutang'?'bg-purple-50 text-purple-700':'text-gray-500 hover:bg-gray-50'}`}>
                                <CreditCard className="w-4 h-4"/> Data Piutang
                            </button>
                            <button onClick={() => setActiveTab('hutang')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab==='hutang'?'bg-orange-50 text-orange-700':'text-gray-500 hover:bg-gray-50'}`}>
                                <CreditCard className="w-4 h-4"/> Data Hutang
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            {activeTab === 'logistik' && renderLogistikForm()}
                            {activeTab === 'pesanan' && renderPesananForm()}
                            {activeTab === 'piutang' && renderPiutangForm()}
                            {activeTab === 'hutang' && renderHutangForm()}
                        </div>
                    </div>

                    {/* Petunjuk Penggunaan */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 border-b border-gray-50 pb-4 flex items-center gap-2">
                                <Key className="text-gray-400 w-5 h-5" /> Petunjuk Setup API
                            </h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="flex gap-2 items-start">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span> 
                                    <div className="flex flex-col gap-2 w-full">
                                        <span>Bagikan file Spreadsheet sebagai "Pelihat" ke email Service Account berikut:</span>
                                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200">
                                            <code className="text-xs text-gray-700 flex-1 truncate">sanzaya@sanzaya.iam.gserviceaccount.com</code>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText('sanzaya@sanzaya.iam.gserviceaccount.com');
                                                    Swal.fire({ title: 'Disalin!', text: 'Email berhasil disalin ke clipboard.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                                                }}
                                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                                title="Salin Email"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</span> Setiap Tipe laporan (Logistik, Pesanan, Piutang) ditarik dan disimpan ke dalam tabel databasenya masing-masing secara terpisah.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
