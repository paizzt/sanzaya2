import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Search, Package, Filter, Box } from 'lucide-react';
import ClientPagination from '@/Components/ClientPagination';

export default function Products({ auth, products, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [source, setSource] = useState(filters.source || '');

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
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari nama produk atau NIE..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border-gray-300 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </form>
                        
                        <div className="flex gap-3 min-w-fit">
                            <div className="relative">
                                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    value={source}
                                    onChange={(e) => handleFilterChange('source', e.target.value)}
                                    className="pl-9 pr-10 py-2.5 border-gray-300 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white min-w-[160px]"
                                >
                                    <option value="">Semua Sumber</option>
                                    <option value="Distributor">Produk Distributor</option>
                                    <option value="Internal">Produk Internal</option>
                                </select>
                            </div>

                            <div className="relative">
                                <Box className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    value={type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="pl-9 pr-10 py-2.5 border-gray-300 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white min-w-[160px]"
                                >
                                    <option value="">Semua Kategori</option>
                                    <option value="BMHP">BMHP</option>
                                    <option value="Alat">Alat Kesehatan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <ClientPagination 
                            data={products}
                            itemsPerPage={20}
                            renderTable={(currentItems) => (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-600">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Nama Produk & Sumber</th>
                                                <th className="px-6 py-4 font-semibold">Kategori</th>
                                                <th className="px-6 py-4 font-semibold">NIE / Reg. No</th>
                                                <th className="px-6 py-4 font-semibold">Kemasan</th>
                                                <th className="px-6 py-4 font-semibold text-right">Harga</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {currentItems.length > 0 ? currentItems.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{product.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${product.source_type === 'Internal' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                                                {product.source_type}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {product.provider_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                            {product.jenis || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-700">
                                                        {product.registration_no || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {product.unit || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-indigo-600">
                                                        Rp {Number(product.price || 0).toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                                            <Package className="w-12 h-12 mb-3 text-gray-300" />
                                                            <p className="text-base font-medium text-gray-900">Tidak ada produk ditemukan</p>
                                                            <p className="text-sm mt-1">Coba ubah kata kunci pencarian atau filter.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
