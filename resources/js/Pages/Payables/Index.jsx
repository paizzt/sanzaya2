import ExportDropdown from '@/Components/ExportDropdown';
import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Wallet, Plus, Edit, Trash2, ClipboardList } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';
import ClientPagination from '@/Components/ClientPagination';
import MultiSelect from '@/Components/MultiSelect';
import Swal from 'sweetalert2';

export default function Index({ auth, items = [], providers, companies, filters, dailyReports = [], users = [], totalAll, lastUpdated }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // PHP empty arrays `[]` from `$request->only()` can be passed here instead of `{}`.
    // If filters is `[]`, `filters.sort` evaluates to `Array.prototype.sort`, crashing useState!
    const safeFilters = (filters && typeof filters === 'object' && !Array.isArray(filters)) ? filters : {};

    const [filterSearch, setFilterSearch] = useState(safeFilters.search || '');
    const [filterPt, setFilterPt] = useState(safeFilters.pt ? (Array.isArray(safeFilters.pt) ? safeFilters.pt : safeFilters.pt.split(',')) : []);
    const [filterYear, setFilterYear] = useState(safeFilters.year ? (Array.isArray(safeFilters.year) ? safeFilters.year : safeFilters.year.split(',')) : []);
    const [filterSort, setFilterSort] = useState(typeof safeFilters.sort === 'string' ? safeFilters.sort : '');

    const applyFilter = () => {
        router.get(route('payables.index'), {
            search: filterSearch,
            pt: Array.isArray(filterPt) ? filterPt.join(',') : filterPt,
            year: Array.isArray(filterYear) ? filterYear.join(',') : filterYear,
            sort: filterSort
        }, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        setFilterSearch('');
        setFilterPt([]);
        setFilterYear([]);
        setFilterSort('');
        router.get(route('payables.index'), {}, { preserveState: true, replace: true });
    };

    const getFilteredDetails = (details) => {
        let detailsArray = details;
        if (typeof details === 'string') {
            try {
                detailsArray = JSON.parse(details);
            } catch (e) {
                detailsArray = [];
            }
        }
        if (!Array.isArray(detailsArray)) {
            detailsArray = [];
        }
        if (filterYear.length === 0) return detailsArray;
        return detailsArray.filter(d => filterYear.includes(String(d.year)));
    };

    const getFilteredTotal = (details) => {
        return getFilteredDetails(details).reduce((sum, d) => sum + Number(d.amount || 0), 0);
    };

    const safeItems = useMemo(() => Array.isArray(items) ? items : [], [items]);

    const { yearEntries, ptEntries, totalPenyedias, totalHutangKeseluruhan } = useMemo(() => {
        try {
            const summaryByYear = safeItems.reduce((acc, item) => {
                const filteredDetails = getFilteredDetails(item.details);
                filteredDetails.forEach(d => {
                    if (d && d.year && d.year !== 'Total') {
                        acc[d.year] = (acc[d.year] || 0) + Number(d.amount || 0);
                    }
                });
                return acc;
            }, {});

            const summaryByPT = safeItems.reduce((acc, item) => {
                const companyName = item.company ? item.company.name : '-';
                if (companyName) {
                    acc[companyName] = (acc[companyName] || 0) + getFilteredTotal(item.details);
                }
                return acc;
            }, {});

            const safeSummaryByYear = (summaryByYear && typeof summaryByYear === 'object') ? summaryByYear : {};
            const safeSummaryByPT = (summaryByPT && typeof summaryByPT === 'object') ? summaryByPT : {};

            return {
                yearEntries: Object.entries(safeSummaryByYear).sort(([a], [b]) => Number(b) - Number(a)),
                ptEntries: Object.entries(safeSummaryByPT),
                totalPenyedias: new Set(safeItems.map(item => item.provider ? item.provider.name : '').filter(Boolean)).size,
                totalHutangKeseluruhan: safeItems.reduce((sum, item) => sum + getFilteredTotal(item.details), 0),
            };
        } catch (e) {
            console.error('Summary computation error:', e);
            return { yearEntries: [], ptEntries: [], totalPenyedias: 0, totalHutangKeseluruhan: 0 };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeItems, filterYear]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID').format(number);
    };

    const formatInputCurrency = (val) => {
        if (!val) return '';
        const parts = val.toString().split('.');
        let intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return parts.length > 1 ? intPart + ',' + parts[1] : intPart;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }) + ' WIB';
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        company_id: '',
        provider_name: '',
        details: [{ year: new Date().getFullYear().toString(), amount: '' }]
    });

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setData({
                id: item.id,
                company_id: item.company_id || '',
                provider_name: item.provider ? item.provider.name : '',
                details: item.details && item.details.length > 0 ? item.details : [{ year: new Date().getFullYear().toString(), amount: '' }]
            });
        } else {
            setEditingItem(null);
            reset();
            setData('details', [{ year: new Date().getFullYear().toString(), amount: '' }]);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingItem(null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('payables.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data hutang berhasil disimpan',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Data?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('payables.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Terhapus',
                            text: 'Data berhasil dihapus.',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                });
            }
        });
    };

    const dailyForm = useForm({
        billing_date: new Date().toISOString().split('T')[0],
        user_id: auth.user.id.toString(),
        provider_id: '',
        result: ''
    });

    const submitDaily = (e) => {
        e.preventDefault();
        dailyForm.post(route('payables.dailyReport.store'), {
            preserveScroll: true,
            onSuccess: () => {
                dailyForm.reset('provider_id', 'result');
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Laporan harian berhasil disimpan',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    };

    // Generate year options from 2020 to 2030
    const yearOptions = Array.from({ length: 11 }, (_, i) => {
        const y = (2020 + i).toString();
        return { value: y, label: y };
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Data Hutang</h2>}
        >
            <Head title="Data Hutang" />

            <div className="pb-12 pt-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-blue-500" />
                                    Data Hutang
                                </h3>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                                    <div className="w-full">
                                        <ExportDropdown 
                                            pdfRoute={route('payables.export.pdf', { search: filterSearch, pt: Array.isArray(filterPt) ? filterPt.join(',') : filterPt, year: Array.isArray(filterYear) ? filterYear.join(',') : filterYear, sort: filterSort })} 
                                            excelRoute={route('payables.export.excel', { search: filterSearch, pt: Array.isArray(filterPt) ? filterPt.join(',') : filterPt, year: Array.isArray(filterYear) ? filterYear.join(',') : filterYear, sort: filterSort })} 
                                            className="w-full justify-center" 
                                        />
                                    </div>
                                    <PrimaryButton onClick={() => openModal()} className="w-full justify-center h-[42px] whitespace-nowrap">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center">
                                    <h4 className="text-sm font-semibold text-amber-800 mb-2">Total Semua Hutang</h4>
                                    <span className="text-xl xl:text-2xl font-extrabold text-amber-600 whitespace-nowrap">Rp {formatRupiah(totalAll || totalHutangKeseluruhan)}</span>
                                    <span className="text-xs text-amber-700/70 mt-2 text-center">
                                        Terakhir diupdate pada tanggal {formatDate(lastUpdated)}
                                    </span>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Hutang Berdasarkan Tahun</h4>
                                    <div className="space-y-1">
                                        {yearEntries.map(([year, amount]) => (
                                            <div key={year} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-sm gap-1 sm:gap-2 mb-2 pb-2 border-b border-blue-100 last:border-0 last:pb-0">
                                                <span className="text-blue-700 font-medium">{year}</span>
                                                <span className="font-bold text-blue-900 whitespace-nowrap sm:text-right">Rp {formatRupiah(amount)}</span>
                                            </div>
                                        ))}
                                        {yearEntries.length === 0 && <div className="text-sm text-blue-600/70">Tidak ada data</div>}
                                    </div>
                                </div>
                                
                                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm">
                                    <h4 className="text-sm font-semibold text-indigo-800 mb-2">Hutang Berdasarkan PT</h4>
                                    <div className="space-y-1">
                                        {ptEntries.map(([pt, amount]) => (
                                            <div key={pt} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-sm gap-1 sm:gap-2 mb-2 pb-2 border-b border-indigo-100 last:border-0 last:pb-0">
                                                <span className="text-indigo-700 leading-tight font-medium">{pt}</span>
                                                <span className="font-bold text-indigo-900 whitespace-nowrap sm:text-right">Rp {formatRupiah(amount)}</span>
                                            </div>
                                        ))}
                                        {ptEntries.length === 0 && <div className="text-sm text-indigo-600/70">Tidak ada data</div>}
                                    </div>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center">
                                    <h4 className="text-sm font-semibold text-emerald-800 mb-2">Total Penyedia yang Punya Hutang</h4>
                                    <span className="text-4xl font-extrabold text-emerald-600">{totalPenyedias}</span>
                                    <span className="text-emerald-700 text-sm mt-1">Penyedia</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                                <div>
                                    <InputLabel value="Cari Penyedia" />
                                    <TextInput 
                                        type="text" 
                                        className="w-full mt-1" 
                                        value={filterSearch} 
                                        onChange={e => setFilterSearch(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && applyFilter()}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Filter PT" />
                                    <div className="mt-1">
                                        <MultiSelect
                                            options={companies ? companies.map(c => ({ value: c.id.toString(), label: c.name })) : []}
                                            value={filterPt}
                                            onChange={setFilterPt}
                                            placeholder="Semua PT"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Filter Tahun" />
                                    <div className="mt-1">
                                        <MultiSelect
                                            options={yearOptions}
                                            value={filterYear}
                                            onChange={setFilterYear}
                                            placeholder="Semua Tahun"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Urutkan Nominal" />
                                    <select
                                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm w-full mt-1"
                                        value={filterSort}
                                        onChange={e => setFilterSort(e.target.value)}
                                    >
                                        <option value="">Terbaru (Default)</option>
                                        <option value="terbesar">Terbesar</option>
                                        <option value="terkecil">Terkecil</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 w-full md:col-span-2 lg:col-span-3 xl:col-span-1 justify-start xl:justify-end mt-2 xl:mt-0">
                                    <PrimaryButton onClick={applyFilter} type="button">Filter</PrimaryButton>
                                    <SecondaryButton onClick={resetFilter} type="button">Reset</SecondaryButton>
                                </div>
                            </div>
                            

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama PT</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Penyedia</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal Hutang</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hutang</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(() => {
                                            let processedItems = [...safeItems];
                                            if (filterSort === 'terbesar') {
                                                processedItems.sort((a, b) => getFilteredTotal(b.details) - getFilteredTotal(a.details));
                                            } else if (filterSort === 'terkecil') {
                                                processedItems.sort((a, b) => getFilteredTotal(a.details) - getFilteredTotal(b.details));
                                            }
                                            return processedItems.length > 0 ? processedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.company ? item.company.name : '-'}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words max-w-xs md:max-w-md">{item.provider ? item.provider.name : '-'}</td>
                                                <td className="px-6 py-4">
                                                    {getFilteredDetails(item.details).map((d, i) => (
                                                        <div key={i} className="text-sm font-semibold mb-1">
                                                            {d.year}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getFilteredDetails(item.details).map((d, i) => (
                                                        <div key={i} className="text-sm mb-1 whitespace-nowrap">
                                                            Rp {formatRupiah(d.amount || 0)}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                                                    Rp {formatRupiah(getFilteredTotal(item.details))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-900 mr-4">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                            )) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                    Belum ada data hutang.
                                                </td>
                                            </tr>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            
                            {safeItems.length > 0 && (
                                <div className="mt-4 border-t">
                                    <ClientPagination 
                                        total={safeItems.length} 
                                        itemsPerPage={itemsPerPage} 
                                        currentPage={currentPage} 
                                        onPageChange={setCurrentPage} 
                                    />
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingItem ? 'Edit Data Hutang' : 'Tambah Hutang'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96 overflow-y-auto pr-2">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="company_id" value="Nama PT (Perusahaan)" />
                            <select
                                id="company_id"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.company_id}
                                onChange={(e) => setData('company_id', e.target.value)}
                            >
                                <option value="">-- Pilih PT --</option>
                                {companies && companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.company_id} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="provider_name" value="Nama Penyedia" />
                            <TextInput 
                                id="provider_name"
                                className="mt-1 block w-full"
                                value={data.provider_name}
                                onChange={e => setData('provider_name', e.target.value)}
                            />
                            <InputError message={errors.provider_name} className="mt-2" />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-700">Daftar Hutang per Tahun</h4>
                                <button type="button" onClick={() => setData('details', [...data.details, { year: new Date().getFullYear().toString(), amount: '' }])} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center gap-1">
                                    <Plus className="w-3 h-3 mr-2" /> Tambah Tahun
                                </button>
                            </div>

                            {data.details.map((detail, index) => (
                                <div key={index} className="flex items-center gap-4 mb-3">
                                    <div className="w-1/3">
                                        <TextInput
                                            type="number"
                                            className="w-full"
                                            value={detail.year}
                                            onChange={e => {
                                                const newDetails = [...data.details];
                                                newDetails[index].year = e.target.value;
                                                setData('details', newDetails);
                                            }}
                                        />
                                    </div>
                                    <div className="w-full flex-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">Rp</span>
                                            </div>
                                            <TextInput
                                                type="text"
                                                className="w-full pl-9 font-mono text-right"
                                                value={detail.amount !== undefined && detail.amount !== null ? formatInputCurrency(detail.amount) : ''}
                                                onChange={e => {
                                                    let rawStr = e.target.value.split('.').join('').replace(',', '.').replace(/[^0-9.]/g, '');
                                                    let parts = rawStr.split('.');
                                                    if (parts.length > 2) rawStr = parts[0] + '.' + parts.slice(1).join('');
                                                    parts = rawStr.split('.');
                                                    if (parts.length > 1) rawStr = parts[0] + '.' + parts[1].substring(0, 2);
                                                    
                                                    const newDetails = [...data.details];
                                                    newDetails[index].amount = rawStr;
                                                    setData('details', newDetails);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => {
                                        const newDetails = data.details.filter((_, i) => i !== index);
                                        setData('details', newDetails);
                                    }} className="text-red-500 hover:text-red-700 p-2">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Total Hutang:</span>
                                <span className="text-xl font-bold text-green-700">
                                    Rp {formatRupiah(data.details.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0))}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}



