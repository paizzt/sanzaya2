import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Package, ChevronDown, ChevronRight, ChevronLeft, Store, Link as LinkIcon } from 'lucide-react';

export default function ItemRequirementsPublic({ groupedItems, outletName, filterMonth, filterYear }) {
    const [selectedOutlet, setSelectedOutlet] = useState(outletName || null);

    // If an outlet is selected, show its data
    if (selectedOutlet) {
        const items = groupedItems[selectedOutlet] || [];
        
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <Head title={`Kebutuhan Barang - ${selectedOutlet}`} />
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        {!outletName && (
                            <button
                                onClick={() => setSelectedOutlet(null)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                        )}
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Store className="w-6 h-6 text-indigo-600" />
                                {selectedOutlet}
                            </h1>
                            {(filterMonth || filterYear) && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Menampilkan data: {filterMonth && filterMonth !== '' ? filterMonth : ''} {filterYear && filterYear !== '' ? filterYear : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 text-center w-12">No</th>
                                        <th scope="col" className="px-3 py-3">Bulan Tahun</th>
                                        <th scope="col" className="px-3 py-3">Nama Barang</th>
                                        <th scope="col" className="px-3 py-3">Nama Perusahaan</th>
                                        <th scope="col" className="px-3 py-3">Satuan</th>
                                        <th scope="col" className="px-3 py-3 text-center">Qty</th>
                                        <th scope="col" className="px-3 py-3">Keterangan</th>
                                        <th scope="col" className="px-3 py-3 text-right">Harga</th>
                                        <th scope="col" className="px-3 py-3 text-center">Terkirim</th>
                                        <th scope="col" className="px-3 py-3 text-center">Belum</th>
                                        <th scope="col" className="px-3 py-3 text-right">Total</th>
                                        <th scope="col" className="px-3 py-3 text-center w-20">Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="12" className="px-3 py-8 text-center text-gray-500">
                                                Tidak ada data untuk outlet ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-3 py-2 text-center text-gray-900 font-medium">{index + 1}</td>
                                                <td className="px-3 py-2">{item.month_year}</td>
                                                <td className="px-3 py-2 font-medium text-gray-900">{item.item_name}</td>
                                                <td className="px-3 py-2">{item.company_name}</td>
                                                <td className="px-3 py-2">{item.unit}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        item.description === 'BHMP' ? 'bg-purple-50 text-purple-700' : 
                                                        item.description === 'ALAT' ? 'bg-orange-50 text-orange-700' : 
                                                        'bg-gray-50 text-gray-700'
                                                    }`}>
                                                        {item.description}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right whitespace-nowrap">
                                                    Rp {item.price.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-3 py-2 text-center text-emerald-600 font-medium">
                                                    {item.sent}
                                                </td>
                                                <td className="px-3 py-2 text-center text-red-600 font-medium">
                                                    {item.not_sent}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-blue-600 whitespace-nowrap">
                                                    Rp {item.total.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex justify-center">
                                                        {item.link && (
                                                            <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-lg" title="Buka Tautan">
                                                                <LinkIcon className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
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

    // Default view: list of outlets
    const outlets = Object.keys(groupedItems).sort();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Head title="Kebutuhan Barang" />
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-7 h-7 text-indigo-600" />
                        Kebutuhan Barang
                    </h2>
                </div>

                {outlets.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Data</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {outlets.map((outlet) => {
                            const itemCount = groupedItems[outlet]?.length || 0;
                            return (
                                <button
                                    key={outlet}
                                    onClick={() => setSelectedOutlet(outlet)}
                                    className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all group text-left w-full"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                <Store className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
                                            {outlet}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {itemCount} Item Kebutuhan
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
