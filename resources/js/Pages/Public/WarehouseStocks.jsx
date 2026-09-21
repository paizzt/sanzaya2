import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Box, Search, Package } from 'lucide-react';
import Fuse from 'fuse.js';

export default function WarehouseStocksPublic({ items, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    
    // Parse URL for active columns, default to all if not specified
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const colsParam = urlParams.get('cols');
    const activeCols = colsParam ? colsParam.split(',') : ['code', 'name', 'category', 'quantity', 'unit', 'link'];

    const showCol = (col) => activeCols.includes(col);

    const fuse = useMemo(() => new Fuse(items, {
        keys: [
            'name', 
            'code',
            'category',
            'link'
        ],
        threshold: 0.3,
        ignoreLocation: true
    }), [items]);

    const filteredItems = useMemo(() => {
        let result = items;
        if (searchTerm) {
            result = fuse.search(searchTerm).map(result => result.item);
        }
        return result;
    }, [fuse, searchTerm, items]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Head title="Stok Gudang" />
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Box className="w-7 h-7 text-indigo-600" />
                        Informasi Stok Gudang
                    </h1>
                    
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                            placeholder="Cari nama, kode, kategori..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {showCol('code') && <th scope="col" className="px-6 py-4">Kode/SKU</th>}
                                    {showCol('name') && <th scope="col" className="px-6 py-4">Nama Barang</th>}
                                    {showCol('category') && <th scope="col" className="px-6 py-4">Kategori</th>}
                                    {showCol('quantity') && <th scope="col" className="px-6 py-4">Stok</th>}
                                    {showCol('unit') && <th scope="col" className="px-6 py-4">Satuan</th>}
                                    {showCol('link') && <th scope="col" className="px-6 py-4">Link E-Katalog</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={activeCols.length || 1} className="px-6 py-12 text-center">
                                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">Tidak ada data stok gudang yang ditemukan.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            {showCol('code') && (
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600">
                                                    {item.code || '-'}
                                                </td>
                                            )}
                                            {showCol('name') && (
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{item.name}</div>
                                                </td>
                                            )}
                                            {showCol('category') && (
                                                <td className="px-6 py-4">
                                                    {item.category || '-'}
                                                </td>
                                            )}
                                            {showCol('quantity') && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full font-medium ${
                                                        item.quantity <= item.minimum_stock 
                                                            ? 'bg-red-50 text-red-700' 
                                                            : 'bg-green-50 text-green-700'
                                                    }`}>
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                            )}
                                            {showCol('unit') && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.unit || '-'}
                                                </td>
                                            )}
                                            {showCol('link') && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.link ? (
                                                        <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Buka E-Katalog</a>
                                                    ) : (
                                                        <span className="text-gray-600">-</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
