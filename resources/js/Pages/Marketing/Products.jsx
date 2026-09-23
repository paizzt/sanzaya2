import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Search, Package, Filter, Box } from 'lucide-react';
import ClientPagination from '@/Components/ClientPagination';
import CustomSelect from '@/Components/CustomSelect';

export default function Products({ auth, products, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [source, setSource] = useState(filters.source || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('marketing.products.index'), { search, type, source }, { preserveState: true, preserveScroll: true });
    };

    const handleFilterChange = (key, value) => {
        if (key === 'type') setType(value);
        if (key === 'source') setSource(value);
        
        const newFilters = { search, type, source, [key]: value };
        router.get(route('marketing.products.index'), newFilters, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cari Produk Marketing" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                                <Package className="w-6 h-6 text-indigo-600" />
                                Pencarian Produk
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Cari dan lihat daftar produk dari Distributor maupun Produk Internal (BMHP/Alat).
                            </p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama produk..."
                                    className="w-full pl-12 pr-4 py-3 border-gray-200 rounded-2xl text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm min-h-[44px]"
                                />
                            </div>
                        </form>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-20">
                            <div className="relative w-full sm:w-auto">
                                <CustomSelect
                                    value={source}
                                    onChange={(val) => handleFilterChange('source', val)}
                                    options={[
                                        { value: '', label: 'Semua Sumber' },
                                        { value: 'Distributor', label: 'Produk Distributor' },
                                        { value: 'Internal', label: 'Produk Internal' },
                                    ]}
                                    icon={Filter}
                                    className="w-full sm:min-w-[200px]"
                                />
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <CustomSelect
                                    value={type}
                                    onChange={(val) => handleFilterChange('type', val)}
                                    options={[
                                        { value: '', label: 'Semua Kategori' },
                                        { value: 'BMHP', label: 'BMHP' },
                                        { value: 'Alat', label: 'Alat Kesehatan' },
                                    ]}
                                    icon={Box}
                                    className="w-full sm:min-w-[200px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hide-scrollbar">
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="block md:table w-full text-sm text-left text-gray-600">
                                <thead className="hidden md:table-header-group text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Nama Produk & Sumber</th>
                                        <th className="px-6 py-4">Kategori</th>
                                        <th className="px-6 py-4">NIE / Reg. No</th>
                                        <th className="px-6 py-4">Kemasan</th>
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group divide-y divide-transparent md:divide-gray-50 bg-gray-50/30 md:bg-white p-4 md:p-0">
                                    {products.length > 0 ? products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                                                <tr key={product.id} className="block md:table-row hover:bg-indigo-50/30 transition-colors mb-4 md:mb-0 bg-white md:bg-transparent border border-gray-100 md:border-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none p-4 md:p-0">
                                                    <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                        <div className="font-bold text-gray-900 text-base md:text-sm">{product.name}</div>
                                                        <div className="flex items-center gap-2 mt-2 md:mt-1">
                                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${product.source_type === 'Internal' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                                                                {product.source_type}
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-500">
                                                                {product.provider_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                        <div className="flex justify-between md:block items-center">
                                                            <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Kategori</span>
                                                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                                {product.jenis || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 font-medium text-gray-700 border-b border-gray-50 md:border-none mb-2 md:mb-0">
                                                        <div className="flex justify-between md:block items-center">
                                                            <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">NIE/Reg No</span>
                                                            <span>{product.registration_no || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="block md:table-cell px-0 md:px-6 py-2 md:py-4 text-gray-500 text-sm">
                                                        <div className="flex justify-between md:block items-center">
                                                            <span className="md:hidden font-semibold text-gray-400 text-xs uppercase tracking-wider">Kemasan</span>
                                                            <span>{product.unit || '-'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr className="block md:table-row">
                                                    <td colSpan="4" className="block md:table-cell px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                                <Package className="w-12 h-12 text-gray-300" />
                                                            </div>
                                                            <p className="text-lg font-bold text-gray-700">Tidak ada produk ditemukan</p>
                                                            <p className="text-sm mt-1 text-gray-500">Coba ubah kata kunci pencarian atau sesuaikan filter.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                        
                        {products.length > 0 && (
                            <ClientPagination 
                                total={products.length}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
